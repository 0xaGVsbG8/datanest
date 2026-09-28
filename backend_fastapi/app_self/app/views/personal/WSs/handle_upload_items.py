from fastapi import APIRouter

router = APIRouter()
from fastapi.websockets import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from modules import format_size, guess_file_type, format_time_diff
from modules.format_size import get_folder_size
import uuid
import asyncio
import os, json
# from views.personal.APIs.upload_items_get_token import upload_token_data_ls
from starlette.websockets import WebSocketDisconnect
from modules import find_new_item_path, read_cfg_json, justify_path_for_db, manage_redis
from views.personal.middlewares.protect_storage_resrc import STORAGE_PREFIX
from views.personal.APIs.get_items import blank_item_alias


def drop_file(path: os.path):
    if os.path.exists(path):
        os.remove(path)


async def asyncio_drop_file(safety_lock, path):
    
    if not safety_lock:
        return
    
    await asyncio.sleep(1)
    db_path = justify_path_for_db.get(path)
    db = next(get_db())
    
    try:
        for record in db.query(ITEMINFO).filter(ITEMINFO.path == db_path).all():
            db.delete(record)
        db.commit()
    finally:
        db.close()

    await asyncio.sleep(5)
    drop_file(path)


def register_item_in_db(db, filepath, owner, parent_token, item_type='file'):
    db_path = justify_path_for_db.get(filepath)
    existing = db.query(ITEMINFO).filter(ITEMINFO.path == db_path).first()
    if existing:
        return existing.url_token

    item_token = str(uuid.uuid4())
    db.add(ITEMINFO(
        path=db_path,
        owner=owner,
        type=item_type,
        url_token=item_token,
        isFavourite=False,
    ))
    parent_shared_record = db.query(shared_items).filter(shared_items.local_token==parent_token).first()
    if parent_shared_record:
        db.add(shared_items(
            path=db_path,
            type=item_type,
            local_token=item_token,
            access_type=parent_shared_record.access_type,
            allowed_by=parent_shared_record.allowed_by,
            overall_access=parent_shared_record.overall_access,
            owner=parent_shared_record.owner,
            parent=False,
            FavouriteOf=[],
        ))
    db.commit()
    return item_token


def create_empty_file(filepath):
    parent = os.path.dirname(filepath)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(filepath, 'w') as f:
        f.write('')


def append_chunk(filepath, chunk):
    parent = os.path.dirname(filepath)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(filepath, 'ab') as f:
        f.write(chunk)


@router.websocket('/handle_upload/')
async def view(websocket: WebSocket):
    access_token = websocket.query_params.get('access_token')
