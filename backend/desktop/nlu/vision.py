def parse_vision(text):

    text = text.lower().strip()

    commands = [

        "what is on my screen",
        "whats on my screen",
        "what's on my screen",
        "describe my screen",
        "analyse my screen",
        "analyze my screen",
        "explain my screen",
        "screen analysis",

    ]

    if text in commands:

        return {

            "intent": "vision_action",

            "action": "describe",

            "entities": {}

        }

    return None