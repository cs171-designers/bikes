// code still in progress - for creating bar chart grouping data by starttime of trips

class NightingaleChart {

    constructor(parentElement, data, variable, _dateParser) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = this.data;
        this.displayData = [];
        this.variable = variable;
        this.dateParser = _dateParser;

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Append Nightingale Group
        vis.nightingaleChartGroup = vis.svg
            .append('g')
            .attr('class', 'nightingale-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + (10 + vis.height / 2) + ")");

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'nightTooltip')

        // Scales and labels
        vis.colorScale = d3.scaleLinear()
            .range(["#deeff5", "#00008B"])

        vis.legendScale = d3.scaleLinear()
            .domain([0, 100])
            .range(["#deeff5", "#00008B"])

        vis.legendAxisScale = d3.scaleLinear()
            .range([100, 0])

        vis.nightingaleChartGroup.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(${30 + vis.margin.right + vis.height / 2}, -50)`)

        vis.legendAxis = d3.axisRight(vis.legendAxisScale)
            .ticks(3)

        vis.radiusScale = d3.scaleLinear()
            .range([0, d3.min([vis.width / 2, vis.height / 2]) - 3 * vis.margin.top])

        vis.startAngleScale = d3.scaleLinear()
            .domain([0, 7]) // number of bins
            .range([0, 7 * Math.PI / 4])

        vis.endAngleScale = d3.scaleLinear()
            .domain([0, 7])
            .range([Math.PI / 4, 2 * Math.PI])

        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", 5)
            .style("font-size", "15px")
            .style("text-anchor", "middle")
            .text("Rides and Average Trip Durations by Time of Day")

        // format ticks to convey hour categories. Categories do not update
        vis.tickStrings = ["12am - 3am", "3am - 6am", "6am - 9am", "9am - 12pm", "12pm - 3pm", "3pm - 6pm", "6pm - 9pm", "9pm - 12am"];

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        // for bar chart, need total count for each category. do not need date information

        let data = Object.values(vis.filteredData).flat();

        let hour = ["overnight1", "overnight2", "morn1", "morn2", "aft1", "aft2", "night1", "night2"];

        let dataHolder = [];
        var startTime = performance.now()
        let trip_data = categorize(data);
        var endTime = performance.now()

        console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
        for (let i = 0; i < hour.length; i++) {
            dataHolder.push({
                index: i,
                hour: hour[i],
                num_rides: trip_data[0][i],
                avg_trip_dur: trip_data[1][i]
            })
        }
        vis.displayData = dataHolder;
        console.log("display data bar hours", vis.displayData)

        function categorize(d) {
            // let hourFormat = d3.timeFormat("%H"); // computed once when data is loaded

            // // filtered data by start hour categories
            const bucket_size = 3;
            // let trip_data = (new Array(24 / bucket_size)).fill(0).map(i => []);
            // d.forEach((ride) => {
            //     let bucket = Math.floor(ride.startHourString / bucket_size);
            //     if (ride.startHourString === 24) bucket = 0;
            //     trip_data[bucket].push(ride);
            // });
            // console.log("data", trip_data);

            // define arrays to hold returned data
            // let num_rides = [];
            // let avg_trip_duration = [];
            let num_rides = (new Array(24 / bucket_size)).fill(0);
            let total_trip_duration = (new Array(24 / bucket_size)).fill(0);

            d.forEach((ride) => {
                let bucket = Math.floor(ride.startHourString / bucket_size);
                if (ride.startHourString === 24) bucket = 0;
                num_rides[bucket] += 1;
                total_trip_duration[bucket] += ride.tripduration;
            });

            // for (let i = 0; i < trip_data.length; i++) {
            //     let trips = trip_data[i];
            //     let rides = trips.length;

            //     let total_dur = 0;
            //     trips.forEach(ride => total_dur += ride.tripduration);
            //     let avg_trip_dur = 0;
            //     if (rides != 0) {
            //         avg_trip_dur = total_dur / rides / 60;
            //     }
            //     num_rides.push(rides);
            //     avg_trip_duration.push(avg_trip_dur);
            // }
            let avg_trip_duration = total_trip_duration.map((val,i) => val / num_rides[i] / 60);
            console.log("data", [num_rides, avg_trip_duration]);
            return [num_rides, avg_trip_duration];
        }
        // console.log("BAR displayData", vis.displayData);

        // Create arrays of just num_rides and avg trip duration
        let numRidesArray = []
        let avgTripDurArray = []
        vis.displayData.forEach(bin => {
            numRidesArray.push(Math.sqrt(8 * bin.num_rides / Math.PI));
            avgTripDurArray.push(bin.avg_trip_dur);
        })

        // Finish creating domains using wrangled data
        vis.maxRadVal = d3.max(numRidesArray)
        vis.radiusScale.domain([0, vis.maxRadVal])
        vis.colorScale.domain([d3.min(avgTripDurArray), d3.max(avgTripDurArray)])
        vis.legendAxisScale.domain([d3.min(avgTripDurArray), d3.max(avgTripDurArray)])


        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        let labelArcs = vis.nightingaleChartGroup.selectAll(".labelArc")
            .data(vis.displayData)

        labelArcs.enter().append("g")
            .append("path")
            .attr("class", "labelArc")
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(vis.radiusScale(vis.maxRadVal))
                .startAngle(d => vis.startAngleScale(d.index))
                .endAngle(d => vis.endAngleScale(d.index))
            )
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", "1px")
            .each(function (d, i) {
                // This section made with the help of this blog post by Nadleh Bremer
                // https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/
                //A regular expression that captures all in between the start of a string
                //(denoted by ^) and the first capital letter L
                let firstArcSection = /(^.+?)L/;

                //The [1] gives back the expression between the () (thus not the L as well)
                //which is exactly the arc statement
                let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
                //Replace all the comma's so that IE can handle it -_-
                //The g after the / is a modifier that "find all matches rather than
                //stopping after the first match"
                newArc = newArc.replace(/,/g, " ");


                //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
                //flip the end and start position
                if (vis.endAngleScale(d.index) > 90 * Math.PI / 180 && vis.endAngleScale(d.index) <= 3 * Math.PI / 2) {
                    //Everything between the capital M and first capital A
                    let startLoc = /M(.*?)A/;
                    //Everything between the capital A and 0 0 1
                    let middleLoc = /A(.*?)0 0 1/;
                    //Everything between the 0 0 1 and the end of the string (denoted by $)
                    let endLoc = /0 0 1 (.*?)$/;
                    //Flip the direction of the arc by switching the start and end point
                    //and using a 0 (instead of 1) sweep flag
                    let newStart = endLoc.exec(newArc)[1];
                    let newEnd = startLoc.exec(newArc)[1];
                    let middleSec = middleLoc.exec(newArc)[1];

                    //Build up the new arc notation, set the sweep-flag to 0
                    newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
                }

                //Create a new invisible arc that the text can flow along
                vis.nightingaleChartGroup.append("path")
                    .attr("class", "hiddenDonutArcs")
                    .attr("id", "timeArc_" + i)
                    .attr("d", newArc)
                    .style("fill", "none");
            });

        let arcs = vis.nightingaleChartGroup.selectAll(".nightArc")
            .data(vis.displayData)

        arcs.enter().append("g")
            .append("path")
            .attr("class", "nightArc")
            .attr("d", d3.arc()
                .innerRadius(0)
                .outerRadius(d => vis.radiusScale(Math.sqrt(8 * d.num_rides / Math.PI)))
                .startAngle(d => vis.startAngleScale(d.index))
                .endAngle(d => vis.endAngleScale(d.index))
            )
            .attr("fill", function (d) {
                return vis.colorScale(d.avg_trip_dur)
            })
            .attr("stroke", "black")
            .style("stroke-width", "1px")
            .on('mouseover', function (event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>${vis.tickStrings[d.index]}</h3>
                             <h4>Total Rides: ${d3.format(",")(d.num_rides)} rides</h4>
                             <h4>Average Trip Duration: ${d.avg_trip_dur.toFixed(2)} minutes</h4>      
                         </div>`);
            })
            .on('mouseout', function (event, d) {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


        let arcLabels = vis.nightingaleChartGroup.selectAll(".arcLabel")
            .data(vis.displayData)

        arcLabels.enter().append("text")
            .attr("class", "arcLabel")
            .attr("dy", function (d, i) {
                return (vis.endAngleScale(d.index) > 90 * Math.PI / 180 && vis.endAngleScale(d.index) <= 3 * Math.PI / 2 ? 18 : -11);
            })
            .append("textPath")
            .attr("startOffset", "50%")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("xlink:href", function (d, i) { return "#timeArc_" + i; })
            .text(d => vis.tickStrings[d.index])

        let legendBars = vis.nightingaleChartGroup.selectAll(".legendBar")
            .data(d3.range(100))

        legendBars.enter().append("rect")
            .attr("class", "legendBar")
            .attr("width", 10)
            .attr("height", 1)
            .attr("fill", d => vis.legendScale(d))
            .attr("x", 3 * vis.margin.right + vis.height / 2)
            .attr("y", d => 50 - d)

        let legendTitle = vis.nightingaleChartGroup.append("text")
            .attr("class", "legend-title")
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", `rotate(90) translate(0, ${-(60 + vis.margin.right + vis.height / 2)})`)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text("Average Trip Duration in Minutes")

        let legendAxis = vis.svg.select(".legend-axis").call(vis.legendAxis);
    }
}