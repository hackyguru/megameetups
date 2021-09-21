const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const routes = require('./routes/router')

app.set("views", path.join(__dirname, "views"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Setting up sessions
app.use(cookieParser());
app.use(
    sessions({
        secret:
            process.env.SESSION_SECRET,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 3 },
        resave: false,
    })
);

app.get("/", (req, res) => {
  res.redirect('/dashboard');
});

app.use(routes)

// starting server
app.listen(3000, function () {
    console.log("server listening on port 3000");
});
