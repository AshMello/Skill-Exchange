const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const path = require('path')
var session = require('express-session')
const app = express()
const models = require('./models')
const bcrypt = require('bcrypt')
const saltRounds = 10

const VIEWS_PATH= path.join(__dirname, '/views');

const sequelize = require('sequelize')
const Op = sequelize.Op
const port = process.env.PORT || 8080

// adding session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.get('/', (req, res) => {
  res.render('login')
})

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set('views','./views')
app.set('view engine','mustache')

const userRoutes = require('./routes/users')
app.use('/users', userRoutes)

// Functions //

function isAuthenticated(req,res,next) {
  if (req.session.user) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

  // Logging out
app.post('/logout', function(req, res, next) {
 if (req.session) {
   req.session.destroy(function(err) {
     if(err) {
       return next(err);
     } else {
       res.redirect('/login');
     }
   });
 }
})
  // Showing the login in page
app.get('/logout',(req,res) =>{
 res.render('logout')
})

  // Logging into the app and checking the username and password to the database
app.post('/login', (req,res) => {

  let username = req.body.username
  let password = req.body.password

  models.User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    if (user === null) {
      res.render("login", {message: "Invalid username or password!"})
    }
      else {
        bcrypt.compare(password, user.password,(error,result) => {
          if (result) {
            if (req.session){
              req.session.user = user.dataValues
          }
          res.redirect('/users/home')
          // var hour = 3600000
          // req.session.cookie.expires = new Date(Date.now() + hour)
          // req.session.cookie.maxAge = hour

        } else {
          res.render("login", {message: "Invalid username or password!"})
        }
      })
    }
  })
})

  // Register and encrypting the password
app.post('/registration', (req,res) => {
  bcrypt.hash(req.body.password, saltRounds, function(err,hash) {

  let user = models.User.build({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    city: req.body.city
  })
  models.User.findOne({
     where: {username : req.body.username}
   }).then(function (result) {
         if (null != result) {
           console.log("USERNAME ALREADY EXISTS:", result.username);
         }
         else {
           user.save().then(function(newUser){
   })}
   res.redirect('/login')
  })
  })
  })

  // Shows the pages of all these below
app.post('/register',  (req,res) =>{
  res.redirect('/register')

})

app.post('/add-category', (req, res) => {
    id = req.body.id
    name = req.body.name

})

app.get('/trade', isAuthenticated, (req,res) => {
  res.render('trade')
})

app.get('/login', (req,res) => {
  res.render('login')
})

app.get('/register', (req,res) => {
  res.render('register')
})


// Listen for server //

app.listen(port, () => { console.log(`Server is running on port ${port}.`) })

// app.listen(process.env.PORT || 5000) => {
// console.log("Server is online...")
// })
