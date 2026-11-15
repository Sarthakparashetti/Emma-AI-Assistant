from desktop.nlu.engine import parse
from desktop.command_router import route_command


# =====================================================
# Normalize common command variations
# =====================================================

REPLACEMENTS = {
    "minimise": "minimize",
    "maximise": "maximize",
    "organise": "organize",
    "centre": "center",

    "launch": "open",
    "start": "open",

    "exit": "close",
    "quit": "close",

    "switch to": "focus",
    "bring up": "focus",
    "bring": "focus",
}


def normalize(text: str) -> str:

    text = text.lower().strip()

    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)

    return text


# =====================================================
# Execute Tasks
# =====================================================

def execute_plan(tasks):

    responses = []

    for task in tasks:

        task.target = normalize(task.target)

        print("=" * 60)
        print("TASK:", repr(task.target))

        intent = parse(task.target)

        print("PARSED:", intent)

        if intent is None:
            print("PARSE FAILED")
            continue

        response = route_command(intent)

        print("RESPONSE:", response)
        print("=" * 60)

        if response:
            responses.append(response)

    if not responses:
        return None

    return "\n".join(responses)