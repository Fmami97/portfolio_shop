const pad = num => (num > 9 ? "" : "0") + num;
//used alongside the rotating-file-stream (rfs) library.
const generator = (time, index) => {
    if (!time) return "file.log";

    let datetime = time.getFullYear() + "" + pad(time.getMonth() + 1);


    return `logs/${datetime}-${index}-file.log`;
};


module.exports = { generator };