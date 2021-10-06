const express = require("express");
const path = require("path");
const db = require("./db");
const uploader = require("./uploader");
const { upload } = require("./s3");

const PORT = process.env.PORT || 3001;

const awsBucketUrl = "https://nandoseimer.s3.amazonaws.com/";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/images.json", (request, response) => {
    db.getImages().then((result) => {
        response.send(result);
    });
});

app.get("/api/images/:imageId", (request, response) => {
    if (request.params.imageId == "first") {
        db.getFirstImageId().then((result) => {
            response.json(result[0].id);
        });
        return;
    }
    db.getImageById(request.params.imageId).then((result) => {
        response.json(result);
    });
});

app.get("/api/images/:imageId/comments", (request, response) => {
    db.getCommentsById(request.params.imageId).then((result) => {
        response.json(result);
    });
});

app.get("/api/images", (request, response) => {
    console.log("app.get api/images", request.query);
    db.getMoreImages(request.query).then((result) => {
        console.log(result);
        response.json(result);
    });

    // db.getMoreImages()
});

app.post("/upload", uploader.single("file"), upload, (request, response) => {
    // console.log(request.body, request.file);
    request.body.url = awsBucketUrl + request.file.filename;
    if (request.file) {
        db.addImage(request.body)
            .then((result) => {
                response.json(result);
            })
            .catch((error) => {
                console.log("app.post upload", error);
                response.json({
                    success: false,
                });
            });
    } else {
        response.json({
            success: false,
        });
    }
});

app.post("/api/images/:image_id/comments", (request, response) => {
    db.addComment(request.body).then((result) => {
        response.json(result);
    });
});

app.listen(PORT);
