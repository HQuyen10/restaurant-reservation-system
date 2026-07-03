from backend.core.extensions import db

class OrderItem(db.Model):
    __tablename__ = "order_item"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'))
    name = db.Column(db.String(100))
    food_id = db.Column(
        db.String(8),
        db.ForeignKey("Food.FoodID"),
        nullable=False
    )

    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)

    food = db.relationship("Food", backref="order_items")

