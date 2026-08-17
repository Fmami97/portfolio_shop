const bcrypt = require("bcrypt");

const pad = num => (num > 9 ? "" : "0") + num;
//used alongside the rotating-file-stream (rfs) library.
//generates a new filename for the stream with the provided parameters
const generator = (time, index) => {
    if (!time) return "file.log";
    let datetime = time.getFullYear() + "" + pad(time.getMonth() + 1);
    return `${datetime}-${index}-file.log`;
};



// Create password hashing function below:
//password: the plaintext we need to hash.
const passwordHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    //hash the password by applying the salt
    const hash = await bcrypt.hash(password, salt);
    return hash;
};


//password isn't hashed, and hash is the stored password in DB
const comparePasswords = async (password, hash) => {
    try {
        //the salt is stored in the hash, so no need to provide it.
        const matchFound = await bcrypt.compare(password, hash);
        return matchFound;
    } catch (err) {
        console.log(err);
    }
    return false;
};


module.exports = { generator, passwordHash, comparePasswords };