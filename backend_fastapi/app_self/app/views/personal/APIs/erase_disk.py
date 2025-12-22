from fastapi import APIRouter, BackgroundTasks, Request
from app_independencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks
from db_conn import get_db
from views.models import ITEMINFO
from modules import justify_path_for_db
import os, shutil


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



@router.get('/sec/erase-disk/')
async def view(request: Request, bg_tasks: BackgroundTasks):
    
    user = request.state.user

    if user:
        userpath = os.path.join(__STORAGE_VAULT_PATH, user)
        if os.path.exists(userpath):
            paths_ls = []
            for root, dirs, files in os.walk(userpath):

                for d in dirs:
                    dpath = os.path.join(root,d)
                    paths_ls.append(dpath)

                for f in files:
                    fpath = os.path.join(root, f)
                    paths_ls.append(fpath)

            bg_tasks.add_task(drop_dbs_records, paths_ls)

            shutil.rmtree(userpath)
            print(f'Erased a disk of user --> {user}')
            
            os.makedirs(userpath)

        return {'erased':True}