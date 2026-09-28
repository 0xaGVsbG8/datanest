from redis_conn import r_conn
import redis
import json
import asyncio

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
