from app_independencies import router,Request, __STORAGE_VAULT_PATH, PREFIX, ZIP_ARCS_PATH
from sqlalchemy.orm import Session
from fastapi import Depends
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO, shared_items
import os, shutil
from sqlalchemy import and_
from modules import find_new_item_path, justify_path_for_db
from views.personal.APIs.get_share_info import find_closest_record_parent
from typing import cast
import time


class userdata_token_ls(BaseModel):
    token: str

class userdata(BaseModel):
    token_ls: list[userdata_token_ls]
    dst_token: str

class RESPONSE(BaseModel):
    result: bool


in_change = set()



@router.post('/sec/move-item/')
async def view(request: Request, userdata: userdata, db : Session = Depends(get_db),) :
    user = request.state.user
    if user:

        token_ls = [t.token for t in userdata.token_ls]

        old_records = db.query(ITEMINFO).filter(and_(
            ITEMINFO.url_token.in_(token_ls),
            ITEMINFO.owner == user,
        )).all()


        if userdata.dst_token != 'main':
            received_path= db.query(ITEMINFO).filter(and_(
                ITEMINFO.url_token == userdata.dst_token,
                ITEMINFO.owner == user,
            )).first().path

        else:
            received_path = user


        if old_records and received_path:

            old_paths = [(os.path.join(__STORAGE_VAULT_PATH, path.path), path.url_token, path.type) for path in old_records]
            for i, (old_path, item_url_token, item_type) in enumerate(old_paths):
                if os.path.exists(old_path):
                    new_path = os.path.join(__STORAGE_VAULT_PATH, received_path, os.path.basename(old_path))

                    if not new_path == old_path:

                        if os.path.exists(new_path):
                            new_path = find_new_item_path.get(new_path)

                        
                        old_path: str
                        new_path: str


                        try:
                            #prevents user from asking for moving an item while the previous one is not done
                            if old_path not in in_change:
                                in_change.add(old_path)
                            else:
                                continue
                            
                            try:
                                
                                shutil.move(old_path, new_path)                                
                                print(f"Moving:  {old_path} to  -->  {new_path}")

                                old_db_path = justify_path_for_db.get(old_path)
                                new_db_path = justify_path_for_db.get(new_path)
                                old_records[i].path = new_db_path

                                share_data = db.query(shared_items).filter(shared_items.path.like(f"{old_db_path}%")).all()
                                if share_data:
                                    for record in share_data:
                                        db.delete(record)
                                    
                                parent_record = find_closest_record_parent(new_db_path)
                                if parent_record:
                                    parent_record = cast(shared_items, parent_record)
                                    
                                    new_record = shared_items(
                                        path = new_db_path,
                                        type = item_type,
                                        local_token = item_url_token,
                                        access_type = parent_record.access_type,
                                        overall_access = parent_record.overall_access,
                                        owner = parent_record.owner,
                                        parent = False,
                                        FavouriteOf = parent_record.FavouriteOf,
                                        last_change = time.time(),
                                    )

                                    db.add(new_record)

                            finally:    
                                in_change.remove(old_path)


                        except shutil.Error:
                            print('Cannot move directory into itself!')
                            pass

            db.commit()

            return {'result': True}
                

                
    


