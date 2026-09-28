


from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
import subprocess,threading
import os
from app_dependencies import OS, router, origins
from views import auth_creds
from views import assign_user_id
from views.non_auth import router as non_auth_router
from views.personal import router as personal_router
from views.personal.middlewares import protect_storage_resrc, protect_personal
from views.for_devs import router as for_devs_router
from views.for_devs import protect_dev_src
from fastapi import Depends
from sqlalchemy.orm import Session
from app_dependencies import app
import asyncio
from db_conn import get_db
from views import Request_timeouter
from fastapi.templating import Jinja2Templates
from modules.sessions import ensure_table
from modules.passcodes import ensure_columns

templates = Jinja2Templates(directory="templates")
try:
    ensure_table()
except Exception as e:
    print('user_sessions table not ready yet:', e)
try:
    ensure_columns()
except Exception as e:
    print('passcodes_info columns not ready yet:', e)


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



@router.api_route('/redirector/',methods=['GET','POST','DELETE','PUT','PATCH'])
async def view(request:Request):
    # print('contact')
    return templates.TemplateResponse("index.html", {"request": request, "name": "Kierowniku"})





app.include_router(router)
app.include_router(non_auth_router)
app.include_router(personal_router)
app.include_router(for_devs_router)
app.include_router(auth_creds.router)




