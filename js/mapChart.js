
// Create map class
class BlueBikeMap {

    constructor(parentElement, bikeData, stationData, center) {
        this.parentElement = parentElement
        this.bikeData = bikeData
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


        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        // Look at bike 1 and get the stations it visited
        vis.bike1 = vis.bikeData[1]
        console.log("1", vis.bike1)

        vis.startStationIDs = vis.bike1.map(trip => trip["start station id"])

        // Get coords of these stations
        vis.stationCoords = []
        vis.startStationIDs.forEach(function (station) {
            vis.stationData.forEach(function (d) {
                if (d["Id"] === station) {
                    vis.stationCoords.push([d.Latitude, d.Longitude])
                }
            })
        })


        console.log(vis.stationCoords)
        vis.updateVis()
    }

    updateVis() {
        let vis = this

        // Loop over station data and create markers for each station the chosen bike visited
        vis.stationData.forEach(function (d) {

            if (vis.startStationIDs.includes(d["Id"])) {
                let marker = L.marker([d.Latitude, d.Longitude])
                    .bindPopup(`Station: ${d.Name}`)
                vis.stationGroup.addLayer(marker)
            }
        })

        // TODO: Make this part interactive
        // Add lines between stations
        vis.stationLines = L.polyline(
            vis.stationCoords,
            {
                color: 'blue',
                opacity: 0.6,
                weight: 8
            }
        ).addTo(vis.map);

    }
}