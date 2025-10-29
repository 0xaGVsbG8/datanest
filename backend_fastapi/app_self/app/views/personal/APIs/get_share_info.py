from app_independencies import router,Request, __STORAGE_VAULT_PATH
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO, shared_items
import uuid
import os
from sqlalchemy import and_
from .edit_share_info import recurent_update
from typing import cast
import time

class userdata(BaseModel):
    local_token: str

class RESPONSE(BaseModel):
    url: bool | str


def find_oldest_record_parent(record_path):
    db = next(get_db())
    try:

        paths_ls = []
        paths_parts = (record_path.replace('\\','/').split('/'))

        for i in range(len(paths_parts), 0, -1):
            paths_ls.append('/'.join(paths_parts[:i]))
        if paths_ls:
            result = db.query(shared_items).filter(shared_items.path.in_(paths_ls)).all()
            result = sorted(result, key=lambda r:r.path)
            for r in result:
                if r.parent:
                    return r
        return None
    finally:
        db.close()



def find_closest_record_parent(record_path):
    db = next(get_db())
    try:

        paths_ls = []
        paths_parts = (record_path.replace('\\','/').split('/'))

        parents_records = []

        for i in range(len(paths_parts), 0, -1):
            paths_ls.append('/'.join(paths_parts[:i]))
        if paths_ls:
            result = db.query(shared_items).filter(shared_items.path.in_(paths_ls)).all()
            result = sorted(result, key=lambda r:r.path)
            for r in result:
                if r.parent:
                    parents_records.append(r)
        
        if len(parents_records) != 0:
            return parents_records[len(parents_records)-1]

        return None
    finally:
        db.close()



@router.post('/sec/get-share-info/')
async def view(request: Request, userdata: userdata, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = request.state.user
    if user:
        parent_record = None

        shared_item_result = db.query(shared_items).filter(and_(shared_items.local_token == userdata.local_token, shared_items.owner == user)).first()
        local_item_result = db.query(ITEMINFO).filter(ITEMINFO.url_token == userdata.local_token, ITEMINFO.owner == user).first()
        
        print(f'user: {user} is asking for data of item --> {userdata.local_token}')
    

        if local_item_result:
            if not shared_item_result:
                parent_record = find_closest_record_parent(local_item_result.path)
                if parent_record:
                    parent_record = cast(shared_items, parent_record)

                local_item_result.last_change = time.time()
                new_record = shared_items(
                    path = local_item_result.path,
                    type = 'dir' if os.path.isdir(os.path.join(__STORAGE_VAULT_PATH,local_item_result.path)) else 'file',
                    local_token = local_item_result.url_token,
                    access_type =  parent_record.access_type if parent_record else 'browse-only',
                    allowed_by =  parent_record.allowed_by if parent_record else [user],
                    overall_access = parent_record.overall_access if parent_record else'restricted',
                    owner = user,
                    parent = False if parent_record else True,
                    FavouriteOf = [user] if local_item_result.isFavourite else []
                )


                db.add(new_record)
                recurent_update(db, local_item_result.path, False)

                shared_item_result = new_record

            else:
                parent_record = find_closest_record_parent(shared_item_result.path)

            if shared_item_result.owner not in shared_item_result.allowed_by:
                shared_item_result.allowed_by.append(shared_item_result.owner)


            members_ls = shared_item_result.allowed_by
            members_ls: list
            members_ls.sort(key=lambda member: 0 if member==shared_item_result.owner else 1)


            itemdata = {
                'name': os.path.basename(shared_item_result.path),
                'owner': shared_item_result.owner,
                'hierarchy_type': shared_item_result.parent,
                'members': [{'address':member} for member in members_ls ],
                'overall_access': shared_item_result.overall_access,
                'access_type': shared_item_result.access_type,
                'url_token': shared_item_result.local_token,
                'ChildrenOf': os.path.basename(parent_record.path) if parent_record else None,
                'type': 'dir' if os.path.isdir(os.path.join(__STORAGE_VAULT_PATH, local_item_result.path)) else 'file'
            }


            db.commit()
            
            return itemdata
        

    raise HTTPException(status_code=403, detail="Access denied")

        
        


        