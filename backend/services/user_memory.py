from database.db import get_connection


def save_fact(chat_id: str, key: str, value: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT,
            memory_key TEXT,
            memory_value TEXT
        )
    """)

    cursor.execute("""
        INSERT INTO user_memory
        (chat_id, memory_key, memory_value)
        VALUES (?, ?, ?)
    """, (chat_id, key, value))

    conn.commit()
    conn.close()


def get_fact(chat_id: str, key: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT memory_value
        FROM user_memory
        WHERE chat_id=? AND memory_key=?
        ORDER BY id DESC
        LIMIT 1
    """, (chat_id, key))

    row = cursor.fetchone()

    conn.close()

    if row:
        return row["memory_value"]

    return None