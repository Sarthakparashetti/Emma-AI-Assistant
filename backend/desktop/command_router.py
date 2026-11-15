from desktop.controllers import (
    browser_controller,
    system_controller,
    window_controller,
    file_controller,
    app_controller,
    media_controller,
    screenshot_controller,
    ocr_controller,
    vision_controller,
    security_controller,
    vision_controller,
    security_controller,
)

CONTROLLERS = {

    "browser_action": browser_controller.dispatch,

    "system_action": system_controller.dispatch,

    "window_action": window_controller.dispatch,

    "file_action": file_controller.dispatch,

    "app_action": app_controller.dispatch,

    "media_action": media_controller.dispatch,

    "screenshot_action": screenshot_controller.dispatch,

    "ocr_action": ocr_controller.dispatch,

    "vision_action": vision_controller.dispatch,

    "security_action": security_controller.dispatch,

    "vision_action": vision_controller.dispatch,

    "security_action": security_controller.dispatch,
}


def route_command(intent_data):

    if not intent_data:
        return "Sorry, I couldn't understand that."

    intent = intent_data["intent"]
    action = intent_data.get("action")
    entities = intent_data.get("entities", {})

    controller = CONTROLLERS.get(intent)

    if controller:
        return controller(action, entities)

    return "Sorry, I don't know how to do that yet."