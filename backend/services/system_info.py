import psutil
from fastapi import APIRouter

router = APIRouter()

@router.get("/system")
def system_info():

    battery = psutil.sensors_battery()

    return {
        "cpu": psutil.cpu_percent(interval=1),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage("/").percent,
        "battery": battery.percent if battery else "N/A"
    }