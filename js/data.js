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
        "2018/201803_hubway_tripdata.csv",
        "2018/201804-hubway-tripdata.csv",
        "2018/201805-bluebikes-tripdata.csv",
        // "2018/201806-bluebikes-tripdata.csv",
        // "2018/201807-bluebikes-tripdata.csv",
        // "2018/201808-bluebikes-tripdata.csv",
        // "2018/201809-bluebikes-tripdata.csv",
        // "2018/201810-bluebikes-tripdata.csv",
        // "2018/201811-bluebikes-tripdata.csv",
        // "2018/201812-bluebikes-tripdata.csv",
        // "2019/201901-bluebikes-tripdata.csv",
        // "2019/201902-bluebikes-tripdata.csv",
        // "2019/201903-bluebikes-tripdata.csv",
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
    constructor(status_label_id = null) {
        console.log("Data constructor");
        this.status_label_id = status_label_id;
    }
    statusType = null;
    statusMessage = null;
    loadingDone = false;
    updateStatus() {
        console.log("updating loading status", this.statusMessage)
        if (this.statusMessage !== null) document.getElementById(this.status_label_id).innerText = this.statusMessage;
        if (this.statusType !== null) document.getElementById(this.status_label_id).classList.add((this.statusType) ? "success" : "error");
    }
    updateStatusCompete() {
        if (this.status_label_id) {
            this.loadingDone = true;
            this.statusType = !!(this._stations && this._rides);
            this.statusMessage = (this._stations && this._rides) ? "Loaded" : "Error Loading";
            console.log("finished loading files update", this.statusType, this.statusMessage);
            this.updateStatus();
        }
    }
    load() {
        return this.loadStations().then(() => {
            return this.loadRides();
        }).then((res) => {
            this.updateStatusCompete();
            return res;
        }).finally(() => {
            console.log("finished loading", this.status_label_id)
            this.updateStatusCompete(); 
        });
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
    ridesLoaded = 1;
    updateRideStatus() {
        if (this.loadingDone) return;
        this.statusMessage = `Loading (${this.ridesLoaded}/${this.files.length} files loaded)...`
        this.updateStatus();
    }
    loadRides() {
        let dataHandler = this;
        let USE_MIN = true;
        console.log("loading bikes")
        return Promise.all([...this.files.map(f => d3.csv("data/" + (USE_MIN ? "min/" : "") + f, d3.autoType).then(res => {
            this.ridesLoaded++;
            this.updateRideStatus()
            return res;
        }))])
            .then(function (data) {
                // process ride data
                dataHandler._rides = data.flat(1);

                // convert times to date objects
                let dateParser = d3.timeParse("%Y-%m-%d %H:%M:%S");

                dataHandler._rides.forEach(d => {
                    if (d.starttime) {
                        // add age attribute to data
                        d.age = Number(d.starttime.slice(0, 4)) - d["birth year"];
                        if (d.starttime.length > 20) {
                            d.starttime = dateParser(d.starttime.slice(0, 19)); //slice off the milliseconds... ?
                        }
                        else {
                            d.starttime = dateParser(d.starttime);
                        }

                    }
                    if (d.stoptime) {
                        if (d.stoptime.length > 20) {
                            d.stoptime = dateParser(d.stoptime.slice(0, 19)); //slice off the milliseconds... ?
                        }
                        else {
                            d.stoptime = dateParser(d.stoptime);
                        }
                    }
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

    // get station coordinates
    getStationCoords() {
        let dataHandler = this;
        let stationCoords = {};

        dataHandler._stations.forEach(d => {
            let station = d["Id"];

            if (stationCoords[station]) {
                stationCoords[station].push(d);
            }
            else {
                stationCoords[station] = [d];
            }
        })
        //console.log(groupedDate);
        return stationCoords;
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
        return groupedDate;
    }
    // group data by day (1 week view)
    groupWeek() {
        let dataHandler = this;
        let groupedWeek = {};

        dataHandler._rides.forEach(d => {
            let weekFormat = d3.timeFormat("%U-%Y"); // Sunday-based week of the year as a decimal number [00, 53]
            let week = weekFormat(d.starttime);

            if (groupedWeek[week]) {
                groupedWeek[week].push(d);
            }
            else {
                groupedWeek[week] = [d];
            }
        })
        return groupedWeek;
    }

    // group data by station id
    groupStation() {
        let dataHandler = this;
        let groupedStation = [];

        dataHandler._rides.forEach(d => {
            let station = d["start station id"]

            if (groupedStation[station]) {
                groupedStation[station].push(d);
            }
            else {
                groupedStation[station] = [d];
            }
        })
        //console.log(groupedStation);
        return groupedStation;
    }

    // group data by bike id
    groupBikeID() {
        let dataHandler = this
        let groupedBikes = []

        dataHandler._rides.forEach(d => {
            let bikeID = d.bikeid

            if (groupedBikes[bikeID]) {
                groupedBikes[bikeID].push(d)
            }
            else {
                groupedBikes[bikeID] = [d]
            }
        })

        let groupedBikesSorted = []

        groupedBikes.forEach(d => {
            let sortedBike = d.sort(function (a, b) {
                return a.starttime - b.starttime
            });
            groupedBikesSorted[d[0].bikeid] = sortedBike
        })


        console.log("TRIPS GROUPED BY BIKE ID, CHRONOLOGICAL ORDER", groupedBikesSorted)
        return groupedBikesSorted
    }

    count_filters = {
        user: {
            "All": filtered_array => filtered_array,
            "Subscriber": filtered_array => filtered_array.filter(ride => ride.usertype === "Subscriber"),
            "Customer": filtered_array => filtered_array.filter(ride => ride.usertype === "Customer"),
            "Unspecified": filtered_array => filtered_array.filter(ride => ride.usertype === "Subscriber" && ride.usertype !== "Customer"),
        },
        age: {
            "All": filtered_array => filtered_array,
            "Youth (<18)": filtered_array => filtered_array.filter(ride => ride.age < 18),
            "Young Adult (18-25)": filtered_array => filtered_array.filter(ride => ride.age >= 18 && ride.age < 25),
            "Adult (25+)": filtered_array => filtered_array.filter(ride => ride.age >= 25),
            "Missing": filtered_array => filtered_array.filter(ride => ride.age != 0 && !ride.age),
        },
        gen: {
            "All": filtered_array => filtered_array,
            "Male": filtered_array => filtered_array.filter(ride => ride.gender === 1),
            "Female": filtered_array => filtered_array.filter(ride => ride.gender === 2),
            "Unspecified": filtered_array => filtered_array.filter(ride => ride.gender !== 2 && ride.gender !== 1),
        },
    }
    getRideCounts() {
        let counts = {};
        let data = this._rides;
        Object.entries(count_filters.user).forEach(([u_key, u_val]) => {
            let users = u_val(data);
            Object.entries(count_filters.age).forEach(([a_key, a_val]) => {
                let age = a_val(users);
                Object.entries(count_filters.gen).forEach(([s_key, s_val]) => {
                    let sex = s_val(age);
                    counts[`user_${u_key}_age_${a_key}_gen_${s_key}`] = sex.length;
                })
            })
        });
        console.log("counts", counts)
        return counts;
    }
    getMultiLevelCounts() {
        return {
            "gender-age": Object.entries(this.count_filters.gen).filter(([key]) => key !== "All").map(([g_key, g_val]) => {
                return {
                    label: g_key,
                    value: g_val(this._rides).length,
                    components: Object.entries(this.count_filters.age).filter(([key]) => key !== "All").map(([key, filter]) => ({
                        label: g_key + ": " + key,
                        value: filter(g_val(this._rides)).length
                    }))
                }
            }),
            "user-age": Object.entries(this.count_filters.user).filter(([key]) => key !== "All").map(([g_key, g_val]) => {
                return {
                    label: g_key,
                    value: g_val(this._rides).length,
                    components: Object.entries(this.count_filters.age).filter(([key]) => key !== "All").map(([key, filter]) => ({
                        label: g_key + ": " + key,
                        value: filter(g_val(this._rides)).length
                    }))
                }
            }),
            "age-user": Object.entries(this.count_filters.age).filter(([key]) => key !== "All").map(([g_key, g_val]) => {
                return {
                    label: g_key,
                    value: g_val(this._rides).length,
                    components: Object.entries(this.count_filters.user).filter(([key]) => key !== "All").map(([key, filter]) => ({
                        label: g_key + ": " + key,
                        value: filter(g_val(this._rides)).length
                    }))
                }
            }),
        }
    }
    queryCounts(counts, user, age, sex) {
        return counts[`${user}_${age}_${sex}`]
    }

}