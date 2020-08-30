// require('./keys/keys') //create keys
require('dotenv').config()

const express = require('express')
const app = express()

const fs = require('fs')
const passport = require("passport")
const cookieParser = require('cookie-parser')

const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET
const SECRET_KEY = fs.readFileSync(__dirname + "/keys/private.pem", "utf-8")
const PUBLIC_KEY = fs.readFileSync(__dirname + "/keys/public.pem", "utf-8")
const utils = require('./lib/utils')

const connection = require("./config/model/models")
const User = connection.models.passportusers
const Token = connection.models.tokens


app.use(cookieParser())
require('./config/passportJWT')(passport)
app.use(passport.initialize())

app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.get('/',  async (req,res)=>{
    const payload = {
        sub: '_id',
        iat: Date.now()
      };
    const token =  jwt.sign(payload, SECRET_KEY, { expiresIn: "60" , algorithm: 'RS256'});
         await User.find({})
        .then(user=>{
            console.log(user)
            res.send("home").end()
        }
        )
        .catch(err=>console.log(err))
            
        
})

//register
//check if user exists
//save hashed password
//create refresh token
//save refresh token into DB

app.post('/register', async (req,res,next)=>{
    const {username,password} = req.body

    await User.findOne({username})
    .then(async foundUser => {
        
        if(foundUser) 
            
            res.status(401).json({message:"User exists"})
        else{
              const hashedPassword = utils.genPassword(password)
              await User.create({
                username,
                hash:hashedPassword.hash,
                salt:hashedPassword.salt
            })
        .then(async newUser=>{  

            console.log(newUser)
           token = utils.refreshToken(newUser)
            await Token.create({
                refreshToken:token
            })
            .then(storedToken=>{
                console.log(storedToken)
                res.status(200).json({success:true, token:storedToken})
            })
            .catch(err=>next(err))
        })
        .catch(err => next(err))
        }
    })
    .catch(err => {
        next(err)
    })

})

//login
//check if user exists
//check if password is correct
//ask for refresh token
//save refresh token in session
//use refresh token for a new access token
app.post('/login', async (req,res,next)=>{

    const {username,password} = req.body

    await User.findOne({username})
    .then(async user =>{
        if(!user) res.status(401).json({success:false, message:"Incorrect user"})
        if(!utils.isValid(password, user.salt,user.hash)) res.status(401).json({success:false, message:"Incorrect password"})
        
        await Token.find({})
            .then(users=>{
                users.filter(u=>{
                    if(u.refreshToken !== undefined){
                        const id = utils.verifyToken(u.refreshToken).sub
                        if (id == user._id){
                            //store refreshtoken in header
                            const accessToken = utils.accessToken(id)
                            res.cookie('accessToken', accessToken, {maxAge:1000*60, httpOnly:true}).json({success:true})
                        }
                }
                })
            })
        })
})

//authenticate
//use access token to enter route

app.post('/auth', passport.authenticate('jwt', {session:false}), 
(req,res)=>{
    console.log("Authenticated")
})

app.get('/cookie', (req,res,next)=>{
    console.log(req.cookies)
})

app.listen(3000)