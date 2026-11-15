# Security Module Setup

This build adds real, working security features that need no extra setup
(process monitoring, network connection monitoring, the screen/phishing
scan, password strength auditing, and the aggregated security score all
work out of the box once you `pip install -r requirements.txt`).

One feature — **URL reputation checking** — needs a free third-party API
key because Emma doesn't run her own malware/URL database. Here's how to
turn it on.

## VirusTotal API key (free tier)

1. Create a free account at https://www.virustotal.com/gui/join-us
2. Go to your profile → **API Key** and copy it.
3. Open `backend/.env` (same file that already holds `GEMINI_API_KEY`)
   and add a new line:

   ```
   VIRUSTOTAL_API_KEY=your_key_here
   ```

4. Restart the backend (`python main.py` / `uvicorn main:app`).
5. The **URL Reputation Check** card on the Security page will now return
   real community detection stats instead of a "not configured" message.

**Free tier limits:** 4 requests/minute, 500/day. That's plenty for a
capstone demo; if you need more, VirusTotal's paid tiers raise the limit.

## Notes on the other security checks

- **Process monitoring** (`/security/processes`) uses `psutil` and flags
  processes by name pattern, execution path, and resource usage. It is a
  transparent heuristic, not a signature-based antivirus engine — it will
  not catch novel malware, and it can false-positive on legitimate tools
  that happen to run from a temp directory.
- **Network monitoring** (`/security/network`) reads established
  connections via `psutil.net_connections()`. On some operating systems
  this requires the backend process to run with elevated privileges to
  see connections owned by other users/processes — if you see a
  "permission denied" message, try running the backend as Administrator
  (Windows) or with `sudo` (Linux/macOS, though this project otherwise
  targets Windows).
- **CPU percentages** on first read may show as `0%` — this is a
  `psutil` characteristic (it needs two samples over time to compute
  accurate usage); the numbers become meaningful on the second poll.
- There is **no bundled antivirus engine or file-scanning integration**
  in this build. If you want real file scanning, the most realistic path
  for a capstone project is integrating the free **ClamAV** engine
  (`pip install pyclamd` + a running `clamd` daemon) — this was not added
  here because it requires installing and running a separate background
  service, which is a bigger decision than I wanted to make silently.
