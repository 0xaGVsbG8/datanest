from app_independencies import router,Request, __STORAGE_VAULT_PATH
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from modules import justify_path_for_db, get_rid_of_dups, validate_ownership
import os
from sqlalchemy import and_


class userdata(BaseModel):
    path_token: str



async def drop_dbs_records(paths_ls: list):


    dbpaths = [justify_path_for_db.get(path) for path in paths_ls]
    db = next(get_db())
    db: Session
    result = db.query(ITEMINFO).filter(ITEMINFO.path.in_(dbpaths)).all()
    if result:
        for record in result:
            db.delete(record)
        db.commit()
    db.close()



@router.post('/sec/rem-dups/')
async def view(request: Request, userdata: userdata, bg_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    user = request.state.user

    if user:
        userpath = os.path.join(__STORAGE_VAULT_PATH, user)

        src_path = 'x'
        if userdata.path_token == 'main':
            src_path = userpath
        else:
            src_path = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token==userdata.path_token,ITEMINFO.owner==user)).first()
            if not src_path:
                src_path = db.query(shared_items).filter(shared_items.local_token==userdata.path_token).first()
                if src_path:
                    src_path = None if not validate_ownership.validate_shared_record(src_path, user) else src_path.path

            if not src_path:
                return {'dups':False}

        result = get_rid_of_dups.scan_dups(src_path, True)

        bg_tasks.add_task(drop_dbs_records, result)
       
        return {'dups':True}