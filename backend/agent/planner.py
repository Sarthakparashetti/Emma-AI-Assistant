import re

from agent.task import Task


def create_plan(message: str):

    """
    Splits a user request into multiple executable tasks.
    """

    separators = [
        ", then ",
        " then ",
        ", and ",
        " and ",
        ";",
    ]

    parts = [message]

    for separator in separators:

        new_parts = []

        for part in parts:
            new_parts.extend(part.split(separator))

        parts = new_parts

    tasks = []

    for part in parts:

        part = part.strip()

        if not part:
            continue

        tasks.append(
            Task(
                action="command",
                target=part
            )
        )

    return tasks