

from fastapi import APIRouter, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from views.models import User as model_user
from db_conn import get_db
from uuid import  uuid4
import random, json
import bcrypt
from pydantic import EmailStr, BaseModel
from modules import send_mail
from modules.passcodes import store_passcode, too_many_requests

router = APIRouter()

class register_data(BaseModel):
    email : EmailStr
    password : str

async def send_code_task(email: str, passcode: int):
    print('sending an email to ---> ', email)
    send_mail.send_code(email).set_content(passcode, "You have requested to create an account. Use the 6-digit access code below to continue:", "If you didn't request this code, you can safely ignore this email.").send_this()


@router.post('/register/')
async def view(request:Request, bg_tasks: BackgroundTasks, userdata: register_data, db: Session = Depends(get_db)):
    if too_many_requests(request, 'register'):
        return {'rate_limited': True}

    email = userdata.email
    exists = db.query(model_user).filter(model_user.email==email).first()
    if exists:
        return {'already_exists': True}
        
    else:
        passcode = random.randint(100000, 999999)
        auth_token_gen = uuid4()

        user_credentials = {
            'address': userdata.email,
            'passwd': bcrypt.hashpw(userdata.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        }

        store_passcode(db, passcode, auth_token_gen, 'register', json.dumps(user_credentials))
        bg_tasks.add_task(send_code_task, email, passcode)
        db.commit()
        return {'auth_token': auth_token_gen}
            
