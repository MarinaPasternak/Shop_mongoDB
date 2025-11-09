const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageURL = req.body.imageURL;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageURL);
  product.save().then(result => {
    console.log(result);
    res.redirect('/admin/products');
  })
  .catch(error => {
    console.log(error);
  })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;

  if (!editMode) {
    return res.redirect('/');
  }

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(error => {
      console.log(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedimageURL = req.body.imageURL;
  const updatedDesc = req.body.description;
  Product
    .findByPk(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageURL = updatedimageURL;
      product.description = updatedDesc;
      product.save();
    })
    .then()
    .catch(error => {
      console.log(error)
    });
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => console.error(err));
};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product
//     .findByPk(prodId)
//     .then(product => {
//       return product.destroy();
//     })
//     .then(result => {
//       res.redirect('/admin/products');
//     })
//     .catch();
// };
