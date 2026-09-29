
from app.app_dependencies import OS,app_path, OVERSEER_PATH, __STORAGE_VAULT_PATH, __STORAGE_VAULT_PATH_MAIN, ZIP_ARCS_PATH, ROOT_EMAIL, ROOT_PASSWD, ROOT_USER_ID
import os,subprocess,sys
from app.db_conn import get_db
from app.redis_conn import test_redis
from app.views.models import User
import time, bcrypt, uvicorn


DEV_BOOT = True # restarts backend after every save in files


def deploy_backend():
    
    if OS!="windows":
        os.system('clear')
    else:
        os.system('cls')
    
    time.sleep(2)
    print('waiting for other services to boot up!')
    time.sleep(10)

    os.system('ls')

    print('Booting up the backend!')
    print('testing a db conn!')
    print('STORAGE_PATH --> ',__STORAGE_VAULT_PATH)

    os.makedirs(__STORAGE_VAULT_PATH, exist_ok=True)
    os.makedirs(__STORAGE_VAULT_PATH_MAIN, exist_ok=True)
    os.makedirs(ZIP_ARCS_PATH, exist_ok=True)

    with open(os.path.join(__STORAGE_VAULT_PATH_MAIN,'it_works.txt'),'w') as f:
        f.write('')


    db = next(get_db())
    try:
        db.query(User).first()
        print('test positivie!')

        result = db.query(User).filter(User.email==ROOT_EMAIL)
        new_root_record = User(
            email = ROOT_EMAIL,
            password = bcrypt.hashpw(str(ROOT_PASSWD).encode('utf-8'),bcrypt.gensalt()).decode('utf-8'),
            isDev=True,
            user_token = ROOT_USER_ID
        )

        if not result:
            db.add(new_root_record)
        else:
            result = new_root_record


        db.commit()

    finally:
        db.close()
        
    
    test_redis()

    subprocess.Popen(f"python {OVERSEER_PATH}", shell=True)
    app_dir = os.path.dirname(app_path)
    os.chdir(app_dir)
    os.environ['PYTHONPATH'] = app_dir + os.pathsep + os.environ.get('PYTHONPATH', '')
    if app_dir not in sys.path:
        sys.path.insert(0, app_dir)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9002,
        app_dir=app_dir,
        workers=None if DEV_BOOT else 4,
        ws_ping_interval=20,
        ws_ping_timeout=60,
        ws_max_size=16777216,
        reload=DEV_BOOT,
    )


if __name__ == '__main__':
    deploy_backend() 