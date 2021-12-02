// create bar chart for trip duration

class StationBarChart {
    constructor(parentElement, ridesData, stationData, sortByMost){
        // , variable) {
        this.parentElement = parentElement;
        this.ridesData = ridesData;
        this.stationData = stationData;
        this.displayData = ridesData;
        this.sortByMost = sortByMost;
        // this.variable = variable;
        // this.eventHandler = _eventHandler;

        this.initVis();
    }
    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = { top: 10, right: 50, bottom: 250, left: 180 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");



        // Scales and axes
        vis.x = d3.scaleBand()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yLabel = vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -40)
            .style("text-anchor", "middle");

        vis.yLabel.text("# rides");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // add chart title placeholder
        vis.svg.append("text")
            .attr("x",-vis.margin.left + vis.width/2)
            .attr("y",0)
            .attr("class","lineTitle");

        // y-axis label
        vis.yLabel = vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height/2)
            .attr("y", -vis.margin.left + 10)
            .style("text-anchor", "middle");


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;
        console.log("LARA STATION DATA", vis.stationData)
        console.log("LARA RIDES DATA", vis.ridesData)
        let sorted = []
        let rideLengths = {}




        vis.ridesData.forEach(function (d) {
            let numTrips = d.length;
            // console.log(numTrips)
            let stationID = d[0]['start station id'].toString()
            // console.log(stationID)
            rideLengths[stationID] = numTrips
        })
        console.log(rideLengths)

        for (let stationID in vis.stationData) {
            // console.log(stationID) // gives you 10 or 17 or whatever
            let numTrips = rideLengths[stationID]
            console.log(numTrips)
            if (numTrips !== undefined) {
                sorted.push({id: stationID,
                    name: vis.stationData[stationID][0]['Name'],
                numTrips: numTrips,
                lat: vis.stationData[stationID][0]['Latitude'],
                    long: vis.stationData[stationID][0]['Longitude']})


            }

            // sorted.push({id: stationID, name: name,
            //     numTrips: numTrips,
            //     lat: stationLatitude, long: stationLongitude})
            // console.log(numTrips);

        }
        console.log(sorted)

        //     // console.log("data barcharts", vis.stationData, vis.stationData[stationID], stationID, d)
        //     let stationLatitude = vis.stationData[stationID][0]['Latitude']
        //     let stationLongitude = vis.stationData[stationID][0]['Longitude']
        //     let name = vis.stationData[stationID][0]['Name']
        //     // console.log(stationLatitude)
        //     sorted.push({id: stationID, name: name,
        //         numTrips: numTrips,
        //         lat: stationLatitude, long: stationLongitude})
        //     // console.log(numTrips);
        //
        //     // vis.stationData[d]
        // });
        // console.log(sorted)
        vis.sortedByMost = sorted.sort((a,b)=> b.numTrips - a.numTrips);

        if (vis.sortByMost) {
            vis.newsorted = vis.sortedByMost;
        }
        else {
            vis.newsorted = sorted.sort((a,b)=> a.numTrips - b.numTrips);
        }

        // vis.newsorted = sorted.sort((a,b)=> b.numTrips - a.numTrips);
        // console.log("sorted", vis.newsorted);

        vis.topFiveStations = vis.newsorted.slice(0,5)
        // console.log(vis.topFiveStations)


        // vis.topFiveStations.forEach(function(station) {
        //
        // })

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        vis.x.domain(vis.topFiveStations.map(function(d) { return d.name; }))
            .padding(0.2);

        vis.svg.append("g")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-30)")
            .style("text-anchor", "end");

        vis.y.domain([0, d3.max(vis.sortedByMost, function (d) {
            return d['numTrips']})]);

        vis.svg.append("g")
            .call(vis.yAxis)
        //console.log("y scale domain", vis.y.domain())
        //console.log("y scale range", vis.y.range())

        //console.log("x scale domain", vis.x.domain())
        //console.log("height", vis.height)



        vis.svg.selectAll("mybar")
            .data(vis.topFiveStations)
            .enter()
            .append("rect")
            .style("fill", "grey")
            .attr("x", function(d) { return vis.x(d.name); })
            .attr("width", vis.x.bandwidth())
            .attr("fill", "#69b3a2")
            // no bar at the beginning thus:
            .attr("height", function(d) {return vis.height - vis.y(0); }) // always equal to 0
            .attr("y", function(d) { return vis.y(0); })

        // Animation
        vis.svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return vis.y(d.numTrips); })
            .attr("height", function(d) {
                let height = (vis.height - vis.y(d.numTrips))
                //console.log(height)
                return height})
            .delay(function(d,i){return(i*100)}) //console.log(i) ;





    }


}