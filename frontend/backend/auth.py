import os
import sqlite3
import hashlib
import re

# Determine database path (use /tmp on serverless environments like Vercel)
if os.path.exists("/tmp") and os.access("/tmp", os.W_OK):
    DB_NAME = "/tmp/users.db"
else:
    DB_NAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.db")


def get_connection():
    return sqlite3.connect(DB_NAME, check_same_thread=False)


def hash_password(password: str) -> str:
    salt = "ai_ecms_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def is_valid_email(email: str) -> bool:
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return re.match(pattern, email.strip()) is not None


def initialize_database():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Seed default user 'Alex' if database is empty
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]

        if count == 0:
            default_password_hash = hash_password("password123")
            cursor.execute(
                """
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
                """,
                ("Alex", "alex@college.edu", default_password_hash, "Student"),
            )

        connection.commit()
        connection.close()
    except Exception as e:
        print(f"Auth DB initialization error: {e}")


def register_user(name: str, email: str, password: str, role: str = "Student"):
    name = name.strip()
    email = email.strip().lower()
    role = role.strip() if role else "Student"

    if not name:
        return False, "Full name is required.", None

    if not is_valid_email(email):
        return False, "Please enter a valid email address.", None

    if len(password) < 6:
        return False, "Password must contain at least 6 characters.", None

    connection = get_connection()
    cursor = connection.cursor()

    try:
        hashed_password = hash_password(password)
        cursor.execute(
            """
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
            """,
            (name, email, hashed_password, role),
        )
        connection.commit()
        user_id = cursor.lastrowid

        user_data = {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
        }
        return True, "Account created successfully.", user_data

    except sqlite3.IntegrityError:
        return False, "An account with this email already exists.", None
    except Exception as e:
        return False, f"Registration failed: {str(e)}", None
    finally:
        connection.close()


def login_user(email: str, password: str):
    email = email.strip().lower()

    if not email:
        return False, "Email is required.", None

    if not password:
        return False, "Password is required.", None

    hashed_password = hash_password(password)

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            WHERE email = ? AND password = ?
            """,
            (email, hashed_password),
        )
        user = cursor.fetchone()

        if user:
            user_data = {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "role": user[3],
            }
            return True, "Login successful.", user_data

        return False, "Invalid email or password.", None

    except Exception as e:
        return False, f"Login error: {str(e)}", None
    finally:
        connection.close()


# Auto-initialize on import
initialize_database()
