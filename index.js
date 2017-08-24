//Express
const express = require ("express");
const app = express ();

//Mongo
const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb://localhost:27017/robot";
const data = require("./data");

// Mongoose
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/robot');


//Mustache
const mustacheExpress = require("mustache-express");
app.engine("mustache", mustacheExpress());
app.set("views", "./views")
app.set("view engine", "mustache")
app.use(express.static("public"))

const session = require("express-session")

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

//NOTE  DO NOT UNCOMMENT
// MongoClient.connect(uri)
//   .then(function(db){
//     return db.collection("users").insertMany(data.users)
//   })
//   .then(function(result){
//     console.log(result);
//   });

//bcrypt
const bcrypt = require('bcryptjs');
// const hash = bcrypt.hashSync(password, 8);
// bcrypt.compareSync(password, hash);

//bcrypt user authentication
const userSchema = new mongoose.Schema({
  username: { type: Number, unique: true, lowercase: true, required: true },
  passwordHash: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

userSchema.virtual('password')
  .get(function () { return null })
  .set(function (value) {
    const hash = bcrypt.hashSync(value, 8);
    this.passwordHash = hash;
  })

userSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

userSchema.statics.authenticate = function(username, password, done) {
    this.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            done(err, false)
            alert("Incorrect")
        } else if (user && user.authenticate(password)) {
            done(null, user)
        } else {
            done(null, false)
            alert("Try again")
        }
    })
};



//Unemployed
app.get("/jobs", function(req, res){
  MongoClient.connect(uri)
    .then(function(db){
      return db.collection("users").find({job:null}).toArray(function(err, doc){
        // console.log(doc);
        res.render("jobs", {robot:doc});
      }); //pulls in first present but won't work with find. Need to be able to display it
      db.close();
    });
  });

  //Employed
  app.get("/employed", function(req, res){
    MongoClient.connect(uri)
      .then(function(db){
        return db.collection("users").find({job: {$ne: null}}).toArray(function(err, doc){
          // console.log(doc);
          res.render("employed", {robot:doc});
        }); //pulls in first present but won't work with find. Need to be able to display it
        db.close();
      });
    });

app.get('/user', function (req, res) {
  res.render("user", data);
});

const list= {
  username: 2,
  password: "that"
};

app.post("/completed", function (req,res){
  User.create({
    username: req.session.username,
    password: req.session.password,
  })
  res.redirect("/completed");
});

app.get("/completed", function(req, res){
  return User.find()
  .then(function(users){
  res.render("completed", data);
})
});

app.get("/login", function(req,res){
  res.render("login");
})


app.get('/user/:id', (req, res) => {
  let myId = parseInt(req.params.id);
  MongoClient.connect(uri)
    .then((db) => {
      let collection = db.collection('users');
      collection.findOne({'id' : myId})
    .then((users) => {
      res.render("template", users);
      db.close();
    })})
});

app.listen(3000, function () {
  console.log('All hail AI');
});
