import sqlite3
import hashlib
import re


# ============================================================
# DATABASE
# ============================================================

DB_NAME = "users.db"


def get_connection():
    return sqlite3.connect(
        DB_NAME,
        check_same_thread=False
    )


def initialize_database():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    connection.commit()
    connection.close()


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password):

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# ============================================================
# EMAIL VALIDATION
# ============================================================

def is_valid_email(email):

    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return re.match(
        pattern,
        email
    ) is not None


# ============================================================
# REGISTER USER
# ============================================================

def register_user(
    name,
    email,
    password,
    role
):

    name = name.strip()
    email = email.strip().lower()

    if not name:
        return False, "Name is required."

    if not is_valid_email(email):
        return False, "Please enter a valid email address."

    if len(password) < 6:
        return False, "Password must contain at least 6 characters."

    connection = get_connection()
    cursor = connection.cursor()

    try:

        hashed_password = hash_password(
            password
        )

        cursor.execute(
            """
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)
            """,
            (
                name,
                email,
                hashed_password,
                role
            )
        )

        connection.commit()

        return True, "Account created successfully."

    except sqlite3.IntegrityError:

        return False, "An account with this email already exists."

    finally:

        connection.close()


# ============================================================
# LOGIN USER
# ============================================================

def login_user(
    email,
    password
):

    email = email.strip().lower()

    hashed_password = hash_password(
        password
    )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, email, role
        FROM users
        WHERE email = ?
        AND password = ?
        """,
        (
            email,
            hashed_password
        )
    )

    user = cursor.fetchone()

    connection.close()

    if user:

        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[3]
        }

    return None