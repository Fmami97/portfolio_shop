const bcrypt = require("bcrypt");

const pad = num => (num > 9 ? "" : "0") + num;
//used alongside the rotating-file-stream (rfs) library.
const generator = (time, index) => {
    if (!time) return "file.log";

    let datetime = time.getFullYear() + "" + pad(time.getMonth() + 1);


    return `logs/${datetime}-${index}-file.log`;
};





// Create password hashing function below:
//password: the plaintext we need to hash.
//saltRounds: amount of time needed to calculate the salt
const passwordHash = async (password, saltRounds) => {
    try {

        const salt = await bcrypt.genSalt(saltRounds);
        //hash the password by applying the salt
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (err) {
        console.log(err);
    }
    return null;
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