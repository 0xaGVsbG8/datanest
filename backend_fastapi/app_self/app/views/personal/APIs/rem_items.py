from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_independencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from pydantic import BaseModel
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from modules import justify_path_for_db, validate_ownership
import os, shutil
from sqlalchemy import and_
from typing import List, Literal


class item_ls(BaseModel):
    token: str
    name: str


class route_data(BaseModel):
    token: str
    items_ls: List[item_ls]
    filter_by: Literal['shared','off']



async def drop_file_records(itemlist: list):

    db = next(get_db())
    try:

        result = db.query(ITEMINFO).filter(ITEMINFO.path.in_([justify_path_for_db.get(item) for item in itemlist])).all()
        if result:
            [db.delete(record) for record in result]
            db.commit()


        result = db.query(shared_items).filter(shared_items.path.in_([justify_path_for_db.get(item) for item in itemlist])).all()
        if result:
            [db.delete(record) for record in result]
            db.commit()
            
    finally:
        db.close()


@router.post('/sec/rem-items/')
async def view(request: Request, route: route_data, background_tasks: BackgroundTasks, db: Session = Depends(get_db),):
    user = request.state.user
    print(route.filter_by, 'ddd',route.token,'22')
    if len(route.items_ls) == 0:
        print('Empty rem ')
        return False
    
    root_path = os.path.join(__STORAGE_VAULT_PATH)


    if route.filter_by == 'off':
        if route.token == 'main':
            paths = [os.path.join(user,item.name).replace('\\','/') for item in route.items_ls]
            result =  db.query(ITEMINFO).filter(and_(ITEMINFO.path.in_(paths),ITEMINFO.owner==user)).all()
            paths = [record.path for record in result]
            
        else:
            local_ownership = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token==route.token,ITEMINFO.owner == user)).first()
            if local_ownership:
                paths = [path.path for path in db.query(ITEMINFO).filter(and_(ITEMINFO.owner==user),ITEMINFO.url_token.in_([item.token for item in route.items_ls])).all()]
            else:
                #switching to shared if local ownership was not confirmed
                route.filter_by = 'shared'


    if route.filter_by == 'shared':
        tokens_ls = [item.token for item in route.items_ls]
        result = db.query(shared_items).filter(shared_items.local_token.in_(tokens_ls)).all()
        
        avaible_records = []

        for record in result:
            #authenticating ownership of given record such as access type etc...
            avaible_records.append(record) if validate_ownership.validate_shared_record(record, user) else None


        result = avaible_records

        paths = [record.path for record in result]
        root_path = __STORAGE_VAULT_PATH


    itemlist = []

    if paths:
        for item in paths:
            itempath = os.path.join(root_path, item)
            itemlist.append(itempath)

            if os.path.exists(itempath):
                if os.path.isdir(itempath):
                    shutil.rmtree(itempath)
                else:
                    os.remove(itempath)

        background_tasks.add_task(drop_file_records, itemlist)


        return {'op':True, 'deleted':[os.path.basename(item) for item in paths]}
    
    return {'op':False}
