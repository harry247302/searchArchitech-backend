const jwt = require('jsonwebtoken');
const { client } = require('../config/client');
const asyncHandler = require ('express-async-handler');
const protect = asyncHandler(async(req,res,next)=>{
    let token;

    token = req.cookies.token;

    if(token){
        try {
            console.log(process.env.JWT_SECRET,"---------------------------------------------------------------------");
            
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            const userId = decode.userId;            
            const result = await client(
                `SELECT id, first_name, last_name, email, category, phone_number, profile_url, company_name
                FROM users WHERE id = $1`,
                [userId]
            )
            if(rows.length ===0){
                res.status(401);
                throw new ('User not found')
            }
            req.user = rows[0]
            next();
        } catch (error) {
            console.log(error)
            res.status(401);
            throw new error('No authrization')
        }
    }
})


module.exports = { protect };