"""
Emma AI OS — Security routes.

Replaces the old "screenshot-only" security scan with a real, system-wide
picture built from data Emma can actually see on this machine:

  GET  /security/scan        -> vision-based phishing/scam analysis of the
                                  most recent screenshot (existing feature,
                                  now one signal among several, not the
                                  whole story)
  GET  /security/processes   -> live process list with transparent,
                                  rule-based suspicion flags
  GET  /security/network     -> active outbound network connections
  GET  /security/score       -> aggregated security score + breakdown
  POST /security/url-check   -> URL reputation via VirusTotal (only works
                                  if the user supplies their own free API
                                  key — see SECURITY_SETUP.md)

Honesty note: there is no bundled antivirus engine, no local malware
signature database, and no network traffic capture here. This is
heuristic, transparent, and clearly labeled as such — not a replacement
for a real EDR/AV product.
"""

import os
import re

import psutil
from fastapi import APIRouter
from pydantic import BaseModel

from services.security_engine import analyze_security

router = APIRouter(prefix="/security")

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY")

SUSPICIOUS_NAME_PATTERNS = [
    "mimikatz", "keylog", "rat_", "nc.exe", "netcat",
    "psexec", "lazagne", "procdump", "cobaltstrike",
    "meterpreter", "wce.exe",
]

SUSPICIOUS_PATH_FRAGMENTS = [
    "\\appdata\\local\\temp",
    "\\windows\\temp",
    "/tmp/",
]


# ---------------------------------------------------------------------------
# Vision-based scan (existing capability, now under /security prefix)
# ---------------------------------------------------------------------------

@router.get("/scan")
def security_scan():
    try:
        report = analyze_security()

        return {"status": "ok", "report": report}

    except Exception as e:
        return {"status": "error", "report": f"Security scan failed: {e}"}


# ---------------------------------------------------------------------------
# Process analysis
# ---------------------------------------------------------------------------

def _classify_process(proc_info: dict) -> list[str]:
    flags = []

    name = (proc_info.get("name") or "").lower()
    exe = (proc_info.get("exe") or "").lower()

    if any(pattern in name for pattern in SUSPICIOUS_NAME_PATTERNS):
        flags.append("suspicious_name")

    if any(fragment in exe for fragment in SUSPICIOUS_PATH_FRAGMENTS):
        flags.append("runs_from_temp")

    if not exe:
        flags.append("unknown_origin")

    cpu = proc_info.get("cpu_percent") or 0
    mem = proc_info.get("memory_percent") or 0

    if cpu > 50:
        flags.append("high_cpu")

    if mem > 15:
        flags.append("high_memory")

    return flags


@router.get("/processes")
def list_processes():
    processes = []

    for proc in psutil.process_iter(
        ["pid", "name", "exe", "cpu_percent", "memory_percent"]
    ):
        try:
            info = proc.info
            flags = _classify_process(info)

            processes.append({
                "pid": info.get("pid"),
                "name": info.get("name"),
                "exe": info.get("exe") or "unknown",
                "cpu_percent": round(info.get("cpu_percent") or 0, 1),
                "memory_percent": round(info.get("memory_percent") or 0, 1),
                "flags": flags,
                "risk": "flagged" if flags else "normal",
            })

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    processes.sort(
        key=lambda p: (len(p["flags"]) == 0, -p["cpu_percent"])
    )

    flagged_count = sum(1 for p in processes if p["flags"])

    return {
        "total": len(processes),
        "flagged": flagged_count,
        "processes": processes[:150],
    }


# ---------------------------------------------------------------------------
# Network analysis
# ---------------------------------------------------------------------------

@router.get("/network")
def network_activity():
    connections = []

    try:
        for conn in psutil.net_connections(kind="inet"):
            if conn.status != psutil.CONN_ESTABLISHED or not conn.raddr:
                continue

            proc_name = "unknown"

            if conn.pid:
                try:
                    proc_name = psutil.Process(conn.pid).name()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            connections.append({
                "pid": conn.pid,
                "process": proc_name,
                "local_address": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                "remote_address": f"{conn.raddr.ip}:{conn.raddr.port}",
            })

    except (psutil.AccessDenied, PermissionError):
        return {
            "status": "permission_denied",
            "message": (
                "Reading network connections requires elevated privileges "
                "on this OS. Run the backend as Administrator to enable "
                "this check."
            ),
            "connections": [],
        }

    return {
        "status": "ok",
        "total_established": len(connections),
        "connections": connections[:100],
    }


# ---------------------------------------------------------------------------
# Aggregate security score
# ---------------------------------------------------------------------------

def _extract_vision_risk_score(report: str) -> int | None:
    match = re.search(r"risk score:?\s*(\d{1,3})\s*/\s*100", report, re.IGNORECASE)

    if match:
        return max(0, min(100, int(match.group(1))))

    return None


@router.get("/score")
def security_score():
    proc_data = list_processes()
    net_data = network_activity()

    score = 100
    breakdown = []

    flagged = proc_data["flagged"]
    penalty = min(40, flagged * 8)

    if penalty:
        score -= penalty
        breakdown.append(f"-{penalty} for {flagged} flagged process(es)")

    established = net_data.get("total_established", 0)

    if established > 40:
        penalty = min(20, (established - 40) // 5 * 2)
        score -= penalty
        breakdown.append(f"-{penalty} for unusually high outbound connection count ({established})")

    vision_note = None

    try:
        vision_report = analyze_security()
        vision_score = _extract_vision_risk_score(vision_report)

        if vision_score is not None:
            # Blend: vision score contributes up to 30 points of penalty
            vision_penalty = round(vision_score * 0.3)
            score -= vision_penalty
            breakdown.append(f"-{vision_penalty} from screen risk score ({vision_score}/100)")
        else:
            vision_note = "Screen analysis unavailable (no screenshot on disk yet)."

    except Exception:
        vision_note = "Screen analysis failed to run."

    score = max(0, min(100, round(score)))

    if score >= 85:
        level = "Low"
    elif score >= 60:
        level = "Moderate"
    elif score >= 35:
        level = "Elevated"
    else:
        level = "High"

    return {
        "score": score,
        "threat_level": level,
        "breakdown": breakdown or ["No risk factors detected"],
        "flagged_processes": flagged,
        "established_connections": established,
        "vision_note": vision_note,
    }


# ---------------------------------------------------------------------------
# URL reputation (requires the user's own VirusTotal API key)
# ---------------------------------------------------------------------------

class UrlCheckRequest(BaseModel):
    url: str


@router.post("/url-check")
def check_url(request: UrlCheckRequest):
    if not VIRUSTOTAL_API_KEY:
        return {
            "status": "not_configured",
            "message": (
                "URL reputation checking requires a free VirusTotal API "
                "key. Add VIRUSTOTAL_API_KEY to backend/.env and restart "
                "the server. See SECURITY_SETUP.md for the 2-minute "
                "setup steps."
            ),
        }

    try:
        import base64
        import requests

        url_id = base64.urlsafe_b64encode(
            request.url.encode()
        ).decode().strip("=")

        resp = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers={"x-apikey": VIRUSTOTAL_API_KEY},
            timeout=10,
        )

        if resp.status_code == 404:
            return {
                "status": "unknown",
                "message": "This URL has not been scanned by VirusTotal before.",
            }

        resp.raise_for_status()
        data = resp.json()

        stats = data["data"]["attributes"]["last_analysis_stats"]

        return {
            "status": "ok",
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
        }

    except Exception as e:
        return {"status": "error", "message": f"URL check failed: {e}"}
