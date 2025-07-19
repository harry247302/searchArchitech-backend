const jwt = require('jsonwebtoken');
const { client } = require('../config/client');
const asyncHandler = require ('express-async-handler');
const protect = asyncHandler(async(req,res,next)=>{
    let token;

    token = req.cookies.token;
    // console.log(token, "---------------------------------------------");
    // if(token){
    //     try { 
    //         const decode = jwt.verify(token,process.env.JWT_SECRET);
    //         console.log(decode);
            
    //         const userId = decode.id;

    //         if(decode.designation=="Super Admin"){
    //             result = await client.query(
    //                 `SELECT id,email,designation
    //                 FROM admin WHERE id= $1`,
    //                 [userId]
    //             )
    //         }else if(decode.designation=="Architect"){
    //              result = await client.query(
    //             `SELECT id,email,designation
    //             FROM architech WHERE id = $1`,
    //             [userId]
    //         )
    //         }else{
    //             result = await client.query(
    //                 `SELECT id,email,designation
    //                 FROM visitors WHERE id = $1`,
    //                 [userId]
    //             )
    //         }
                        
            
    //         const rows = result.rows
    //         // console.log(rows);
            
    //         if(rows.length ===0){
    //             res.status(401);
    //             throw new Error('User not found')
    //         }
            
    //         req.user = rows[0]
    //         // console.log(req.user);
            
    //         next();
    //     } catch (error) {
    //         console.log(error)
    //         res.status(401);
    //         throw new Error('No authrization')
    //     }
    // }
    
    if(!token){
        return res.status(403).json({message:"Token is required"});
    }
     try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET) 
        req.user = decoded;
        
        
        next();
    } catch(error){
        res.status(401).json({message:"Invalid or expired token"});
    }
})


module.exports = { protect };