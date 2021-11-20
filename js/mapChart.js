
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
        console.log(vis.startStationIDs)

        // Get station objects in order of arrival
        vis.visitedStations = []
        vis.startStationIDs.forEach(function (visitedId){
             vis.stationData.forEach(function (station) {
                if (visitedId === station["Id"]) {
                    if (station["Number"] != null) {
                        vis.visitedStations.push(station)
                    }
                }
            })
        })

        console.log("Visited Stations", vis.visitedStations)

        // Get array of coords for ease of use later
        vis.stationCoords = []
        vis.visitedStations.forEach(function (station) {
            vis.stationCoords.push([station.Latitude, station.Longitude])
        })

        console.log(vis.stationCoords)

        vis.updateVis()
    }

    updateVis() {
        let vis = this


        // Loop over station data and create markers for each station the chosen bike visited
        vis.visitedStations.forEach(function (d) {
                let marker = L.marker([d.Latitude, d.Longitude])
                    .bindPopup(`Station: ${d.Name}`)
                vis.stationGroup.addLayer(marker)
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

        // Create click listeners for buttons
        vis.prevListener = d3.select("#previous-button").on("click", previousStop)
        function previousStop() {
            vis.map.removeLayer(vis.stationGroup)
            vis.map.removeLayer(vis.stationLines)
        }

        vis.nextListener = d3.select("#next-button").on("click", nextStop)
        function nextStop() {
            vis.map.addLayer(vis.stationGroup)
            vis.map.addLayer(vis.stationLines)
        }
    }
}