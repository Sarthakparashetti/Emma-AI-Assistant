def parse_screenshot(text: str):

    text = text.strip().lower()

    commands = [

        "take screenshot",

        "take a screenshot",

        "capture screen",

        "capture my screen",

        "capture screenshot",

        "screenshot",

    ]

    if text in commands:

        return {

            "intent": "screenshot_action",

            "action": "take",

            "entities": {}

        }

    return None