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

        vis.margin = { top: 20, right: 10, bottom: 20, left: 50 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.radiusScale = d3.scaleLinear()

        vis.arc = d3.arc()
            .innerRadius(0)
            .outerRadius(d => {vis.radiusScale(d.radius)})
            .startAngle( function(d,i) { return angleScale( d.angle ); } );

        // format ticks to convey hour categories. Categories do not update
        let tickStrings = ["12-3 am", "3-6 am", "6-9 am", "9-12 pm", "12-3 pm", "3-6 pm", "6-9 pm", "9-12 am"];

        // add chart title placeholder
        vis.svg.append("text")
            .attr("x", -vis.margin.left + vis.width / 2)
            .attr("y", 0)
            .attr("class", "lineTitle");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        let hourFormat = d3.timeFormat("%H");
        // for bar chart, need total count for each category. do not need date information

        let data = Object.values(vis.filteredData).flat();

        let hour = ["overnight1", "overnight2", "morn1", "morn2", "aft1", "aft2", "night1", "night2"];

        let dataHolder = [];

        for (let i = 0; i < hour.length; i++) {
            dataHolder.push({
                hour: hour[i],
                num_rides: categorize(data)[0][i],
                avg_trip_dur: categorize(data)[1][i]
            })
        }
        vis.displayData = dataHolder;
        console.log("display data bar hours", vis.displayData)

        function categorize(d) {
            let hourFormat = d3.timeFormat("%H");

            // define arrays to hold returned data
            let num_rides = [];
            let avg_trip_duration = [];

            // filtered data by start hour categories
            let overnight1_trips = d.filter(ride => hourFormat(ride.starttime) < 3); // 12-3 am.
            let overnight2_trips = d.filter(ride => hourFormat(ride.starttime) >= 3 && hourFormat(ride.starttime) < 6); // 3-6 am
            let morn1_trips = d.filter(ride => hourFormat(ride.starttime) >= 6 && hourFormat(ride.starttime) < 9); // 6-9 am
            let morn2_trips = d.filter(ride => hourFormat(ride.starttime) >= 9 && hourFormat(ride.starttime) < 12); // 9-12 pm
            let aft1_trips = d.filter(ride => hourFormat(ride.starttime) >= 12 && hourFormat(ride.starttime) < 15); // 12-3 pm
            let aft2_trips = d.filter(ride => hourFormat(ride.starttime) >= 15 && hourFormat(ride.starttime) < 18); // 3-6 pm
            let night1_trips = d.filter(ride => hourFormat(ride.starttime) >= 18 && hourFormat(ride.starttime) < 21); // 6-9 pm
            let night2_trips = d.filter(ride => hourFormat(ride.starttime) >= 21 && hourFormat(ride.starttime) <= 24); // 9-12 am

            let trip_data = [overnight1_trips, overnight2_trips, morn1_trips, morn2_trips, aft1_trips, aft2_trips, night1_trips, night2_trips];

            for (let i = 0; i < trip_data.length; i++) {
                let trips = trip_data[i];
                let rides = trips.length;

                let total_dur = 0;
                trips.forEach(ride => total_dur += ride.tripduration);
                let avg_trip_dur = 0;
                if (rides != 0) {
                    avg_trip_dur = total_dur / rides / 60;
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


    }
}