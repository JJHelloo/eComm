const express = require('express');
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool.js");
app.set("view engine", "ejs");
const fetch = require("node-fetch");
const faker = require('faker');
const session = require('express-session');
const bcrypt = require('bcrypt');
var cart = require('./public/js/cart.js');
const saltRounds = 10;
var count = 0;

app.use(express.static("public"));
app.use(express.urlencoded({ extend: true }));
app.use(express.json());

// for log in and signing up
app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// unsplash access key
// const apiKey = 97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk

// unsplash private key
// bzu--QhZBgtHGrqgjhLKeca7aLCm82OdKNY1EKmEMzM 


app.get('/', async (req, res) => {

  let sql = `SELECT *
            FROM products`;
  let rows = await executeSQL(sql);
  console.log(rows);

  res.render("index", { "rows": rows, userName: req.session.firstName });
});

//newUser (register)
app.get("/register", (req, res) => {
  res.render("signUp")
});
app.post("/register", async (req, res) => {
  var firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let userEmail = req.body.userEmail;
  let password = req.body.password;

  let sql = `SELECT email
            FROM customers
            WHERE email = ?`;
  let params = [userEmail];
  let usernameRows = await executeSQL(sql, [userEmail]);

  if (usernameRows.length > 0) {
    res.render("signUp", { "error": "Email is already being used" })
  }
  else {
    const hash = await bcrypt.hash(password, saltRounds);
    sql = "INSERT INTO customers (firstName, lastName, email, password) VALUES (?, ?, ?, ?);"

    params = [firstName, lastName, userEmail, hash];
    await executeSQL(sql, params);

    res.render("logIn", { "error": "Please Sign In now" });
    // res.redirect("signIn") 
  }

});

// render login page
app.get('/signIn', (req, res) => {
  res.render("logIn");
});
// post function for signing in
app.post('/signIn', async (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let customerID = 0;
  let firstName;
  // request.session.username = username;

  let passwordHash = "";
  let sql = `SELECT *
             FROM customers
             WHERE email = ?`;
  let data = await executeSQL(sql, [userEmail]);

  if (data.length > 0) {
    passwordHash = data[0].password;
    firstName = data[0].firstName;
    customerID = data[0].customerID;
  }
  const match = await bcrypt.compare(userPassword, passwordHash);

  if (match) {
    req.session.authenticated = true;
    req.session.firstName = firstName;
    req.session.customerID = customerID;
    res.redirect('/');
  }
  else {
    res.render('logIn', { "error": "Invalid user name or password" },)
  }
});
app.get('/update', async (req, res) => {
  let sql = `SELECT *
            FROM customers`;
  let data = await executeSQL(sql);
  res.render("accountUpdate");
});
app.post('/update', async (req, res) => {
  let userEmail = req.body.userEmail;
  let sql = `UPDATE customers
               SET email = ?
               WHERE customerID = ${req.session.customerID}`;
  // ${req.session.id}
  let data = await executeSQL(sql, [userEmail]);
  res.render("accountUpdate", { "error": "Email was updated" });
});
// log out
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
// shopping cart
app.get('/cart', (req, res) => {
  res.render('shoppingCart', { userName: req.session.firstName });
});
// shirt functions
app.get('/shirts', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=nike-shirts&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();
  let imageList = data.results;

  res.render("shirts", { "images": imageList, userName: req.session.firstName });
});
app.get('/menShirts', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=nike-mens-shirts&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();
  let imageList = data.results;

  res.render("shirts", { "images": imageList, userName: req.session.firstName });
});
app.get('/womensShirts', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=nike-womens-shirts&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();
  let imageList = data.results;

  res.render("shirts", { "images": imageList, userName: req.session.firstName });
});

// shoes functions
app.get('/shoes', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=nike-shoes&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();

  let imageList = data.results;

  res.render("shoes", { "images": imageList, userName: req.session.firstName });
});
app.get('/mensShoes', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=addidas-mens&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();

  let imageList = data.results;

  res.render("shoes", { "images": imageList, userName: req.session.firstName });
});
app.get('/womensShoes', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=shoes-womens&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();
  let imageList = data.results;

  res.render("shoes", { "images": imageList, userName: req.session.firstName });
});
// pants functions
app.get('/pants', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=pants&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();

  let imageList = data.results;

  res.render("pants", { "images": imageList, userName: req.session.firstName });
});
app.get('/mensPants', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=shorts-mens&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();

  let imageList = data.results;

  res.render("pants", { "images": imageList, userName: req.session.firstName });
});
app.get('/womensPants', async (req, res) => {
  // pull imaged from unsplash api 
  let url = 'https://api.unsplash.com/search/photos/?query=pants-womens&per_page=12&client_id=97UNfAJO8C__9X4betCQvGY_-vSurh52YqL6ubB8cwk';
  let response = await fetch(url);
  let data = await response.json();

  let imageList = data.results;

  res.render("pants", { "images": imageList, userName: req.session.firstName });
});

app.get('/api/customers/:customerID', async (req, res) => {
  let customerID = req.params.customerID;
  let firstName = req.query.firstName;
  let sql = `SELECT *
             FROM customers
             WHERE customerID = ?`;
  let rows = await executeSQL(sql, [customerID]);
  res.send({ "customers": rows });
});
// check if logged in
function isLoggedIn(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/signIn");
  }
}




//sql function
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}
// listen to port
app.listen(3000, () => {
  console.log('server started');
})