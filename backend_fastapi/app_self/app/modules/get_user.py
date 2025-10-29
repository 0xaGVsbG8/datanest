
from fastapi.requests import Request
import ast
from views.models import User
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic import BaseModel
from db_conn import get_db, SessionLocal
from uuid import UUID




def get(request: Request, db: Session = next(get_db())):
    cookies = request.cookies
    if cookies.get('user_token'):
        user_token = UUID(cookies.get('user_token'))
        result = db.query(User).filter(User.user_token==user_token).first()
        if result:
            return result.email
            
    return False