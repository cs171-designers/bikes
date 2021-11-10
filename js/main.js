let promises = [
    d3.csv("data/2018/201801_hubway_tripdata.csv"),
    d3.csv("data/2018/201802_hubway_tripdata.csv"),
    /*
    d3.csv("data/2018/201803_hubway_tripdata.csv"),
    d3.csv("data/2018/201804-hubway-tripdata.csv"),
    d3.csv("data/2018/201805-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201806-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201807-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201808-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201809-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201810-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201811-bluebikes-tripdata.csv"),
    d3.csv("data/2018/201812-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201901-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201902-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201903-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201904-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201905-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201906-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201907-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201908-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201909-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201910-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201911-bluebikes-tripdata.csv"),
    d3.csv("data/2019/201912-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202001-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202002-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202003-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202004-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202005-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202006-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202007-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202008-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202009-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202010-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202011-bluebikes-tripdata.csv"),
    d3.csv("data/2020/202012-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202101-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202102-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202103-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202104-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202105-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202106-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202107-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202108-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202109-bluebikes-tripdata.csv"),
    d3.csv("data/2021/202110-blueblikes-tripdata.csv")
    */
];

Promise.all(promises)
    .then(function (data) {
        createVis(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function createVis(data) {
    console.log(data.length)
    console.log("done")
}