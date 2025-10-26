from app_independencies import router,Request, __STORAGE_VAULT_PATH, PREFIX

#variable to use in class
STORAGE_VAULT_PATH = __STORAGE_VAULT_PATH

from sqlalchemy.orm import Session
from fastapi import Depends, BackgroundTasks, HTTPException
from sqlalchemy import and_, or_
from pydantic import BaseModel,  model_validator
from db_conn import get_db
from views.models import ITEMINFO, shared_items
import os
from modules import justify_path_for_db, format_size, format_time_diff
from modules import guess_file_type
from typing import Literal, cast, Optional
from views.personal.middlewares.protect_storage_resrc import STORAGE_PREFIX
from fuzzywuzzy import fuzz
import time, asyncio, shutil


blank_item_alias = 'BLANK_1x3100012131312311sd112nnnnnnx'

instance_userdata = {
    "me": '',
    'Parent_editable': False,
    'access':' True',
    'owner': 'user',
    'view_type': 'view_type',
    'current_dir': '',
    'viewing_widgets': "True if current_dir != '' or userdata.filter_by == 'off' else False,",
    'static_url_access_token': 'static_url_access_token',
    'static_url':'static_url',
    'tree_ls': [],
    'items_ls': [],
}
                   


BASENAME_SIMILARITY = 60


class userdata(BaseModel):
    path_token: str
    filter_by: Literal['fav', 'off', 'shared']
    search_type: Literal['normal', 'whole']
    search_input: Optional[str] = None

    @model_validator(mode='after')
    def check_search_input_required(self):
        if self.search_type == 'whole' and not self.search_input:
            return instance_userdata
        return self
    
    


class data_returner_pack:

    def __init__(self, userdata_here, user):
        
        self.userdata = cast(userdata, userdata_here)
        self.user = user
        



    def check_if_editable(self, record):
        if self.userdata.filter_by == 'shared':
            record: shared_items
            record = cast(shared_items, record)

            if record.owner == self.user:
                return True
            
            if record.access_type == 'browse-only':
                return False
            
            if record.access_type == 'editing' and self.user in record.allowed_by:
                return True

                
        else:
            return True


    def get_path_token(self, record):
        if self.userdata.filter_by == 'shared':
            record = cast(shared_items, record)
            return record.local_token
                
        else:
            return record.url_token



    def to_display(self, record):

        if self.userdata.filter_by == 'shared':
            record = cast(shared_items, record)
            if self.userdata.path_token == 'main' and record.parent == False:
                return False
            
        return True



    def check_if_favourite(self, record):


        
        if self.userdata.filter_by == 'shared':
            record = cast(shared_items, record)
            if record.overall_access == 'restricted' and self.user not in record.allowed_by:
                return False

            if self.user in (record.FavouriteOf or []):
                return True
            
            return False
        
            
        return record.isFavourite
    
    def check_if_item_to_display(self, record, user, path_token = None):

        path_token = self.userdata.path_token if path_token is None else path_token

        if self.userdata.filter_by == 'shared':
            record = cast(shared_items, record)
            if path_token != 'main':
                if record.parent and record.type == 'dir':
                    if record.owner == user:
                        return True
                    else:
                        return False
            return True

        if self.userdata.filter_by == 'off':
            record = cast(ITEMINFO, record)
            if record.owner == user:
                return True

            db = next(get_db())
            try:
                result = db.query(shared_items).filter(shared_items.local_token == record.url_token).first()
                if result:
                    if result.parent:
                        return False
            finally:
                db.close()
        
        return True
    

    def set_tree(self, user, owner, current_path: str, all: bool):
        db = next(get_db())
        try:
            if user == owner or all:
                dirs_ls = []
                tree_ls = []
                for root, dirs, files in os.walk(os.path.join(STORAGE_VAULT_PATH, user)):
                    for d in dirs:
                        dirpath = os.path.join(root, d)
                        dirs_ls.append(justify_path_for_db.get(dirpath))


                result = db.query(ITEMINFO).filter(ITEMINFO.path.in_(dirs_ls)).all()
                seen = set()
                for record in result:
                    if record.path not in seen:
                        seen.add(record.path)
                        tree_ls.append({
                            "path":str(record.path).replace(user+'/','')+'/',
                            "token": record.url_token
                        })
                
                tree_ls = sorted(tree_ls, key=lambda x: x['path'])

                tree_ls = list(filter(lambda record: blank_item_alias not in record['path'] ,tree_ls))

                return tree_ls
            

            paths_ls = []
            paths_parts = (current_path.replace('\\','/').split('/'))
            for i in range(len(paths_parts), 0, -1):
                paths_ls.append('/'.join(paths_parts[:i]))

            

                result = db.query(shared_items).filter(shared_items.path.in_(paths_ls)).all()
            

            

            result = sorted(result,key=lambda record:record.path)
            parent = None
            parent_record = None
            
            for record in result:
                if record.parent:
                    parent_record = record
                    parent = record.path
                    break

            parent = current_path if parent is None else parent
            


            paths_ls = []
            for root, dirs, files in os.walk(os.path.join(STORAGE_VAULT_PATH, parent)):
                for d in dirs:
                    dpath = os.path.join(root, d)
                    paths_ls.append(justify_path_for_db.get(dpath))

            filtered_result = db.query(shared_items).filter(and_(shared_items.path.in_(paths_ls),~shared_items.parent)).all()
            filtered_result = list(filtered_result)
            filtered_result.append(parent_record)

            tree_ls = []
            for record in filtered_result:
                if record.path == current_path:
                    continue
                
                if record.path == parent:
                    itemdata = {
                    "path":'/'+os.path.basename(record.path),
                    "token": record.local_token,
                    }
                else:
                    itemdata = {
                        "path":record.path.replace(parent, ''),
                        "token": record.local_token,
                    }
                tree_ls.append(itemdata)
        

            tree_ls = list(filter(lambda record: blank_item_alias not in record['path'] ,tree_ls))

            return tree_ls

        
        finally:
                db.close()





