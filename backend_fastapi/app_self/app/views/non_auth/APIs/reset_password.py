

from app_independencies import router,Request, SEND_MAILS
from fastapi import Depends, BackgroundTasks
from sqlalchemy.orm import Session
from views.models import User, passcodes_info
from db_conn import get_db
import random
from uuid import uuid4
from modules import send_mail
from pydantic import EmailStr


class response:
    auth_token: uuid4


async def send_code_task(email: str, passcode: int):
    print('sending an email to ---> ', email)
    send_mail.send_code(email).set_content(passcode, "You have requested to reset the password. Use the 6-digit access code below to continue:", None).send_this()



@router.get('/reset_password/')
async def view(request:Request,bg_tasks: BackgroundTasks, address: EmailStr, db: Session = Depends(get_db) ):
    result = db.query(User).filter(User.email==address).first()
    if result:
        passcode = ''.join([str(random.randint(0,9)) for _ in range(0,6)])
        auth_token_gen = uuid4()
        db.add(passcodes_info(
            passcode = passcode,
            auth_token = auth_token_gen,
            type = 'reset_password',
            for_user_token = result.user_token
        ))
        db.commit()
        bg_tasks.add_task(send_code_task, result.email, passcode) if SEND_MAILS else None
        return {'auth_token': str(auth_token_gen)}


    return {'found_address': False}


            

