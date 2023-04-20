const path = require('path')
const rootDir = path.dirname(require.main.filename);
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const env=require('dotenv')
env.config()
const SECRET_KEY=process.env.SECRET_KEY
const User = require('../models/users')
exports.signupPage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'signup.html'))
}

exports.loginPage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'public', 'html', 'login.html'))
}

exports.generateAccessToken=(id, name,email) => {
    return jwt.sign({ id: id, name: name, email:email}, SECRET_KEY);
  }

exports.createUser = async (req, res, next) => {
    try{
        console.log(req.body);
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const project = await User.findOne({ where: { email: email } });
        if (project === null) {
            const saltrounds = 10
            const hashPassword = await bcrypt.hash(password, saltrounds)
            const result = await User.create({ name: name, email: email, phone: phone, password: hashPassword })
            res.status(201).json({ message: 'Successfully Created'})
            res.redirect('/')
        } else {
            res.status(400).send('User Already Exists')
    }
}catch(err){
        console.log(err);
    }
}

exports.checkUser=async(req,res,next)=>{
    try {
        console.log(req.body);
        const email = req.body.email
        const password = req.body.password
        const user1 = await User.findOne({ where: { email: email } });
        if (user1 === null) {
            res.status(404).send('User Not Found')
        } else {
            const hash = user1.dataValues.password
            await bcrypt.compare(password, hash, function (err, result) {
                if (result === false) {
                  return res.status(401).send('User Not Authorized')
                }})
            res.status(200).json({ message: 'User Logging successfull',id:user1.id,name:user1.name,email:user1.email, token: exports.generateAccessToken(user1.id,user1.name,user1.email)}) 
    }
        
    } catch (error) {
        
    }
}