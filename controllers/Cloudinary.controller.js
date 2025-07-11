const multer = require("multer");

const fs = require('fs');
const cloudinary = require("../config/cloudinary");
const upload = multer({ dest: 'uploads/' });

const cloudinary_setup = async (req,res,next)=>{
    try {
        const result=await cloudinary.uploader.upload(req.file.path,{
            folder:'uploads'
        });
        fs.unlinkSync(req.file.path);
        console.log(result.secure_url);
        
        res.json({url:result.secure_url})
    } catch (error) {
        console.log(error)
        next(error)
    }
}
module.exports = {cloudinary_setup}