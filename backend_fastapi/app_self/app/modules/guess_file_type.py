import magic
import os
import sys
import filetype


__STORAGE_VAULT_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),'__STORAGE_VAULT','USERS')




def get(path: str):

    file_type = 'text'

    try:
        kind = filetype.guess(path)

        if kind is None:
            pass
            #unknown file type returning text as default
        else:
            file_type = kind.mime

    finally:
        return file_type








