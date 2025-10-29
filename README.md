

# DATANEST
# this project is a storage cloud something like google drive, includes features such as uploading, sharing with diffrent users, downloading, browsing files

- Users files and arcs (zips) are stored in backend_fastapi/app_self/__STORAGE_VAULT


## Used stack / techs
- Backend: FastAPI, Python
- Frontend: Next.js, React, TypeScript
- Backend <---> Frontend Communication: WebSockets, FetchAPI
- Docker for containerized environment
- Nginx for a reverse proxy so everything runs on a single port at the end


# Requirements
- Docker and Docker Compose
(Those are downloaded in dockerfiles anyways)
- Python 3.10+ (Optional)
- Node.js 20+ (Optional)
- npm or yarn (Optional)


# Instalation
Just install this repo then follow the rest of the instructions


# Set up / configuration


- CONFIGURATION FILES:
# frontend_next/app_self/next.config.ts
# backend_fastapi/app_self/app/app_independencies.py
# backend_fastapi/app_self/app/db_conn.py


# ===CORS BEHAVIOUR / NETWORK configuration===
if you want to use it with a domain other than a localhost for instance https://yoyo.com you have to set up cors in both config files (backend, frontend)


# in app_independencies (backend) 
you have to add your domain to origins 
THIS BLOCK:

# origins = [
    # '*' #dev only,
    'http://localhost:9000',
    'http://localhost:9001',
    # your domain goes here
# ]




# in next.config.ts
You have to edit these lines:

# export const base_backend_url = '://localhost:9000/datanest/backend' //must be in this format!  
replace localhost:9000 with your domain for instance ://yoyo.com  <-- your domain + /datanest/backend so ://yoyo.com/datanest/backend

# export const use_ssl: boolean = false 
false if your domain has http true if it has https


#  allowedDevOrigins: [
    'http://localhost:9000',
    'http://localhost:9000'
#  ],

provide your domain here aswell 




if you want this to run on your domain you can use reversed proxy from nginx example record for this service in default.conf:


server {
    client_max_body_size 120G;
    listen 443 ssl;
    server_name domain;
    ssl_certificate path;
    ssl_certificate_key path;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;


#   SERVICE
    location /datanest/ {
        proxy_pass http://localhost:9000/datanest/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
#   SERVICE

}




# service configuration (backend)

# ===Builded in admin account===
In app_independencies you can provide builded in admin email address that requires no passcode to enter to log in simply restart the login page after providing admin credentials


- ===Enable / disable test account===
In app_independencies you can enable or disable test account that requires no specific password in logging page simply restart the login page after providing temp acc address and any password 
# ALLOW_TEST_ACC_FOR_DEV_PURPOSES = True 
edit this line to manage



- SENDING EMAIL CONFIGURATION

# SEND_MAILS = True
edit this line if you want or not to send mails
# By default mails will be sent from gmail account i have provided, its a fresh account
If you want to use your address edit these lines
# SENDER_EMAIL = "fuzzdisk@gmail.com"
# SENDER_EMAIL_PASSWORD = "avhi wyig ptvo mthg" 


- Lifespan of zipped folders (download)
# ZIP_ARC_LIFESPAN = 25200
edit this line (seconds) after that time a zip arc will be removed no matter


# UPLOAD LIMIT and ACCOUNT LIMIT
You can set upload limit per request for instance max 2GB upload at once and overall avaible space for a single user
Its setable either in backend_fastapi/app_self/__STORAGE_VAULT/config.json file or on a dev page which is http://localhost:9000/datanest/drive/dev    (preferable)


# db_conn conf
leave it by default if you are gonna use docker compose build to boot the service
else edit this line in backend_fastapi/app_self/app/db_conn.py:
# DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/datanestDB"
replace postgres1 with user, postgres2 with passwd, localhost with an address or leave it




# ===BOOTING SERVICE===
Type 'docker compose build' in main app folder


# ===Diagnostics=== 
After booting a service you should be able to access it at localhost:9000/datanest/backend


















































