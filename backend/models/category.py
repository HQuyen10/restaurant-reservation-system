from backend.core.extensions import db

class CategoryFood(db.Model):
    __tablename__ = 'category'

    CategoryID = db.Column(db.Integer, primary_key=True)
    CategoryName = db.Column(db.String(255))
