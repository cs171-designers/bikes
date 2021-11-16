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

        // vis.displayData.push({
        //     hour: "overnight",
        //     num_rides: categorize(data)[0][0],
        //     avg_trip_dur: categorize(data)[1][0]
        //     },
        //     {
        //         hour: "morn1",
        //         num_rides: categorize(data)[0][1],
        //         avg_trip_dur: categorize(data)[1][1]
        //     },
        //     {
        //         hour: "morn2",
        //         num_rides: categorize(data)[0][2],
        //         avg_trip_dur: categorize(data)[1][2]
        //     },
        //     {
        //         hour: "aft1",
        //         num_rides: categorize(data)[0][3],
        //         avg_trip_dur: categorize(data)[1][3]
        //     },
        //     {
        //         hour: "aft2",
        //         num_rides: categorize(data)[0][4],
        //         avg_trip_dur: categorize(data)[1][4]
        //     },
        //     {
        //         hour: "night1",
        //         num_rides: categorize(data)[0][5],
        //         avg_trip_dur: categorize(data)[1][5]
        //     },
        //     {
        //         hour: "night2",
        //         num_rides: categorize(data)[0][6],
        //         avg_trip_dur: categorize(data)[1][6]
        //     }
        // )
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

        console.log("BAR displayData", vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        // Update domain
        vis.x.domain(vis.displayData.map(d => d.hour));

        // tickFormat?? ["12-6 am", "6-9 am", "9-12 pm", "12-3 pm", "3-6 pm", "6-9 pm", "9-12 am"]);

        // need maximum num_rides or avg_trip_duration from all subcategories
        // let ovn_displayData = vis.displayData.map(d => d[selectedCategory + "_overnight"]);
        // let morn1_displayData = vis.displayData.map(d => d[selectedCategory + "_morn1"]);
        // let morn2_displayData = vis.displayData.map(d => d[selectedCategory + "_morn2"]);
        // let aft1_displayData = vis.displayData.map(d => d[selectedCategory + "_aft1"]);
        // let aft2_displayData = vis.displayData.map(d => d[selectedCategory + "_aft2"]);
        // let night1_displayData = vis.displayData.map(d => d[selectedCategory + "_night1"]);
        // let night2_displayData = vis.displayData.map(d => d[selectedCategory + "_night2"]);
        //
        // let hour_displayData = ovn_displayData
        //     .concat(morn1_displayData).concat(morn2_displayData)
        //     .concat(aft1_displayData).concat(aft2_displayData)
        //     .concat(night1_displayData).concat(night2_displayData);

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
            .data(vis.displayData)//, d => d.hour)

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