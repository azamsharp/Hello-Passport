
const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
const app = express()
const flash = require('connect-flash')
const mustacheExpress = require('mustache-express')
const bcrypt = require('bcryptjs')

app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session())
app.use(flash())

// list of users
let users = []

passport.use(new LocalStrategy(
  function(username,password,done) {

    let user = users.find((user) => {
      return (user.username == username && bcrypt.compareSync(password, user.password))
     })

     if(!user) {
       return done(null,false, { message : 'Incorrect credential'})
     }

    return done(null,{ username : username })
  }
))

passport.serializeUser(function(user,done){
  done(null,user)
})

passport.deserializeUser(function(user,done){
  done(null,user)
})

app.get('/dashboard',function(req,res,next){

  console.log(req.isAuthenticated())

  if(!req.isAuthenticated()) {
    res.render('login')
    return
  }

  res.render('dashboard')
})

app.get('/',function(req,res){
  res.send('Home Page')
})

app.get('/login',function(req,res){
  res.render('login')
})

app.get('/register',function(req,res){
  res.render('register')
})

app.post('/register',function(req,res){

  let username = req.body.username
  let password = req.body.password

  const hash = bcrypt.hashSync(password,8)
  let user = { username : username, password : hash}

  //console.log(bcrypt.compareSync(password, hash))

  // add the user to the list
  users.push(user)

  res.send(user.password)
})

app.post('/login',passport.authenticate('local',{
  failureRedirect : '/login',
  successRedirect : '/'
}))

app.listen(3000,function(){
  console.log('Server is running')
})
