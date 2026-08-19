const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const authRouter = require("./routes/authRouter");
const express = require("express");

//libraries to host the documentation of the project
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yaml');


//libraries to parse data and handle many HTML based issues
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const helmet = require("helmet");


//libraries to keep logs of the requests
const { generator } = require("./utils.js")
const morgan = require("morgan");
const rfs = require("rotating-file-stream");


//libraries to keep user sessions and passport configuration
const session = require('express-session')
const { passport } = require('./middleware/passportManager.js');


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


//setting up the session and passport strategies
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 60 * 1000 }
    })
);

app.use(passport.initialize());
app.use(passport.session());

//hosting the documentation with openAPI
app.use("/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));


app.use("/v1/users", usersRouter);
app.use("/v1/products", productsRouter);
app.use("/v1/auth", authRouter);



//serves the website in the public folder (place your react's "npm run build" result in the public folder )
// app.use(express.static("public"))

app.get('/', (req, res) => {
    res.redirect('/v1/docs');
});

//all routes not handled by the backend goes to the frontend
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });



module.exports = { app }