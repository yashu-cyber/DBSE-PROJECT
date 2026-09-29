import os
from datetime import datetime, timedelta, timezone

import jwt


JWT_SECRET = os.getenv("JWT_SECRET", "warehouseiq-dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 8


def create_token(user_id, username, role):
    now = datetime.now(timezone.utc)

    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRATION_HOURS),
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token):
    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM],
    )
