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
    },
    data: {
        mainTitle: "Image Mine",
        images: [],
        filePath: "",
        username: "",
        description: "",
        title: "",
    },
});
