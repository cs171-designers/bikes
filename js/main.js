let selectedCategory; // global variable holding form selection - num_Rides or avg_trip_dur
let generalLine, memberLine, genderLine, ageLine, hourBar; // visuals for dashboard -- defined globally so that categoryChange function can be called
let bikeMap;
let barCharts;

function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");
    // let vis1 = Vis1(dataHandler)

    // Dashboard view
    // load data
    dataHandler.load().then(() => {

        // map
        let bikeData = dataHandler.groupBikeID()
        bikeMap = new BlueBikeMap("bike-map", bikeData, [42.360082, -71.058880])

        // barCharts
        let ridesData = dataHandler.loadRides()
        barCharts = new barChart("trip-length-barchart", ridesData) // , variable)

        // pieChart
        let counts = dataHandler.getMultiLevelCounts();
        const pie_charts = {
            "gender-age": "Gender Pie Chart (Hover for Age)",
            "user-age": "User Pie Chart (Hover for Age)",
            "age-user": "Age Pie Chart (Hover for User)",
        };
        Object.entries(pie_charts).forEach(([chart, title]) => {
            let pieChart = new PieChart(chart + "-pie-chart", title, counts[chart]);
        })

        // Dashboard View
        let lineData = dataHandler.groupDate();
        console.log(lineData);

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

        generalLine = new LineChart("main-line-chart", lineData, "overview", eventHandler);
        memberLine = new LineChart("member-line-chart", lineData, "member");
        genderLine = new LineChart("gender-line-chart", lineData, "gender");
        ageLine = new LineChart("age-line-chart", lineData, "age");
        hourBar = new BarChart("hour-bar-chart", lineData, eventHandler);

        // Bind event handler
        eventHandler.bind("selectionChanged", function(event){
            //console.log("brush")
            let rangeStart = event.detail[0];
            let rangeEnd = event.detail[1];
            memberLine.onSelectionChange(rangeStart, rangeEnd);
            genderLine.onSelectionChange(rangeStart, rangeEnd);
            ageLine.onSelectionChange(rangeStart, rangeEnd);
            hourBar.onSelectionChange(rangeStart, rangeEnd);

        });
        // Bind event handler
        eventHandler.bind("updateLabels", function(event){
            let rangeStart = event.detail[0];
            let rangeEnd = event.detail[1];
            generalLine.onUpdateLabels(rangeStart, rangeEnd);
        });


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
