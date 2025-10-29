from app_independencies import router,Request, __STORAGE_VAULT_PATH, PREFIX, ZIP_ARCS_PATH
from fastapi.responses import Response, JSONResponse
from starlette.responses import Response
from typing import List



@router.get('/log-out/')
async def view(request: Request, response: Response):


    response = JSONResponse(content={'log_out':True})
    

    cookies = request.cookies
    if cookies.get('creds'):
        response.delete_cookie('creds')

    if cookies.get('user_token'):
        response.delete_cookie('user_token')
    
    if cookies.get('client_id'):
        response.delete_cookie('client_id')

    if cookies.get('test_acc'):
        response.delete_cookie('test_acc')
    
    return response
