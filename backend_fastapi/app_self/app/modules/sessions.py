from datetime import datetime, timedelta
from uuid import UUID, uuid4
from fastapi.requests import Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from views.models import UserSession

SESSION_COOKIE = 'session_token'
SESSION_MAX_AGE = 60 * 60 * 24 * 14
SESSION_PATH = '/'

_table_ready = False


def ensure_table():
    global _table_ready
    if _table_ready:
        return
    from db_conn import engine
    UserSession.__table__.create(bind=engine, checkfirst=True)
    _table_ready = True


def _cookie_secure(request: Request) -> bool:
    proto = request.headers.get('x-forwarded-proto', request.url.scheme)
    return proto == 'https'


def set_session_cookie(request: Request, response: Response, token: UUID):
    response.set_cookie(
        key=SESSION_COOKIE,
        value=str(token),
        httponly=True,
        max_age=SESSION_MAX_AGE,
        path=SESSION_PATH,
        secure=_cookie_secure(request),
        samesite='lax',
    )


def clear_session_cookie(request: Request, response: Response):
    response.delete_cookie(
        key=SESSION_COOKIE,
        path=SESSION_PATH,
        httponly=True,
        samesite='lax',
        secure=_cookie_secure(request),
    )


def create_session(db: Session, user_email: str) -> UUID:
    ensure_table()
    token = uuid4()
    db.add(UserSession(
        token=token,
        user_email=user_email,
        expires_at=datetime.utcnow() + timedelta(seconds=SESSION_MAX_AGE),
    ))
    db.flush()
    return token


def revoke_session(db: Session, token: UUID):
    ensure_table()
    db.query(UserSession).filter(UserSession.token == token).delete(synchronize_session=False)


def revoke_all_for_user(db: Session, user_email: str):
    ensure_table()
    db.query(UserSession).filter(UserSession.user_email == user_email).delete(synchronize_session=False)
