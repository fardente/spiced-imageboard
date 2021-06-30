new Vue({
    el: "#main",
    mounted: function () {
        axios.get("/api/images.json").then((result) => {
            this.images = result.data;
        });
    },
    data: {
        title: "Image Mine",
        images: [],
    },
});
