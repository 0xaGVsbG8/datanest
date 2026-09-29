from datetime import datetime, timedelta, timezone
from uuid import UUID
from fastapi.requests import Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from views.models import passcodes_info
from modules import manage_redis

PASSCODE_TTL_SECONDS = 15 * 60
MAX_PASSCODE_ATTEMPTS = 5
RATE_LIMIT = 10
RATE_WINDOW_SECONDS = 60

_table_ready = False


def utc_now():
    return datetime.now(timezone.utc)


def as_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def ensure_columns():
    global _table_ready
    if _table_ready:  
        return
    from db_conn import engine
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE passcodes_info ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP"
        ))
        conn.execute(text(
            "ALTER TABLE passcodes_info ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0"
        ))
        conn.execute(text(
            "UPDATE passcodes_info SET attempts = 0 WHERE attempts IS NULL"
        ))
    _table_ready = True


def client_ip(request: Request) -> str:
    real = request.headers.get('x-real-ip')
    if real:
        return real.strip()
    forwarded = request.headers.get('x-forwarded-for')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.client.host if request.client else 'unknown'


def too_many_requests(request: Request, bucket: str) -> bool:
    key = f'auth:{bucket}:{client_ip(request)}'
    try:
        return manage_redis.rate_limit_exceeded(key, RATE_LIMIT, RATE_WINDOW_SECONDS)
    except Exception:
        return True


def store_passcode(db: Session, passcode, auth_token: UUID, op_type: str, for_user_token):
    ensure_columns()
    now = utc_now()
    db.query(passcodes_info).filter(
        passcodes_info.expires_at.isnot(None),
        passcodes_info.expires_at <= now
    ).delete(synchronize_session=False)

    token_key = str(for_user_token)
    if op_type in ('login', 'reset_password'):
        db.query(passcodes_info).filter(
            passcodes_info.type == op_type,
            passcodes_info.for_user_token == token_key
        ).delete(synchronize_session=False)

    db.add(passcodes_info(
        passcode=passcode,
        auth_token=auth_token,
        type=op_type,
        for_user_token=token_key,
        expires_at=now + timedelta(seconds=PASSCODE_TTL_SECONDS),
        attempts=0,
    ))


def drop_passcode(db: Session, row: passcodes_info):
    db.delete(row)
    db.commit()
