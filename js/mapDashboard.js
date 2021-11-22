
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
        vis.stationData.forEach(station => {
            let count = 0;
            if (station.Id in vis.departureData) {
                count = vis.departureData[station.Id].length
            }

            if (station.Id in vis.arrivalData) {
                count += vis.arrivalData[station.Id].length
            }
            vis.totalSums.push([station.Id, [station.Latitude, station.Longitude], count])
        })
        console.log(vis.totalSums)

        // Create scale for radius of circles
        let sums = []

        if (selectedDashboardView === "total") {
            vis.totalSums.forEach(d => {
                sums.push(d[2])
            })
        }
        else if (selectedDashboardView === "departures") {
            vis.departureSums.forEach(d => {
                sums.push(d[2])
            })
        }
        else {
            vis.arrivalSums.forEach(d => {
                sums.push(d[2])
            })
        }

        vis.radiusScale = d3.scaleLinear()
            .domain([0, d3.max(sums)])
            .range([0, 500])

        vis.updateVis()
    }

    updateVis() {
        let vis = this

        vis.totalSums.forEach(station => {
            let circle = L.circle(station[1], vis.radiusScale(station[2]), {
                color: 'blue',
                fillColor: '#ddd',
                fillOpacity: 0.5
            }).addTo(vis.map);
        })

    }
}