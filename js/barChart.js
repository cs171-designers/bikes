// code still in progress - for creating bar chart grouping data by starttime of trips

class BarChart {

    constructor(parentElement, data, _eventHandler) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = this.data;
        this.displayData = [];
        this.eventHandler = _eventHandler;

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

        // SVG clipping path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);

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

            // draw legend for colored lines
            // vis.legend = vis.svg.append("g")
            //     .attr("class", "legend")
            //     .attr("transform", "translate(" + (vis.width - 60) + ",0)");
            //
            // vis.legend_width = 5;
            // vis.legend_height = 5;
            // vis.legend_padding = 2;


        // draw legend
        // vis.legend.append("rect")
        //     .attr("x", 0)
        //     .attr("y", -15)
        //     .attr("width", vis.legend_width)
        //     .attr("height", vis.legend_height)
        //     .style("fill", "blue");
        //
        // vis.legend.append("text")
        //     .text("Subscriber")
        //     .attr("x", vis.legend_width + vis.legend_padding)
        //     .attr("y", -15 + 5); // add 5, half of font size -- centered with rect
        //
        // vis.legend.append("rect")
        //     .attr("x", 0)
        //     .attr("y", -5) // -15 + 10 = -5. 10 = height of rect + 5 for vertical padding
        //     .attr("width", vis.legend_width)
        //     .attr("height", vis.legend_height)
        //     .style("fill", "red")
        //
        // vis.legend.append("text")
        //     .text("Customer")
        //     .attr("x", vis.legend_width + vis.legend_padding)
        //     .attr("y", -5 + 5);


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;


        //console.log("missing", Object.values(vis.data).map(d => d.filter(ride => ride.age != 0 && !ride.age)))
        // birth year only for subscribers, not known for customers


        let dateParser = d3.timeParse("%Y-%m-%d");


        vis.displayData = Object.entries(vis.filteredData).map(d => {
            return {
                date: dateParser(d[0]),
                num_rides_start: categorize(d[1])//d[1]

                // need num_rides for each category, AND tripdur for each category!

                // num_rides_age_youth: d[1].filter(ride => ride.age < 18).length,
                // num_rides_age_young_adult: d[1].filter(ride => ride.age >= 18 && ride.age < 25).length,
                // num_rides_age_adult: d[1].filter(ride => ride.age >= 25).length,
                // num_rides_age_missing: d[1].filter(ride => ride.age != 0 && !ride.age).length, // missing because birth year unknown for non-subscribers

            }
        })

        //console.log(hourFormat(vis.displayData[0].num_rides_start[0].starttime))

        function categorize(d){
            let hourFormat = d3.timeFormat("%H");

            let morn_trips = d.filter(ride => hourFormat(ride.starttime) <= 11);
            //console.log("morn_trips", morn_trips)

            // let total_dur = 0;
            // d.forEach(ride => total_dur += ride.tripduration);
            // return total_dur/d.length/60;  // divide by 60 to get average trip duration in MINUTES
        }

        // ensure sorted by day
        vis.displayData = (vis.displayData.sort((a,b)=> a.date - b.date));
        console.log("displayData", vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        // Update domain - x axis same for all charts
        // vis.x.domain(d3.extent(vis.displayData, function (d) {
        //     return d.date;
        // }));


        // vis.y.domain([0, d3.max(vis.displayData, function (d) {
        //     return d[selectedCategory];
        // })]);
        // let youth_displayData = vis.displayData.map(d => d[selectedCategory + "_age_youth"]);
        // let ya_displayData = vis.displayData.map(d => d[selectedCategory + "_age_young_adult"]);
        // let adult_displayData = vis.displayData.map(d => d[selectedCategory + "_age_adult"]);
        // let unknown_displayData = vis.displayData.map(d => d[selectedCategory + "_age_missing"]);
        // let age_displayData = youth_displayData.concat(ya_displayData).concat(adult_displayData).concat(unknown_displayData);
        // vis.y.domain([0, d3.max(age_displayData)]);

        // update y axis label
        // if(selectedCategory === "num_rides"){
        //     vis.yLabel.text("# rides");
        // }
        // else{
        //     vis.yLabel.text("average trip duration (min)");
        // }

        // draw data



        // Call the line path function and update the path
        // vis.linePath
        //     // .datum(vis.displayData)
        //     // .attr("d", vis.dataLine)
        //     .transition().duration(200).style("opacity",0)
        //     .transition().duration(400).attr("d", vis.dataLine(vis.displayData)) //pass in data for line generation
        //     .transition().duration(800).style("opacity",1)
        //     .attr("clip-path", "url(#clip)");
        //
        // // Update axes
        // vis.svg.select(".y-axis").transition().duration(800).call(vis.yAxis);
        // vis.svg.select(".x-axis").transition().duration(800).call(vis.xAxis);

    }

    onSelectionChange(selectionStart, selectionEnd){
        // let vis = this;
        //
        // let dateParser = d3.timeParse("%Y-%m-%d");
        // let timeFormat = d3.timeFormat("%Y-%m-%d");
        //
        // vis.filteredData = {};
        // Object.entries(vis.data).forEach(d => {
        //     let date = timeFormat(dateParser(d[0]));
        //     if (date >= timeFormat(selectionStart) && date <= timeFormat(selectionEnd)) {
        //         vis.filteredData[date] = d[1];
        //     }
        // });
        // //console.log(vis.filteredData)
        // vis.wrangleData();
    }

}