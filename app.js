const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const express = require("express");




//libraries to parse data and handle many HTML based issues
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const helmet = require("helmet");


//libraries to keep logs of the requests
const { generator } = require("./utils.js")
const morgan = require("morgan");
const rfs = require("rotating-file-stream");


const app = express();

//parses requests with urlencoded data, to make it available in the req.body
//setting extended to true allows objects and arrays to be affected too.
app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json());
app.use(cors())
app.use(errorHandler());
app.use(helmet());



//generates a new file each month to store logs
const stream = rfs.createStream(generator, { size: "10M", interval: "30d", path: "logs" });
app.use(morgan('tiny', { stream }))


app.use("/v1/users", usersRouter);
app.use("/v1/products", productsRouter);



//serves the website in the public folder (place your react's "npm run build" result in the public folder )
// app.use(express.static("public"))



module.exports = { app }