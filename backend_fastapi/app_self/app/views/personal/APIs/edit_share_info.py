from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from app_independencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
import ast
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr, model_validator
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from modules import send_mail
from typing import List, Literal, Optional
import os
from sqlalchemy import and_
from modules import justify_path_for_db
import time

class addresses_dict(BaseModel):
    address: EmailStr


class fetch_item_info_props(BaseModel):
    members: Optional [List[addresses_dict]] = None
    overall_access: Literal['restricted' , 'anyone']
    access_type: Literal['browse-only' , 'editing']
    url_token: str


    #only checks if there are email addresses if overall access is restricted
    @model_validator(mode='before')
    def check_members_if_restricted_access(cls, values):
        overall_access = values.get('overall_access')
        members = values.get('members')
        if overall_access == 'restricted':
            if not members or len(members) == 0:
                raise ValueError('Members must be provided if overall_access is restricted')
        return values


class userdata(BaseModel):
    fetch_item_info: fetch_item_info_props
    notify_them: bool 
    overwrite_rights: bool 
    action: Literal['erase', 'edit']


    


class RESPONSE(BaseModel):
    result: bool 




def recurent_update(db: Session, path: os.path, hard_overwrite: bool):
    path = os.path.join(__STORAGE_VAULT_PATH, path)
    root_path = path
    items_ls = []
    for root, dirs, files in os.walk(path):
        for d in dirs:
            items_ls.append(justify_path_for_db.get(os.path.join(root,d)))
        for f in files:
            items_ls.append(justify_path_for_db.get(os.path.join(root,f)))


    path = justify_path_for_db.get(path)


    parent_record = db.query(shared_items).filter(shared_items.path==path).first()
    if not parent_record:
        return
    
    result = db.query(shared_items).filter(shared_items.path.like(f"{path}%")).all()

    shared_items_ls = {record.path:[record.local_token, record.parent, record]  for record in result  if record.path != path}
  
   
    local_items =  {record.path:[record.url_token]  for record in db.query(ITEMINFO).filter(ITEMINFO.path.like(f"{path}%")).all()}
    exceptions = []


    records_ls = []
    for item in items_ls:
        if item!=root_path:
            if shared_items_ls.get(item):
                if shared_items_ls[item][1] == True and not hard_overwrite:
                    exceptions.append(shared_items_ls[item][2])
                    continue
                
            if item in local_items:
                records_ls.append(
                    shared_items(
                        path = item,
                        type = 'dir' if os.path.isdir(os.path.join(__STORAGE_VAULT_PATH, item)) else 'file',
                        local_token = local_items[item][0],
                        access_type = parent_record.access_type,
                        allowed_by = parent_record.allowed_by,
                        overall_access = parent_record.overall_access,
                        owner = parent_record.owner,
                        parent = False
                    )
                )

    for item, (url_path, parent, record ) in shared_items_ls.items():
        db.delete(record)
    
    db.add_all(records_ls+exceptions)
    db.commit()
   
async def send_notification(addresses: list, url: str):
    print('sending a notification')
    for address in addresses:
        send_mail.send_share_notfification(address).set_content(f'Accessible at: {url}').send_this()
        print(address)



@router.post('/sec/edit-share-info/')
async def view(request: Request, userdata: userdata, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = request.state.user
    if user:
        if userdata.action == 'edit':
            result = db.query(shared_items).filter(and_(shared_items.owner==user,shared_items.local_token==userdata.fetch_item_info.url_token)).first()
            allowed_by = [member.address for member in userdata.fetch_item_info.members]
            if result:
                result.allowed_by = allowed_by
                result.overall_access = userdata.fetch_item_info.overall_access
                result.access_type = userdata.fetch_item_info.access_type
                result.parent = True
                
                if os.path.isdir(os.path.join(__STORAGE_VAULT_PATH,result.path)):
                    recurent_update(db, result.path, userdata.overwrite_rights)

                result = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token==userdata.fetch_item_info.url_token,ITEMINFO.owner==user)).first()
                if result:
                    result.last_change = time.time()




                db.commit()

                if userdata.notify_them and userdata.fetch_item_info.overall_access == 'restricted':
                    background_tasks.add_task(send_notification, [member.address for member in userdata.fetch_item_info.members], userdata.fetch_item_info.url_token)
                

                return {'result':True}
        
        if userdata.action == 'erase':
            result = db.query(shared_items).filter(shared_items.local_token==userdata.fetch_item_info.url_token).first()
            parent_path = result
            if result:
                result = db.query(shared_items).filter(and_(shared_items.path.like(f"{result.path}%"),~shared_items.parent)).all()
                [db.delete(record) for record in result]
                db.delete(parent_path)
                db.commit()
                return {'shared_data_erased': True}


    raise HTTPException(status_code=403, detail="Access denied")
 