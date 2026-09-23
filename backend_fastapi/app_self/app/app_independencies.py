

import platform,os
from fastapi import APIRouter, FastAPI, Request
from uuid import uuid4

PREFIX='/backend'


ROOT_EMAIL = 'root@dash.io'
ROOT_PASSWD = 'Liduka35'
ROOT_USER_ID = str(uuid4())


OS = platform.system().lower()
OVERSEER_PATH = os.path.join(os.path.dirname(__file__),'overseer.py')

DEPLOY_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)),'deploy.py')

SEND_MAILS = True
SENDER_EMAIL = "fuzzdisk@gmail.com"
SENDER_EMAIL_PASSWORD = "avhi wyig ptvo mthg" #Gmail account app code
 

ALLOW_TEST_ACC_FOR_DEV_PURPOSES = True # allows a dev | regular user to log in as temp@gmail.com and with any password without checking db and etc...
TEST_ACC_FOR_DEV_PURPOSES = 'temp@gmail.com'



ZIP_ARC_LIFESPAN = 25200 #secs (7 hours)

models_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),'models.py')
schemas_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),'schemas.py')
app_path = os.path.join(os.path.dirname(__file__),'main.py')
__STORAGE_VAULT_PATH_MAIN = (os.path.join(os.path.dirname(os.path.dirname(__file__)),'__STORAGE_VAULT')).replace('\\','/')
__STORAGE_VAULT_PATH = os.path.join(__STORAGE_VAULT_PATH_MAIN, 'USERS')


CONF_JSON = os.path.join(__STORAGE_VAULT_PATH_MAIN, 'config.json')


#loading a default json conf
if not os.path.exists(CONF_JSON):
    with open(CONF_JSON, 'w') as f:
        f.write("""
{
    "_comment": "in GBs",
    "MAX_STORAGE_PER_ACCOUNT": 22.0,
    "MAX_UPLOAD_SIZE": 22.0
}
""")
        

ZIP_ARCS_PATH = (os.path.join(__STORAGE_VAULT_PATH_MAIN, 'ZIP_ARCS')).replace('\\','/')


app = FastAPI(
    # docs_url=None,
    # redoc_url=None,
    # openapi_url=False
)
#unmark those to disable public docs






#-------------------------------
#-------------------------------
#INSERT YOUR CORS HERE
#------------------------------
#------------------------------


origins = [
    # '*' #dev only,
    'http://localhost:9000',
    'http://localhost:9001',
    'https://berkehut.ddns.net',
    'https://gowno.shop',
    'http://berkehut.ddns.net',
]


router = APIRouter(prefix=PREFIX)

