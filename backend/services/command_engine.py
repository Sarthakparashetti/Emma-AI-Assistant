from services.tool_router import route_command


def execute_command(chat_id: str, message: str):

    return route_command(chat_id, message)