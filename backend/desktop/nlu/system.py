import re


SYSTEM_COMMANDS = {

    # ===========================
    # Open Windows Components
    # ===========================

    "open settings": "settings",
    "open control panel": "control_panel",
    "open task manager": "task_manager",
    "open cmd": "cmd",
    "open command prompt": "cmd",
    "open powershell": "powershell",
    "open notepad": "notepad",
    "open calculator": "calculator",
    "open calc": "calculator",
    "open paint": "paint",
    "open device manager": "device_manager",
    "open disk management": "disk_management",
    "open services": "services",
    "open registry editor": "registry_editor",
    "open regedit": "registry_editor",
    "open event viewer": "event_viewer",
    "open system information": "system_information",
    "open firewall": "firewall",
    "open network settings": "network_settings",
    "open network connections": "network_connections",
    "open display settings": "display_settings",
    "open bluetooth settings": "bluetooth_settings",
    "open windows update": "windows_update",
    "open sound settings": "sound_settings",
}


def parse_system(text: str):

    text = text.lower().strip()

    # ======================================
    # Exact Commands
    # ======================================

    action = SYSTEM_COMMANDS.get(text)

    if action:
        return {
            "intent": "system_action",
            "action": action,
            "entities": {}
        }

    # ======================================
    # Time
    # ======================================

    if (
        "time" in text
        and "timezone" not in text
    ):
        return {
            "intent": "system_action",
            "action": "current_time",
            "entities": {}
        }

    # ======================================
    # Date
    # ======================================

    if (
        "date" in text
        or "today" in text
    ):
        return {
            "intent": "system_action",
            "action": "current_date",
            "entities": {}
        }

    # ======================================
    # Day
    # ======================================

    if (
        "day" in text
        or "weekday" in text
    ):
        return {
            "intent": "system_action",
            "action": "current_day",
            "entities": {}
        }

    # ======================================
    # Battery
    # ======================================

    if "battery" in text:
        return {
            "intent": "system_action",
            "action": "battery_status",
            "entities": {}
        }

    # ======================================
    # CPU
    # ======================================

    if (
        "cpu" in text
        or "processor" in text
    ):
        return {
            "intent": "system_action",
            "action": "cpu_usage",
            "entities": {}
        }

    # ======================================
    # RAM
    # ======================================

    if (
        "ram" in text
        or "memory" in text
    ):
        return {
            "intent": "system_action",
            "action": "ram_usage",
            "entities": {}
        }

    # ======================================
    # Disk
    # ======================================

    if (
        "disk" in text
        or "storage" in text
        or "drive usage" in text
    ):
        return {
            "intent": "system_action",
            "action": "disk_usage",
            "entities": {}
        }

    # ======================================
    # Uptime
    # ======================================

    if "uptime" in text:
        return {
            "intent": "system_action",
            "action": "system_uptime",
            "entities": {}
        }

    # ======================================
    # Hostname
    # ======================================

    if (
        "computer name" in text
        or "hostname" in text
        or "host name" in text
    ):
        return {
            "intent": "system_action",
            "action": "hostname",
            "entities": {}
        }

    # ======================================
    # IP Address
    # ======================================

    if (
        "ip address" in text
        or re.search(r"\bip\b", text)
    ):
        return {
            "intent": "system_action",
            "action": "ip_address",
            "entities": {}
        }

    # ======================================
    # Current User
    # ======================================

    if (
        "current user" in text
        or "logged in user" in text
        or "who am i" in text
    ):
        return {
            "intent": "system_action",
            "action": "current_user",
            "entities": {}
        }

    # ======================================
    # Operating System
    # ======================================

    if (
        "operating system" in text
        or "windows version" in text
        or "os version" in text
    ):
        return {
            "intent": "system_action",
            "action": "operating_system",
            "entities": {}
        }

    return None