

const usersRouter = require("./routes/usersRouter.js");
const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");

const { generator } = require("./utils.js")
const morgan = require("morgan");
const rfs = require("rotating-file-stream");

const app = express();


app.use(bodyParser.json());
app.use(cors())
app.use(errorHandler());


const stream = rfs.createStream(generator, "")
app.use(morgan('tiny', { stream: createWriteStream('./logs/app.log', { flags: 'a' }) }))


app.use("users", usersRouter);



//serves the website in the public folder
// app.use(express.static("public"))



module.exports = { app }