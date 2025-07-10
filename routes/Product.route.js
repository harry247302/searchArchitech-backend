// routes/Auth.route.js
const express = require('express');
const { protect } = require('../middleware/Auth.middleware');
const { create_product, deleteProductById, update_product_by_id, get_all_products } = require('../controllers/Product.controller');

const productRouter = express()



productRouter.post('/create/product',protect,create_product)

productRouter.delete('/delete/product',protect,deleteProductById)

productRouter.patch('/update/product/:id',protect,update_product_by_id)

productRouter.get('/fetch-All/product',protect,get_all_products)


module.exports = productRouter
