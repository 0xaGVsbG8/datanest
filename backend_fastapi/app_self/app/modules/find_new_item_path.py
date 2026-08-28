import os

def get(path: os.path):
    iter = 0
    if path == '':
        raise SystemError('Empty path!')
    
    if not os.path.exists(path):
        return path

        
    name = path
    ext = ''

    if os.path.isfile(path):
        name, ext = os.path.splitext(path)

    while True:
        iter+=1
        new_name = name + f" ({iter})" + ext
        if not os.path.exists(new_name):
            break


            
    return new_name

