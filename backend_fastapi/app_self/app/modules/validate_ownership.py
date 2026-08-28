
from db_conn import get_db
from typing import cast
from views.models import shared_items, ITEMINFO


#validates ownership of record if it was handed by sharing
def validate_shared_record(record, user):


    record = cast(shared_items, record)

    if record.owner == user:
        return True
    
    if record.parent:
        return False
    
    if record.overall_access == 'restricted':
        if user not in record.allowed_by:
            return False
        else:
            if record.access_type == 'editing':
                return True
            
    if record.overall_access == 'anyone' and record.access_type == 'editing':
        return True


