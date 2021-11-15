// create bar chart for trip duration

class barChart {
    constructor(parentElement, ridesData, stationData){
                // , variable) {
        this.parentElement = parentElement;
        this.ridesData = ridesData;
        this.stationData = stationData;
        this.displayData = ridesData;
        // this.variable = variable;
        // this.eventHandler = _eventHandler;

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 50};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

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
        console.log("LARA BARCHART DATA", vis.stationData)
        console.log("LARA RIDES DATA", vis.ridesData)
        let sorted = []


        vis.ridesData.forEach(function (d) {
            let numTrips = d.length;
            let stationID = d[0]['start station id'].toString()
            sorted.push({id: stationID, numTrips: numTrips})
            // console.log(numTrips);

            // vis.stationData[d]





        });
        console.log(sorted)

        vis.newsorted = vis.sorted.sort((a,b)=> a.numTrips - b.numTrips);
        console.log("sorted", vis.newsorted);

        vis.topFiveStations = vis.newsorted.slice(0,5)
        console.log(vis.topFiveStations)

        vis.updateVis();

    }

    updateVis() {
        let vis = this;


    }


}