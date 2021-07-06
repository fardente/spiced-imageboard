Vue.component("image-card", {
    template: "#image-card",
    props: ["image_id", "image"],
    data: function () {
        return {
            classObject: {
                hidden: true,
            },
        };
    },
    methods: {
        showDetails: function (imageId) {
            console.log("clicki", imageId);
            location.hash = "#" + imageId;
        },
        showImgInfo: function () {
            this.classObject.hidden = false;
        },
        hideImgInfo: function () {
            this.classObject.hidden = true;
        },
    },
});

Vue.component("image-details", {
    template: "#image-details",
    props: ["id"],
    watch: {
        id: function (newId, oldId) {
            console.log("watcher reacts", newId, oldId);
            axios.get("/api/images/" + this.id).then((image) => {
                this.image = image.data;
                this.nextBtn = image.data.next;
                this.prevBtn = image.data.prev;
                console.log("alte id", this.id);
                this.id = newId;
            });
        },
    },
    data: function () {
        return {
            image: {},
            nextBtn: null,
            prevBtn: null,
        };
    },
    mounted: function () {
        axios.get("/api/images/" + this.id).then((image) => {
            this.image = image.data;
            this.nextBtn = image.data.next;
            this.prevBtn = image.data.prev;
        });
    },
    methods: {
        closeDetails: function (event) {
            this.$emit("close-details", event);
        },
        nextImage: function (imageId, event) {
            // this.id = imageId; -> avoid mutating props directly
            if (imageId) {
                location.hash = "#" + imageId;
            } else {
                this.closeDetails(event);
            }
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
    watch: {
        image_id: function (newId, oldId) {
            console.log("comments watching change", newId, oldId);
            axios
                .get("/api/images/" + this.image_id + "/comments")
                .then((comments) => {
                    this.comments = comments.data;
                });
        },
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
        const hash = this.parseHash();
        if (hash) {
            this.showDetails(hash);
        }
        axios.get("/api/images.json").then((result) => {
            this.images = result.data;
            this.latest_id = this.updateLatestId(result.data);
            this.updateFirstId();
        });
        window.addEventListener("hashchange", (event) => {
            this.showDetails(this.parseHash(event.newURL));
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
                    this.latest_id = result.data.id;
                    console.log("latest id nach upload", result.data.id);
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
        closeDetails: function (event) {
            console.log("close event", event);
            event.stopPropagation();
            this.currentImgId = null;
            location.hash = "";
        },
        updateFirstId: function () {
            axios.get("/api/images/first").then((first_id) => {
                this.firstImageId = first_id.data;
                if (this.latest_id === this.firstImageId) {
                    this.reachedEnd = true;
                }
            });
        },
        updateLatestId: function (arr) {
            return Math.min(...arr.map((x) => x.id));
        },
        loadMoreImages: function () {
            console.log("loading more");
            axios
                .get("/api/images", {
                    params: {
                        latest_id: this.latest_id,
                        limit: this.limit,
                    },
                })
                .then((result) => {
                    console.log("loadMoreImages result.data", result.data);
                    this.images = this.images.concat(result.data);
                    this.latest_id = this.updateLatestId(result.data);
                    if (this.latest_id === this.firstImageId) {
                        this.reachedEnd = true;
                    }
                });
        },
        parseHash: function () {
            const hash = parseInt(location.hash.slice(1));
            if (hash != "" && typeof hash == "number" && !Number.isNaN(hash)) {
                console.log("hash is ", +location.hash.slice(1));
                return hash;
            }
            return null;
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
        latest_id: null,
        limit: 5,
        firstImageId: null,
        reachedEnd: false,
    },
});
