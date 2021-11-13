function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");
    // let vis1 = Vis1(dataHandler)

    // Dashboard view
    // load data
    dataHandler.load().then(() => {
        let lineData = dataHandler.groupDate();
        console.log(lineData);

        let pieChart = new PieChart("pie-chart", dataHandler);

        let generalLine = new LineChart("main-line-chart", lineData, "overview");
        let memberLine = new LineChart("member-line-chart", lineData, "member");
        let genderLine = new LineChart("gender-line-chart", lineData, "gender");
        let ageLine = new LineChart("age-line-chart", lineData, "age");

    });

}
init();
