
import os

def get_folder_size(path: os.path):

    folder_size = 0

    for root, dirs, files in os.walk(path):
        for f in files:
            fpath = os.path.join(root,f)
            folder_size += os.path.getsize(fpath)

    return folder_size


def convert(size_bytes: int):

    if size_bytes < 1024:
        if size_bytes != 0:
            return f"{size_bytes:.2f}Bs"
        else:
            return f"0.00Bs"
    elif size_bytes < 1024*1024:
        return f"{size_bytes/1024:.2f}KBs"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes/(1024*1024):.2f}MBs"
    else:
        return f"{size_bytes/(1024*1024*1024):.2f}GBs"
    

def get(path,size_bytes = None):   
    if not size_bytes and size_bytes!=0:
        if os.path.isdir(path):
            size_bytes = get_folder_size(path)
            return convert(size_bytes)
        
        #if its a single file
        size_bytes = os.path.getsize(path)

    return convert(size_bytes)
    
