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
    constructor(status_label_id = null) {
        console.log("Data constructor");
        this.status_label_id = status_label_id;
    }
    load() {
        return this.loadStations().then(() => {
            return this.loadRides();
        }).finally(() => {
            if (this.status_label_id) {
                document.getElementById(this.status_label_id).innerText = (this._stations && this._rides) ? "Loaded" : "Error Loading";
                document.getElementById(this.status_label_id).classList.add((this._stations && this._rides) ? "success" : "error");
            }
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

    getRideCounts() {
        const filters = {
            user: {
                user_all: filtered_array => filtered_array,
                user_subscriber: filtered_array => filtered_array.filter(ride => ride.usertype === "Subscriber"),
                user_customer: filtered_array => filtered_array.filter(ride => ride.usertype === "Customer"),
                user_unspecified: filtered_array => filtered_array.filter(ride => ride.usertype === "Subscriber" && ride.usertype !== "Customer"),
            },
            age: {
                age_all: filtered_array => filtered_array,
                age_youth: filtered_array => filtered_array.filter(ride => ride.age < 18),
                age_young_adult: filtered_array => filtered_array.filter(ride => ride.age >= 18 && ride.age < 25),
                age_adult: filtered_array => filtered_array.filter(ride => ride.age >= 25),
                age_missing: filtered_array => filtered_array.filter(ride => ride.age != 0 && !ride.age),
            },
            gen: {
                gen_all: filtered_array => filtered_array,
                gen_male: filtered_array => filtered_array.filter(ride => ride.gender === 1),
                gen_female: filtered_array => filtered_array.filter(ride => ride.gender === 2),
                gen_unspecified: filtered_array => filtered_array.filter(ride => ride.gender !== 2 && ride.gender !== 1),
            },
        }
        let counts = {};
        let data = this._rides;
        Object.entries(filters.user).forEach(([u_key, u_val]) => {
            let users = u_val(data);
            Object.entries(filters.age).forEach(([a_key, a_val]) => {
                let age = a_val(users);
                Object.entries(filters.gen).forEach(([s_key, s_val]) => {
                    let sex = s_val(age);
                    counts[`${u_key}_${a_key}_${s_key}`] = sex.length;
                })
            })
        });
        console.log("counts", counts)
        return counts;
    }
    queryCounts(counts, user, age, sex) {
        return counts[`${user}_${age}_${sex}`]
    }

}