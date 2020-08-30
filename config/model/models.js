const connection = require('../database')
const mongoose = require('mongoose')
connection.model('passportusers',new mongoose.Schema({
    username:String,
    hash:String,
    salt:String
}))
connection.model('tokens',new mongoose.Schema({refreshToken:String}))
module.exports = connection