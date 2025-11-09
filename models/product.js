const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class Product {
  constructor(title, price, description, imageURL, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageURL = imageURL;
    this._id = id;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOperation;

    if (this._id) {
      dbOperation = db
        .collection('products')
        .updateOne(
          {_id: new mongodb.ObjectId(this._id)}, 
          { $set: this }
        );
    } else {
      dbOperation = db
        .collection('products')
        .insertOne(this)
    }

    return dbOperation.then().catch(error => {
      console.log(error);
    });
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products').find().toArray()
    .then(products => {
      return products;
    })
    .catch((error) => {
      console.log(error);
    });
  }

  static findById(productId) {
    const db = getDb();
    return db.collection('products')
      .find({_id: new mongodb.ObjectId(productId)})
      .next()
      .then(product => {
        return product;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static deleteById(productId) {
    const db = getDb();
    return db.collection('products').deleteOne({_id: new mongodb.ObjectId(productId)})
    .then()
    .catch((error) => {
      console.log(error);
    });
  }
}

module.exports = Product;