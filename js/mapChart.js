
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

        // Create time format
        vis.timeFormat = d3.timeFormat("%m/%d/%Y %I:%M %p")

        // Create bike icon class
        vis.genericIcon = L.Icon.extend({
            options: {
                shadowUrl: 'img/marker-shadow.png',
                iconSize: [41, 41],
                iconAnchor: [20, 41],
                popupAnchor: [0, -28]
            }
        })

        vis.bikeIcon = new vis.genericIcon({iconUrl: 'img/bike.png'})

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this

        // Look at bike 1 and get the stations it visited
        vis.randId = d3.randomInt(1, vis.bikeData.length)()
        vis.bike = vis.bikeData[vis.randId]
        // console.log(vis.bike)

        vis.startStationIDs = vis.bike.map(trip => trip["start station id"])
        // console.log(vis.startStationIDs)

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

        // console.log("Visited Stations", vis.visitedStations)

        // Get array of coords for ease of use later
        vis.stationCoords = []
        vis.visitedStations.forEach(function (station) {
            vis.stationCoords.push([station.Latitude, station.Longitude])
        })

        // console.log(vis.stationCoords[0])

        vis.map.setView(vis.stationCoords[0], 13, {animation: false})

        vis.updateVis()
    }

    updateVis() {
        let vis = this

    // Initialize markers and lines
        vis.marker = []
        for (let i=0; i<vis.visitedStations.length; i++) {
            vis.marker[i] = L.marker([vis.visitedStations[i].Latitude, vis.visitedStations[i].Longitude], {icon: vis.bikeIcon})
                .bindPopup(`Station: ${vis.visitedStations[i].Name} <br>
                    Departure Time: ${vis.timeFormat(vis.bike[i].starttime)} <br>
                    Trip Duration: ${parseInt(vis.bike[i].tripduration / 60) + " minutes " + vis.bike[i].tripduration % 60 + " seconds"}`)
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
                vis.map.setView([
                        vis.visitedStations[vis.counter].Latitude,
                        vis.visitedStations[vis.counter].Longitude],
                    13, {animation: false}
                )
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
                vis.map.setView([
                    vis.visitedStations[vis.counter].Latitude,
                    vis.visitedStations[vis.counter].Longitude],
                    13, {animation: false}
                )
                return true
            }
        }

        vis.generatorListener = d3.select("#generator-button").on("click", regenBike)
        function regenBike() {
            vis.marker.forEach(function (d) {
                vis.map.removeLayer(d)
            })

            vis.stationLines.forEach(function (d) {
                vis.map.removeLayer(d)
            })

            vis.wrangleData()
            return true
        }

    }
}