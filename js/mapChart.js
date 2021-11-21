
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

/*
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

 */
        // Initialize markers and lines
        vis.marker = []
        for (let i=0; i<vis.visitedStations.length; i++) {
            vis.marker[i] = L.marker([vis.visitedStations[i].Latitude, vis.visitedStations[i].Longitude])
                .bindPopup(`Station: ${vis.visitedStations[i].Name}`)
        }
        vis.map.addLayer(vis.marker[0])

        vis.stationLines = []
        for (let i=0; i<vis.visitedStations.length-1; i++) {
            vis.stationLines[i] = L.polyline(
                [vis.stationCoords[i], vis.stationCoords[i+1]],
                {
                    color: 'blue',
                    opacity: 0.6,
                    weight: 8
                }
            )
        }

        // Create click listeners for buttons
        vis.counter = 0

        vis.prevListener = d3.select("#previous-button").on("click", previousStop)
        function previousStop() {
            if (vis.counter === 0) {
                return false
            }
            else {
                vis.map.removeLayer(vis.marker[vis.counter])
                vis.map.removeLayer(vis.stationLines[vis.counter-1])
                vis.counter -= 1
                return true
            }
        }

        vis.nextListener = d3.select("#next-button").on("click", nextStop)
        function nextStop() {
            if (vis.counter === vis.visitedStations.length - 1) {
                return false
            }
            else {
                vis.map.addLayer(vis.marker[vis.counter + 1])
                vis.map.addLayer(vis.stationLines[vis.counter])
                vis.counter += 1
                return true
            }
        }
    }
}