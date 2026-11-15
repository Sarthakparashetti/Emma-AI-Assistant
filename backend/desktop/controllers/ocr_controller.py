from pathlib import Path

import pytesseract
from PIL import Image

# If Tesseract isn't in PATH, uncomment and adjust:
# pytesseract.pytesseract.tesseract_cmd = (
#     r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# )

SCREENSHOT_DIR = (
    Path(__file__).resolve().parents[2]
    / "screenshots"
)


def get_latest_screenshot():

    files = sorted(
        SCREENSHOT_DIR.glob("*.png"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )

    if not files:
        return None

    return files[0]


def read_screen():

    image_path = get_latest_screenshot()

    if image_path is None:
        return (
            "No screenshot found.\n"
            "Please take a screenshot first."
        )

    image = Image.open(image_path)

    text = pytesseract.image_to_string(image)

    text = text.strip()

    if not text:
        return "No readable text found."

    return text


def dispatch(action, entities):

    if action == "read":
        return read_screen()

    return None