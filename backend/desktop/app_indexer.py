import json
import os
from pathlib import Path

DATABASE = Path(__file__).parent / "app_database.json"

SEARCH_LOCATIONS = [
    r"C:\ProgramData\Microsoft\Windows\Start Menu\Programs",
    os.path.expandvars(r"%APPDATA%\Microsoft\Windows\Start Menu\Programs"),
    r"C:\Program Files",
    r"C:\Program Files (x86)",
]

# Ignore executables that are not real launchable apps
IGNORE_KEYWORDS = [
    "uninstall",
    "unins",
    "setup",
    "installer",
    "install",
    "update",
    "updater",
    "helper",
    "service",
    "crash",
    "report",
    "telemetry",
    "driver",
    "redistributable",
    "runtime",
    "router",
    "repair",
    "support",
    "assistant",
    "plugin",
    "launcherupdater",
    "daemon",
]

# Words to remove from names
REMOVE_WORDS = [
    "(x64)",
    "(x86)",
    "64-bit",
    "32-bit",
]


def clean_name(name: str):

    name = name.lower()

    for word in REMOVE_WORDS:
        name = name.replace(word.lower(), "")

    name = name.replace("_", " ")
    name = name.replace("-", " ")

    return " ".join(name.split())


def should_ignore(name: str):

    lower = name.lower()

    for word in IGNORE_KEYWORDS:
        if word in lower:
            return True

    return False


def scan_apps():

    apps = {}

    for location in SEARCH_LOCATIONS:

        if not os.path.exists(location):
            continue

        for root, _, files in os.walk(location):

            for file in files:

                if not (
                    file.endswith(".exe")
                    or file.endswith(".lnk")
                ):
                    continue

                name = Path(file).stem

                if should_ignore(name):
                    continue

                name = clean_name(name)

                if len(name) < 2:
                    continue

                if name not in apps:

                    apps[name] = os.path.join(root, file)

    with open(DATABASE, "w", encoding="utf-8") as f:
        json.dump(
            dict(sorted(apps.items())),
            f,
            indent=4
        )

    print(f"Indexed {len(apps)} applications.")

    return apps


def load_apps():

    if not DATABASE.exists():
        return scan_apps()

    with open(DATABASE, "r", encoding="utf-8") as f:
        return json.load(f)


def refresh_database():
    return scan_apps()