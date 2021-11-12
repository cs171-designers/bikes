// useful for visualizations let dateFormatter = d3.timeFormat("%Y-%m-%d %H:%M:%S");

// Has two very useful properties but should not be exposed: _rides and _stations
class DataHandler {
    files = [
        // // modified to get rid of extra header row
        "2018/201801_hubway_tripdata.csv",
        "2018/201802_hubway_tripdata.csv",
        "2018/201803_hubway_tripdata.csv",
        "2018/201804-hubway-tripdata.csv",
        "2018/201805-bluebikes-tripdata.csv",
        "2018/201806-bluebikes-tripdata.csv",
        "2018/201807-bluebikes-tripdata.csv",
        "2018/201808-bluebikes-tripdata.csv",
        "2018/201809-bluebikes-tripdata.csv",
        "2018/201810-bluebikes-tripdata.csv",
        "2018/201811-bluebikes-tripdata.csv",
        "2018/201812-bluebikes-tripdata.csv",
        "2019/201901-bluebikes-tripdata.csv",
        "2019/201902-bluebikes-tripdata.csv",
        "2019/201903-bluebikes-tripdata.csv",
        "2019/201904-bluebikes-tripdata.csv",
        "2019/201905-bluebikes-tripdata.csv",
        "2019/201906-bluebikes-tripdata.csv",
        "2019/201907-bluebikes-tripdata.csv",
        "2019/201908-bluebikes-tripdata.csv",
        "2019/201909-bluebikes-tripdata.csv",
        "2019/201910-bluebikes-tripdata.csv",
        "2019/201911-bluebikes-tripdata.csv",
        "2019/201912-bluebikes-tripdata.csv",
    ];
    constructor() {
        console.log("Data constructor");
        this.load();
    }
    load() {
        let dataHandler = this;
        let USE_MIN = true;
        console.log("begin loading", "with min", USE_MIN)
        Promise.all([...this.files.map(f => d3.csv("data/" + (USE_MIN ? "min/" : "") + f, d3.autoType))])
            .then(function ([stations, old_stations, ...data]) {
                //console.log(data.length)
                //console.log("done", stations, old_stations, data)
                dataHandler._stations = [...stations, ...old_stations].map(item => {
                    if ("Public" in item) {
                        item.Public = (item.Public === "Yes");
                    }
                    return item;
                }).filter((item, index, array) => {
                    // filter out duplicate stations
                    return index === array.findIndex(other => item.Number === other.Number);
                });

                dataHandler._rides = data.flat(1);

                // convert times to date objects
                let dateParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
                dataHandler._rides.forEach(d => {
                    if (d.starttime) {
                        d.starttime = dateParser(d.starttime);
                    }
                    if (d.stoptime) {
                        d.stoptime = dateParser(d.stoptime);
                    }
                });

                console.log("data merge", dataHandler._stations, dataHandler._rides);
                console.log("one station");
                console.table(dataHandler._stations[0])
                console.log("one ride");
                console.table(dataHandler._rides[0])
            })
            .catch(function (err) {
                console.log(err)
            });
    }
    age() {
        let dataHandler = this;
        dataHandler._rides.forEach((d, index) => {
            if (index == 0) {
                console.log(d.starttime.getFullYear() - d["birth year"]);
            }

        });

        // all the variable names changed in the later files
        // Also -- lots of null date objects????
    }
}