


from fastapi import APIRouter, Request
from app_independencies import Request
from functools import wraps
from db_conn import get_db
from views.models import User
from uuid import UUID
from app_independencies import ALLOW_TEST_ACC_FOR_DEV_PURPOSES, TEST_ACC_FOR_DEV_PURPOSES, __STORAGE_VAULT_PATH
import os

router = APIRouter()

def auth_validator(func):
    @wraps(func)
    async def wrapper(*args,**kwargs):
        if kwargs.get('request'):
            cookies = kwargs['request'].cookies
            db = next(get_db())
            try:
                if not cookies.get('test_acc'):
                    if cookies.get('user_token'):
                        user_token = UUID(cookies.get('user_token'))
                        result = db.query(User).filter(User.user_token==user_token).first()
                        if result:
                            return await func(*args,**kwargs)
                        
                else:
                    if not ALLOW_TEST_ACC_FOR_DEV_PURPOSES:
                        return False
                    
                    result = db.query(User).filter(User.email==TEST_ACC_FOR_DEV_PURPOSES).first()
                    if not result:
                        db.add(User(email=TEST_ACC_FOR_DEV_PURPOSES,password='',isDev=False))
                        db.commit()
                        
                        dirpath = os.path.join(__STORAGE_VAULT_PATH, TEST_ACC_FOR_DEV_PURPOSES)
                        if not os.path.exists(dirpath):
                            os.makedirs(dirpath)

                    return await func(*args,**kwargs)
                
            finally:
                db.close()
                
        return False
          
    return wrapper


@router.post("/auth-creds/") 
@auth_validator
async def view(request:Request):
    return {"auth": True}
