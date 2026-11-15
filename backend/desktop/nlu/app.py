import re

from desktop.nlu.common import contains_any
from desktop.nlu.patterns import OPEN_WORDS, CLOSE_WORDS


APP_PATTERN = (
    r"(?:open|launch|start|run|close|exit|quit|terminate|kill|"
    r"restart|check|is|show|list)\s+(.+)"
)


def clean_app(app):

    app = app.strip()

    prefixes = (
        "the ",
        "my ",
        "a ",
        "an ",
        "application ",
        "app ",
        "program ",
    )

    for p in prefixes:
        if app.startswith(p):
            app = app[len(p):]

    return app.strip()


def parse_app(text: str):

    text = text.strip().lower()

    if contains_any(text, OPEN_WORDS):

        match = re.fullmatch(APP_PATTERN, text)

        if match:

            return {
                "intent": "app_action",
                "action": "open",
                "entities": {
                    "app": clean_app(match.group(1))
                },
            }

    if contains_any(text, CLOSE_WORDS):

        match = re.fullmatch(APP_PATTERN, text)

        if match:

            return {
                "intent": "app_action",
                "action": "close",
                "entities": {
                    "app": clean_app(match.group(1))
                },
            }

    if text.startswith("restart "):

        return {
            "intent": "app_action",
            "action": "restart",
            "entities": {
                "app": clean_app(text.replace("restart", "", 1))
            },
        }

    if text.startswith("is ") and text.endswith(" running"):

        app = clean_app(text[3:-8])

        return {
            "intent": "app_action",
            "action": "is_running",
            "entities": {
                "app": app
            },
        }

    if text in (
        "running apps",
        "show running apps",
        "list running apps",
    ):

        return {
            "intent": "app_action",
            "action": "list_running",
            "entities": {},
        }

    return None