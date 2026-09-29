from redis_conn import r_conn
import redis
import json
import asyncio
from . import get_user
import time

#IN CASE CLEAN UP DOESNT WORK CORRECTLY
RESET_CACHE_AFTER = 12 * 60 * 60 #(hours)


def dump_upload_token_data(token_data: dict):
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("upload_token_data_ls")

                current_data = pipe.get("upload_token_data_ls")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = []

                data.append(token_data)

                pipe.multi()
                pipe.set(
                    "upload_token_data_ls",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue
        
        
def read_upload_token_data_ls():
    data = json.loads(r_conn.get('upload_token_data_ls'))
    if data:
        return data
    return []


async def drop_upload_token_data(token, delay:int = 60):
    await asyncio.sleep(delay)
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("upload_token_data_ls")

                current_data = pipe.get("upload_token_data_ls")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = []
                    
                    
                for index,record in enumerate(data):
                    if record['token'] == token:
                        data.pop(index)
                        break


                pipe.multi()
                pipe.set(
                    "upload_token_data_ls",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue















def dump_download_token_data(token_data: dict):
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("USERS_DIR_DOWNLOAD_REQUESTS_DATA")

                current_data = pipe.get("USERS_DIR_DOWNLOAD_REQUESTS_DATA")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = []

                data.append(token_data)

                pipe.multi()
                pipe.set(
                    "USERS_DIR_DOWNLOAD_REQUESTS_DATA",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue



        
def read_download_token_data_ls():
    data = json.loads(r_conn.get('USERS_DIR_DOWNLOAD_REQUESTS_DATA'))
    if data:
        return data
    return []



async def drop_download_token_data(token, delay:int = 60):
    await asyncio.sleep(delay)
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("USERS_DIR_DOWNLOAD_REQUESTS_DATA")

                current_data = pipe.get("USERS_DIR_DOWNLOAD_REQUESTS_DATA")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = []
                    
                    
                for index,record in enumerate(data):
                    if record['url_token'] == token:
                        data.pop(index)
                        break


                pipe.multi()
                pipe.set(
                    "USERS_DIR_DOWNLOAD_REQUESTS_DATA",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue






def store_upload_size(user, packsize):
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("USER_UPLOAD_SIZE_CACHE")

                current_data = pipe.get("USER_UPLOAD_SIZE_CACHE")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = {}
                
                if not data.get(user):
                    data[user] = {'packsize': packsize, 'last_que':time.time()}
                else:
                    data[user]['packsize'] += packsize
                    data[user]['last_que'] = time.time()
                    
                print(data)
                    
                pipe.multi()
                pipe.set(
                    "USER_UPLOAD_SIZE_CACHE",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue
    ...
    
    
def reclaim_user_cached_upload_size(user, packsize, reset_cache = False):
    while True:
        try:
            with r_conn.pipeline() as pipe:
                pipe.watch("USER_UPLOAD_SIZE_CACHE")

                current_data = pipe.get("USER_UPLOAD_SIZE_CACHE")

                if current_data:
                    data = json.loads(current_data)
                else:
                    data = {}
                    
                    
                
                if not data.get(user):
                    data[user] = {'packsize':0}
                else:
                    if reset_cache:
                        del data[user]
                    else:
                        data[user]['packsize'] -= packsize if packsize > 0 else 0
                    print('space reclaimed')
                    
                pipe.multi()
                pipe.set(
                    "USER_UPLOAD_SIZE_CACHE",
                    json.dumps(data)
                )

                pipe.execute()

            break

        except redis.WatchError:
            continue


def get_user_cached_upload_size(user):

    current_data = json.loads(r_conn.get("USER_UPLOAD_SIZE_CACHE"))
    if not current_data:
        return 0
    if current_data.get(user):
        if current_data.get(user).get('last_que'):
            if time.time() - current_data[user]['last_que'] > RESET_CACHE_AFTER:
                reclaim_user_cached_upload_size(user, 0, True)
                print('cache old')
                return 0
        if current_data.get(user).get('packsize'):
            return current_data[user]['packsize']
    return 0
        
   
