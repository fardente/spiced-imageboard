Vue.component("image-details", {
    template: "#image-details",
    props: ["id"],
    data: function () {
        return {
            image: {},
        };
    },
    mounted: function () {
        axios.get("/api/images/" + this.id).then((image) => {
            this.image = image.data;
        });
    },
    methods: {
        closeDetails: function (event) {
            this.$emit("close-details", event);
        },
    },
});

Vue.component("comments", {
    template: "#comments",
    props: ["image_id"],
    data: function () {
        return {
            comments: [],
            comment: "",
            username: "",
        };
    },
    mounted: function () {
        axios
            .get("/api/images/" + this.image_id + "/comments")
            .then((comments) => {
                this.comments = comments.data;
            });
    },
    methods: {
        addcomment: function () {
            axios
                .post("/api/images/" + this.image_id + "/comments", {
                    image_id: this.image_id,
                    username: this.username,
                    comment: this.comment,
                })
                .then((comment) => {
                    this.comments.unshift(comment.data);
                    this.comment = "";
                    this.username = "";
                });
        },
    },
});

new Vue({
    el: "#main",
    mounted: function () {
        axios.get("/api/images.json").then((result) => {
            this.images = result.data;
        });
    },
    methods: {
        fileUpload: function (event) {
            event.preventDefault();
            let formData = new FormData();
            formData.append("file", this.filePath);
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            axios
                .post("/upload", formData)
                .then((result) => {
                    this.images.unshift(result.data);
                    event.target.reset();
                    this.filePath = "";
                    this.username = "";
                    this.description = "";
                    this.title = "";
                })
                .catch((error) => {
                    console.log("axios post error", error);
                });
        },
        getFile: function (event) {
            this.filePath = event.target.files[0];
        },
        showDetails: function (id) {
            this.currentImgId = id;
        },
        closeDetails: function () {
            this.currentImgId = null;
        },
    },
    data: {
        mainTitle: "Image Mine",
        images: [],
        filePath: "",
        username: "",
        description: "",
        title: "",
        currentImgId: null,
    },
});
