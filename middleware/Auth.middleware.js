const jwt = require('jsonwebtoken');
const { client } = require('../config/client');
const asyncHandler = require ('express-async-handler');
const protect = asyncHandler(async(req,res,next)=>{
    let token;

    token = req.cookies.token;
    // console.log(token, "---------------------------------------------");
    

    if(token){
        try { 
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            // console.log(decode);
            
            const userId = decode.id;
            // console.log(userId);
                        
            const result = await client.query(
                `SELECT id,email 
                FROM architech WHERE id = $1`,
                [userId]
            )
            const rows = result.rows
            console.log(rows);
            
            if(rows.length ===0){
                res.status(401);
                throw new Error('User not found')
            }
            
            req.user = rows[0]
            // console.log(req.user);
            
            next();
        } catch (error) {
            console.log(error)
            res.status(401);
            throw new Error('No authrization')
        }
    }
})


module.exports = { protect };