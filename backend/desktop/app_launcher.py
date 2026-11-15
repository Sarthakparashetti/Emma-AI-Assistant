import os
import subprocess
import webbrowser
from difflib import SequenceMatcher

from desktop.app_indexer import load_apps
from desktop.app_aliases import APP_ALIASES

APPS = load_apps()

# -----------------------------------
# Built-in Windows Apps
# -----------------------------------

SYSTEM_APPS = {
    "notepad": "notepad",
    "calculator": "calc",
    "calc": "calc",
    "paint": "mspaint",
    "cmd": "cmd",
    "powershell": "powershell",
    "task manager": "taskmgr",
    "control panel": "control",
    "settings": "ms-settings:",
    "registry editor": "regedit",
    "explorer": "explorer",
}

# -----------------------------------
# Websites
# -----------------------------------

WEBSITES = {
    "youtube": "https://youtube.com",
    "gmail": "https://mail.google.com",
    "github": "https://github.com",
    "google": "https://google.com",
    "linkedin": "https://linkedin.com",
    "stackoverflow": "https://stackoverflow.com",
    "chatgpt": "https://chat.openai.com",
}


def reload_apps():
    global APPS
    APPS = load_apps()


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def open_application(app_name: str):

    app_name = app_name.lower().strip()

    # =========================================
    # Websites
    # =========================================

    if app_name in WEBSITES:

        webbrowser.open(WEBSITES[app_name])

        return f"Opening {app_name.title()}..."

    # =========================================
    # Alias Lookup
    # =========================================

    if app_name in APP_ALIASES:
        app_name = APP_ALIASES[app_name]

    # =========================================
    # Windows System Apps
    # =========================================

    if app_name in SYSTEM_APPS:

        command = SYSTEM_APPS[app_name]

        try:

            if command == "ms-settings:":
                os.startfile(command)
            else:
                subprocess.Popen(command)

            return f"Opening {app_name.title()}..."

        except Exception as e:
            return f"Unable to open {app_name}: {e}"

    # =========================================
    # Exact Match
    # =========================================

    if app_name in APPS:

        path = APPS[app_name]

        try:

            if path.endswith(".exe"):
                subprocess.Popen(path)
            else:
                os.startfile(path)

            return f"Opening {app_name.title()}..."

        except Exception as e:
            return f"Unable to open {app_name}: {e}"

    # =========================================
    # Smart Fuzzy Match
    # =========================================

    best_match = None
    best_score = 0

    for app in APPS.keys():

        score = similarity(app_name, app)

        if score > best_score:

            best_score = score
            best_match = app

    # Only accept very confident matches
    if best_score >= 0.85:

        path = APPS[best_match]

        try:

            if path.endswith(".exe"):
                subprocess.Popen(path)
            else:
                os.startfile(path)

            return f"Opening {best_match.title()}..."

        except Exception as e:
            return f"Unable to open {best_match}: {e}"

    return f"I couldn't find an application named '{app_name}'."