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
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const allowedFields = [
      "title",
      "name",
      "image_1",
      "image_2",
      "image_3",
      "category",
      "brand_name",
      "type",
      "description",
      "material",
      "color_palette",
      "tags"
    ];

    const updates = [];
    const values = [];

    // Dynamically build update fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${updates.length + 1}`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Add id at the end
    values.push(id);
    const query = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING *;
    `;

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

const get_all_products = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM products;';
    const result = await client.query(query);

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};



module.exports = {
  create_product,
  deleteProductById,
  update_product_by_id,
  get_all_products
};