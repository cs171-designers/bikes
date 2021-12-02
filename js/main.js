let selectedCategory; // global variable holding form selection - num_Rides or avg_trip_dur
let generalLine, memberLine, genderLine, ageLine, hourBar; // visuals for dashboard -- defined globally so that categoryChange function can be called
let bikeMap;
let stationDashboard;
let barChartsMost;
let barChartsLeast;
let selectedDashboardView;
let riderTrendLine, memberTrend, genderTrend, ageTrend;

function init() {
    // console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");

    // load data
    dataHandler.load().then(() => {

        // $(document).ready(function() {
        //     $('#pagepiling').pagepiling();
        // });

        // map
        let bikeData = dataHandler.groupBikeID()
        bikeMap = new BlueBikeMap("bike-map", bikeData, dataHandler._stations, [42.360082, -71.058880])

        let arrivalData = dataHandler.groupStationArrivals()
        let departureData = dataHandler.groupStationDepartures()
        selectedDashboardView = document.getElementById("map-dashboard-dropdown").value

        stationDashboard = new BlueBikeMapDashboard("station-dashboard", arrivalData, departureData, dataHandler._stations, [42.374443, -71.116943])

        // barCharts
        let ridesData = dataHandler.groupStation();
        let stationData = dataHandler.getStationCoords();
        barChartsMost = new StationBarChart("trip-length-barchart-most", ridesData, stationData, true); // , variable)
        barChartsLeast = new StationBarChart("trip-length-barchart-least", ridesData, stationData, false);


        // pieChart
        let counts = dataHandler.getMultiLevelCounts();
        console.log("multi counts", counts)
        const pie_charts = {
            "gender-age": "Gender Pie Chart (Hover for Age)",
            "user-age": "User Pie Chart (Hover for Age)",
            "age-user": "Age Pie Chart (Hover for User)",
        };
        Object.entries(pie_charts).forEach(([chart, title]) => {
            let pieChart = new PieChart(chart + "-pie-chart", title, counts[chart]);
        })

        // Dashboard View
        let dayParser = "%Y-%m-%d";
        let dayData = dataHandler.groupDate();
        // console.log(lineData);
        
        let weekParser = "%U-%Y";
        let weekData = dataHandler.groupWeek();
        // console.log("aggregated", weekData);

        // Create event handler
        let eventHandler = {
            bind: (eventName, handler) => {
                document.body.addEventListener(eventName, handler);
            },
            trigger: (eventName, extraParameters) => {
                document.body.dispatchEvent(new CustomEvent(eventName, {
                    detail: extraParameters
                }));
            }
        };
        selectedCategory = document.getElementById('categorySelector').value; // default selection value

        // switch data between lineData and weekData?
        const USE_WEEKS = true;
        let dateParser = (USE_WEEKS) ? weekParser : dayParser;
        let lineData = (USE_WEEKS) ? weekData : dayData;
        generalLine = new LineChart("main-line-chart", lineData, "overview", eventHandler, dateParser);
        memberLine = new LineChart("member-line-chart", lineData, "member", null, dateParser);
        genderLine = new LineChart("gender-line-chart", lineData, "gender", null, dateParser);
        ageLine = new LineChart("age-line-chart", lineData, "age", null, dateParser);
        hourBar = new DashBarChart("hour-bar-chart", lineData, eventHandler, dateParser);

        // Bind event handler
        eventHandler.bind("selectionChanged", function (event) {
            //console.log("brush")
            let rangeStart = !!event.detail ? event.detail[0] : null;
            let rangeEnd = !!event.detail ? event.detail[1] : null;
            memberLine.onSelectionChange(rangeStart, rangeEnd);
            genderLine.onSelectionChange(rangeStart, rangeEnd);
            ageLine.onSelectionChange(rangeStart, rangeEnd);
            hourBar.onSelectionChange(rangeStart, rangeEnd);

        });
        // Bind event handler
        eventHandler.bind("updateLabels", function (event) {
            let rangeStart = !!event.detail ? event.detail[0] : null;
            let rangeEnd = !!event.detail ? event.detail[1] : null;
            generalLine.onUpdateLabels(rangeStart, rangeEnd);
        });


        // ridershipTrend line
        riderTrendLine = new LineChart("riderTrend", lineData, "overview", eventHandler, dateParser); // get rid of brush capability??
        memberTrend = new LineChart("memberTrend", lineData, "member", null, dateParser);
        genderTrend = new LineChart("genderTrend", lineData, "gender", null, dateParser);
        ageTrend = new LineChart("ageTrend", lineData, "age", null, dateParser);

    });

}
// switch between num_rides and avg_trip_dur
function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    generalLine.updateVis();
    memberLine.updateVis();
    genderLine.updateVis();
    ageLine.updateVis();
    hourBar.updateVis();
}
init();
