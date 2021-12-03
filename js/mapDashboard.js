
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
/*
        let harvard = CENTERS.HARVARD
        let mit = CENTERS.MIT

        vis.harvardCircle = L.circle([harvard.Latitude, harvard.Longitude], 1609.34, {
            color: 'red',
            fillColor: '#ddd',
            fillOpacity: 0.5
        }).addTo(vis.map);

        vis.mitCircle = L.circle([mit.Latitude, mit.Longitude], 1609.34, {
            color: 'orange',
            fillColor: '#ddd',
            fillOpacity: 0.5
        }).addTo(vis.map);

 */



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
        // console.log("before sort", vis.arrivalSums.map(item => [...item]))
        vis.arrivalSums.sort((a, b) => b[2] - a[2])
        // console.log("after sort", vis.arrivalSums.map(item => [...item]))
        console.log(vis.arrivalData)
        console.log(vis.arrivalSums)

        vis.departureSums = []
        vis.stationData.forEach(station => {
            let count = 0;
            if (station.Id in vis.departureData) {
                count = vis.departureData[station.Id].length
            }
            vis.departureSums.push([station.Id, [station.Latitude, station.Longitude], count])
        })
        vis.departureSums.sort((a, b) => b[2] - a[2])
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
        vis.totalSums.sort((a, b) => b[2] - a[2])
        console.log(vis.totalSums)

        // Create scale for radius of circles
        let totals = []

        vis.totalSums.forEach(d => {
            totals.push(d[2])
        })

        vis.radiusScale = d3.scaleLinear()
            .domain([0, d3.max(totals)])
            .range([0, 500])
        console.log("station data", vis.stationData)

        // Wrangle data to get net bike flow
        vis.netBikes = []
        for (let i=0; i<vis.arrivalSums.length; i++) {
            let tmp = vis.arrivalSums[i].slice(); // duplicate so that we edit copy not reference
            tmp[2] = vis.arrivalSums[i][2] - vis.departureSums[i][2]
            vis.netBikes.push(tmp)
        }
        vis.netBikes.sort((a, b) => Math.abs(b[2]) - Math.abs(a[2]))
        console.log("FLUX", vis.netBikes)

        let netBikeTotals = []
        vis.netBikes.forEach(d => {
            netBikeTotals.push(Math.abs(d[2]))
        })

        vis.netScale = d3.scaleLinear()
            .domain([0, d3.max(netBikeTotals)])
            .range([0, 250])

        vis.updateVis()
    }

    updateVis() {
        let vis = this

        vis.circleCounter = 0
        vis.circles = []
        let popupBlurb = ""
        if (selectedDashboardView === "totalSums") {
            popupBlurb = "Total departures and arrivals:"
        }
        else if (selectedDashboardView === "departureSums") {
            popupBlurb = "Total departures:"
        }
        else if (selectedDashboardView === "arrivalSums") {
            popupBlurb = "Total arrivals:"
        }
        else {
            popupBlurb = "Net bikes:"
        }

        vis[selectedDashboardView].forEach(station => {
            if (selectedDashboardView === "netBikes") {
                let stationName = ""
                vis.stationData.forEach(d => {
                    if (d.Id === station[0]) {
                        stationName = d.Name
                    }
                })
                if (station[2] < 0) {
                    vis.circles[vis.circleCounter] = L.circle(station[1], vis.netScale(Math.abs(station[2])), {
                        color: 'orange',
                        fillColor: 'orange',
                        fillOpacity: 0.3,
                        weight: 1
                    })
                        .bindPopup(`Station: ${stationName} <br>${popupBlurb} ${station[2]}`)
                        .addTo(vis.map);
                }
                else {
                    vis.circles[vis.circleCounter] = L.circle(station[1], vis.netScale(station[2]), {
                        color: 'purple',
                        fillColor: 'purple',
                        fillOpacity: 0.3,
                        weight: 1
                    })
                        .bindPopup(`Station: ${stationName} <br>${popupBlurb} +${station[2]}`)
                        .addTo(vis.map);
                }
                vis.circleCounter += 1
            }
            else {
                let stationName = ""
                vis.stationData.forEach(d => {
                    if (d.Id === station[0]) {
                        stationName = d.Name
                    }
                })
                vis.circles[vis.circleCounter] = L.circle(station[1], vis.radiusScale(station[2]), {
                    color: 'blue',
                    fillColor: 'blue',
                    fillOpacity: 0.3,
                    weight: 1
                })
                    .bindPopup(`Station: ${stationName} <br>${popupBlurb} ${station[2]}`)
                    .addTo(vis.map);
                vis.circleCounter += 1
            }
        })

        vis.dropdownListener = d3.select("#map-dashboard-dropdown").on("change", changeView)
        function changeView() {
            vis.circles.forEach(circle => {
                vis.map.removeLayer(circle)
            })
            selectedDashboardView = document.getElementById("map-dashboard-dropdown").value
            console.log(selectedDashboardView)
            vis.updateVis()
        }
    }
}