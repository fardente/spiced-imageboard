const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/images.json", (request, response) => {
    db.getImages().then((result) => {
        console.log(result[0]);
        response.send(result);
    });
});

const PORT = 8080;

app.listen(PORT);
