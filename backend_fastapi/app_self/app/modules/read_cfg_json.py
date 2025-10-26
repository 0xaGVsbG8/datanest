

from app_independencies import CONF_JSON
import aiofiles, json

#used for storing upload and account settings in json db


async def get_max_storage_per_acc():
    async with aiofiles.open(CONF_JSON, 'r', encoding='utf-8') as f:
        content = await f.read()
        data = json.loads(content)
        return data['MAX_STORAGE_PER_ACCOUNT'] * (1024*1024*1024)


async def get_max_upload_size():
    async with aiofiles.open(CONF_JSON, 'r', encoding='utf-8') as f:
        content = await f.read()
        data = json.loads(content)
        return data['MAX_UPLOAD_SIZE']  * (1024*1024*1024)

