import pygetwindow as gw


# =====================================================
# Action Aliases
# =====================================================

ACTION_ALIASES = {
    "focus": "activate",
    "switch": "activate",
    "bring": "activate",

    "minimise": "minimize",
    "shrink": "minimize",

    "fullscreen": "maximize",

    "exit": "close",
}


# =====================================================
# Helpers
# =====================================================

def normalize_title(title: str) -> str:

    if not title:
        return ""

    title = title.lower().strip()

    prefixes = [
        "the ",
        "my ",
        "a ",
        "an ",
        "window ",
    ]

    for prefix in prefixes:
        if title.startswith(prefix):
            title = title[len(prefix):]
            break

    return title.strip()


def find_window(title):

    title = normalize_title(title)

    if not title:
        return None

    for window in gw.getAllWindows():

        try:

            window_title = window.title.strip()

            if not window_title:
                continue

            if title in window_title.lower():
                return window

        except Exception:
            continue

    return None


# =====================================================
# Window Operations
# =====================================================

def activate_window(title):

    window = find_window(title)

    if not window:
        return f"Window '{title}' not found."

    try:

        if window.isMinimized:
            window.restore()

        window.activate()

        return f"Activated '{window.title}'."

    except Exception as e:

        return f"Unable to activate window: {e}"


def minimize_window(title):

    window = find_window(title)

    if not window:
        return f"Window '{title}' not found."

    try:

        window.minimize()

        return f"Minimized '{window.title}'."

    except Exception as e:

        return f"Unable to minimize window: {e}"


def maximize_window(title):

    window = find_window(title)

    if not window:
        return f"Window '{title}' not found."

    try:

        window.maximize()

        return f"Maximized '{window.title}'."

    except Exception as e:

        return f"Unable to maximize window: {e}"


def restore_window(title):

    window = find_window(title)

    if not window:
        return f"Window '{title}' not found."

    try:

        window.restore()

        window.activate()

        return f"Restored '{window.title}'."

    except Exception as e:

        return f"Unable to restore window: {e}"


def close_window(title):

    window = find_window(title)

    if not window:
        return f"Window '{title}' not found."

    try:

        window.close()

        return f"Closed '{window.title}'."

    except Exception as e:

        return f"Unable to close window: {e}"


def list_windows():

    windows = []

    for window in gw.getAllWindows():

        try:

            title = window.title.strip()

            if title:
                windows.append(title)

        except Exception:
            continue

    return sorted(set(windows))


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, parsed):

    action = ACTION_ALIASES.get(action, action)

    target = parsed.get("target", "")

    if action == "activate":
        return activate_window(target)

    elif action == "minimize":
        return minimize_window(target)

    elif action == "maximize":
        return maximize_window(target)

    elif action == "restore":
        return restore_window(target)

    elif action == "close":
        return close_window(target)

    elif action == "list":

        windows = list_windows()

        if not windows:
            return "No windows found."

        return "\n".join(windows)

    return None