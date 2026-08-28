import os,zipfile
from app_independencies import ZIP_ARCS_PATH
from views.personal.APIs.get_items import blank_item_alias

zipfile.ZIP64_LIMIT = 100 * 1024**3 



CHUNK_SIZE = 64  * 1024  # 64 KB
zipdir = os.path.join(os.path.dirname(__file__),'archx')

def chunk_reader(path):
    global all_offset, OVERALL_OFFSET
    
    offset = 1
    FILESIZE = os.path.getsize(path)
    with open(path, 'rb') as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            
            OVERALL_OFFSET_in_mb = round(OVERALL_OFFSET / (1024*1024),2)
            all_offset_in_mb = round(all_offset / (1024*1024),2)
            
            
            perc_progress = round((OVERALL_OFFSET/ all_offset) * 100,2)
         
                
            offset+=len(chunk)
            OVERALL_OFFSET+=len(chunk)
            
            print(f'CURRENTLY ZIPPING: {os.path.basename(path)}, OVERALL-PROGRESS: {perc_progress}%                                      ', 
                  flush=True,end='\r')
            
            yield chunk, perc_progress
            

def gen_file_ls(path: os.path, file_ls: list = None):
    
    global all_offset, OVERALL_OFFSET
    
  
    
    if path:
        file_ls = []
        for root, dirs, files in os.walk(path):
            for file in files:
                filepath = os.path.join(root, file)
                all_offset += os.path.getsize(filepath)
                file_ls.append(filepath)
    else:
        for item in file_ls:
            all_offset += os.path.getsize(item)
            
    
    print('all size --> ',round(all_offset / (1024*1024),2), 'MBs')
    return file_ls




async def gen_ziparc(location, dest:str = None, items: list = None):
    
    global all_offset, OVERALL_OFFSET
    # print(location, '22x1?')
    
    OVERALL_OFFSET = 1
    all_offset = 0
    
    
    if not items:
        items = gen_file_ls(location)
    else:
        gen_file_ls(None, items)
    
    print(items, '<--args')
    
    
    if not dest or not dest.endswith('.zip'):
        # print('Invalid or non existent zipname!')
        dest =os.path.join(ZIP_ARCS_PATH, os.path.basename(location))
        
    current_num = 0
    prev_num = 0


    with zipfile.ZipFile(dest,'w', compression=zipfile.ZIP_STORED, allowZip64=True) as zf:
        for index, item in enumerate(items, start = 1):
            item:str

            #ignores fake file when zipping
            if blank_item_alias in item:
                continue

            if os.path.isdir(item):
                arcname = os.path.join(
                    os.path.basename(location),
                    os.path.relpath(item, start=location)
                ).replace('\\', '/') + '/'
                zf.writestr(arcname, '') 
                continue
            else:
            
                arcname = os.path.join(
                    os.path.basename(location),
                    os.path.relpath(item, start=location)
                ).replace('\\', '/')

                with zf.open(arcname,'w') as file:
                    for chunk,perc in chunk_reader(item):
                        current_num = int(perc)
                        file.write(chunk)
                        if current_num!=prev_num:
                            yield perc, index

                    
    


