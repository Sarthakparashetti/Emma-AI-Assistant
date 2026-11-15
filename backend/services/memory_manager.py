from database.db import get_connection


def add_message(chat_id: str, role: str, content: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO conversations (chat_id, role, content)
        VALUES (?, ?, ?)
        """,
        (chat_id, role, content),
    )

    conn.commit()
    conn.close()


def get_history(chat_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT role, content
        FROM conversations
        WHERE chat_id = ?
        ORDER BY id
        """,
        (chat_id,),
    )

    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "role": row["role"],
            "content": row["content"],
        }
        for row in rows
    ]


def clear_history(chat_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM conversations
        WHERE chat_id = ?
        """,
        (chat_id,),
    )

    conn.commit()
    conn.close()