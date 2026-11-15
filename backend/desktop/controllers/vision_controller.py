from services.vision_engine import analyze_screen


def describe_screen():
    return analyze_screen(
        """
Describe everything visible on the screen.

Include:
- Open applications
- Current webpage or software
- Buttons, menus and forms
- Any errors or warnings
- Important information
- What the user appears to be doing

Be concise but complete.
"""
    )


def dispatch(action, entities):

    if action == "describe":
        return describe_screen()

    return None