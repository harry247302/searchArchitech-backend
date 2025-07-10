const { client } = require('../config/client');

 const create_product = async (req,res,next)=>{
    try {
        const {   
            title,
            name,
            image_1,
            image_2,
            image_3,
            category,
            brand_name,
            type,
            description,
            material,
            color_palette,
            tags} = req.body


            const query = `
            INSERT INTO products (
              title, name, image_1, image_2, image_3, category, brand_name, type, description, material, color_palette, tags
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
            RETURNING *;`;

            const values = [
                title,
                name,
                image_1,
                image_2,
                image_3,
                category,
                brand_name,
                type,
                description,
                material,
                color_palette,
                tags
              ];


            const result = await client.query(query, values);

            res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            product: result.rows[0]
            });
      
    } catch (error) {
        console.log(error)
        next(error)
    }
}




 const deleteProductById = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      deletedProduct: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error); // or return res.status(500).json({ message: 'Internal Server Error' });
  }
};


const update_product_by_id = async (req, res, next) => {
  try {
    const {
      id,
      title,
      name,
      image_1,
      image_2,
      image_3,
      category,
      brand_name,
      type,
      description,
      material,
      color_palette,
      tags
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const query = `
      UPDATE products
      SET 
        title = $1,
        name = $2,
        image_1 = $3,
        image_2 = $4,
        image_3 = $5,
        category = $6,
        brand_name = $7,
        type = $8,
        description = $9,
        material = $10,
        color_palette = $11,
        tags = $12
      WHERE id = $13
      RETURNING *;
    `;

    const values = [
      title,
      name,
      image_1,
      image_2,
      image_3,
      category,
      brand_name,
      type,
      description,
      material,
      color_palette,
      tags,
      id
    ];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      updatedProduct: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { update_product_by_id };



module.exports = {
  create_product,
  deleteProductById,
  update_product_by_id
};
