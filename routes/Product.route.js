// routes/Auth.route.js
const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { create_product, deleteProductById } = require('../controllers/Product.controller');

const productRouter = express()



productRouter.post('/create/product',protect,create_product)

productRouter.delete('/delete/product',protect,deleteProductById)


module.exports = productRouter
