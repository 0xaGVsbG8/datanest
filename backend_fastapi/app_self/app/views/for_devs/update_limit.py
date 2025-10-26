
from app_independencies import router, Request, CONF_JSON
from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, Query
from db_conn import get_db
import asyncio
from typing import Literal
import json, aiofiles



config_json_lock = asyncio.Lock()

#updates limits

async def update_acc_limit(limit: int):
    async with config_json_lock:
        async with aiofiles.open(CONF_JSON, 'r',encoding='utf-8') as f:
            content = await f.read()
            data = json.loads(content)
            data['MAX_STORAGE_PER_ACCOUNT'] = limit

        async with aiofiles.open(CONF_JSON, 'w',encoding='utf-8') as f:
            await f.write(json.dumps(data, indent=4))



async def update_upload_limit(limit: int):
    async with config_json_lock:
        async with aiofiles.open(CONF_JSON, 'r',encoding='utf-8') as f:
            content = await f.read()
            data = json.loads(content)
            data['MAX_UPLOAD_SIZE'] = limit

        async with aiofiles.open(CONF_JSON, 'w',encoding='utf-8') as f:
            await f.write(json.dumps(data, indent=4))




@router.get('/dev/update_acc_limit/')
async def view(request: Request, background_tasks: BackgroundTasks, limit: float = Query(..., gt = 0), set_what: Literal['upload','account'] = Query(...), db: Session = Depends(get_db)):
    
    if set_what == 'account':
        print('dev wants to change acc limits')
        await update_acc_limit(limit)
    else:
        print('dev wants to change upload limits')
        await update_upload_limit(limit)
    
    print('dev changed limits!')

    return {'result': True}