/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */


class PieChart {

    // constructor method to initialize Timeline object
    constructor(parentElement, title, data) {
        this.parentElement = parentElement;
        this.circleColors = d3.schemeSet1;
        this.secondaryColors = d3.schemeSet3;
        // console.log("coloirs", this.circleColors, this.secondaryColors)
        this.title = title;
        this.data = data;

        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = { top: 10, right: 50, bottom: 10, left: 50 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text(vis.title)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // pie chart setup
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");

        // Define a default pie layout
        vis.pie = d3.pie().value(d => d.value).sort(null);;

        // Ordinal color scale (10 default colors)
        // vis.color = d3.scaleOrdinal(d3.schemeCategory10);

        // Pie chart settings
        let outerRadius = vis.width / 2;
        let innerRadius = 0;      // Relevant for donut charts

        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this

        vis.displayData = vis.data.map((item, i) => {
            item.color = vis.circleColors[i % vis.circleColors.length];
            item.components = item.components.map((item, i) => {
                item.color = vis.secondaryColors[i % vis.circleColors.length]
                return item;
            })
            return item;
        });
        vis.displayData = [];
        vis.data.forEach((parent, parent_i) => {
            parent.components.forEach((item, i) => {
                item.parent = parent;
                item.color = vis.circleColors[parent_i % vis.circleColors.length];
                item.secondaryColor = vis.secondaryColors[i % vis.secondaryColors.length];
                this.displayData.push(item);
            })
        });
        // console.log("data", this.data, this.displayData)

        // // generate random data
        // for (let i = 0; i < 4; i++) {
        //     let random = Math.floor(Math.random() * 100)
        //     vis.displayData.push({
        //         value: random,
        //         color: vis.circleColors[i]
        //     })
        // }

        vis.updateVis()

    }

    // updateVis method
    updateVis() {
        let vis = this;

        // Bind data
        let arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData).sort(() => 0))

        // Append paths
        arcs.enter()
            .append("path")
            .merge(arcs)
            .attr("class", "arc") // important
            .attr("d", vis.arc)
            .attr("data-parent", d => d.data.parent.label.replaceAll(" ", "_").replaceAll("+", "_").replaceAll("(", "_").replaceAll(")", "_"))
            .style("fill", function (d, index) {
                // console.log("item", d)
                return d.data.color;
            })
            .on('mouseover', function (event, d) {
                // console.log("mouseover", d);
                // console.log("mouseover", d.data, d.data.parent);
                vis.svg.selectAll("path.arc")
                    .style("opacity", 0.2)
                vis.svg.selectAll(`path[data-parent=${d.data.parent.label.replaceAll(" ", "_").replaceAll("+", "_").replaceAll("(", "_").replaceAll(")", "_")}]`)
                    // .style("fill", function (d, index) {
                    //     // console.log("item", d)
                    //     return d.data.secondaryColor;
                    // })
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'black')
                    .style("opacity", 1)
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)');

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3>${d.data.label}<h3>
                             <h4>${d.data.value} Rides</h4>      
                         </div>`);
            })
            .on('mouseout', function (event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)
                vis.svg.selectAll("path.arc")
                    .style("fill", function (d, index) {
                        // console.log("item", d)
                        return d.data.color;
                    })
                    .attr('stroke-width', '0px')
                    .style("opacity", 1)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        arcs.exit().remove();

    }
}