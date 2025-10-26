from app_independencies import router,Request, __STORAGE_VAULT_PATH
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from db_conn import get_db
import shutil, os
from views.models import ITEMINFO, shared_items



@router.get('/dev/format-disk/')
async def view(request: Request,background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    print('dev is askign to format the whole disk!')

    for dir in os.listdir(__STORAGE_VAULT_PATH):
        path = os.path.join(__STORAGE_VAULT_PATH, dir)
        try:
            if os.path.exists(path):
                if os.path.isdir(path):
                    shutil.rmtree(path)
                    os.makedirs(path)
                else:
                    os.remove(path)
        except Exception as e:
            pass

    db.query(ITEMINFO).delete()
    db.query(shared_items).delete()
    db.commit()

    return {'result': True}
