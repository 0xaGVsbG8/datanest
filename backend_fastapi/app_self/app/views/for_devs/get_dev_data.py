from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_dependencies import Request, __STORAGE_VAULT_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from db_conn import get_db
from modules import format_size, read_cfg_json
from modules import format_size
import shutil, os
from views.models import User


def get_users_info():

    db = next(get_db())
    try:
        result = db.query(User).all()
        if result:
            userdatas = []
            for record in result:
                userpath = os.path.join(__STORAGE_VAULT_PATH, record.email)
                userdata = {
                    'address': record.email,
                    'space': format_size.get(userpath) if os.path.exists(userpath) else '0.00Bs',
                    'crt-date': record.creation_date
                }
                userdatas.append(userdata)
            return userdatas
    finally:
        db.close()



@router.get('/dev/get_dev_data/')
async def view(request: Request,background_tasks: BackgroundTasks, db: Session = Depends(get_db)):


    user = request.state.user



    storage_size = format_size.get_folder_size(__STORAGE_VAULT_PATH)
    
    used_storage = format_size.convert(storage_size)


    #diffrence between win and linux
    DRIVE = os.path.splitdrive(__file__)[0]
    DRIVE = DRIVE if DRIVE != '' else '/'
    
    total , _, free = shutil.disk_usage(DRIVE) 
    free_storage = format_size.convert(total - free)


    perc = storage_size / free


    STORAGE_INFO = {
        'used_storage': used_storage,
        'real_used_storage': storage_size,

        'free_storage': free_storage,
        'real_free_storage': round(free, 2),

        'max_storage_per_acc': format_size.convert(await read_cfg_json.get_max_storage_per_acc()),
        'max_upload_size': format_size.convert(await read_cfg_json.get_max_upload_size()),

        'perc': perc
    }



    return {
        'STORAGE_INFO': STORAGE_INFO,
        'users_data': get_users_info()
    }