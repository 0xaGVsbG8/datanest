from app_independencies import router,Request
from fastapi.responses import Response


@router.post('/log-out/')
async def view(request: Request,response: Response):
    print('User is asking to be log out!')
    response.delete_cookie('creds')
    return {'status':'dumped'}