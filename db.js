const pg = require("spiced-pg");
let db;
if (process.env.DATABASE_URL) {
    db = pg(process.env.DATABASE_URL);
} else {
    const { dbUser, dbPass } = require("./secrets.json");
    db = pg(`postgres:${dbUser}:${dbPass}@localhost:5432/imageboard`);
}

function getImages() {
    return db
        .query("SELECT * FROM images")
        .then((result) => {
            return result.rows;
        })
        .catch((error) => console.log(error));
}

module.exports = {
    getImages,
};
