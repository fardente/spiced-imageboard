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
            console.log(image.data);
            this.image = image.data;
        });
    },
    methods: {
        closeDetails: function (event) {
            console.log("modal closedetails");
            this.$emit("close-details", event);
        },
    },
});

new Vue({
    el: "#main",
    mounted: function () {
        axios.get("/api/images.json").then((result) => {
            this.images = result.data;
            console.log("res", result.data[0].id);
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
                    console.log(
                        "axios.post ",
                        result.data,
                        result.data.title,
                        this.images
                    );
                    event.target.parentElement.reset();
                    this.images.unshift(result.data);
                })
                .catch((error) => {
                    console.log("axios post error", error);
                });
        },
        getFile: function (event) {
            console.log("Selected file", event);
            this.filePath = event.target.files[0];
            console.log(event.target.files[0]);
        },
        showDetails: function (id) {
            console.log("click on details", id);
            this.currentImgId = id;
        },
        closeDetails: function () {
            console.log("Main vue closedetails");
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
