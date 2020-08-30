const crypto = require('crypto')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const fs = require('fs')
const SECRET = fs.readFileSync(__dirname + "/../keys/private.pem", "utf-8")
const PUBLIC = fs.readFileSync(__dirname + "/../keys/public.pem", "utf-8")

module.exports = {
    genPassword : (password) =>{
        const salt = crypto.randomBytes(32).toString('hex')
        const hash = crypto.pbkdf2Sync(password,salt,10000,64,"sha256").toString('hex')
        return {
            salt, hash
        }
    },
    isValid : (password,salt,hash) =>{
        const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha256").toString('hex')
        return hash === hashVerify
    },

    refreshToken: (user)=>{
        return jwt.sign({id:user._id}, SECRET, {algorithm:"RS256"})
    },

    accessToken: (id)=>{
        return jwt.sign({id}, SECRET, {algorithm:"RS256"})
    },

    verifyToken: (token)=>{
        return jwt.verify(token, PUBLIC)
    }
    
}