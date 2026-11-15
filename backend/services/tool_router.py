from services.ai_engine import ask_ai
from services.memory_manager import add_message, get_history
from services.user_memory import save_fact, get_fact
from services.memory_engine import (
    extract_memory,
    detect_memory_question,
)

from desktop.app_indexer import refresh_database
from desktop.app_launcher import reload_apps

from agent.planner import create_plan
from agent.executor import execute_plan


def route_command(chat_id: str, message: str) -> str:

    message = message.strip()
    msg = message.lower()

    # =====================================================
    # Dynamic Memory Engine
    # =====================================================

    memory = extract_memory(message)

    if memory:

        key, value = memory

        save_fact(chat_id, key, value)

        readable_key = key.replace("_", " ")

        if key == "name":
            return f"Nice to meet you, {value}! I'll remember your name."

        return f"Got it! I'll remember your {readable_key} is {value}."

    query = detect_memory_question(message)

    if query:

        value = get_fact(chat_id, query)

        if value:

            readable_key = query.replace("_", " ")

            if query == "name":
                return f"Your name is {value}."

            return f"Your {readable_key} is {value}."

    # =====================================================
    # Refresh Application Database
    # =====================================================

    refresh_commands = {
        "refresh apps",
        "refresh applications",
        "scan apps",
        "scan applications",
        "update apps",
        "update applications",
        "reload apps",
        "reload applications",
    }

    if msg in refresh_commands:

        refresh_database()
        reload_apps()

        return "Application database refreshed successfully."

    # =====================================================
    # AI Planner + Executor
    # =====================================================

    try:

        tasks = create_plan(message)

        if tasks:

            response = execute_plan(tasks)

            if response:
                return response

    except Exception as e:

        print(f"[Planner Error] {e}")

    # =====================================================
    # AI Conversation
    # =====================================================

    history = get_history(chat_id)

    conversation = ""

    for item in history:

        conversation += f"{item['role']}: {item['content']}\n"

    conversation += f"User: {message}"

    reply = ask_ai(conversation)

    add_message(chat_id, "User", message)
    add_message(chat_id, "Emma", reply)

    return reply