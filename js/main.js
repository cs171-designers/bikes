let selectedCategory; // global variable holding form selection - num_Rides or avg_trip_dur
let generalLine, memberLine, genderLine, ageLine; // visuals for dashboard -- defined globally so that categoryChange function can be called

function init() {
    console.log("instantiating Data");
    let dataHandler = new DataHandler("load-status");
    // let vis1 = Vis1(dataHandler)

    // Dashboard view
    // load data
    dataHandler.load().then(() => {

        // pieChart
        let pieChart = new PieChart("pie-chart", dataHandler);

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

        // Bind event handler
        eventHandler.bind("selectionChanged", function(event){
            //console.log("brush")
            let rangeStart = event.detail[0];
            let rangeEnd = event.detail[1];
            memberLine.onSelectionChange(rangeStart, rangeEnd);
            genderLine.onSelectionChange(rangeStart, rangeEnd);
            ageLine.onSelectionChange(rangeStart, rangeEnd);
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
}
init();
