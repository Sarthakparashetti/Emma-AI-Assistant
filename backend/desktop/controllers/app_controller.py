import time
import psutil

from desktop.app_launcher import open_application
from desktop.app_aliases import APP_ALIASES
from desktop.controllers.window_controller import find_window


# =====================================================
# Action Aliases
# =====================================================

ACTION_ALIASES = {
    "launch": "open",
    "start": "open",

    "exit": "close",
    "quit": "close",

    "kill": "force_close",
}


# =====================================================
# Helpers
# =====================================================

def resolve_app_name(app: str) -> str:
    """
    Normalize application names.

    Examples:
        the calculator -> calculator
        my chrome -> google chrome
        calc -> calculator
        vscode -> visual studio code
    """

    if not app:
        return ""

    app = app.lower().strip()

    prefixes = [
        "the ",
        "my ",
        "a ",
        "an ",
        "application ",
        "app ",
        "program ",
    ]

    for prefix in prefixes:
        if app.startswith(prefix):
            app = app[len(prefix):]
            break

    app = app.strip()

    return APP_ALIASES.get(app, app)


def find_process(process_name):

    process_name = resolve_app_name(process_name)

    for process in psutil.process_iter(["pid", "name"]):

        try:

            name = process.info["name"]

            if not name:
                continue

            name = name.lower()

            if (
                process_name == name
                or process_name in name
                or name.startswith(process_name)
            ):
                return process

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return None


# =====================================================
# App Actions
# =====================================================

def open_app(app):

    app = resolve_app_name(app)

    if not app:
        return "Please specify an application."

    window = find_window(app)

    if window:

        try:
            window.activate()
            return f"{app.title()} is already running."

        except Exception:
            pass

    return open_application(app)


def close_app(app):

    app = resolve_app_name(app)

    if not app:
        return "Please specify an application."

    process = find_process(app)

    if not process:
        return f"{app.title()} is not running."

    try:
        process.terminate()
        process.wait(timeout=3)
    except psutil.TimeoutExpired:
        process.kill()
    except Exception:
        pass

    return f"Closed {app.title()}."


def force_close_app(app):

    app = resolve_app_name(app)

    if not app:
        return "Please specify an application."

    process = find_process(app)

    if not process:
        return f"{app.title()} is not running."

    process.kill()

    return f"Force closed {app.title()}."


def restart_app(app):

    app = resolve_app_name(app)

    if not app:
        return "Please specify an application."

    process = find_process(app)

    if process:

        try:
            process.kill()
            time.sleep(1)
        except Exception:
            pass

    return open_application(app)


def is_running(app):

    app = resolve_app_name(app)

    return find_process(app) is not None


def running_apps():

    apps = []

    for process in psutil.process_iter(["name"]):

        try:

            name = process.info["name"]

            if name:
                apps.append(name)

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return sorted(set(apps))


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, entities):

    action = ACTION_ALIASES.get(action, action)

    app = entities.get("app", "")

    if action == "open":
        return open_app(app)

    elif action == "close":
        return close_app(app)

    elif action == "force_close":
        return force_close_app(app)

    elif action == "restart":
        return restart_app(app)

    elif action == "is_running":

        if is_running(app):
            return f"{resolve_app_name(app).title()} is running."

        return f"{resolve_app_name(app).title()} is not running."

    elif action == "list_running":

        apps = running_apps()

        if not apps:
            return "No running applications found."

        return "\n".join(apps)

    return None