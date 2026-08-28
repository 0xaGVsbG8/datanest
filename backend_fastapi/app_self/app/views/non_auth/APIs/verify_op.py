from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db_conn import get_db
from views.models import passcodes_info, User
import uuid
from typing import List, Optional
from uuid import UUID
import json
import bcrypt

router = APIRouter()

class users_token_props(BaseModel):
    user_token: UUID
    auth_token: UUID


class DataStorage_props(BaseModel):
    users_token: List[users_token_props]


DataStorage = DataStorage_props(
    # login_data= []
    users_token = []
)


@router.get('/verify_op/')
async def view(request: Request,response: Response, passcode: int = Query(..., ge=100000, le=999999), auth_token: UUID = Query(...), new_password: Optional[str] = Query(None), db: Session = Depends(get_db)):


    result = db.query(passcodes_info).filter(passcodes_info.auth_token == auth_token).first()
    # print(result.passcode, '<--- correct passcode, received passcode --->', passcode)
    if result:
        if result.passcode == passcode:
            if result.type == 'login':
                response.set_cookie(
                    key='user_token',
                    value=str(result.for_user_token),
                    httponly=True,
                    max_age=60*60*24*365*10,
                    path='/'
                )
                db.delete(result)
                db.commit()
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
                        db.delete(result)
                        db.commit()
                        print('password changed')
                        return {'password_changed': True}


            if result.type == 'register':
                userdata = json.loads(result.for_user_token) 
                email = userdata['address']
                if not db.query(User).filter(User.email==email).first():
                    passwd = bcrypt.hashpw(str(userdata['passwd']).encode('utf-8'),bcrypt.gensalt())
                    db.add(User(email=email,password=passwd.decode('utf-8'),isDev = False))
                    db.delete(result)
                    db.commit()
                    return {'user_created': True}


            return {'result': False}
    
        else:
            return {'passcode_incorrect': True}

    
    else:
        return {'auth_token_found': False}
