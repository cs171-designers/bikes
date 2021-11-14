class BlueBikeMap {

    constructor(parentElement, bikeData, center) {
        this.parentElement = parentElement
        this.bikeData = bikeData
        this.center = center

        this.initVis()
    }

    initVis() {
        let vis = this

        // Initialize Leaflet objects
        vis.map = L.map(vis.parentElement).setView(vis.center, 13);

        // Add tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Create empty station group
        vis.stationGroup = L.layerGroup().addTo(vis.map)


        vis.wrangleData()
    }

    wrangleData() {
        let vis = this


        vis.updateVis()
    }

    updateVis() {
        let vis = this
    }
}