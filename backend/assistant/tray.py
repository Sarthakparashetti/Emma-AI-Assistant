import threading

from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw

running = True
icon = None


def create_image():

    image = Image.new("RGB", (64, 64), "#2563eb")

    draw = ImageDraw.Draw(image)

    draw.ellipse((12, 12, 52, 52), fill="white")

    return image


def quit_app(icon, item):

    global running

    running = False

    icon.stop()


def start_tray():

    global icon

    icon = Icon(
        "Emma",
        create_image(),
        "Emma Assistant",
        menu=Menu(
            MenuItem("Exit", quit_app)
        ),
    )

    threading.Thread(
        target=icon.run,
        daemon=True
    ).start()