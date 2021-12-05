const sectionSelector = "[data-lazy-section]";
let selectedCategory; // global variable holding form selection - num_Rides or avg_trip_dur
let generalLine, memberLine, genderLine, ageLine; // visuals for dashboard -- defined globally so that categoryChange function can be called
let bikeMap;
let stationDashboard;
let nightingale;
let barChartsMost;
let barChartsLeast;
let selectedDashboardView;
let dataHandler = new DataHandler("load-status");

// switch between num_rides and avg_trip_dur
function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    generalLine.updateVis();
    memberLine.updateVis();
    genderLine.updateVis();
    ageLine.updateVis();
}
class Slide {
    rendered = false;
    constructor(page, renderFn) {
        this.page = page;
        this.renderFn = renderFn;
    }
    setAsLoading() {
        document.querySelectorAll(`[data-lazy-section=${this.page}]`).forEach((section, index) => {
            if ((index + 1) > this.page) {
                return;
            }
            // console.log("section", section, this.page, index);
            const statuses = section.querySelectorAll(".load-status");
            // console.log("statuses", statuses, this.page, index);
            statuses.forEach(stat => {
                stat.innerHTML = "Loading..."
            })
        })
    }
    setAsRendered() {
        document.querySelectorAll(`[data-lazy-section=${this.page}]`).forEach((section, index) => {
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
            this.setAsLoading();
            // console.log("rendering slide", this.page)
            window.setTimeout(() => {
                dataHandler.load().then(() => {
                    this.renderFn();
                    this.setAsRendered();
                });
            }, 20);
        }
        // console.log("slide rendered", this.page)
    }
}
function start() {
    let s = new Slide(null, function () { });
    s.render();
}
start();
// CHANGE HERE IS SLIDES CHANGE
let slides = [
    // new Slide("", function () { }),
    new Slide("bike-map", function () {
        let bikeData = dataHandler.groupBikeID()
        bikeMap = new BlueBikeMap("bike-map", bikeData, dataHandler._stations, [42.360082, -71.058880])
    }),
    new Slide("station-map", function () {
        let arrivalData = dataHandler.groupStationArrivals()
        let departureData = dataHandler.groupStationDepartures()
        selectedDashboardView = document.getElementById("map-dashboard-dropdown").value

        stationDashboard = new BlueBikeMapDashboard("station-dashboard", arrivalData, departureData, dataHandler._stations, [42.374443, -71.116943])

        //console.log()
    }),
    new Slide("trip-bar", function () {
        // barCharts
        let ridesData = dataHandler.groupStation();
        let stationData = dataHandler.getStationCoords();
        barChartsMost = new StationBarChart("trip-length-barchart-most", ridesData, stationData, true); // , variable)
        barChartsLeast = new StationBarChart("trip-length-barchart-least", ridesData, stationData, false);
    }),
    new Slide("nightingale-chart", function () {
        // Data
        let dayParser = "%Y-%m-%d";
        let weekParser = "%Y-%U";

        // switch data between grouped by week or day
        const USE_WEEKS = true;
        let dateParser = (USE_WEEKS) ? weekParser : dayParser;
        let lineData = (USE_WEEKS) ? dataHandler.groupWeek() : dataHandler.groupDate();

        // Create Nightingale Chart
        nightingale = new NightingaleChart("nightingale-chart", lineData, "num_rides", dateParser);
    }),
    new Slide("pie-charts", function () {
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
    new Slide("line-charts", function () {
        let dayParser = "%Y-%m-%d";
        let weekParser = "%Y-%U";

        // switch data between lineData and weekData?
        const USE_WEEKS = true;
        let dateParser = (USE_WEEKS) ? weekParser : dayParser;
        let lineData = (USE_WEEKS) ? dataHandler.groupWeek() : dataHandler.groupDate();

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
prepareSlide = (_nextSlide) => {
    const slideIndex = _nextSlide;
    slides.forEach((slide) => {
        if (slide.page == slideIndex) {
            slide.render();
        }
    })
}
const scrollLoadOffset = 200;
document.addEventListener("DOMContentLoaded", function () {
    let lazySections = [].slice.call(document.querySelectorAll(sectionSelector)).map((el, index) => {
        return {
            el: el,
            index: index
        }
    });
    // console.log("lazy slides", lazySections);
    let active = false;

    const lazyLoad = function () {
        if (active === false) {
            active = true;

            window.setTimeout(function () {
                lazySections.forEach(function (obj) {
                    let index = obj.index;
                    let section = obj.el;
                    if ((section.getBoundingClientRect().top <= window.innerHeight + scrollLoadOffset && section.getBoundingClientRect().bottom >= 0 - scrollLoadOffset) && getComputedStyle(section).display !== "none") {
                        prepareSlide(section.dataset.lazySection);
                        console.log("preparing slide", section.dataset.lazySection, section)

                        lazySections = lazySections.filter(function (sec) {
                            return sec !== section;
                        });

                        if (lazySections.length === 0) {
                            document.removeEventListener("scroll", lazyLoad);
                            window.removeEventListener("resize", lazyLoad);
                            window.removeEventListener("orientationchange", lazyLoad);
                        }
                    }
                });

                active = false;
            }, 200);
        }
    };

    document.addEventListener("scroll", lazyLoad);
    window.addEventListener("resize", lazyLoad);
    window.addEventListener("orientationchange", lazyLoad);
    lazyLoad();
});

function myFunction() {
    var x = document.getElementById("myDIV");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else if (x.style.display === "block") {
        x.style.display = "none";
    }
    else {
        x.style.display = "block";
    }
}