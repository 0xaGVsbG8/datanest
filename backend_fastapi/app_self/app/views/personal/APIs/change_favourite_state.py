from fastapi import APIRouter, Depends, Query, HTTPException, Request
from app_dependencies import Request

router = APIRouter()
import ast
from sqlalchemy.orm import Session
from fastapi import Depends
from db_conn import get_db
from views.models import ITEMINFO, shared_items
from sqlalchemy import and_
from fastapi import Query, HTTPException


@router.get('/sec/change-favourite-state/',)
async def view(
    request: Request,
    current_state: bool = Query(...),
    item_token: str = Query(...),
    db: Session = Depends(get_db)
):

    user = request.state.user

    if user:
        result = db.query(ITEMINFO).filter(ITEMINFO.url_token==item_token).all()
        if result:
            for record in result:
                if record.owner == user:
                    record.isFavourite = not current_state


            current_state = not current_state
            result = db.query(shared_items).filter(and_(shared_items.local_token==item_token)).all()

            if result:
                for record in result:

                    if record.FavouriteOf is None:
                        temp_ls = []
                    else:
                        temp_ls = record.FavouriteOf.copy()

                    if not current_state:
                        if user in temp_ls:
                            temp_ls.remove(user)
                    
                    else:
                        if user not in temp_ls:
                            temp_ls.append(user)

                    record.FavouriteOf = temp_ls
                
            db.commit()
            return {'changes':True}
        else:
            raise HTTPException(status_code=404, detail="Item not found")
        
    else:
        raise HTTPException(status_code=403, detail="Access denied")



