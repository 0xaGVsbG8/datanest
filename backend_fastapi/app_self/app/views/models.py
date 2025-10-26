
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base
from datetime import datetime
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import ARRAY, String
import uuid
import time

Base = declarative_base()



class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    creation_date = Column(DateTime, default=datetime.utcnow)
    isDev = Column(Boolean)
    user_token = Column(UUID(as_uuid=True), default=uuid.uuid4)

    def __init__(self, email, password, isDev, user_token = None):
        self.email = email
        self.password = password
        self.isDev = isDev
        if user_token:
            self.user_token = user_token
    


class ITEMINFO(Base):
    __tablename__ = 'ITEMSINFO'
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String)
    owner = Column(String)
    type = Column(String)
    url_token = Column(String)
    isFavourite = Column(Boolean)
    last_change = Column(Integer)
    
    def __init__(self, path, owner=None, type=None, url_token=None, isFavourite=False, last_change=None):
        self.path = path
        self.owner = owner
        self.type = type
        self.url_token = url_token
        self.isFavourite = isFavourite
        self.last_change = int(last_change or time.time())

    
class zipinfo(Base):
    __tablename__ = 'zipinfo'
    id = Column(Integer, primary_key=True, index=True)
    zip_token = Column(String)
    user_token = Column(String)
    crt_date = Column(DateTime, default=datetime.utcnow)

    def __init__(self, zip_token=None, user_token=None, crt_date=None):
        self.zip_token = zip_token
        self.user_token = user_token
        self.crt_date = crt_date if crt_date is not None else datetime.utcnow()



class shared_items(Base):
    __tablename__ = 'shared_items'
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String)
    type = Column(String)
    local_token = Column(String)

    access_type = Column(Enum('browse-only','editing', name='access_type_enum'))
    overall_access = Column(Enum('anyone','restricted', name='overall_access_enum'))

    allowed_by = Column(ARRAY(String))
    owner = Column(String)
    parent = Column(Boolean)
    FavouriteOf = Column(MutableList.as_mutable(ARRAY(String)), default=list, server_default='{}')
    last_change = Column(Integer)
    

    def __init__(self, path, local_token=None, type=None, access_type=None, allowed_by=None,
        overall_access=None, owner=None, parent=False, FavouriteOf=None, last_change=None):
        
        self.path = path
        self.local_token = local_token
        self.type = type
        self.access_type = access_type
        self.allowed_by = allowed_by if allowed_by is not None else []
        self.overall_access = overall_access
        self.owner = owner
        self.parent = parent
        self.FavouriteOf = FavouriteOf if FavouriteOf is not None else []
        self.last_change = last_change


    
class passcodes_info(Base):
    __tablename__ = 'passcodes_info'
    
    id = Column(Integer, primary_key=True, index=True)
    passcode = Column(Integer)
    auth_token = Column(UUID(as_uuid=True), default=uuid.uuid4)
    type = Column(Enum('login', 'register','reset_password', name='type_enum'))
    for_user_token = Column(String)

    def __init__(self, passcode, auth_token, type, for_user_token):
        self.passcode = passcode
        self.auth_token = auth_token
        self.type = type
        self.for_user_token = for_user_token
    