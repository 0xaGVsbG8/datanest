from fastapi import APIRouter, Depends, Query, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, Query
from sqlalchemy import and_
from db_conn import get_db
from views.models import ITEMINFO, User, shared_items
from typing import Literal
import shutil, os
from app_dependencies import ROOT_EMAIL
from modules.sessions import revoke_all_for_user


def delete_user_data(address):

    db = next(get_db())
    try:
        result = db.query(ITEMINFO).filter(ITEMINFO.owner == address).all()

        for record in result:
            db.delete(record)

        result = db.query(shared_items).filter(shared_items.owner == address).all()
        for record in result:
            db.delete(record)


        userpath = os.path.join(__STORAGE_VAULT_PATH, address)

        if os.path.exists(userpath):
            shutil.rmtree(userpath)
            os.makedirs(userpath)

        db.commit()

    finally:
        db.close()



@router.get('/dev/manage-user/')
async def view(
                request: Request, 
                address: str = Query(...), 
                action_type: Literal['delete','erase'] = Query(...),
                db: Session = Depends(get_db)
            ):
    
    
    user = db.query(User).filter(and_(User.email == address, User.email != ROOT_EMAIL)).first()
    if user:
        if action_type == 'delete':
            print(f'deleting a user --> {user}')
            revoke_all_for_user(db, address)
            db.delete(user)
            delete_user_data(address)


        if action_type == 'erase':
            print(f'erasing a user --> {user}')
            delete_user_data(address)

        
        db.commit()

        return {'result':True}
    
    
    return {'result':False}

