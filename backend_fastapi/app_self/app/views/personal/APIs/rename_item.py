from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from pydantic import BaseModel, Field
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from modules import  justify_path_for_db, format_time_diff
from typing import Literal, Optional
import os, shutil
from sqlalchemy import and_

class userdata(BaseModel):
    token: str
    new_name: str = Field(..., min_length=1)
    filter_by: Literal['shared','off']


class RESPONSE(BaseModel):
    result: bool
    new_name: Optional[str]
    last_change: Optional[str]


in_change = set()



def update_records(oldpath, newpath):

    db = next(get_db())
    db: Session

    oldpath = justify_path_for_db.get(oldpath)
    newpath = justify_path_for_db.get(newpath)

    print(oldpath, newpath)

    
    records_from_share = db.query(shared_items).filter(shared_items.path==oldpath).all()
    if records_from_share:
        for record in records_from_share:
            record.path = newpath

    records_from_iteminfo = db.query(ITEMINFO).filter(ITEMINFO.path==oldpath).all()
    if records_from_iteminfo:
        for record in records_from_iteminfo:
            record.path = newpath

    db.commit()
    db.close()


@router.post('/sec/rename-item/', response_model = RESPONSE)
async def view(request: Request, userdata: userdata, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):

    user = request.state.user
    print(f'User is asking to rename: {userdata.token} to --> {userdata.new_name}')
    userdata.new_name = userdata.new_name.replace('/','')
    if user:

        if userdata.filter_by == 'off':
            result = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token == userdata.token, ITEMINFO.owner == user)).first()
        
        else:
            result = db.query(shared_items).filter(and_(shared_items.local_token == userdata.token)).first()
            if result:

                if result.owner != user:
                    if result.overall_access == 'restricted':
                        if user not in result.allowed_by:
                            return {'result':False}
                        else:
                            pass

                    if result.access_type != 'editing':
                        return {'result':False}
            

        if result:
            itempath = os.path.join(__STORAGE_VAULT_PATH, result.path)
            new_itempath = os.path.join(os.path.dirname(itempath),userdata.new_name)
            

            #prevents user from asking for name change while the previous one is not done
            if itempath not in in_change:
                in_change.add(itempath)
                try:
                    shutil.move(itempath, new_itempath)
                finally:
                    in_change.remove(itempath)

            update_records(itempath, new_itempath)

            db.commit()
            db.refresh(result)
            return {'result': True, 'new_name': os.path.basename(new_itempath), 'last_change': format_time_diff.convert(0)}


    return {'result': False}
