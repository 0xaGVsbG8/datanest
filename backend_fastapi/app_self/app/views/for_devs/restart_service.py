from fastapi import APIRouter, Depends, BackgroundTasks, Request
from app_dependencies import Request, DEPLOY_PATH

router = APIRouter()
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks
from db_conn import get_db
import asyncio
import os, sys, subprocess


async def close_this():
    await asyncio.sleep(2)
    try:
        print('restarting')
        subprocess.Popen([sys.executable, DEPLOY_PATH] + sys.argv)
        print('closing this thread')
        os._exit(0)
    except Exception:
        pass




@router.get('/dev/restart-service/')
async def view(request: Request,background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    print('dev is asking to restart a service')
    background_tasks.add_task(close_this)
    return {'status':'restarting...'}
