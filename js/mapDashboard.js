
// Create map class
class BlueBikeMapDashboard {

    constructor(parentElement, arrivalData, departureData, stationData, center) {
        this.parentElement = parentElement
        this.arrivalData = arrivalData
        this.departureData = departureData
        this.stationData = stationData
        this.center = center

        this.initVis()
    }

    initVis() {
        let vis = this

        // Set image path
        L.Icon.Default.imagePath = 'img/';

        // Initialize Leaflet objects
        vis.map = L.map(vis.parentElement).setView(vis.center, 13);

        // Add tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(vis.map);

        // Create empty station group
        vis.stationGroup = L.layerGroup().addTo(vis.map)

        // Create time format
        vis.timeFormat = d3.timeFormat("%m/%d/%Y %I:%M %p")

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        vis.arrivalSums = []
        vis.stationData.forEach(station => {
            let count = 0;
            if (station.Id in vis.arrivalData) {
                count = vis.arrivalData[station.Id].length
            }
            vis.arrivalSums.push([station.Id, [station.Latitude, station.Longitude], count])
        })
        console.log(vis.arrivalSums)

        vis.departureSums = []
        vis.stationData.forEach(station => {
            let count = 0;
            if (station.Id in vis.departureData) {
                count = vis.departureData[station.Id].length
            }
            vis.departureSums.push([station.Id, [station.Latitude, station.Longitude], count])
        })
        console.log(vis.departureSums)

        vis.totalSums = []

        vis.updateVis()
    }

    updateVis() {

    }
}