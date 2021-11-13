function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");
    // let vis1 = Vis1(dataHandler)

    // Dashboard view
    // load data
    dataHandler.load().then(() => {
        let lineData = dataHandler.groupDate();
        console.log(lineData);

       // let pieChart = new PieChart("pie-chart", dataHandler);

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

        let generalLine = new LineChart("main-line-chart", lineData, "overview", eventHandler);
        let memberLine = new LineChart("member-line-chart", lineData, "member");
        let genderLine = new LineChart("gender-line-chart", lineData, "gender");
        let ageLine = new LineChart("age-line-chart", lineData, "age");

        // Bind event handler
        eventHandler.bind("selectionChanged", function(event){
            //console.log("brush")
            let rangeStart = event.detail[0];
            let rangeEnd = event.detail[1];
            memberLine.onSelectionChange(rangeStart, rangeEnd);
            genderLine.onSelectionChange(rangeStart, rangeEnd);
            ageLine.onSelectionChange(rangeStart, rangeEnd);
        });

    });

}
init();
