


from fastapi import APIRouter, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from views.models import User as model_user, passcodes_info
import bcrypt
from db_conn import get_db
from uuid import  uuid4
import random, json
from pydantic import EmailStr, BaseModel
from modules import send_mail

router = APIRouter()

class register_data(BaseModel):
    email : EmailStr
    password : str

async def send_code_task(email: str, passcode: int):
    print('sending an email to ---> ', email)
    send_mail.send_code(email).set_content(passcode, "You have requested to create an account. Use the 6-digit access code below to continue:", "If you didn't request this code, you can safely ignore this email.").send_this()


@router.post('/register/')
async def view(request:Request, bg_tasks: BackgroundTasks, userdata: register_data, db: Session = Depends(get_db)):

    email = userdata.email
    exists = db.query(model_user).filter(model_user.email==email).first()
    if exists:
        return {'already_exists': True}
        
    else:
        passcode = ''.join([str(random.randint(0,9)) for _ in range(0,6)])
        auth_token_gen = uuid4()

        user_credentials = {
            'address': userdata.email,
            'passwd': userdata.password,
        }

        db.add(passcodes_info(
            passcode = passcode,
            auth_token=auth_token_gen,
            type='register',
            for_user_token = json.dumps(user_credentials)
        ))
        bg_tasks.add_task(send_code_task, email, passcode)
        db.commit()
        return {'auth_token': auth_token_gen}
            

