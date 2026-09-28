from fastapi import APIRouter, Request, Depends
from app_dependencies import Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from db_conn import get_db
from uuid import UUID
from modules.sessions import revoke_session, clear_session_cookie, SESSION_COOKIE

router = APIRouter()



@router.get('/log-out/')
async def view(request: Request, db: Session = Depends(get_db)):


    response = JSONResponse(content={'log_out':True})
    

    cookies = request.cookies
    if cookies.get('creds'):
        response.delete_cookie('creds')

    if cookies.get(SESSION_COOKIE):
        try:
            revoke_session(db, UUID(cookies.get(SESSION_COOKIE)))
            db.commit()
        except (ValueError, TypeError):
            pass
        clear_session_cookie(request, response)
    
    if cookies.get('client_id'):
        response.delete_cookie('client_id')                 

    if cookies.get('test_acc'):
        response.delete_cookie('test_acc')
    
    return response
