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
        .query("SELECT * FROM images ORDER BY id DESC LIMIT 8")
        .then((result) => {
            return result.rows;
        })
        .catch((error) => console.log("db.getimages error", error));
}

function getImageById(id) {
    return db
        .query(
            `SELECT *,
        (SELECT id FROM images WHERE id < $1 ORDER BY ID DESC LIMIT 1) as prev,
        (SELECT id FROM images WHERE id > $1 ORDER BY ID ASC LIMIT 1) as next
        FROM images WHERE id = $1`,
            [id]
        )
        .then((result) => {
            console.log("image by id", result.rows[0]);
            return result.rows[0];
        });
}

function getFirstImageId() {
    return db
        .query("SELECT id FROM images ORDER BY id ASC LIMIT 1")
        .then((result) => {
            return result.rows;
        })
        .catch((error) => {
            console.log("db.js getFirstImageId", error);
        });
}

function getMoreImages({ latest_id, limit }) {
    return db
        .query("SELECT * FROM images WHERE id < $1 ORDER BY id DESC LIMIT $2", [
            latest_id,
            limit,
        ])
        .then((result) => {
            return result.rows;
        });
}

function addImage(img) {
    return db
        .query(
            "INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [img.url, img.username, img.title, img.description]
        )
        .then((result) => {
            return result.rows[0];
        });
}

function getCommentsById(image_id) {
    return db
        .query("SELECT * FROM comments WHERE image_id = $1 ORDER BY id DESC", [
            image_id,
        ])
        .then((result) => {
            return result.rows;
        });
}

function addComment(comment) {
    return db
        .query(
            "INSERT INTO comments (image_id, username, comment) VALUES ($1, $2, $3) RETURNING *",
            [comment.image_id, comment.username, comment.comment]
        )
        .then((result) => {
            return result.rows[0];
        });
}

module.exports = {
    getFirstImageId,
    getImages,
    getImageById,
    getMoreImages,
    addImage,
    getCommentsById,
    addComment,
};
