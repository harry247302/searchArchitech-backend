const multer = require("multer");

const fs = require('fs');
const cloudinary = require("../config/cloudinary");
const upload = multer({ dest: 'uploads/' });

const cloudinary_setup = async (req,res,next)=>{
    try {
        console.log(req);
        
        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:'uploads'
        });
        fs.unlinkSync(req.file.path);
        console.log(result);
        
        res.json({url:result})
    } catch (error) {
        console.log(error)
        next(error)
    }
}
module.exports = {cloudinary_setup}