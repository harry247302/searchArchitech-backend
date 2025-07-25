const jwt = require('jsonwebtoken');
const { client } = require('../config/client');
const asyncHandler = require ('express-async-handler');
const protect = asyncHandler(async(req,res,next)=>{
    let token;

    token = req?.cookies?.token || req?.cookies?.architectToken || req?.cookies?.visitorToken;
    console.log(token);
    
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