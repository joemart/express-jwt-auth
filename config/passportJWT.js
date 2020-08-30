require('dotenv').config()
const fs = require('fs')
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const PUBLIC_KEY = fs.readFileSync(__dirname + "/../keys/public.pem","utf-8")
const connection = require('./model/models')
const User = connection.models.passportusers
const Token = connection.models.tokens

const cookieExtractor = (req)=> {
    let token = null;
    if (req && req.cookies)
    {
        token = req.cookies['accessToken'];
    }
    
    return token;
};

const options = {
    secretOrKey : PUBLIC_KEY,
    jwtFromRequest : cookieExtractor,
    algorithms: "RS256"
}

const verify = (payload, done) =>{

    
    User.findOne({_id:payload.id})
    .then(u=>{
        if(u) return done(null,u)
        else return done(null,false)
    })
    .catch(err => done(err))

}

const strategy = new JwtStrategy(options,verify)

module.exports = (passport) => passport.use(strategy)