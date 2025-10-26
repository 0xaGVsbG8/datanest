from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker



#FOR DOCKER USAGE without compose
DATABASE_URL = "postgresql+psycopg2://postgres:postgres@host.docker.internal:9003/datanestDB?client_encoding=utf8"

#FOR DOCKER USAGE WITH COMPOSE
DATABASE_URL = "postgresql+psycopg2://postgres:postgres@postgres:5432/datanestDB?client_encoding=utf8"


#FOR REGULAR USAGE
# DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/datanestDB"


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autoflush=False,autocommit=False,bind=engine)

Base = declarative_base()
db = SessionLocal()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def log_out_every_user():
    from views.models import User
    from uuid import uuid4

    print('logging every user out!')

    db_local = SessionLocal() 
    users = db_local.query(User).all()

    for user in users:
        new_token = uuid4()
        user.user_token = new_token

    db_local.commit()
    db_local.close()


if __name__=='__main__':
    from views.models import User
    db_local = SessionLocal() 
    users = db_local.query(User).all()

    for user in users:
        print(user.id,user.email)

    # log_out_every_user()