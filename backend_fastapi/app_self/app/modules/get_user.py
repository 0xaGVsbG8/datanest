
from fastapi.requests import Request
from views.models import User, UserSession
from sqlalchemy.orm import Session
from db_conn import get_db
from uuid import UUID
from datetime import datetime
from modules.sessions import ensure_table, SESSION_COOKIE



def get(request: Request, db: Session = next(get_db())):
    cookies = request.cookies
    raw_token = cookies.get(SESSION_COOKIE)
    if not raw_token:
        return False

    try:
        token = UUID(raw_token)
    except (ValueError, TypeError):
        return False

    ensure_table()
    session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.utcnow()
    ).first()

    if not session:
        expired = db.query(UserSession).filter(UserSession.token == token).first()
        if expired:
            db.delete(expired)
            db.commit()
        return False

    user = db.query(User).filter(User.email == session.user_email).first()
    if user:
        return user.email

    db.delete(session)
    db.commit()
    return False
