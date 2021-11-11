function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler();
    // let vis1 = Vis1(dataHandler)
    dataHandler.load().then(() => {
        dataHandler.groupDate();
    })

}
init();

// initialize variables to save linked charts
let linkedCharts = [];
let leftChart;
