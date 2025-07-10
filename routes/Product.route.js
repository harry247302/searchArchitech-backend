// routes/Auth.route.js
const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { create_product, deleteProductById, update_product_by_id } = require('../controllers/Product.controller');

const productRouter = express()



productRouter.post('/create/product',protect,create_product)

productRouter.delete('/delete/product',protect,deleteProductById)

productRouter.patch('/update/product/:id',protect,update_product_by_id)
module.exports = productRouter
