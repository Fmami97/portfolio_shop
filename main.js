//environment variables (remove this line in deployment)
//since all variables will bet set elsewhere
require('dotenv').config({ path: ".env" });
const { app } = require("./app.js");



// Designate which PORT the server will listen on (first tries to find an env file)
const PORT = process.env.API_PORT || 8000;





// listen on the designsated PORT
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});