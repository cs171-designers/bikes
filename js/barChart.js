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
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        // format ticks to convey hour categories. Categories do not update
        let tickStrings = ["12-6 am", "6-9 am", "9-12 pm", "12-3 pm", "3-6 pm", "6-9 pm", "9-12 am"];
        vis.xAxis.tickFormat(function(d,i) {
            return tickStrings[i];
        });


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

        let hourFormat = d3.timeFormat("%H");
        // for bar chart, need total count for each category. do not need date information

        let data = Object.values(vis.filteredData).flat();

        let hour = ["overnight","morn1","morn2","aft1","aft2","night1","night2"];

        let dataHolder = [];

        for (let i=0; i<hour.length; i++)
        {
            dataHolder.push({
                hour: hour[i],
                num_rides: categorize(data)[0][i],
                avg_trip_dur: categorize(data)[1][i]
            })
        }
        vis.displayData = dataHolder;

        function categorize(d){
            let hourFormat = d3.timeFormat("%H");

            // define arrays to hold returned data
            let num_rides = [];
            let avg_trip_duration = [];

            // filtered data by start hour categories
            let overnight_trips = d.filter(ride => hourFormat(ride.starttime) < 6); // 12 - 6 am. largest range because assume not many rides at this time
            let morn1_trips = d.filter(ride => hourFormat(ride.starttime) >= 6 && hourFormat(ride.starttime) < 9); // 6-9 am
            let morn2_trips = d.filter(ride => hourFormat(ride.starttime) >= 9 && hourFormat(ride.starttime) < 12); // 9-12 pm
            let aft1_trips = d.filter(ride => hourFormat(ride.starttime) >= 12 && hourFormat(ride.starttime) < 15); // 12-3 pm
            let aft2_trips = d.filter(ride => hourFormat(ride.starttime) >= 15 && hourFormat(ride.starttime) < 18); // 3-6 pm
            let night1_trips = d.filter(ride => hourFormat(ride.starttime) >= 18 && hourFormat(ride.starttime) < 21); // 6-9 pm
            let night2_trips = d.filter(ride => hourFormat(ride.starttime) >= 21 && hourFormat(ride.starttime) <= 24); // 9-12 am

            let trip_data = [overnight_trips, morn1_trips, morn2_trips, aft1_trips, aft2_trips, night1_trips, night2_trips];

            for (let i = 0; i < trip_data.length; i++) {
                let trips = trip_data[i];
                let rides = trips.length;

                let total_dur = 0;
                trips.forEach(ride => total_dur += ride.tripduration);
                let avg_trip_dur = 0;
                if(rides != 0){
                    avg_trip_dur = total_dur/rides/60;
                }
                num_rides.push(rides);
                avg_trip_duration.push(avg_trip_dur);
            }
            return [num_rides, avg_trip_duration];
        }
        //console.log("BAR displayData", vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        // Update domain
        vis.x.domain(vis.displayData.map(d => d.hour));
        vis.y.domain([0, d3.max(vis.displayData.map(d => d[selectedCategory]))]);

        // update y axis label
        if(selectedCategory === "num_rides"){
            vis.yLabel.text("# rides");
        }
        else{
            vis.yLabel.text("average trip duration (min)");
        }

        // draw data
        let bar = vis.svg.selectAll("rect")
            .data(vis.displayData)

//console.log(bar) // why is first one empty?? so "overnight" is empty?

        bar.enter().append("rect")
            .attr("class", "bar")
            .merge(bar)
            .style("fill","grey")
            .transition()
            .duration(800)
            .attr("x", d => vis.x(d.hour))
            .attr("width", vis.x.bandwidth())
            .attr("y", d => vis.y(d[selectedCategory]))
            .attr("height", d => vis.height - (vis.y(d[selectedCategory])));

        // Update axes
        vis.svg.select(".y-axis").transition().duration(800).call(vis.yAxis);
        vis.svg.select(".x-axis").transition().duration(800).call(vis.xAxis);

    }

    onSelectionChange(selectionStart, selectionEnd){
        let vis = this;

        let dateParser = d3.timeParse("%Y-%m-%d");
        let timeFormat = d3.timeFormat("%Y-%m-%d");

        vis.filteredData = {};
        Object.entries(vis.data).forEach(d => {
            let date = timeFormat(dateParser(d[0]));
            if (date >= timeFormat(selectionStart) && date <= timeFormat(selectionEnd)) {
                vis.filteredData[date] = d[1];
            }
        });
        //console.log(vis.filteredData)
        vis.wrangleData();
    }

}