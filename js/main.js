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

    });

}
init();

// initialize variables to save linked charts
let linkedCharts = [];
