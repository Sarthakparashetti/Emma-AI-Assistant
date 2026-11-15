from pathlib import Path
from datetime import datetime

from PIL import ImageGrab


SCREENSHOT_DIR = (
    Path(__file__).resolve().parents[2]
    / "screenshots"
)

SCREENSHOT_DIR.mkdir(exist_ok=True)


def take_screenshot():

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = f"screenshot_{timestamp}.png"

    filepath = SCREENSHOT_DIR / filename

    image = ImageGrab.grab()

    image.save(filepath)

    return (
        "Screenshot saved successfully.\n\n"
        f"Location:\n{filepath}"
    )


def dispatch(action, entities):

    if action == "take":
        return take_screenshot()

    return None