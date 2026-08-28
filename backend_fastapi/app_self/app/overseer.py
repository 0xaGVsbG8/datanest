
from db_conn import get_db
from app_independencies import __STORAGE_VAULT_PATH, ZIP_ARCS_PATH, ZIP_ARC_LIFESPAN
from views.models import ITEMINFO, zipinfo, shared_items
import os,time,shutil
import asyncio
from datetime import datetime, timezone
from modules import justify_path_for_db
import uuid


#Looks for unregistered files and removes their record from db and also does that in reverse
async def fake_path_records_record():
    print('Fake path records scanner active!')
    while True:
        db = next(get_db())
        try:
            paths = []
            records_to_rem = []
            for model in [ITEMINFO, shared_items]:
                for record in db.query(model).all():
                    path = os.path.normpath(os.path.join(__STORAGE_VAULT_PATH, record.path)).replace('\\', '/')
                    if not os.path.exists(path):
                        records_to_rem.append(path)
                        print('dumping record --> ',record.path)
                        db.delete(record)
                    else:
                        paths.append(path)

            db.commit()


            ignore_users_dirs = [os.path.join(__STORAGE_VAULT_PATH, path).replace('\\','/') for path in os.listdir(__STORAGE_VAULT_PATH)]

            for root, dirs, files in os.walk(__STORAGE_VAULT_PATH):
                for d in dirs:
                    try:
                        dpath = os.path.normpath(os.path.join(root,d)).replace('\\','/')
                        if dpath in ignore_users_dirs:
                            continue
                        if dpath not in paths:
                            shutil.rmtree(dpath)
                    except Exception:
                        pass

                for f in files:
                    try:
                        fpath = os.path.normpath(os.path.join(root,f)).replace('\\','/')
                        if fpath not in paths:
                            os.remove(fpath)
                    except Exception:
                        pass


        finally:
            db.close()
        await asyncio.sleep(15)
    
    


#Looks for arcs that lifetime is over and should be deleted including records of them in db
async def find_dead_arcs():
    print('Dead archives scanner active!')
    while True:

        if not os.path.exists(ZIP_ARCS_PATH):
            os.makedirs(ZIP_ARCS_PATH)
        
        db = next(get_db())

        try:
        
            result = db.query(zipinfo).all()
            now = datetime.now(timezone.utc)
            
            for record in result:
                crt_date: datetime = record.crt_date
                diffrence = (now - crt_date).total_seconds()
                if diffrence > ZIP_ARC_LIFESPAN:
                    db.query(zipinfo).filter(zipinfo.id==record.id).delete()
                    db.commit()
                    itempath = os.path.join(ZIP_ARCS_PATH, record.zip_token)
                    if os.path.exists(itempath):
                        try:
                            if os.path.exists(itempath):
                                shutil.rmtree(itempath)
                        except Exception as e:
                            pass
                        
                        
            
            for item in os.listdir(ZIP_ARCS_PATH):
                itempath = (os.path.join(ZIP_ARCS_PATH, item)).replace('\\','/')
                db_itempath = itempath.split(ZIP_ARCS_PATH+'/')[1]
                result = db.query(zipinfo).filter(zipinfo.zip_token == db_itempath).first()
                if not result:
                    try:
                        if os.path.exists(itempath):
                            shutil.rmtree(itempath)
                    except Exception as e:
                        pass

                    
            db.commit()
        
        finally:
            db.close()
        
        await asyncio.sleep(15)
    
    




    

    
def assign_path_token(path: os.path = None, owner: str = None, prep_token: str = None, parent_token = None):
    
    try:
        db = next(get_db())
        if not path:
            items_ls = []
            for root, dirs, files in os.walk(__STORAGE_VAULT_PATH):
                for d in dirs:
                    dirpath = os.path.join(root,d)
                    db_dirpath = justify_path_for_db.get(dirpath)
                    items_ls.append({
                        'owner':dirpath.split(__STORAGE_VAULT_PATH)[1].replace('\\','/').split('/')[1],
                        'dirpath': dirpath,
                        'db_itempath': db_dirpath
                    })

                for f in files:
                    filepath = os.path.join(root,f)
                    db_itempath = justify_path_for_db.get(filepath)
                    items_ls.append({
                        'owner':dirpath.split(__STORAGE_VAULT_PATH)[1].replace('\\','/').split('/')[1],
                        'dirpath': filepath,
                        'db_itempath': db_itempath
                    })

                    
            result = db.query(ITEMINFO).filter(ITEMINFO.path.in_([item['db_itempath'] for item in items_ls])).all()
            acknowledged_paths = [record.path for record in result]
            

            itemsx_ls = [item for item in items_ls if item['db_itempath'] not in acknowledged_paths]
            
            records_ls = [
                ITEMINFO(
                    path = item['db_itempath'],
                    owner = item['owner'],
                    type = 'dir',
                    url_token = str(uuid.uuid4()) if not prep_token  else prep_token,
                    isFavourite = False,
                )
                for item in itemsx_ls
            ]
        
            db.add_all(records_ls)
            records_ls.clear()

        else:

            records_to_add = []

            token = str(uuid.uuid4())
            new_record1 =ITEMINFO(
                path = justify_path_for_db.get(path),
                owner = owner,
                type = 'file' if os.path.isfile(path) else 'dir',
                url_token = token,
                isFavourite = False,
            )

            records_to_add.append(new_record1)
            
            parent_shared_record = db.query(shared_items).filter(shared_items.local_token==parent_token).first()

            if parent_shared_record:
            
                new_record2 = shared_items(
                    path = justify_path_for_db.get(path),
                    type = 'file' if os.path.isfile(path) else 'dir',
                    url_token = token,
                    local_token = token,
                    access_type = parent_shared_record.access_type,
                    allowed_by = parent_shared_record.allowed_by,
                    overall_access = parent_shared_record.overall_access,
                    owner = parent_shared_record.owner,
                    parent = False,
                    FavouriteOf = [],
                )

                records_to_add.append(new_record2)

            
            db.add_all(records_to_add)
            db.commit()
            return token

        db.commit()
        
                
            
    except Exception as e:
        print(e)
        
    finally:
        db.close()
        
        
    
async def loop_assign_path_token():
    while True:
        assign_path_token()
        await asyncio.sleep(10)
    
        
    
    
async def main():
    
    task1 = asyncio.create_task(fake_path_records_record())
    task2 = asyncio.create_task(find_dead_arcs())
    await asyncio.gather(
        task1, 
        task2, 
    )
    
    
def start():
    print('Overseer is starting its work!')
    asyncio.run(main())
    


print('Overseer module imported!')
if __name__=='__main__':
    start()
