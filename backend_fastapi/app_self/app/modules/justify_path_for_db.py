from app_independencies import __STORAGE_VAULT_PATH
import os


#adjusts path for db insertion
def get(path:str):
    
    path = os.path.normpath(path)
    path = path.replace('\\','/')
    local = __STORAGE_VAULT_PATH.replace('\\','/')
    modified_path = str(path.split(local)[1]).replace('\\','/')
    if modified_path[0] == '/':
        modified_path = modified_path[1:]
    
    return modified_path