async def delete_unregistered_files(items_ls:list):
    while True:
        try:
            for item in items_ls:
                os.remove(item) if os.path.isfile(item) else shutil.rmtree(item)
            break

        except Exception as e:
            pass
        await asyncio.sleep(15)







async def drop_dead_file(token, db = next(get_db())):
    try:
        result = db.query(ITEMINFO).filter(ITEMINFO.url_token==token).all()
        if result:
            [db.delete(record) for record in result]
        db.commit()
    finally:
        db.close()



@router.post('/sec/get_items/')
async def view(request: Request, userdata: userdata,background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    path = userdata.path_token
    user = request.state.user
    OWNER = None

    print(f'User: {user} is asking for path token --> {path} filters {userdata.filter_by, userdata.search_type}')
    if not user:
        return False
    

    db_paths = []
    result = True
    current_dir = ''
    root_path = ''
    view_type = 'dir'
    current_path = None
    show_paths = True

    Parent_editable = False
    data_returner = data_returner_pack(userdata, user)
    

    if not os.path.exists(os.path.join(__STORAGE_VAULT_PATH, user)):
        os.makedirs(os.path.join(__STORAGE_VAULT_PATH, user))


    if userdata.search_type == 'normal':
        

        if userdata.filter_by == 'off':
            if path == 'main':
                Parent_editable = True
                current_dir = 'Home'
                root_path = os.path.join(__STORAGE_VAULT_PATH,user)
                path = os.path.join(__STORAGE_VAULT_PATH, user)
                current_path = 'Home'
                OWNER = user

            else:
                iteminfo = db.query(ITEMINFO).filter(and_(ITEMINFO.url_token == path, ITEMINFO.owner == user)).first()
                if iteminfo:
                    Parent_editable = True

                if not iteminfo:
                    sharedinfo = db.query(shared_items).filter(shared_items.local_token == path).first()
                    if sharedinfo:
                        if sharedinfo.overall_access == 'restricted' and user not in sharedinfo.allowed_by:
                            sharedinfo = None
                        
                        if sharedinfo:
                            #switching to shared
                            userdata.filter_by = 'shared'
                
                    


                result = iteminfo or sharedinfo
                if result:
                    
                    OWNER = result.owner if result.owner else '?'
                    current_dir = os.path.basename(result.path)
                    current_path = result.path
                    root_path = os.path.join(__STORAGE_VAULT_PATH, result.path)
                    path = root_path

        
                if not os.path.exists(path):
                    if (isinstance(result, ITEMINFO) or isinstance(result, shared_items)):
                        db.delete(result)
                        db.commit()
                    raise HTTPException(status_code=404, detail="Item not found")





        if userdata.filter_by == 'fav':
            show_paths = False
            path = os.path.join(__STORAGE_VAULT_PATH,user)
            result= db.query(ITEMINFO).outerjoin(shared_items, shared_items.local_token==ITEMINFO.url_token).filter(
                or_(
                    and_(ITEMINFO.isFavourite == True,ITEMINFO.owner == user),
                    (shared_items.FavouriteOf.any(user))
                )
            ).all()
            for record in result:
                record.isFavourite = True

            if not result:
                return instance_userdata







        if userdata.filter_by == 'shared':
            path = os.path.join(__STORAGE_VAULT_PATH,user)
            if userdata.path_token == 'main':
                show_paths = False
                result = db.query(shared_items).join(ITEMINFO, ITEMINFO.url_token==shared_items.local_token).filter(shared_items.allowed_by.any(user)).all()



            else:
    
                result = db.query(shared_items).filter(shared_items.local_token==userdata.path_token).first()
                if result:
                    OWNER = result.owner
                    current_dir = os.path.basename(result.path)
                    current_path = result.path

                    if result.access_type == 'editing':
                        Parent_editable = True
                    
                    if result.overall_access == 'restricted' and user in result.allowed_by or result.owner == user :
                        root_path = os.path.join(__STORAGE_VAULT_PATH, result.path)
                        path = root_path
                       
                    
                    if result.overall_access == 'anyone':
                     
                        root_path = os.path.join(__STORAGE_VAULT_PATH, result.path)
                        path = root_path

                   

            if not result:
                return instance_userdata

    else:
        seen = set()
        userdata.filter_by = 'off'

        result = db.query(ITEMINFO, shared_items).outerjoin(shared_items, shared_items.local_token==ITEMINFO.url_token).filter(or_(
            ITEMINFO.owner==user, shared_items.allowed_by.any(user)
        )).all()
        temp_result = []

        for iteminfo, sharedinfo in result:
            iteminfo = cast(ITEMINFO, iteminfo)
            sharedinfo = cast(shared_items, iteminfo)

            if iteminfo.path in seen:
                continue

          
            itempath = os.path.join(__STORAGE_VAULT_PATH, iteminfo.path)
            BASENAME = os.path.basename(itempath)

            if not os.path.exists(itempath):
                continue

            ratio = fuzz.ratio(BASENAME,userdata.search_input)

            if ratio < BASENAME_SIMILARITY:
                continue
            

    

            temp_result.append(iteminfo)
            seen.add(iteminfo.path)

        result = temp_result

        if len(result) == 0:
            return instance_userdata

    
    

    if result:  

        if userdata.search_type == 'normal':

      

            if not os.path.exists(root_path) and root_path != ''  :
                if (isinstance(result, ITEMINFO) or isinstance(result, shared_items)):
                    db.delete(result)
                    db.commit()
                raise HTTPException(status_code=404, detail="Item not found")

            

            if userdata.filter_by == 'off' or (userdata.filter_by == 'shared' and userdata.path_token!='main'):


                if not os.path.isfile(root_path):
                    for item in os.listdir(root_path):
                        itempath = os.path.join(root_path, item)
                        db_itempath = justify_path_for_db.get(itempath)  
                        db_paths.append(db_itempath)

                else:
                    view_type = 'file'
                    db_itempath = justify_path_for_db.get(root_path)  
                    db_paths.append(db_itempath)
                    path = os.path.dirname(path)

                if userdata.filter_by == 'off':

                    result = db.query(ITEMINFO).filter(and_(ITEMINFO.path.in_(db_paths),ITEMINFO.owner==user)).all()
                    
                if userdata.filter_by == 'shared':
                    result = db.query(shared_items).filter(and_(shared_items.path.in_(db_paths))).all()
                    result_save = []
                    for record in result:
                        if record.overall_access == 'restricted':
                            if user not in record.allowed_by:
                                continue
                            else:
                                result_save.append(record)

                        if record.overall_access == 'anyone':
                            result_save.append(record)

                    result = result_save

              




        seen = set()

        items_ls = []



        if len(result) == 0 and len(db_paths) != 0:

            items_to_delete = []

            if view_type != 'file':
                for item in db_paths:
                    itempath = os.path.join(__STORAGE_VAULT_PATH, item)
                    items_to_delete.append(itempath)
                
                background_tasks.add_task(delete_unregistered_files, items_to_delete)
        

        for record in result:


            if not data_returner.to_display(record):
                continue


            if not data_returner.check_if_item_to_display(record, user):
                continue



            ipath = os.path.join(__STORAGE_VAULT_PATH, record.path)
            if not os.path.exists(ipath) or record.path in seen:
                if not os.path.exists(ipath):
                    try:
                        background_tasks.add_task(drop_dead_file, record.url_token)
                    except Exception:
                        pass
                continue
                
            # if record.parent


            seen.add(record.path)                

                        
            itemdata = {
                    "owner": record.owner,
                    "name":os.path.basename(record.path),
                    'editable': data_returner.check_if_editable(record),
                    'isFavourite': data_returner.check_if_favourite(record),
                    "path": record.path.replace(user+'/','')+'/',
                    'type':'dir' if os.path.isdir(ipath) else 'file', 
                    "path_token": data_returner.get_path_token(record),
                    'real_size': os.path.getsize(ipath),
                    'size': format_size.get(ipath),
                    'last_change': format_time_diff.convert(time.time() - record.last_change) if record.last_change else 'N/A',
                    'real_last_change':os.path.getmtime(ipath),
                    'mimetype': guess_file_type.get(ipath),
                    'access_url': STORAGE_PREFIX+record.path,
            }
            items_ls.append(itemdata)

        items_ls = sorted(items_ls, key=lambda record: 0 if record['type'] == 'dir' else 1)
            








        ALL = (user == OWNER and userdata.path_token == 'main') 

        OWNER_PATH = os.path.join(__STORAGE_VAULT_PATH, OWNER if OWNER is not None else user)

        if not os.path.exists(OWNER_PATH):
            os.makedirs(OWNER_PATH)

        current_dir_name = "Home" if current_dir == '' else current_dir
        current_path = 'Home' if current_path == None else current_path
        
        items_ls = list(filter(lambda item: blank_item_alias not in item['path'] , items_ls))
        
        userdata = {
            "me": user,
            'Parent_editable':Parent_editable,
            'access': True,
            'owner': OWNER,
            'view_type': view_type,
            'current_dir': current_dir_name,
            'viewing_widgets': True if current_dir != '' or userdata.filter_by == 'off' else False,
            'tree_ls': data_returner.set_tree(user, OWNER, current_path, ALL ) if show_paths and userdata.search_type == 'normal'  and userdata.filter_by == 'off' else [],
            'items_ls': items_ls,
        }
                    
        return userdata
        

    else:
        raise HTTPException(status_code=404, detail="Item not found")

        