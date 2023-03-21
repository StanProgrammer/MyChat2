const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const User = sequelize.define('user' , {
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type:Sequelize.TEXT
    },
    email:{
        type:Sequelize.STRING,
        unique: true
    },
    phonenumber:{
        type:Sequelize.STRING
    },
    password:{
        type:Sequelize.STRING
    }
})

module.exports = User;