// create line charts for interactive, linked dashboard view

class LineChart {
    constructor(parentElement, data, variable, _eventHandler, _dateParser) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = this.data;
        this.displayData = [];
        this.variable = variable;
        this.eventHandler = _eventHandler;
        this.dateParser = _dateParser;

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 10, bottom: 20, left: 60 };

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
            .attr("x", -vis.margin.left + vis.width / 2)
            .attr("y", -15)
            .attr("class", "lineTitle");

        // y-axis label
        vis.yLabel = vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            //.attr("y", -vis.margin.left + 10)
            .style("text-anchor", "middle");

        // ONLY Brush on the Overview chart
        if (vis.variable === "overview") {
            // Append a path for the line function, so that it is later behind the brush overlay
            vis.linePath = vis.svg.append("path")
                .attr("class", "line");

            if(vis.eventHandler != null){
                // Add Brushing Component
                vis.currentBrushRegion = null;
                const brushHandler = function (event) {
                    // User just selected a specific region
                    vis.currentBrushRegion = event.selection;
                    if (vis.currentBrushRegion) {
                        vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);
                    }

                    // Trigger the event 'selectionChanged' of our event handler
                    vis.eventHandler.trigger("selectionChanged", vis.currentBrushRegion);

                    // trigger event to update date labels
                    vis.eventHandler.trigger("updateLabels", vis.currentBrushRegion);
                }
                vis.brush = d3.brushX()
                    .extent([[0, 0], [vis.width, vis.height]])
                    .on("brush", brushHandler)
                    .on("end", brushHandler);

                vis.brushGroup = vis.svg.append("g")
                    .attr("class", "brush");

                // Add SVG ABOVE main brush-able chart to show time period dates labels
                vis.timeSvg = d3.select("#time").append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", 20)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + ",0)");

                vis.timeSvg.append("rect")
                    .attr("id", "time-period-min-box")
                    .attr("x", -55)
                    .attr("y", 0)
                    .attr("width", 80)
                    .attr("height", 20);

                vis.timeSvg.append("text")
                    .attr("id", "time-period-min")
                    .text("2018-01-01")
                    .attr("x", -50)
                    .attr("y", 15);

                vis.timeSvg.append("text")
                    .attr("id", "time-dash")
                    .text("-")
                    .attr("x", 30)
                    .attr("y", 15);

                vis.timeSvg.append("rect")
                    .attr("id", "time-period-max-box")
                    .attr("x", 45)
                    .attr("y", 0)
                    .attr("width", 80)
                    .attr("height", 20);

                vis.timeSvg.append("text")
                    .attr("id", "time-period-max")
                    .text("2019-12-31")
                    .attr("x", 50)
                    .attr("y", 15);
            }
        }

        if (vis.variable != "overview") {
            // draw legend for colored lines
            vis.legend = vis.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + vis.margin.left+ ",0)");
                //.attr("transform", "translate(" + (vis.width - 60) + ",0)");

            vis.legend_width = 5;
            vis.legend_height = 5;
            vis.legend_padding = 2;
        }

        // Only draw the line paths once! different number of lines for each demographic
        if (vis.variable === "member") {
            vis.linePath_sub = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_cus = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "red");

            vis.legend.append("text")
                .text("Subscriber")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5); // add 5, half of font size -- centered with rect

            vis.legend.append("rect")
                .attr("x", 80)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "blue")

            vis.legend.append("text")
                .text("Non-subscriber")
                .attr("x", 80 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);
        }

        if (vis.variable === "gender") {
            vis.linePath_un = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_f = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_m = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "grey")

            vis.legend.append("text")
                .text("Unknown")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 80)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "brown")

            vis.legend.append("text")
                .text("Female")
                .attr("x", 80 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 160)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "green")

            vis.legend.append("text")
                .text("Male")
                .attr("x", 160 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);
        }

        if (vis.variable === "age") {
            vis.linePath_youth = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_ya = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_adult1 = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_adult2 = vis.svg.append("path")
                .attr("class", "line");

            vis.linePath_unknown = vis.svg.append("path")
                .attr("class", "line");

            // draw legend
            vis.legend.attr("transform", "translate(-15,0)"); // more age categories, need to move legend further left

            vis.legend.append("rect")
                .attr("x", 0)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "grey")

            vis.legend.append("text")
                .text("Unknown")
                .attr("x", vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 60)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "limegreen");

            vis.legend.append("text")
                .text("Youth (<18)")
                .attr("x", 60 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 140)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "orange")

            vis.legend.append("text")
                .text("Adult (18-28)")
                .attr("x", 140 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 220)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "darkcyan")

            vis.legend.append("text")
                .text("Adult (28-38)")
                .attr("x", 220 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);

            vis.legend.append("rect")
                .attr("x", 300)
                .attr("y", -10)
                .attr("width", vis.legend_width)
                .attr("height", vis.legend_height)
                .style("fill", "purple")

            vis.legend.append("text")
                .text("Adult (38+)")
                .attr("x", 300 + vis.legend_width + vis.legend_padding)
                .attr("y", -10 + 5);
        }

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }
    wrangleData() {
        let vis = this;

        //console.log("missing", Object.values(vis.data).map(d => d.filter(ride => ride.age != 0 && !ride.age)))
        // birth year only for subscribers, not known for customers

        let dateParser = d3.timeParse(vis.dateParser);

        vis.displayData = Object.entries(vis.filteredData).map(d => {
            return {
                date: dateParser(d[0]),

                num_rides: d[1].length,
                num_rides_user_subscriber: user(d[1])[0][0],
                num_rides_user_customer: user(d[1])[1][0],

                num_rides_gen_unknown: gender(d[1])[0][0],
                num_rides_gen_male: gender(d[1])[1][0],
                num_rides_gen_female: gender(d[1])[2][0],

                num_rides_age_youth: age(d[1])[0][0],
                num_rides_age_young_adult: age(d[1])[1][0],
                num_rides_age_adult1: age(d[1])[2][0],
                num_rides_age_adult2: age(d[1])[3][0],
                num_rides_age_missing: age(d[1])[4][0], // missing because birth year unknown for non-subscribers

                avg_trip_dur: average_trip(d[1]),
                avg_trip_dur_user_subscriber: user(d[1])[0][1],
                avg_trip_dur_user_customer: user(d[1])[1][1],

                avg_trip_dur_gen_unknown: gender(d[1])[0][1],
                avg_trip_dur_gen_male: gender(d[1])[1][1],
                avg_trip_dur_gen_female: gender(d[1])[2][1],

                avg_trip_dur_age_youth: age(d[1])[0][1],
                avg_trip_dur_age_young_adult: age(d[1])[1][1],
                avg_trip_dur_age_adult1: age(d[1])[2][1],
                avg_trip_dur_age_adult2: age(d[1])[3][1],
                avg_trip_dur_age_missing: age(d[1])[4][1]
            }
        });
        vis.displayData = vis.displayData.map(res => res);
        vis.displayData = (vis.displayData.sort((a, b) => a.date - b.date));;
        function average_trip(d) {
            let total_dur = 0;
            d.forEach(ride => total_dur += ride.tripduration);
            return total_dur / d.length / 60;  // divide by 60 to get average trip duration in MINUTES
        }
        function user(d) {
            let data = ["Subscriber", "Customer"]
            let subscriber = [];
            let customer = [];

            for (let i = 0; i < data.length; i++) {
                //subset data
                let trips = d.filter(ride => ride.usertype === data[i]);
                // num_rides
                let rides = trips.length;
                // calculate avg_trip_duration
                let total_dur = 0;
                trips.forEach(ride => total_dur += ride.tripduration);

                let avg_trip_dur = 0;
                if (rides != 0) {
                    avg_trip_dur = total_dur / rides / 60;
                }

                // return values
                if (i == 0) {
                    subscriber.push(rides);
                    subscriber.push(avg_trip_dur);
                } else {
                    customer.push(rides);
                    customer.push(avg_trip_dur);
                }
            }
            return [subscriber, customer]
        }
        function gender(d) {
            let data = [0, 1, 2]
            let gen_unknown = [];
            let gen_m = [];
            let gen_f = [];

            for (let i = 0; i < data.length; i++) {
                let trips = d.filter(ride => ride.gender === data[i]);
                let rides = trips.length;
                let total_dur = 0;
                trips.forEach(ride => total_dur += ride.tripduration);

                let avg_trip_dur = 0;
                if (rides != 0) {
                    avg_trip_dur = total_dur / rides / 60;
                }
                if (i === 0) {
                    gen_unknown.push(rides);
                    gen_unknown.push(avg_trip_dur);
                } else if (i === 1) {
                    gen_m.push(rides);
                    gen_m.push(avg_trip_dur);
                }
                else {
                    gen_f.push(rides);
                    gen_f.push(avg_trip_dur);
                }
            }
            return [gen_unknown, gen_m, gen_f];
        }
        function age(d) {
            // categories -- <18, 18-28, 28-38, 38+
            let age_youth = [];
            let age_ya = [];
            let age_adult1 = [];
            let age_adult2 = [];
            let age_unknown = [];

            let filtered_trips = [];
            let youth_trips = d.filter(ride => ride.age < 18);
            let ya_trips = d.filter(ride => ride.age >= 18 && ride.age < 28);
            let adult1_trips = d.filter(ride => ride.age >= 28 && ride.age < 38);
            let adult2_trips = d.filter(ride => ride.age >= 38);
            let unknown_trips = d.filter(ride => ride.age != 0 && !ride.age);

            filtered_trips.push(youth_trips, ya_trips, adult1_trips, adult2_trips, unknown_trips);

            for (let i = 0; i < filtered_trips.length; i++) {
                let trips = filtered_trips[i];
                let rides = trips.length;
                let total_dur = 0;
                trips.forEach(ride => total_dur += ride.tripduration);
                let avg_trip_dur = 0;
                if (rides != 0) {
                    avg_trip_dur = total_dur / rides / 60;
                }
                if (i === 0) {
                    age_youth.push(rides);
                    age_youth.push(avg_trip_dur);
                } else if (i === 1) {
                    age_ya.push(rides);
                    age_ya.push(avg_trip_dur);
                }
                else if (i === 2) {
                    age_adult1.push(rides);
                    age_adult1.push(avg_trip_dur);
                }
                else if (i === 3) {
                    age_adult2.push(rides);
                    age_adult2.push(avg_trip_dur);
                }
                else {
                    age_unknown.push(rides);
                    age_unknown.push(avg_trip_dur);
                }
            }
            return [age_youth, age_ya, age_adult1, age_adult2, age_unknown];
        }

        // ensure sorted by day
        vis.displayData = (vis.displayData.sort((a, b) => a.date - b.date));
        //console.log("line displayData", vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        //vis.xAxis.ticks(10);

        // Update domain - x axis same for all charts
        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.date;
        }));

      // update y domain
        if (selectedCategory === "num_rides"){
            vis.y.domain([0, d3.max(vis.displayData, function (d) {
                return d[selectedCategory];
            })]);
        }
        else{
            // get max from the highest average from all the categories

            let sub_displayData = vis.displayData.map(d => d[selectedCategory + "_user_subscriber"]);
            let cus_displayData = vis.displayData.map(d => d[selectedCategory + "_user_customer"]);
            let unknown_gen_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_unknown"]);
            let male_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_male"]);
            let female_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_female"]);
            let youth_displayData = vis.displayData.map(d => d[selectedCategory + "_age_youth"]);
            let ya_displayData = vis.displayData.map(d => d[selectedCategory + "_age_young_adult"]);
            let adult_displayData = vis.displayData.map(d => d[selectedCategory + "_age_adult"]);
            let unknown_age_displayData = vis.displayData.map(d => d[selectedCategory + "_age_missing"]);

            let data = sub_displayData.concat(cus_displayData)
                .concat(unknown_gen_displayData).concat(male_displayData).concat(female_displayData)
                .concat(youth_displayData).concat(ya_displayData).concat(adult_displayData).concat(unknown_age_displayData);

            vis.y.domain([0, d3.max(data)]);
        }

        // update y axis label AND include insights on dashboard
        if (selectedCategory === "num_rides") {
            vis.yLabel.text("# rides")
                .attr("y", -vis.margin.left + 10);

            document.getElementById("mainInsight").innerHTML =
                "<p> As you can see, ridership tends to increase in the summer months and decrease in the winter months.</p>"
            + "<p>In the charts below, you can dive further into the demographics of Bluebike users to see how bike " +
                "usage varies across categories. You can brush on the chart to the left to zoom in on selected time frames " +
                "on the charts below. Clicking out of the brush selection will reset the charts.\n</p>"
            + "<p>It is important to note that, due to the structure of the data, rides are not associated with specific " +
            "users. Therefore, our analysis is on the rides rather than on users. \n</p>";
            document.getElementById("memberInsight").innerHTML =
                "<p>More rides are consistently completed by subscribers than non-subscribers. The difference in " +
                "rides between membership types is usually at least 5,000 rides, but ridership is very low across both " +
                "membership types in January. This trend makes sense because subscribers pay a flat rate for unlimited " +
                "45-minute rides, so it would be more cost effective for subscribers to ride more. However, January of " +
                "each year is not only very cold but also a holiday where people are less likely to go out, whether by " +
                "bike or not. </p>";
            document.getElementById("genderInsight").innerHTML =
                "<p>Most rides are completed by Male users, then Female users, and finally by users of unknown gender." +
                "Because rides are not associated with specific users, this trend could be because of particular male users" +
                "who are very avid bikers, or because there are more male Bluebike users than females, or males just tend to" +
                "ride more than females.</p>";
            document.getElementById("ageInsight").innerHTML =
                "<p>There are a similar number of rides completed by adults aged 18-28, 28-38, and 38+, though there are" +
                "slightly more rides completed by adults aged 18-28.\n"+
                "There are very few rides completed by youth <18 and users of unknown age.</p>";
        }
        else {
            vis.yLabel.text("average trip duration (min)")
                .attr("y", -vis.margin.left + 30);

            document.getElementById("mainInsight").innerHTML =
                "<p>From this graph, we see that the average trip duration is around 15 minutes. \n</p>"
                + "<p>In the charts below, you can dive further into the demographics of Bluebike users to see how bike " +
                "usage varies across categories. You can brush on the chart to the left to zoom in on selected time frames " +
                "on the charts below. Clicking out of the brush selection will reset the charts.\n</p>"
                + "<p>It is important to note that, due to the structure of the data, rides are not associated with specific " +
                "users. Therefore, our analysis is on the rides rather than on users. \n</p>";

            document.getElementById("memberInsight").innerHTML =
                "<p>Although more rides are completed by subscribers than non-subscribers, these rides are actually shorter\n" +
                "(by about 15 minutes) on average than rides by non-subscribing customers! This could be because\n" +
                "subscribers are already paying for unlimited rides and feel that it is worth the money to\n" +
                "indulge in shorter rides.\n</p>" +
                "<p> Rides by subscribers tend to be around 30 minutes on average. Rides by non-subscribers are around 13 minutes on average.</p>";

            document.getElementById("genderInsight").innerHTML =
                "<p>Following the same trend, users with unknown gender are likely non-subscribing customers where\n" +
                "their demographic data is not entered. So, they also tend to take longer rides along the same\n" +
                "trend as the customers line in the previous graph. However, we also see that rides by Male and Female\n" +
                "users tend to take trips that are about the same duration, although trips by Females are slightly longer.\n</p>" +
                "<p> Rides by Females are around 15 minutes on average, whereas rides by Males are around 13 minutes on average.</p>";

            document.getElementById("ageInsight").innerHTML =
                "<p>When examining trip duration by age, we see that rides by adults aged 18-28 and adults aged 38+ have \n" +
                "similar average trip duration, around 15 minutes long.\n" +
                "Rides by adults aged 28-38 are typically the longest, with an average duration of around 20 minutes." +
                "Rides by young users <18 have a much more variation in trip duration.\n</p>";
        }

        // draw data lines
        if (vis.variable === "overview") {
            // update y axis
            // vis.y.domain([0, d3.max(vis.displayData, function (d) {
            //     return d[selectedCategory];
            // })]);

            if(vis.eventHandler != null){
                // call brush component
                vis.brushGroup
                    .attr("clip-path", "url(#clip)")
                    .call(vis.brush);
            }

            // D3 path generator
            vis.dataLine = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory]));

            // Call the line path function and update the path
            vis.linePath
                .data([vis.displayData])
                // .attr("d", vis.dataLine)
                .style("opacity", 0)
                .attr("d", vis.dataLine) //pass in data for line generation
                .style("opacity", 1)
                .attr("clip-path", "url(#clip)");

        }

        if (vis.variable === "member") {
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Type")

            // update y axis
            // let sub_displayData = vis.displayData.map(d => d[selectedCategory + "_user_subscriber"]);
            // let cus_displayData = vis.displayData.map(d => d[selectedCategory + "_user_customer"]);
            // let member_displayData = sub_displayData.concat(cus_displayData);
            // vis.y.domain([0, d3.max(member_displayData)]);

            // write data lines as function? Then do the radio lines with them as callback?
            // draw data lines
            vis.dataLine_sub = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_user_subscriber"]));
            console.log(selectedCategory + "_user_subscriber")

            vis.linePath_sub
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_sub) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "red");

            vis.dataLine_cus = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_user_customer"]));

            vis.linePath_cus
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_cus)
                .style("opacity", 1)
                .style("stroke", "blue");

        }

        if (vis.variable === "gender") {
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Gender")

            // update y axis
            // let unknown_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_unknown"]);
            // let male_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_male"]);
            // let female_displayData = vis.displayData.map(d => d[selectedCategory + "_gen_female"]);
            // let gen_displayData = unknown_displayData.concat(male_displayData).concat(female_displayData);
            // vis.y.domain([0, d3.max(gen_displayData)]);

            // draw data lines
            vis.dataLine_un = d3.line()
                .x(d => vis.x(d.date))
                .y(function (d) { return vis.y(d[selectedCategory + "_gen_unknown"]) });

            vis.linePath_un
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_un) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "grey");

            vis.dataLine_f = d3.line()
                .x(d => vis.x(d.date))
                .y(function (d) { return vis.y(d[selectedCategory + "_gen_female"]) });

            vis.linePath_f
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_f)
                .style("opacity", 1)
                .style("stroke", "brown");

            vis.dataLine_m = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_gen_male"]));

            vis.linePath_m
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_m)
                .style("opacity", 1)
                .style("stroke", "green");
        }

        if (vis.variable === "age") {
            // add chart title labels
            vis.svg.select(".lineTitle").text("By User Age")

            // update y axis
            // let youth_displayData = vis.displayData.map(d => d[selectedCategory + "_age_youth"]);
            // let ya_displayData = vis.displayData.map(d => d[selectedCategory + "_age_young_adult"]);
            // let adult_displayData = vis.displayData.map(d => d[selectedCategory + "_age_adult"]);
            // let unknown_displayData = vis.displayData.map(d => d[selectedCategory + "_age_missing"]);
            // let age_displayData = youth_displayData.concat(ya_displayData).concat(adult_displayData).concat(unknown_displayData);
            // vis.y.domain([0, d3.max(age_displayData)]);

            vis.dataLine_youth = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_age_youth"]));

            vis.linePath_youth
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_youth) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "limegreen");

            vis.dataLine_ya = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_age_young_adult"]));

            vis.linePath_ya
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_ya) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "orange");

            vis.dataLine_adult1 = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_age_adult1"]));

            vis.linePath_adult1
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_adult1) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "purple");

            vis.dataLine_adult2 = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_age_adult2"]));

            vis.linePath_adult2
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_adult2) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "darkcyan");

            vis.dataLine_unknown = d3.line()
                .x(d => vis.x(d.date))
                .y(d => vis.y(d[selectedCategory + "_age_missing"]));

            vis.linePath_unknown
                .data([vis.displayData])
                .style("opacity", 0)
                .attr("d", vis.dataLine_unknown) //pass in data for line generation
                .style("opacity", 1)
                .style("stroke", "grey");
        }

        // Update axes
        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);

    }

    onSelectionChange(selectionStart, selectionEnd) {
        let vis = this;

        // let dateParser = d3.timeParse("%Y-%m-%d");
        let dateParser = d3.timeParse(vis.dateParser);
        let timeFormat = d3.timeFormat(vis.dateParser);

        vis.filteredData = {};
        Object.entries(vis.data).forEach(d => {
            let date = timeFormat(dateParser(d[0]));
            if (!selectionStart || !selectionEnd) {
                // filter reset
                vis.filteredData[date] = d[1];
                return;
            }
            if (date >= timeFormat(selectionStart) && date <= timeFormat(selectionEnd)) {
                vis.filteredData[date] = d[1];
            }
        });

        vis.wrangleData();

    }

    onUpdateLabels(selectionStart, selectionEnd) {
        let vis = this;
        let timeFormat = d3.timeFormat("%Y-%m-%d");
        if (!selectionStart) {
            let start = d3.extent(vis.displayData, function (d) {
                return d.date;
            });
            selectionStart = start[0];
        }
        if (!selectionEnd) {
            let end = d3.extent(vis.displayData, function (d) {
                return d.date;
            });
            selectionEnd = end[1];
        }
        console.log("selection", selectionStart, selectionEnd)
        d3.select("#time-period-min").text(timeFormat(selectionStart));
        d3.select("#time-period-max").text(timeFormat(selectionEnd));
    }
}