# 


    if access_token:
        path = None
        print(access_token, '<-access token!')
        for record in manage_redis.read_upload_token_data_ls():
            if record['token'] == access_token: 
                print('token verified!')
                path = record['path']
                owner = record['owner']
                parent_token = record['parent_token']
                break

        if path:
            
            MAX_UPLOAD_SIZE = await read_cfg_json.get_max_upload_size()
            MAX_STORAGE_PER_ACCOUNT = await read_cfg_json.get_max_storage_per_acc()

            PAYLOAD_SIZE = 0
            await websocket.accept()
            filepath = None
            filepath_ls = []
            SAFETY_LOCK = False
            Upload_dir = path
            itemdata_parent_dir_token = None
            itemdata_parent_dir = None
            created_parents = {}
            first_prior_parent = None
            default_first_parent = None
            item_token = None
            initial_folder_size = await asyncio.to_thread(get_folder_size, path)

            db = next(get_db())


            try:
                while True:
                    if PAYLOAD_SIZE>MAX_UPLOAD_SIZE or initial_folder_size+PAYLOAD_SIZE>MAX_STORAGE_PER_ACCOUNT:
                        print(PAYLOAD_SIZE, MAX_UPLOAD_SIZE)
                        await websocket.close()
                        break

                    data = await websocket.receive()
                    if data["type"] == "websocket.disconnect":
                        print("User disconnected", filepath, 'x')
                        if filepath:
                            if os.path.exists(filepath):
                                asyncio.create_task(asyncio_drop_file(SAFETY_LOCK, filepath))
                        
                        break

                    if data.get('text'):
                        try:
                            data = json.loads(data['text'])
                            data: dict
                            if data.get('registeration'):
                                SAFETY_LOCK = True
                                bare_name = data.get('bare_name')
                                rel_name = data.get('rel_name')
                                rel_included = data.get('rel_included')
                                filesize = data.get('filesize')

                                original_filepath = os.path.join(path, rel_name)


                                if not rel_included:
                                    filepath = os.path.join(path, bare_name)

                                    if not os.path.exists(os.path.dirname(filepath)):
                                        os.makedirs(os.path.dirname(filepath))

                                    if os.path.exists(filepath):
                                        filepath = find_new_item_path.get(filepath)


                     
                                else:

                                    # if not parent_created:
                                    itemdata_parent_dir_received = os.path.dirname(original_filepath)

                                    if default_first_parent is None:
                                        default_first_parent = itemdata_parent_dir_received
                            
                                    if first_prior_parent is not None and default_first_parent is not None:
                                        itemdata_parent_dir_received = itemdata_parent_dir_received.replace(default_first_parent, first_prior_parent + '/', 1)


                                    if itemdata_parent_dir_received.strip() not in created_parents:

                                        if os.path.exists(itemdata_parent_dir_received) and itemdata_parent_dir_received[len(itemdata_parent_dir_received)-1] != '/':
                                            itemdata_parent_dir = find_new_item_path.get(itemdata_parent_dir_received)
                                            os.makedirs(itemdata_parent_dir , exist_ok=True)

                                        else:
                                            os.makedirs(itemdata_parent_dir_received, exist_ok=True)
                                            itemdata_parent_dir = itemdata_parent_dir_received

                                        created_parents[itemdata_parent_dir_received] = itemdata_parent_dir if itemdata_parent_dir else itemdata_parent_dir_received

                                    else:
                                        itemdata_parent_dir = created_parents[itemdata_parent_dir_received]


                                    if first_prior_parent is None:
                                        first_prior_parent = itemdata_parent_dir


                                    parent_db_path = justify_path_for_db.get(itemdata_parent_dir)

                                    itemdata_parent_data = db.query(ITEMINFO).filter(ITEMINFO.path==parent_db_path).first()
                                    if not itemdata_parent_data:

                                        itemdata_parent_dir_token =  str(uuid.uuid4())
                                
                                        new_record_data = {
                                            'path' : justify_path_for_db.get(itemdata_parent_dir),
                                            'owner' :  owner,
                                            'type' : 'dir',
                                            'url_token' : itemdata_parent_dir_token,
                                            'isFavourite' : False,
                                        }

                                

                                        new_record = ITEMINFO(
                                            **new_record_data
                                        )


                                        parent_shared_record = db.query(shared_items).filter(shared_items.local_token==parent_token).first()
                                        if parent_shared_record:
                                
                                            new_parent_shared_record = shared_items(
                                                path = justify_path_for_db.get(itemdata_parent_dir),
                                                type = 'dir',
                                                local_token = itemdata_parent_dir_token,
                                                access_type = parent_shared_record.access_type,
                                                allowed_by = parent_shared_record.allowed_by,
                                                overall_access = parent_shared_record.overall_access,
                                                owner = parent_shared_record.owner,
                                                parent = False,
                                                FavouriteOf = [],
                                            )
                                            db.add(new_parent_shared_record)




                                        db.add(new_record)
                                        db.commit()
                        


                                    filepath = os.path.join(itemdata_parent_dir, bare_name)



                                await asyncio.to_thread(create_empty_file, filepath)
                                if filepath not in filepath_ls:
                                    filepath_ls.append(filepath)

                                if blank_item_alias in filepath and os.path.exists(filepath):
                                    os.remove(filepath)
                                else:
                                    item_token = register_item_in_db(db, filepath, owner, parent_token, 'file')

                        
                                await websocket.send_json({'registered': True})


                            if data.get('erase_upload'):
                                await websocket.close()
                                print('erasing uploads!')
                                await asyncio.sleep(2)
                                for item in filepath_ls:
                                    try:
                                        os.remove(item)
                                        result = db.query(ITEMINFO).filter(ITEMINFO.path == justify_path_for_db.get(item)).all()
                                        if result:
                                            for record in result:
                                                db.delete(record)
                                    except Exception as e:
                                        pass
                                db.close()
                                break



                            if 'safety_lock' in data:
                        
                                SAFETY_LOCK = data.get('safety_lock')
                                if not SAFETY_LOCK:

                                    if filepath and blank_item_alias not in filepath:
                                        item_token = register_item_in_db(db, filepath, owner, parent_token, 'file')
                                    elif not item_token:
                                        item_token = str(uuid.uuid4())

                                    itemdata = {
                                        "name":os.path.basename(filepath),
                                        'owner': owner,
                                        "editable": True,
                                        'isFavourite': False,
                                        "path": filepath.replace(owner+'/','')+'/',
                                        'type':'file', 
                                        "path_token":item_token,
                                        'real_size': filesize,
                                        'size': format_size.get(filepath) if os.path.exists(filepath) else 0,
                                        'last_change': format_time_diff.convert(1),
                                        'real_last_change':os.path.getmtime(filepath) if os.path.exists(filepath) else 1,
                                        'mimetype': guess_file_type.get(filepath) if os.path.exists(filepath) else 0,
                                        'access_url': STORAGE_PREFIX + justify_path_for_db.get(filepath),
                                    }

                



                                    if rel_included:
                                        itemdata_parent_data = {
                                            "name":os.path.basename(itemdata_parent_dir),
                                            "owner": owner,
                                            "editable": True,
                                            'isFavourite': False,
                                            'path':itemdata_parent_dir.replace(owner+'/','')+'/',
                                            'type': 'dir',
                                            'path_token': itemdata_parent_dir_token,
                                            'real_size': os.path.getsize(itemdata_parent_dir),
                                            'size': format_size.get(itemdata_parent_dir),
                                            'last_change': format_time_diff.get(itemdata_parent_dir),
                                            'real_last_change':os.path.getmtime(itemdata_parent_dir),
                                            'mimetype': guess_file_type.get(itemdata_parent_dir)
                                        }

                                        if Upload_dir != os.path.dirname(itemdata_parent_dir):
                                            itemdata_parent_data = None
                                    else:
                                        itemdata_parent_data = None

                            
                                    if Upload_dir != os.path.dirname(filepath):
                                        itemdata = None


                                await websocket.send_json({'safety_lock_took_off': True, 'itemdata': itemdata, 'itemdata_parent':itemdata_parent_data})

                        


                            if data.get('handle_disconnect'):
                                print('user disconected')

                        except json.JSONDecodeError as e:
                            pass


                    if data.get('bytes'):

                        if blank_item_alias in filepath and os.path.exists(filepath):
                            os.remove(filepath)
                        else:
                            chunk = data.get('bytes')
                            await asyncio.to_thread(append_chunk, filepath, chunk)
                            PAYLOAD_SIZE+=len(chunk)

                        await websocket.send_json({'received': True})

            except WebSocketDisconnect:
                if filepath:
                    filepath = os.path.normpath(filepath).replace('\\','/')
                    asyncio.create_task(asyncio_drop_file(SAFETY_LOCK, filepath))
            except Exception as e:
                print('upload handler error', e)
                if filepath:
                    filepath = os.path.normpath(filepath).replace('\\','/')
                    asyncio.create_task(asyncio_drop_file(SAFETY_LOCK, filepath))
                try:
                    await websocket.close()
                except Exception:
                    pass


            finally:
                db.close()
    else:
        await websocket.close(code=4401)
        print('couldnt allocate access token or it was incorrect!')
