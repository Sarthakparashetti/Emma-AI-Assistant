import re

WINDOW_ACTIONS = {
    "minimize": "minimize",
    "minimise": "minimize",
    "hide": "minimize",
    "shrink": "minimize",

    "maximize": "maximize",
    "maximise": "maximize",
    "fullscreen": "maximize",

    "restore": "restore",

    "activate": "activate",
    "focus": "activate",
    "switch": "activate",
    "switch to": "activate",
    "bring": "activate",
    "bring to front": "activate",
}


def clean_target(target: str):

    target = target.strip()

    prefixes = (
        "the ",
        "my ",
        "a ",
        "an ",
        "window ",
    )

    for p in prefixes:
        if target.startswith(p):
            target = target[len(p):]

    return target.strip()


def parse_window(text: str):

    text = text.strip().lower()

    for verb, action in WINDOW_ACTIONS.items():

        match = re.fullmatch(rf"{re.escape(verb)}\s+(.+)", text)

        if match:

            return {
                "intent": "window_action",
                "action": action,
                "entities": {
                    "target": clean_target(match.group(1))
                },
            }

    if text in (
        "list windows",
        "show windows",
    ):
        return {
            "intent": "window_action",
            "action": "list",
            "entities": {},
        }

    return None