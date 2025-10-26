

import os
import hashlib

def chunk_reader(path,chunk_size = 50 * (1024*1024)):

    if not os.path.exists(path):
        return
    
    with open(path,'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk


def compare_by_hash(grouped_files:dict, erase_dups = False):

    hash_ls = []
    seen = set()
    toRemove = []

    for size_group in grouped_files:
        for fpath in grouped_files[size_group]:

            if not os.path.exists(fpath):
                continue

            h = hashlib.sha256()
            for chunk in chunk_reader(fpath):
                h.update(chunk)
            
            hash_ls.append(
                {
                    'fpath':fpath,
                    'hash':h.hexdigest()
                }
            )

           
    for item in hash_ls:
        if item['hash'] not in seen:
            seen.add(item['hash'])
        else:
            toRemove.append(item['fpath'])

    if erase_dups:
        for fpath in toRemove:
            if os.path.exists(fpath):
                os.remove(fpath)

    return toRemove
    
    


def gather_group_by_size(src: os.path):

    group_by_size_data = {}

    if os.path.exists(src):
        for root, dirs, files in os.walk(src):
            for f in files:
                fpath = os.path.join(root, f)
                fsize = os.path.getsize(fpath)
                if not group_by_size_data.get(fsize):
                    group_by_size_data[fsize] = []
                group_by_size_data[fsize].append(fpath)


    return group_by_size_data


def scan_dups(path: os.path, erase_dups = False):
    gathered_ls = gather_group_by_size(path)
    return compare_by_hash(gathered_ls, erase_dups)


