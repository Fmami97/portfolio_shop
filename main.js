//environment variables
require('dotenv').config({ path: ".env" });
const { app } = require("./app.js");



// const test = true



// Designate which PORT the server will listen on (first tries to find an env file)
const PORT = process.env.PORT || 8000;



// listen on the designated PORT
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});