
from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_dependencies import SEND_MAILS
from sqlalchemy.orm import Session
from views.models import User
from db_conn import get_db
import random
from uuid import uuid4
from modules import send_mail
from modules.passcodes import store_passcode, too_many_requests
from pydantic import EmailStr

router = APIRouter()

class response:
    auth_token: uuid4


async def send_code_task(email: str, passcode: int):
    print('sending an email to ---> ', email)
    send_mail.send_code(email).set_content(passcode, "You have requested to reset the password. Use the 6-digit access code below to continue:", None).send_this()



@router.get('/reset_password/')
async def view(request:Request,bg_tasks: BackgroundTasks, address: EmailStr, db: Session = Depends(get_db) ):
    if too_many_requests(request, 'reset_password'):
        return {'rate_limited': True}

    result = db.query(User).filter(User.email==address).first()
    if result:
        passcode = random.randint(100000, 999999)
        auth_token_gen = uuid4()
        store_passcode(db, passcode, auth_token_gen, 'reset_password', result.user_token)
        db.commit()
        bg_tasks.add_task(send_code_task, result.email, passcode) if SEND_MAILS else None
        return {'auth_token': str(auth_token_gen)}


    return {'found_address': False}


            
