from fastapi import APIRouter, Depends, HTTPException, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import Depends, HTTPException
from db_conn import get_db
import os
from modules import format_size, justify_path_for_db, read_cfg_json
from views.models import User, ITEMINFO
from views.personal.APIs.get_items import blank_item_alias



def get_statistics(user):

    db = next(get_db())
    try:
        userpath = os.path.join(__STORAGE_VAULT_PATH, user)
        dls = []
        fls = []

        for root, dirs, files in os.walk(userpath):

            for d in dirs:
                dpath = os.path.join(root, d)
                if dpath == userpath:
                    continue
                dls.append(dpath)

            for f in files:
                fpath = os.path.join(root, f)
                fls.append(fpath)

        paths = dls + fls
        result = db.query(ITEMINFO).filter(and_(ITEMINFO.path.in_(paths), ITEMINFO.owner == user)).all()
        
        if result:
            db_paths = [record.path for record in result]
            dls = list(filter(lambda path:  blank_item_alias not in path and justify_path_for_db.get(path) in db_paths, dls))
            fls = list(filter(lambda path:  blank_item_alias not in path and justify_path_for_db.get(path) in db_paths, fls))

        

        return ((dls+fls), len(dls), len(fls))
    
    finally: 
        db.close()

@router.get('/sec/get_user_info_for_settings/')
async def view(request: Request, db: Session = Depends(get_db)):
    user = request.state.user
    if user:
        paths , d_count, f_count = get_statistics(user)
        
        real_used_storage = format_size.get_folder_size(os.path.join(__STORAGE_VAULT_PATH, user))

        real_max_storage_per_account = await read_cfg_json.get_max_storage_per_acc() 

        used_storage = format_size.get('',real_used_storage)
        max_storage_per_account = format_size.get('',await read_cfg_json.get_max_storage_per_acc() )

        
        print('user is asking for his info!', max_storage_per_account, real_used_storage)

        usage_perc = round((real_used_storage / real_max_storage_per_account),2)

        if usage_perc == 0:
            usage_perc = '>1'


        statistics = {
            'dcount':d_count,
            'fcount':f_count
        }
        

        return {
            'user': user,

            'isDev': db.query(User).filter(User.email==user).first().isDev,

            'real_used_storage': real_used_storage ,
            'real_max_storage_per_account': real_max_storage_per_account,

            'used_storage': used_storage,
            'max_storage_per_account': max_storage_per_account,

            'statistics': statistics,

            'usage_perc': usage_perc
        }
    

