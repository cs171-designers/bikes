// create line charts for interactive, linked dashboard view

class LineChart {
    constructor(parentElement, data, variable, _eventHandler) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = this.data;
        this.displayData = [];
        this.variable = variable;
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
            .style("text-anchor", "middle")
            .text("# rides"); //FOR NOW!

        // ONLY Brush and Zoom on the Overview chart
        if(vis.variable === "overview"){
            // Append a path for the line function, so that it is later behind the brush overlay
            vis.linePath = vis.svg.append("path")
                .attr("class", "line");

            // Add Brushing Component
            vis.currentBrushRegion = null;
            vis.brush = d3.brushX()
                .extent([[0,0],[vis.width, vis.height]])
                .on("brush", function(event){
                    // User just selected a specific region
                    vis.currentBrushRegion = event.selection;
                    vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

                    // Trigger the event 'selectionChanged' of our event handler
                    vis.eventHandler.trigger("selectionChanged", vis.currentBrushRegion);
                });

            vis.brushGroup = vis.svg.append("g")
                .attr("class", "brush");

            // Add zoom component
            vis.xOrig = vis.x; // save original scale

            // function that is being called when user zooms
            vis.zoomFunction = function(event) {
                vis.x = event.transform.rescaleX(vis.xOrig); // apply zoom to x-axis scale

                if(vis.currentBrushRegion){
                    vis.brushGroup.call(vis.brush.move, vis.currentBrushRegion.map(vis.x));
                }

                vis.updateVis();

            };

            // initialize zoom component
            vis.zoom = d3.zoom()
                .scaleExtent([1,20])
                .on("zoom", vis.zoomFunction);

            // disable mousedown and drag in zoom, when you activate zoom (by .call)
            vis.brushGroup.call(vis.zoom)
                .on("mousedown.zoom", null)
                .on("touchstart.zoom", null);

        }

        if (vis.variable != "overview"){
            // draw legend for colored lines
            vis.legend = vis.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (vis.width - 60) + ",0)");

            vis.legend_width = 5;
            vis.legend_height = 5;
            vis.legend_padding = 2;
        }

        // Only draw the line paths once! different number of lines for each demographic
        if (vis.variable === "member"){
            vis.linePath_sub = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_cus = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -15)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "blue");

            vis.legend.append("text")
                .text("Subscriber")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -15 + 5); // add 5, half of font size -- centered with rect

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -5) // -15 + 10 = -5. 10 = height of rect + 5 for vertical padding
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "red")

            vis.legend.append("text")
                .text("Customer")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -5 + 5);
        }

        if (vis.variable === "gender"){
            vis.linePath_un = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_f = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_m = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -15)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "grey")

            vis.legend.append("text")
                .text("Unknown")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -15 + 5);

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -5)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "pink")

            vis.legend.append("text")
                .text("Female")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -5 + 5);

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", 5)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "green")

            vis.legend.append("text")
                .text("Male")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", 5 + 5);
        }

        if (vis.variable === "age"){
            vis.linePath_youth = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_ya = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_adult = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_unknown = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.attr("transform", "translate(" + (vis.width - 100) + ",0)");

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -15)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "grey")

            vis.legend.append("text")
                .text("Unknown")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -15 + 5);

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -5)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "yellow")

            vis.legend.append("text")
                .text("Youth (<18)")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -5 + 5);

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", 5)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "orange")

            vis.legend.append("text")
                .text("Young Adult (18-24)")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", 5 + 5);

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", 15)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "purple")

            vis.legend.append("text")
                .text("Adult (>24)")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", 15 + 5);
        }

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
            return d.num_rides;
        })]);

        if (vis.variable === "overview"){
            // call brush component
            vis.brushGroup
                .attr("clip-path", "url(#clip)")
                .call(vis.brush);

            // D3 path generator
            vis.dataLine = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides));

            // Call the line path function and update the path
            vis.linePath.datum(vis.displayData)
                .attr("d", vis.dataLine)
                .attr("clip-path", "url(#clip)");

            // make sure x-axis updates with zoom
            vis.xAxis.scale(vis.x);
        }

        if (vis.variable === "member"){
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Type")

            // draw data lines
            vis.dataLine_sub = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_user_subscriber));

            vis.linePath_sub
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_sub(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "blue");

            vis.dataLine_cus = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_user_customer));

            vis.linePath_cus
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_cus(vis.displayData))
                .transition().duration(800).style("opacity",1)
                .style("stroke", "red");

        }

        if (vis.variable === "gender"){
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Gender")

            // draw data lines
            vis.dataLine_un = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_unknown));

            vis.linePath_un
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_un(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "grey");

            vis.dataLine_f = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_female));

            vis.linePath_f
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_f(vis.displayData))
                .transition().duration(800).style("opacity",1)
                .style("stroke", "pink");

            vis.dataLine_m = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_gen_male));

            vis.linePath_m
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_m(vis.displayData))
                .transition().duration(800).style("opacity",1)
                .style("stroke", "green");
        }

        if (vis.variable === "age"){
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Age")

            vis.dataLine_youth = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_youth));

            vis.linePath_youth
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_youth(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "yellow");

            vis.dataLine_ya = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_young_adult));

            vis.linePath_ya
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_ya(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "orange");

            vis.dataLine_adult = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_adult));

            vis.linePath_adult
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_adult(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "purple");

            vis.dataLine_unknown = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d.num_rides_age_missing));

            vis.linePath_unknown
                .transition().duration(200).style("opacity",0)
                .transition().duration(400).attr("d", vis.dataLine_unknown(vis.displayData)) //pass in data for line generation
                .transition().duration(800).style("opacity",1)
                .style("stroke", "grey");
        }

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);

        //console.log(Date("2018-01-01 05:22:01").getTime() >= Date("2018-01-10 05:22:01").getTime())

    }

    onSelectionChange(selectionStart, selectionEnd){
        let vis = this;

        let dateParser = d3.timeParse("%Y-%m-%d");
        let timeFormat = d3.timeFormat("%Y-%m-%d");

    vis.filteredData = {};
        Object.entries(vis.data).forEach(d => {
            // console.log(timeFormat(dateParser(d[0])));
            // console.log(timeFormat(selectionStart));
            //  console.log(timeFormat(dateParser(d[0])) >= timeFormat(selectionStart));

           let date = timeFormat(dateParser(d[0]));
            if (date >= timeFormat(selectionStart) && date <= timeFormat(selectionEnd)) {

               vis.filteredData[date] = d[1];
            }
        })
        console.log(vis.filteredData)
        vis.wrangleData();

    }
}