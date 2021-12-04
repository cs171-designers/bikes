let selectedCategory; // global variable holding form selection - num_Rides or avg_trip_dur
let generalLine, memberLine, genderLine, ageLine; // visuals for dashboard -- defined globally so that categoryChange function can be called
let bikeMap;
let stationDashboard;
let nightingale;
let barChartsMost;
let barChartsLeast;
let selectedDashboardView;
let hourBar, hourBarDuration;
let dataHandler = new DataHandler("load-status");
// switch between num_rides and avg_trip_dur
function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    generalLine.updateVis();
    memberLine.updateVis();
    genderLine.updateVis();
    ageLine.updateVis();
    //hourBar.updateVis();
}
class Slide {
    rendered = false;
    constructor(page, renderFn) {
        this.page = page;
        this.renderFn = renderFn;
    }
    setAsRendered() {
        document.querySelectorAll(".pp-section").forEach((section, index) => {
            if ((index + 1) > this.page) {
                return;
            }
            // console.log("section", section, this.page, index);
            const statuses = section.querySelectorAll(".load-status");
            // console.log("statuses", statuses, this.page, index);
            statuses.forEach(stat => {
                stat.style.display = 'none';
            })
        })
    }
    render() {
        if (!this.rendered) {
            this.rendered = true;
            // console.log("rendering slide", this.page)
            dataHandler.load().then(() => {
                this.renderFn();
                this.setAsRendered();
            });
        }
        // console.log("slide rendered", this.page)
    }
}
// CHANGE HERE IS SLIDES CHANGE
const slides = [
    new Slide(1, function () { }),
    new Slide(3, function () {
        let bikeData = dataHandler.groupBikeID()
        bikeMap = new BlueBikeMap("bike-map", bikeData, dataHandler._stations, [42.360082, -71.058880])

        let arrivalData = dataHandler.groupStationArrivals()
        let departureData = dataHandler.groupStationDepartures()
        selectedDashboardView = document.getElementById("map-dashboard-dropdown").value

        stationDashboard = new BlueBikeMapDashboard("station-dashboard", arrivalData, departureData, dataHandler._stations, [42.374443, -71.116943])
    }),
    new Slide(4, function () {
        // barCharts
        let ridesData = dataHandler.groupStation();
        let stationData = dataHandler.getStationCoords();
        barChartsMost = new StationBarChart("trip-length-barchart-most", ridesData, stationData, true); // , variable)
        barChartsLeast = new StationBarChart("trip-length-barchart-least", ridesData, stationData, false);
    }),
    new Slide(5, function () {
        // Data for Line Charts
        let dayParser = "%Y-%m-%d";
        let weekParser = "%Y-%U";

        // switch data between lineData and weekData?
        const USE_WEEKS = true;
        let dateParser = (USE_WEEKS) ? weekParser : dayParser;
        let lineData = (USE_WEEKS) ? dataHandler.groupWeek() : dataHandler.groupDate();

        // bar charts of distribution of rides start time
        // hourBar = new DashBarChart("hour-bar-chart", lineData, "num_rides", dateParser);
        // hourBarDuration = new DashBarChart("hour-bar-chart-duration", lineData, "avg_trip_dur", dateParser);

        // Create Nightingale Chart
        // nightingale = new NightingaleChart("nightingale-chart", lineData, "num_rides", dateParser);
    }),
    new Slide(7, function () {
        // pieChart
        let counts = dataHandler.getMultiLevelCounts();
        // console.log("multi counts", counts)
        const pie_charts = {
            "gender-age": ["Gender Pie Chart (Hover for Age)", d3.schemeSet1],
            "user-age": ["User Pie Chart (Hover for Age)", d3.schemeDark2],
            "age-user": ["Age Pie Chart (Hover for User)", d3.schemeSet1],
        };
        Object.entries(pie_charts).forEach(([chart, [title, colors]]) => {
            let pieChart = new PieChart(chart + "-pie-chart", title, counts[chart], colors);
        })
    }),
    new Slide(8, function () {
        // Data for Line Charts
        let dayParser = "%Y-%m-%d";
        let dayData = dataHandler.groupDate();
        // console.log(lineData);

        let weekParser = "%Y-%U";
        let weekData = dataHandler.groupWeek();
        // console.log("aggregated", weekData);

        // switch data between lineData and weekData?
        const USE_WEEKS = true;
        let dateParser = (USE_WEEKS) ? weekParser : dayParser;
        let lineData = (USE_WEEKS) ? weekData : dayData;

        // Create Dashboard

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

        generalLine = new LineChart("main-line-chart", lineData, "overview", eventHandler, dateParser);
        memberLine = new LineChart("member-line-chart", lineData, "member", null, dateParser);
        genderLine = new LineChart("gender-line-chart", lineData, "gender", null, dateParser);
        ageLine = new LineChart("age-line-chart", lineData, "age", null, dateParser);

        // Bind event handler
        eventHandler.bind("selectionChanged", function (event) {
            //console.log("brush")
            let rangeStart = !!event.detail ? event.detail[0] : null;
            let rangeEnd = !!event.detail ? event.detail[1] : null;
            memberLine.onSelectionChange(rangeStart, rangeEnd);
            genderLine.onSelectionChange(rangeStart, rangeEnd);
            ageLine.onSelectionChange(rangeStart, rangeEnd);
            //hourBar.onSelectionChange(rangeStart, rangeEnd);

        });
        // Bind event handler
        eventHandler.bind("updateLabels", function (event) {
            let rangeStart = !!event.detail ? event.detail[0] : null;
            let rangeEnd = !!event.detail ? event.detail[1] : null;
            generalLine.onUpdateLabels(rangeStart, rangeEnd);
        });

    }),
];
slides.sort((a, b) => a.page - b.page);
const renderOffset = +1;
prepareSlide = (_nextSlide) => {
    const slideIndex = _nextSlide + renderOffset;
    slides.forEach((slide) => {
        if (slide.page <= slideIndex) {
            slide.render();
        }
    })
}

