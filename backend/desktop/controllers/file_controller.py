import os
import shutil
from pathlib import Path


HOME = Path.home()


SPECIAL_FOLDERS = {
    "desktop": HOME / "Desktop",
    "documents": HOME / "Documents",
    "downloads": HOME / "Downloads",
    "pictures": HOME / "Pictures",
    "music": HOME / "Music",
    "videos": HOME / "Videos",
}


# =====================================================
# File Operations
# =====================================================

def create_folder(folder_name):

    path = Path.cwd() / folder_name

    if path.exists():
        return f"Folder '{folder_name}' already exists."

    path.mkdir(parents=True)

    return f"Folder '{folder_name}' created successfully."


def create_file(file_name):

    path = Path.cwd() / file_name

    if path.exists():
        return f"File '{file_name}' already exists."

    path.touch()

    return f"File '{file_name}' created successfully."


def delete_file(file_name):

    for root, _, files in os.walk(HOME):

        if file_name in files:

            os.remove(Path(root) / file_name)

            return f"Deleted '{file_name}'."

    return "File not found."


def rename_file(old_name, new_name):

    for root, _, files in os.walk(HOME):

        if old_name in files:

            old = Path(root) / old_name
            new = Path(root) / new_name

            old.rename(new)

            return f"Renamed '{old_name}' to '{new_name}'."

    return "File not found."


def move_file(file_name, destination):

    destination = destination.lower()

    if destination not in SPECIAL_FOLDERS:
        return "Unknown destination."

    target_folder = SPECIAL_FOLDERS[destination]

    for root, _, files in os.walk(HOME):

        if file_name in files:

            source = Path(root) / file_name

            shutil.move(str(source), str(target_folder))

            return f"Moved '{file_name}' to {destination.title()}."

    return "File not found."


def copy_file(file_name, destination):

    destination = destination.lower()

    if destination not in SPECIAL_FOLDERS:
        return "Unknown destination."

    target_folder = SPECIAL_FOLDERS[destination]

    for root, _, files in os.walk(HOME):

        if file_name in files:

            source = Path(root) / file_name

            shutil.copy2(source, target_folder)

            return f"Copied '{file_name}' to {destination.title()}."

    return "File not found."


def search_file(file_name):

    results = []

    for root, _, files in os.walk(HOME):

        if file_name in files:

            results.append(str(Path(root) / file_name))

    if not results:
        return "File not found."

    return "\n".join(results)


# =====================================================
# Dispatcher
# =====================================================

def dispatch(action, parsed):

    if action == "create_folder":
        return create_folder(parsed["name"])

    if action == "create_file":
        return create_file(parsed["name"])

    if action == "delete_file":
        return delete_file(parsed["name"])

    if action == "rename_file":
        return rename_file(
            parsed["old"],
            parsed["new"]
        )

    if action == "move_file":
        return move_file(
            parsed["name"],
            parsed["destination"]
        )

    if action == "copy_file":
        return copy_file(
            parsed["name"],
            parsed["destination"]
        )

    if action == "search_file":
        return search_file(parsed["name"])

    return None