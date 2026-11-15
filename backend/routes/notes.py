from fastapi import APIRouter
from pydantic import BaseModel

from database.db import get_connection

router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class NoteCreate(BaseModel):
    title: str
    content: str = ""


class TaskCreate(BaseModel):
    title: str
    due_date: str | None = None


class TaskUpdate(BaseModel):
    done: bool


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

@router.get("/notes")
def list_notes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, title, content, created_at, updated_at "
        "FROM notes ORDER BY updated_at DESC"
    )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


@router.post("/notes")
def create_note(note: NoteCreate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO notes (title, content) VALUES (?, ?)",
        (note.title, note.content),
    )

    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {"id": new_id, "title": note.title, "content": note.content}


@router.delete("/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))

    conn.commit()
    conn.close()

    return {"status": "deleted", "id": note_id}


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

@router.get("/tasks")
def list_tasks():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, title, done, due_date, created_at "
        "FROM tasks ORDER BY done ASC, created_at DESC"
    )

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


@router.post("/tasks")
def create_task(task: TaskCreate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tasks (title, due_date) VALUES (?, ?)",
        (task.title, task.due_date),
    )

    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {"id": new_id, "title": task.title, "done": False, "due_date": task.due_date}


@router.patch("/tasks/{task_id}")
def update_task(task_id: int, update: TaskUpdate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE tasks SET done = ? WHERE id = ?",
        (1 if update.done else 0, task_id),
    )

    conn.commit()
    conn.close()

    return {"id": task_id, "done": update.done}


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))

    conn.commit()
    conn.close()

    return {"status": "deleted", "id": task_id}
