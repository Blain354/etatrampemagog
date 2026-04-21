from sqlmodel import SQLModel

# Import all models here so that Alembic and SQLModel.metadata can discover them
from .user import User
