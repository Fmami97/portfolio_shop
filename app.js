

const usersRouter = require("./routes/usersRouter.js");
const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");

const app = express();

app.use(bodyParser.json());
app.use(cors())


app.use("users", usersRouter);


app.use(errorHandler());

//serves the website in the public folder
// app.use(express.static("public"))



module.exports = { app }