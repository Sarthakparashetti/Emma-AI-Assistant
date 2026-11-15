from pathlib import Path
import traceback

from google import genai
from PIL import Image

from config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)

SCREENSHOT_DIR = (
    Path(__file__).resolve().parents[1]
    / "screenshots"
)


def latest_screenshot():

    images = sorted(
        SCREENSHOT_DIR.glob("*.png"),
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )

    if not images:
        return None

    return images[0]


def analyze_screen(prompt: str):

    image_path = latest_screenshot()

    if image_path is None:
        return (
            "No screenshot found.\n"
            "Please take a screenshot first."
        )

    try:

        image = Image.open(image_path)

        response = client.models.generate_content(
        model="gemini-3.6-flash",
            contents=[
                prompt,
                image,
            ],
        )

        if response.text:
            return response.text.strip()

        return "I couldn't analyze the screen."

    except Exception:

        print("\n" + "=" * 80)
        print("VISION ENGINE ERROR")
        traceback.print_exc()
        print("=" * 80 + "\n")

        return "Sorry, I couldn't analyze the screenshot."