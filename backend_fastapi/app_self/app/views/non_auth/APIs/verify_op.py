from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from db_conn import get_db
from views.models import passcodes_info, User
import uuid
from typing import Optional
from uuid import UUID
import json
import bcrypt
from datetime import datetime
from modules.sessions import create_session, set_session_cookie, revoke_all_for_user
from modules.passcodes import (
    MAX_PASSCODE_ATTEMPTS,
    drop_passcode,
    ensure_columns,
    too_many_requests,
)

router = APIRouter()


class verify_op_data(BaseModel):
    passcode: int = Field(..., ge=100000, le=999999)
    auth_token: UUID
    new_password: Optional[str] = None


@router.post('/verify_op/')
async def view(request: Request, response: Response, userdata: verify_op_data, db: Session = Depends(get_db)):
    if too_many_requests(request, 'verify_op'):
        return {'rate_limited': True}

    ensure_columns()
    passcode = userdata.passcode
    auth_token = userdata.auth_token
    new_password = userdata.new_password


    result = db.query(passcodes_info).filter(passcodes_info.auth_token == auth_token).first()
    # print(result.passcode, '<--- correct passcode, received passcode --->', passcode)
    if result:
        if not result.expires_at or result.expires_at <= datetime.utcnow():
            drop_passcode(db, result)
            return {'passcode_expired': True}

        if result.passcode == passcode:
            if result.type == 'login':
                try:
                    account_token = UUID(str(result.for_user_token))
                except (ValueError, TypeError):
                    account_token = None
                user = db.query(User).filter(User.user_token == account_token).first() if account_token else None
                if user:
                    session_token = create_session(db, user.email)
                    db.delete(result)
                    db.commit()
                    set_session_cookie(request, response, session_token)
                    return {'loged_in': True}
            
            
            if result.type == 'reset_password':
                if not new_password:
                    return {'reset_password_procced': True}
                
                else:
                    new_result = db.query(User).filter(User.user_token==result.for_user_token).first()
                    if new_result:
                        hasshed_passwd = bcrypt.hashpw(new_password.encode('utf-8'),bcrypt.gensalt()).decode()
                        new_result.password = hasshed_passwd
                        new_result.user_token = uuid.uuid4()
                        revoke_all_for_user(db, new_result.email)
                        db.delete(result)
                        db.commit()
                        print('password changed')
                        return {'password_changed': True}


            if result.type == 'register':
                userdata = json.loads(result.for_user_token) 
                email = userdata['address']
                if not db.query(User).filter(User.email==email).first():
                    passwd = str(userdata['passwd'])
                    if not passwd.startswith('$2'):
                        passwd = bcrypt.hashpw(passwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    db.add(User(email=email,password=passwd,isDev = False))
                    db.delete(result)
                    db.commit()
                    return {'user_created': True}


            return {'result': False}
    
        else:
            result.attempts = (result.attempts or 0) + 1
            if result.attempts >= MAX_PASSCODE_ATTEMPTS:
                drop_passcode(db, result)
                return {'too_many_attempts': True}
            db.commit()
            return {'passcode_incorrect': True}

    
    else:
        return {'auth_token_found': False}
