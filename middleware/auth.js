const User = require('../models/userModel');

const jwt = require('jsonwebtoken');

exports.authentication = async (req, res, next) => {
    try{
        const token = req.header('Authorization');
        
        const data = jwt.verify(token , process.env.secretKey);
        
        const user = await User.findOne( { where : {id: data.id}} );
        
        req.user = user;
        next();
    }catch(err){
        console.log(err);
        res.status(404).json({success : false , error : err});
    }
}
