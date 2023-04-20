const Sequelize  = require('sequelize');


const sequelize = new Sequelize('chatapp', 'root', 'atib', {
    host: 'localhost',
    dialect: 'mysql'
  });
  module.exports=sequelize