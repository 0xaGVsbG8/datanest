

from fastapi import APIRouter, Depends, BackgroundTasks, Request
from fastapi.responses import Response
from app_dependencies import SEND_MAILS, ROOT_EMAIL, ROOT_PASSWD, ALLOW_TEST_ACC_FOR_DEV_PURPOSES, TEST_ACC_FOR_DEV_PURPOSES, TEST_ACC_PASSWORD
from sqlalchemy.orm import Session
from views.models import User as model_user
import bcrypt
from db_conn import get_db
import random
from uuid import uuid4
from modules import send_mail
from modules.sessions import create_session, set_session_cookie
from modules.passcodes import store_passcode, too_many_requests
from pydantic import EmailStr, BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter()


class login_data(BaseModel):
    email : EmailStr
    password : str
    auth_token: Optional[UUID] = None



async def send_code_task(email: str, passcode: int):
    print('sending an email to ---> ', email)
    send_mail.send_code(email).set_content(passcode, "You have requested to log in. Use the 6-digit access code below to continue:", "If you didn’t request this code, you can safely ignore this email.").send_this()


@router.post('/login/')
async def view(request:Request, bg_tasks: BackgroundTasks, response: Response, userdata: login_data, db: Session = Depends(get_db)):
    if too_many_requests(request, 'login'):
        return {'rate_limited': True}

    email = userdata.email

    #If test account detected user just needs to refresh a page no need to authenticate with an email passcode        
    if ALLOW_TEST_ACC_FOR_DEV_PURPOSES and email == TEST_ACC_FOR_DEV_PURPOSES:
        if userdata.password != TEST_ACC_PASSWORD:
            return {"creds":"incorrect"}

        response.set_cookie(
            key = 'test_acc',
            value = True,
            httponly = True,
            max_age = 999999,
            path = '/'
        )
        
        return {'loged_in': True}
    

    passwd = userdata.password.encode('utf-8')

    
    if email == ROOT_EMAIL and passwd.decode('utf-8') == ROOT_PASSWD:

        id_from_db = db.query(model_user).filter(model_user.email==ROOT_EMAIL).first()
        if id_from_db:
            session_token = create_session(db, id_from_db.email)
            db.commit()
            set_session_cookie(request, response, session_token)
            return {'loged_in': True}

    
    user_creds = db.query(model_user).filter(model_user.email==email).first()
    if user_creds:
        if bcrypt.checkpw(passwd,user_creds.password.encode('utf-8')):
            passcode = random.randint(100000, 999999)
            auth_token_gen = uuid4()
            userdata.auth_token = auth_token_gen

            store_passcode(db, passcode, auth_token_gen, 'login', user_creds.user_token)

            db.commit()

            bg_tasks.add_task(send_code_task, email, passcode) if SEND_MAILS else None

            return {'auth_token': str(auth_token_gen)}
        
        
    return {"creds":"incorrect"}
            
                    
