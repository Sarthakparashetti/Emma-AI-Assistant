import os
import socket
import subprocess
import getpass
import platform
from datetime import datetime

import psutil


# =====================================================
# Open Windows Applications
# =====================================================

def open_settings():
    os.system("start ms-settings:")
    return "Opening Windows Settings..."


def open_control_panel():
    os.system("control")
    return "Opening Control Panel..."


def open_task_manager():
    os.system("taskmgr")
    return "Opening Task Manager..."


def open_cmd():
    subprocess.Popen("cmd")
    return "Opening Command Prompt..."


def open_powershell():
    subprocess.Popen(["powershell"])
    return "Opening PowerShell..."


def open_notepad():
    subprocess.Popen("notepad")
    return "Opening Notepad..."


def open_calculator():
    os.system("start calc")
    return "Opening Calculator..."


def open_paint():
    subprocess.Popen("mspaint")
    return "Opening Paint..."


def open_device_manager():
    os.system("devmgmt.msc")
    return "Opening Device Manager..."


def open_disk_management():
    os.system("diskmgmt.msc")
    return "Opening Disk Management..."


def open_services():
    os.system("services.msc")
    return "Opening Services..."


def open_registry_editor():
    os.system("regedit")
    return "Opening Registry Editor..."


def open_event_viewer():
    os.system("eventvwr.msc")
    return "Opening Event Viewer..."


def open_system_information():
    os.system("msinfo32")
    return "Opening System Information..."


def open_network_connections():
    os.system("ncpa.cpl")
    return "Opening Network Connections..."


def open_firewall():
    os.system("firewall.cpl")
    return "Opening Windows Firewall..."


def open_display_settings():
    os.system("start ms-settings:display")
    return "Opening Display Settings..."


def open_bluetooth_settings():
    os.system("start ms-settings:bluetooth")
    return "Opening Bluetooth Settings..."


def open_windows_update():
    os.system("start ms-settings:windowsupdate")
    return "Opening Windows Update..."


def open_sound_settings():
    os.system("start ms-settings:sound")
    return "Opening Sound Settings..."


def open_network_settings():
    os.system("start ms-settings:network")
    return "Opening Network Settings..."


# =====================================================
# System Information
# =====================================================

def current_time():
    return datetime.now().strftime("Current time is %I:%M:%S %p.")


def current_date():
    return datetime.now().strftime("Today's date is %d %B %Y.")


def current_day():
    return datetime.now().strftime("Today is %A.")


def cpu_usage():
    cpu = psutil.cpu_percent(interval=0.5)
    return f"Current CPU usage is {cpu}%."


def ram_usage():
    memory = psutil.virtual_memory()
    used = round(memory.used / (1024 ** 3), 2)
    total = round(memory.total / (1024 ** 3), 2)

    return (
        f"RAM usage is {memory.percent}% "
        f"({used} GB used out of {total} GB)."
    )


def battery_status():

    battery = psutil.sensors_battery()

    if battery is None:
        return "Battery information is unavailable."

    status = "Charging" if battery.power_plugged else "Not Charging"

    return (
        f"Battery is {battery.percent}% "
        f"({status})."
    )


def disk_usage():

    disk = psutil.disk_usage("/")

    total = round(disk.total / (1024 ** 3), 2)
    used = round(disk.used / (1024 ** 3), 2)
    free = round(disk.free / (1024 ** 3), 2)

    return (
        f"Disk usage is {disk.percent}% "
        f"(Used {used} GB / Total {total} GB / Free {free} GB)."
    )


def system_uptime():

    boot = datetime.fromtimestamp(psutil.boot_time())

    uptime = datetime.now() - boot

    days = uptime.days
    hours = uptime.seconds // 3600
    minutes = (uptime.seconds % 3600) // 60

    return (
        f"System uptime is "
        f"{days} days, {hours} hours and {minutes} minutes."
    )


def hostname():
    return f"Computer name is {socket.gethostname()}."


def ip_address():

    try:
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        return f"IP address is {ip}."

    except Exception:
        return "Unable to retrieve IP address."


def current_user():
    return f"Current user is {getpass.getuser()}."


def operating_system():

    return (
        f"{platform.system()} "
        f"{platform.release()} "
        f"({platform.version()})"
    )


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, parsed=None):

    actions = {

        # Windows Apps

        "settings": open_settings,
        "control_panel": open_control_panel,
        "task_manager": open_task_manager,
        "cmd": open_cmd,
        "powershell": open_powershell,
        "notepad": open_notepad,
        "calculator": open_calculator,
        "paint": open_paint,
        "device_manager": open_device_manager,
        "disk_management": open_disk_management,
        "services": open_services,
        "registry_editor": open_registry_editor,
        "event_viewer": open_event_viewer,
        "system_information": open_system_information,
        "network_connections": open_network_connections,
        "firewall": open_firewall,
        "display_settings": open_display_settings,
        "bluetooth_settings": open_bluetooth_settings,
        "windows_update": open_windows_update,
        "sound_settings": open_sound_settings,
        "network_settings": open_network_settings,

        # System Information

        "current_time": current_time,
        "current_date": current_date,
        "current_day": current_day,
        "cpu_usage": cpu_usage,
        "ram_usage": ram_usage,
        "battery_status": battery_status,
        "disk_usage": disk_usage,
        "system_uptime": system_uptime,
        "hostname": hostname,
        "ip_address": ip_address,
        "current_user": current_user,
        "operating_system": operating_system,
    }

    func = actions.get(action)

    if func:
        return func()

    return f"Unknown system action: {action}"