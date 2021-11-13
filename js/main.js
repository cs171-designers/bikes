function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");
    // let vis1 = Vis1(dataHandler)

    // Dashboard view
    // load data
    dataHandler.load().then(() => {
        let lineData = dataHandler.groupDate();
        console.log(lineData);

        let generalLine = new LineChart("main-line-chart", lineData);

        let counts = dataHandler.getMultiLevelCounts();
        const pie_charts = {
            "gender-age": "Gender Pie Chart (Hover for Age)",
            "user-age": "User Pie Chart (Hover for Age)",
            "age-user": "Age Pie Chart (Hover for User)",
        };
        Object.entries(pie_charts).forEach(([chart, title]) => {
            let pieChart = new PieChart(chart + "-pie-chart", title, counts[chart]);
        })
    });

}
init();

// initialize variables to save linked charts
let linkedCharts = [];
