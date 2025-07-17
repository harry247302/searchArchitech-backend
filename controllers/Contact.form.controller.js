const { client } = require("../config/client")

const contactForm = async(req,res,next)=>{
    try {
        const result = await client.query('SELECT * FROM contact ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const postContactFormDetails  = async (req,res,next)=>{
    const {name ,email,subject,message} = req.body
    
    if(!name || !email || !subject || !message){
        return res.status(400).json({error:'All fields are required'})
    }
    
    try {
        const result = await client.query(
            `INSERT INTO contact (name , email, subject, message)
            VALUES($1, $2, $3, $4)
            RETURNING *`,
            [name,email,subject || null, message]
        );
        res.status(201).json(result.rows[0]);


    } catch (error) {
        console.log(error)
        next(error)
    }
}

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM contact WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    res.status(200).json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    contactForm,
    postContactFormDetails,
    deleteContact
}