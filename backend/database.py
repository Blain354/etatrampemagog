import os
from sqlmodel import Session, create_engine

os.makedirs("data", exist_ok=True)
sqlite_file_name = "data/database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# echo=True allows logging SQL statements. Remove or set to False in production
engine = create_engine(sqlite_url, echo=True, connect_args={"check_same_thread": False})


# Dependency to yield database sessions
def get_session():
    with Session(engine) as session:
        yield session
