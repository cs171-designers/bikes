// Has two very useful properties but should not be exposed: _rides and _stations
class DataHandler {
    files = [
        // modified to get rid of extra header row
        "data/current_bluebikes_stations.csv",
        "data/Hubway_Stations_as_of_July_2017.csv",
        "data/2018/201801_hubway_tripdata.csv",
        // "data/2018/201802_hubway_tripdata.csv",
        // "data/2018/201803_hubway_tripdata.csv",
        "data/2018/201804-hubway-tripdata.csv",
        "data/2018/201805-bluebikes-tripdata.csv",
        // "data/2018/201806-bluebikes-tripdata.csv",
        // "data/2018/201807-bluebikes-tripdata.csv",
        // "data/2018/201808-bluebikes-tripdata.csv",
        // "data/2018/201809-bluebikes-tripdata.csv",
        // "data/2018/201810-bluebikes-tripdata.csv",
        // "data/2018/201811-bluebikes-tripdata.csv",
        // "data/2018/201812-bluebikes-tripdata.csv",
        // "data/2019/201901-bluebikes-tripdata.csv",
        // "data/2019/201902-bluebikes-tripdata.csv",
        // "data/2019/201903-bluebikes-tripdata.csv",
        // "data/2019/201904-bluebikes-tripdata.csv",
        // "data/2019/201905-bluebikes-tripdata.csv",
        // "data/2019/201906-bluebikes-tripdata.csv",
        // "data/2019/201907-bluebikes-tripdata.csv",
        // "data/2019/201908-bluebikes-tripdata.csv",
        // "data/2019/201909-bluebikes-tripdata.csv",
        // "data/2019/201910-bluebikes-tripdata.csv",
        // "data/2019/201911-bluebikes-tripdata.csv",
        // "data/2019/201912-bluebikes-tripdata.csv",
        // "data/2020/202001-bluebikes-tripdata.csv",
        // "data/2020/202002-bluebikes-tripdata.csv",
        // "data/2020/202003-bluebikes-tripdata.csv",
        // "data/2020/202004-bluebikes-tripdata.csv",
        // "data/2020/202005-bluebikes-tripdata.csv",
        // "data/2020/202006-bluebikes-tripdata.csv",
        // "data/2020/202007-bluebikes-tripdata.csv",
        // "data/2020/202008-bluebikes-tripdata.csv",
        // "data/2020/202009-bluebikes-tripdata.csv",
        // "data/2020/202010-bluebikes-tripdata.csv",
        // "data/2020/202011-bluebikes-tripdata.csv",
        // "data/2020/202012-bluebikes-tripdata.csv",
        // "data/2021/202101-bluebikes-tripdata.csv",
        // "data/2021/202102-bluebikes-tripdata.csv",
        // "data/2021/202103-bluebikes-tripdata.csv",
        // "data/2021/202104-bluebikes-tripdata.csv",
        // "data/2021/202105-bluebikes-tripdata.csv",
        // "data/2021/202106-bluebikes-tripdata.csv",
        // "data/2021/202107-bluebikes-tripdata.csv",
        // "data/2021/202108-bluebikes-tripdata.csv",
        // "data/2021/202109-bluebikes-tripdata.csv",
        "data/2021/202110-blueblikes-tripdata.csv"
    ];
    constructor() {
        console.log("Data constructor");
        this.load();
    }
    load() {
        let dataHandler = this;
        console.log("begin loading")
        Promise.all(this.files.map(f => d3.csv(f, d3.autoType)))
            .then(function ([stations, old_stations, ...data]) {
                console.log(data.length)
                console.log("done", stations, old_stations, data)
                dataHandler._stations = [...stations, ...old_stations].map(item => {
                    if ("Public" in item) {
                        item.Public = (item.Public === "Yes");
                    }
                    return item;
                });
                dataHandler._rides = data.flat(1);
                console.log("data merge", dataHandler._stations, dataHandler._rides)
            })
            .catch(function (err) {
                console.log(err)
            });
    }
}