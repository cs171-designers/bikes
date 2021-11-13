// create line charts for interactive, linked dashboard view

class LineChart {
    constructor(parentElement, data, variable) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = [];
        this.variable = variable;

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

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        // ONLY IF overall chart??
        if(vis.variable === "overview"){
            // Append a path for the line function, so that it is later behind the brush overlay
            vis.linePath = vis.svg.append("path")
                .attr("class", "line");
            // TO-DO: Add Brushing to Chart??
        }


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


        let dateParser = d3.timeParse("%Y-%m-%d");

        vis.displayData = Object.entries(vis.data).map(d => {
            return {
                date: dateParser(d[0]),
                num_rides: d[1].length,
                num_rides_user_subscriber: d[1].filter(ride => ride.usertype === "Subscriber").length,
                num_rides_user_customer: d[1].filter(ride => ride.usertype === "Customer").length,

                num_rides_gen_unknown: d[1].filter(ride => ride.gender === 0).length,
                num_rides_gen_male: d[1].filter(ride => ride.gender === 1).length,
                num_rides_gen_female: d[1].filter(ride => ride.gender === 2).length,

                num_rides_age_youth: d[1].filter(ride => ride.age < 18).length,
                num_rides_age_young_adult: d[1].filter(ride => ride.age >= 18 && ride.age < 25).length,
                num_rides_age_adult: d[1].filter(ride => ride.age >= 25).length,
                num_rides_age_missing: d[1].filter(ride => ride.age != 0 && !ride.age).length // missing because birth year unknown for non-subscribers

                // group by starttime would be d[0] get only the time part, not the date...

                // clarify that age visual is only for subscribers
            }
        });

        // ensure sorted by day
        vis.displayData = (vis.displayData.sort((a,b)=> a.date - b.date));
        console.log("displayData", vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        // Update domain
        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.date;
        }));
        vis.y.domain([0, d3.max(vis.displayData, function (d) {
            return d.num_rides; // edit for others?
        })]);


        if (vis.variable === "overview"){
            // D3 path generator
            vis.dataLine = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides));

            // Call the line path function and update the path
            vis.linePath
                .datum(vis.displayData)
                .attr("d", vis.dataLine);
        }

        if(vis.variable === "member"){
            vis.dataLine_sub = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_user_subscriber));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_sub);

            vis.dataLine_cus = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_user_customer));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_cus);
        }

        if(vis.variable === "gender"){
            vis.dataLine_un = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_unknown));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_un);

            vis.dataLine_f = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_female));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_f);

            vis.dataLine_m = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_male));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_m);
        }

        if(vis.variable === "age"){
            vis.dataLine_youth = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_youth));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_youth);

            vis.dataLine_ya = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_young_adult));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_ya);

            vis.dataLine_adult = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_adult));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_adult);

            vis.dataLine_unknown = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_missing));

            // Call the line path function and draw the path
            vis.svg.append("path")
                .attr("class", "line")
                .datum(vis.displayData)
                .attr("d", vis.dataLine_unknown);
        }

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);
    }
}