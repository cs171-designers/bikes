// useful for visualizations let dateFormatter = d3.timeFormat("%Y-%m-%d %H:%M:%S");

// Has two very useful properties but should not be exposed: _rides and _stations
// Converts numeric degrees to radians
let USE_MIN = true; // must be true
let USE_CENTERS = true; // higher ranking
const directory = "data/" + (USE_CENTERS ? "centers/" : (USE_MIN ? "min/" : ""));
CENTERS = {
    "HARVARD": {
        Latitude: 42.374469,
        Longitude: -71.116703
    },
    // "MIT": {
    //     Latitude: 42.360043,
    //     Longitude: -71.094053
    // }
    "HBS": { // includes Allston
        Latitude: 42.365219,
        Longitude: -71.121885
    },
    "HMS": { // includes medical, dential, public health
        Latitude: 42.336425,
        Longitude: -71.103574
    }
}
function toRad(Value) {
    return Value * Math.PI / 180
}
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371 // km
    var dLat = toRad(lat2 - lat1)
    var dLon = toRad(lon2 - lon1)
    var lat1 = toRad(lat1)
    var lat2 = toRad(lat2)

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    var d = R * c
    return d * 0.621371 // km to miles
}
let weekParser = "%Y-%U";
let weekFormat = d3.timeFormat(weekParser);
class DataHandler {
    station_files = [
        "stations.csv",
    ]
    files = [
        // modified to get rid of extra header row
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
    constructor(status_label_id = null) {
        // console.log("Data constructor");
        this.status_label_id = status_label_id;
    }
    statusType = null;
    statusMessage = null;
    loadingDone = false;
    updateStatus() {
        // console.log("updating loading status", this.statusMessage)
        if (this.statusMessage !== null) document.getElementById(this.status_label_id).innerText = this.statusMessage;
        if (this.statusType !== null) document.getElementById(this.status_label_id).classList.add((this.statusType) ? "success" : "error");
    }
    updateStatusCompete() {
        if (this.status_label_id) {
            this.loadingDone = true;
            this.statusType = !!(this._stations && this._rides);
            this.statusMessage = (this._stations && this._rides) ? "Loaded" : "Error Loading";
            // console.log("finished loading files update", this.statusType, this.statusMessage);
            this.updateStatus();
        }
    }
    // filterByCenters(radius = 1) {
    //     if (!this._rides || !this._stations) {
    //         console.error("data is missing so can't filter");
    //         return;
    //     }

    // }
    addStationCounts() {
        this.stationMap = new Map();
        this._stations.forEach((station) => {
            station.start_rides = 0;
            station.end_rides = 0;
            this.stationMap.set(station.Id, station)
        });
        this._rides.forEach((ride) => {
            let start = this.stationMap.get(ride["start station id"]);
            start.start_rides++;
            let end = this.stationMap.get(ride["end station id"]);
            end.end_rides++;
        })
    }
    load = () => {
        let prom = this.loadStations().then(() => {
            return this.loadRides();
        }).then((res) => {
            this.updateStatusCompete();
            return res;
        }).then(res => {
            // this.filterByCenters();
            return res;
        }).finally(() => {
            console.log("finished loading", this.status_label_id)
            this.updateStatusCompete();
            this.loaded = true;
        });
        this.load = () => prom;
        return prom;
    }
    loadStations() {
        let dataHandler = this;
        console.log("loading stations")
        return Promise.all([...this.station_files.map(f => d3.csv(directory + f, d3.autoType))])
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
                // console.log("stations", dataHandler._stations);
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
    parseRideData(data) {
        let rides = data;

        // convert times to date objects
        let dateParser = d3.timeParse("%Y-%m-%d %H:%M:%S");

        rides.forEach(d => {
            if (d.starttime) {
                // add age attribute to data
                d.age = Number(d.starttime.slice(0, 4)) - d["birth year"];
                d.startDateString = d.starttime.slice(0, 10)
                if (d.starttime.length > 20) {
                    d.starttime = dateParser(d.starttime.slice(0, 19)); //slice off the milliseconds... ?
                }
                else {
                    d.starttime = dateParser(d.starttime);
                }
                d.startYearWeekString = weekFormat(d.starttime);

            }
            if (d.stoptime) {
                d.stopDateString = d.stoptime.slice(0, 10);
                if (d.stoptime.length > 20) {
                    d.stoptime = dateParser(d.stoptime.slice(0, 19)); //slice off the milliseconds... ?
                }
                else {
                    d.stoptime = dateParser(d.stoptime);
                }
                d.stopYearWeekString = weekFormat(d.starttime);
            }
        });

        return data;
    }
    loadRides() {
        let dataHandler = this;
        // console.log("loading bikes")
        return Promise.all([...this.files.map(f => d3.csv(directory + f, d3.autoType).then(res => {
            // process ride data
            res = this.parseRideData(res)
            this.ridesLoaded++;
            this.updateRideStatus()
            return res;
        }))])
            .then(function (data) {
                dataHandler._rides = data.flat(1);
                // console.log("rides", dataHandler._rides);
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

        //dataHandler._stations.forEach(d => {
        dataHandler._stations.filter(d => d.Public == true).forEach(d => {
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
            let date = d.startDateString;

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
            let week = d.startYearWeekString;

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

        // filter out undefined values
        let groupedBikesFinal = groupedBikesSorted.filter((a) => a)

        // console.log("TRIPS GROUPED BY BIKE ID, CHRONOLOGICAL ORDER", groupedBikesFinal)
        return groupedBikesFinal
    }

    // group stations by arrivals
    groupStationArrivals() {
        let datahandler = this
        let groupedStationArrivals = {}

        datahandler._rides.forEach(d => {
            let stationId = d["start station id"]

            if (groupedStationArrivals[stationId]) {
                groupedStationArrivals[stationId].push(d)
            }
            else {
                groupedStationArrivals[stationId] = [d]
            }
        })

        let groupedArrivalsSorted = {}
        Object.values(groupedStationArrivals).forEach(d => {
            let sortedStation = d.sort(function (a, b) {
                return a.starttime - b.starttime
            });
            groupedArrivalsSorted[d[0]["start station id"]] = sortedStation
        })

        // console.log("grouped arrivals", groupedArrivalsSorted)

        return groupedArrivalsSorted
    }

    // group stations by departures
    groupStationDepartures() {
        let datahandler = this
        let groupedStationDepartures = {}

        datahandler._rides.forEach(d => {
            let stationId = d["end station id"]

            if (groupedStationDepartures[stationId]) {
                groupedStationDepartures[stationId].push(d)
            }
            else {
                groupedStationDepartures[stationId] = [d]
            }
        })

        let groupedDeparturesSorted = {}
        Object.values(groupedStationDepartures).forEach(d => {
            let sortedStation = d.sort(function (a, b) {
                return a.starttime - b.starttime
            });
            groupedDeparturesSorted[d[0]["end station id"]] = sortedStation
        })

        // console.log("grouped departures", groupedDeparturesSorted)

        return groupedDeparturesSorted
    }

    count_filters = {
        user: {
            "All": filtered_array => filtered_array,
            "Subscriber": filtered_array => filtered_array.filter(ride => ride.usertype === "Subscriber"),
            "Customer": filtered_array => filtered_array.filter(ride => ride.usertype === "Customer"),
            "Unspecified": filtered_array => filtered_array.filter(ride => ride.usertype !== "Subscriber" && ride.usertype !== "Customer"),
        },
        age: {
            "All": filtered_array => filtered_array,
            "Youth (<18)": filtered_array => filtered_array.filter(ride => ride.age < 18),
            "Adult (18-28)": filtered_array => filtered_array.filter(ride => ride.age >= 18 && ride.age < 25),
            "Adult (28-38)": filtered_array => filtered_array.filter(ride => ride.age >= 28 && ride.age < 38),
            "Adult (38-48)": filtered_array => filtered_array.filter(ride => ride.age >= 38 && ride.age < 48),
            "Adult (48-58)": filtered_array => filtered_array.filter(ride => ride.age >= 48 && ride.age < 58),
            "Adult (58-68)": filtered_array => filtered_array.filter(ride => ride.age >= 58 && ride.age < 68),
            "Adult (68-78)": filtered_array => filtered_array.filter(ride => ride.age >= 68 && ride.age < 78),
            "Adult (78-88)": filtered_array => filtered_array.filter(ride => ride.age >= 78 && ride.age < 88),
            "Adult (88+)": filtered_array => filtered_array.filter(ride => ride.age >= 88),
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
        // console.log("counts", counts)
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