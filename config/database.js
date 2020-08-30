require('dotenv').config()
const mongoose = require('mongoose')
const conn = process.env.MONGODB_URI
const connection = mongoose.createConnection(conn,{
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false
})

.once('open', () =>{
    console.log('Connected to DB')
})

module.exports = connection