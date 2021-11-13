const fs = require('fs')
const csv = require('csv-parser')

// const input_filename = '2018/201809-bluebikes-tripdata.csv';
const files = [
    // modified to get rid of extra header row
    // "data/current_bluebikes_stations.csv",
    // "data/Hubway_Stations_as_of_July_2017.csv",
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
    // 
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
    // 
    // "2020/202001-bluebikes-tripdata.csv",
    // "2020/202002-bluebikes-tripdata.csv",
    // "2020/202003-bluebikes-tripdata.csv",
    // "2020/202004-bluebikes-tripdata.csv",
    // "2020/202005-bluebikes-tripdata.csv",
    // "2020/202006-bluebikes-tripdata.csv",
    // "2020/202007-bluebikes-tripdata.csv",
    // "2020/202008-bluebikes-tripdata.csv",
    // "2020/202009-bluebikes-tripdata.csv",
    // "2020/202010-bluebikes-tripdata.csv",
    // "2020/202011-bluebikes-tripdata.csv",
    // "2020/202012-bluebikes-tripdata.csv",
    // //
    // "2021/202101-bluebikes-tripdata.csv",
    // "2021/202102-bluebikes-tripdata.csv",
    // "2021/202103-bluebikes-tripdata.csv",
    // "2021/202104-bluebikes-tripdata.csv",
    // "2021/202105-bluebikes-tripdata.csv",
    // "2021/202106-bluebikes-tripdata.csv",
    // "2021/202107-bluebikes-tripdata.csv",
    // "2021/202108-bluebikes-tripdata.csv",
    // "2021/202109-bluebikes-tripdata.csv",
    // "2021/202110-blueblikes-tripdata.csv"
];
const output_filename = input_filename => 'min/' + input_filename;

const stations = [];
const stations_map = new Map();
fs.createReadStream("current_bluebikes_stations.csv")
    .pipe(csv())
    .on('data', function (row) {
        const formatted_row = {
            "Id": null,
            ...row,
            Latitude: Number(row.Latitude),
            Longitude: Number(row.Longitude)
        }
        stations.push(formatted_row)
    })
    .on('end', function () {
        fs.createReadStream("Hubway_Stations_as_of_July_2017.csv")
            .pipe(csv())
            .on('data', function (row) {
                const formatted_row = {
                    "Id": null,
                    ...row,
                    Latitude: Number(row.Latitude),
                    Longitude: Number(row.Longitude)
                }
                if (!stations.find(s => s.Number === formatted_row.Number)) {
                    // Only add stations if they are not in new registry
                    stations.push(formatted_row)
                }
                stations.forEach(stat => stations_map.set(stat.Name, stat))
            })
            .on('end', function () {
                read_csv(files, 0);
            })
    })

function add_or_update_station(stations, row, start_or_end) {
    const stat = stations_map.get(row[`${start_or_end} station name`])
    // console.log(!!stat);
    if (stat) {
        stat["Id"] = row[`${start_or_end} station id`]
    } else {
        stations_map.set(row[`${start_or_end} station name`], {
            "Id": row[`${start_or_end} station id`],
            "Number": null,
            "Name": row[`${start_or_end} station name`],
            "Latitude": row[`${start_or_end} station latitude`],
            "Longitude": row[`${start_or_end} station longitude`],
            "District": null,
            "Public": null,
            "Total docks": null
        })
    }
}
function read_csv(arr, file_index) {
    if (arr.length <= file_index) {
        console.log("done");
        writeToCSVFile(Array.from(stations_map.values()), output_filename("stations.csv"));
        console.log("finished writing station file ");
        return;
    }
    const input_filename = arr[file_index];
    const formatted_rows = [];
    fs.createReadStream(input_filename)
        .pipe(csv())
        .on('data', function (row) {
            const formatted_row = {
                ...row
            }
            delete formatted_row["end station latitude"];
            delete formatted_row["end station longitude"];
            delete formatted_row["end station name"];
            delete formatted_row["start station latitude"];
            delete formatted_row["start station longitude"];
            delete formatted_row["start station name"];
            formatted_rows.push(formatted_row)
            // Add station id to station list
            add_or_update_station(stations, row, "start");
            add_or_update_station(stations, row, "end");
        })
        .on('end', function () {
            // console.table(formatted_rows)
            // TODO: SAVE formatted_rows data to another file
            writeToCSVFile(formatted_rows, output_filename(input_filename));
            console.log("finished writing file " + (file_index + 1))
            read_csv(files, file_index + 1)
        })
}



function writeToCSVFile(formatted_rows, filename) {
    fs.writeFile(filename, extractAsCSV(formatted_rows), err => {
        if (err) {
            console.log('Error writing to csv file', err);
        } else {
            console.log(`saved as ${filename}`);
        }
    });
}

function extractAsCSV(formatted_rows) {
    const headers = Object.keys(formatted_rows[0]);
    const header = [headers.join(",")]
    const rows = formatted_rows.map(formatted_row =>
        headers.map(k => formatted_row[k]).join(",")
    );
    return header.concat(rows).join("\n");
}

