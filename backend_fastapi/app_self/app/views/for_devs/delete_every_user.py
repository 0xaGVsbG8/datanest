from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Depends, BackgroundTasks
from db_conn import get_db
from views.models import ITEMINFO, User, shared_items, UserSession
import shutil, os




@router.get('/dev/delete-every-user/')
async def view(request: Request,background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    print('dev is asking to delete every user')
    
    devs_emails = select(User.email).where(User.isDev == True)
    devs_emails_result = [email for (email,) in db.execute(devs_emails).all()]
    db.query(UserSession).filter(~UserSession.user_email.in_(devs_emails_result)).delete(synchronize_session=False)
    db.query(User).filter(User.isDev == False).delete()
    db.query(ITEMINFO).filter(~ITEMINFO.owner.in_(devs_emails)).delete()
    db.query(shared_items).filter(~shared_items.owner.in_(devs_emails)).delete()
    db.commit()

    for item in os.listdir(__STORAGE_VAULT_PATH):
        if item not in devs_emails_result:
            if os.path.isdir(os.path.join(__STORAGE_VAULT_PATH, item)):
                shutil.rmtree(os.path.join(__STORAGE_VAULT_PATH, item))



    return {'result': True}