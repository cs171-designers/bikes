// create line charts for interactive, linked dashboard view

class LineChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 10, bottom: 20, left: 40};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Append a path for the line function, so that it is later behind the brush overlay
        vis.timePath = vis.svg.append("path")
            .attr("class", "line");

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(6);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");


        // TO-DO: Add Brushing to Chart??

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        // get number of rides
        console.log("vis data",vis.data);

        //console.log(vis.data.filter(ride => ride.age != 0 && !ride.age));

        //console.log("missing", Object.values(vis.data).map(d => d.filter(ride => ride.age != 0 && !ride.age)))
        // birth year only for subscribers, not known for customers

        vis.displayData = Object.entries(vis.data).map(d => {
            return {
                date: d[0],
                num_rides: d[1].length,
                num_rides_user_subscriber: d[1].filter(ride => ride.usertype === "Subscriber").length,
                num_rides_user_customer: d[1].filter(ride => ride.usertype === "Customer").length,

                num_rides_gen_unknown: d[1].filter(ride => ride.gender === 0).length,
                num_rides_gen_male: d[1].filter(ride => ride.gender === 1).length,
                num_rides_gen_female: d[1].filter(ride => ride.gender === 2).length,

                num_rides_age_youth: d[1].filter(ride => ride.age < 18).length,
                num_rides_age_young_adult: d[1].filter(ride => ride.age >= 18 && ride.age < 25).length,
                num_rides_age_adult: d[1].filter(ride => ride.age >= 25).length,
                num_rides_age_missing: d[1].filter(ride => ride.age != 0 && !ride.age).length


                // clarify that age visual is only for subscribers
            }
        });

        // ensure sorted by day
        vis.displayData = (vis.displayData.sort((a,b)=> a.date - b.date));
        //console.log("displayData", vis.displayData);

    }

    updateVis() {
        let vis = this;

        // Update domain
        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.date;
        }));
        vis.y.domain([0, d3.max(vis.displayData, function (d) {
            return d.value;
        })]);

        // D3 path generator
        vis.line = d3.line()
            .x(function (d) {
                return vis.x(d.date);
            })
            .y0(vis.height)
            .y1(function (d) {
                return vis.y(d.num_rides);
            });

        // Call the line path function and update the path
        vis.timePath
           // .datum(vis.displayData)
            .attr("d", vis.line(vis.displayData));

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);
    }
}