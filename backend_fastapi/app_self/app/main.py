


from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess,threading
import os
from app_independencies import OS,router, origins
from views.non_auth.APIs import login
from views.non_auth.APIs import register
from views.non_auth.APIs import log_out, verify_op, reset_password
from views import auth_creds
from views import assign_user_id
from views.personal.APIs import change_favourite_state, rem_dups, delete_account, erase_disk, log_out,get_user_info_for_settings, get_items, upload_items_get_token,edit_share_info, get_share_info, rem_items, move_item, rename_item, mkdir, download_items_get_token
from views.personal.WSs import handle_download_items, handle_upload_items
from views.personal.middlewares import protect_storage_resrc, protect_personal
from views.for_devs import get_dev_data, update_limit, restart_service, format_disk, delete_every_user, add_user, manage_user
from views.for_devs import protect_dev_src
from fastapi import Depends
from sqlalchemy.orm import Session
from app_independencies import app
import asyncio
from db_conn import get_db
from views import Request_timeouter






app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@router.api_route('/test/',methods=['GET','POST','DELETE','PUT','PATCH'])
async def view(request:Request):
    return ('It works!','Remote-addr -->',request.client.host)


@router.api_route('/',methods=['GET','POST','DELETE','PUT','PATCH'])
async def view(request:Request):
    print('contact')
    return ('It works!','Remote-addr -->',request.client.host)


@app.api_route('/',methods=['GET','POST','DELETE','PUT','PATCH'])
async def view(request:Request):
    print('contact')
    return ('It works!','Remote-addr -->',request.client.host, )







app.include_router(router)




