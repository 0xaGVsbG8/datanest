from fastapi import APIRouter, Depends, Query, Request
from app_independencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, Query
import bcrypt
from pydantic import validate_email
from db_conn import get_db
from views.models import User
import os








@router.get('/dev/add-user/')
async def view(
                request: Request, 
                address: str, 
                passwd: str = Query(..., min_length=1),
                isDev: bool = Query(...),
                db: Session = Depends(get_db)
            ):
    
    try:
        validate_email(address)
    except Exception:
        return {'invalid_email':True}

    
    result = db.query(User).filter(User.email == address).first()
    if result:
        return {'exists':True}
    
    else:
        passwd = bcrypt.hashpw(passwd.encode('utf-8'),bcrypt.gensalt()).decode('utf-8')
        
        new_record = User(
            email = address,
            password = passwd,
            isDev = isDev,
        )

        db.add(new_record)
        db.commit()

        user_path = os.path.join(__STORAGE_VAULT_PATH, address)
        if not os.path.exists(user_path):
            print('Creating users dir')
            os.makedirs(user_path)

    
    return {'result':True}
