// useful for visualizations let dateFormatter = d3.timeFormat("%Y-%m-%d %H:%M:%S");

// Has two very useful properties but should not be exposed: _rides and _stations
class DataHandler {
    station_files = [
        "stations.csv",
    ]
    files = [
        // // modified to get rid of extra header row
        "2018/201801_hubway_tripdata.csv",
        "2018/201802_hubway_tripdata.csv",
        // "2018/201803_hubway_tripdata.csv",
        // "2018/201804-hubway-tripdata.csv",
        "2018/201805-bluebikes-tripdata.csv",
        "2018/201806-bluebikes-tripdata.csv",
        "2018/201807-bluebikes-tripdata.csv",
        // "2018/201808-bluebikes-tripdata.csv",
        // "2018/201809-bluebikes-tripdata.csv",
        // "2018/201810-bluebikes-tripdata.csv",
        // "2018/201811-bluebikes-tripdata.csv",
        // "2018/201812-bluebikes-tripdata.csv",
        // "2019/201901-bluebikes-tripdata.csv",
        // "2019/201902-bluebikes-tripdata.csv",
        // "2019/201903-bluebikes-tripdata.csv",
        // "2019/201904-bluebikes-tripdata.csv",
        // "2019/201905-bluebikes-tripdata.csv",
        // "2019/201906-bluebikes-tripdata.csv",
        // "2019/201907-bluebikes-tripdata.csv",
        // "2019/201908-bluebikes-tripdata.csv",
        // "2019/201909-bluebikes-tripdata.csv",
        // "2019/201910-bluebikes-tripdata.csv",
        "2019/201911-bluebikes-tripdata.csv",
        "2019/201912-bluebikes-tripdata.csv",
    ];
    constructor() {
        console.log("Data constructor");
    }
    load() {
        return this.loadStations().then(() => {
            return this.loadRides();
        })
    }
    loadStations() {
        let USE_MIN = true; // must be true
        let dataHandler = this;
        console.log("loading stations")
        return Promise.all([...this.station_files.map(f => d3.csv("data/" + (USE_MIN ? "min/" : "") + f, d3.autoType))])
            .then(([stations]) => {
                dataHandler._stations = stations.map(item => {
                    if ("Public" in item) {
                        item.Public = (item.Public === "Yes");
                    }
                    return item;
                })
                // .filter((item, index, array) => {
                //     // filter out duplicate stations
                //     return index === array.findIndex(other => item.Number === other.Number);
                // });
                console.log("stations", dataHandler._stations);
                console.log("one station");
                console.table(dataHandler._stations[0]);
                return dataHandler._stations;
            })
            .catch(function (err) {
                console.log(err);
            }).finally(() => {
                console.log("finished loading stations")
            });
    }
    loadRides() {
        let dataHandler = this;
        let USE_MIN = true;
        console.log("loading bikes")
        return Promise.all([...this.files.map(f => d3.csv("data/" + (USE_MIN ? "min/" : "") + f, d3.autoType))])
            .then(function (data) {
                // process ride data
                dataHandler._rides = data.flat(1);

                // convert times to date objects
                let dateParser = d3.timeParse("%Y-%m-%d %H:%M:%S");

                let dateParser2 = d3.timeParse("%Y-%m-%d %H:%M:%S"); // later csv have starttime with seconds with decimals. eg 42 sec vs. 42.48 seconds.

                dataHandler._rides.forEach(d => {
                    if (d.starttime) {
                        // add age attribute to data
                        d.age = Number(d.starttime.slice(0, 4)) - d["birth year"];
                        d.starttime = dateParser(d.starttime);
                    }
                    if (d.stoptime) {
                        d.stoptime = dateParser(d.stoptime);
                    }
                    let getYear = d3.timeParse("%Y");
                    // d.age = getYear(d.starttime) //- d["birth year"];
                });

                console.log("rides", dataHandler._rides);
                console.log("one ride");
                console.table(dataHandler._rides[0])
            })
            .catch(function (err) {
                console.log(err);
            }).finally(() => {
                console.log("finished loading bikes")
            });
    }
    // group data by date
    groupDate() {
        let dataHandler = this;
        let groupedDate = {};

        dataHandler._rides.forEach(d => {
            let timeFormat = d3.timeFormat("%Y-%m-%d");
            let date = timeFormat(d.starttime);

            if (groupedDate[date]) {
                groupedDate[date].push(d);
            }
            else {
                groupedDate[date] = [d];
            }
        })
        //console.log(groupedDate);
        return groupedDate;

    }
}