from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from views.models import ITEMINFO,  User
import os, shutil
from db_conn import get_db
from fastapi.responses import JSONResponse
from modules.sessions import revoke_all_for_user, clear_session_cookie


async def drop_dbs_records(user: str):
    db = next(get_db())
    db: Session
    result = db.query(ITEMINFO).filter(ITEMINFO.owner==user).all()
    if result:
        for record in result:
            db.delete(record)
        db.commit()
    db.close()



@router.get('/sec/delete-account/')
async def view(request: Request, bg_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    user = request.state.user

    if user:
        userpath = os.path.join(__STORAGE_VAULT_PATH, user)
        response = JSONResponse(content={'deleted':True})

        if os.path.exists(userpath):
            shutil.rmtree(userpath)
        
        result = db.query(User).filter(User.email==user).first()
        if result:
            revoke_all_for_user(db, user)
            db.delete(result)
            db.commit()


        bg_tasks.add_task(drop_dbs_records, user)
        clear_session_cookie(request, response)
        


        return response
    

    raise HTTPException(status_code=403, detail="No account")