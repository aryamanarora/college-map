d3.csv("data.csv")
    .then(function (d) {
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
            .then(function (e) {
                d3.json("locs.json").then(function (f) {
                    load(d, e, f)
                })
            })
    })

function load(data, map, coords) {
    var width = window.innerWidth, height = window.innerHeight;
    var svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height)
    var g = svg.append("g")
    
    var projection = d3.geoOrthographic()
        .scale(500)
        .translate([width / 2, height / 2])

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
    
    var path = d3.geoPath()
        .projection(projection)

    function zoomed() {
        projection.rotate([d3.event.transform.x / 5, -d3.event.transform.y / 5])
        path.projection(projection)
        update()
    }
    function unzoomed() {
        svg.transition().duration(1000).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
    }
    var zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 12])
        .on("zoom", zoomed)
    svg.call(zoom)
    svg.on("click", unzoomed)

    var topo = topojson.feature(map, map.objects.countries).features
    
    var data_by_city = {}
    var lat = {}, lon = {}
    data.forEach(d => {
        var city = d["Where?"]
        if (city != "") {
            if (!(city in data_by_city)) {
                data_by_city[city] = []
            }
            data_by_city[city].push({"name": d["Class Member"], "uni": d["Destination!"]})
        }
    })

    data_by_city = Object.entries(data_by_city)

    update()

    function update() {
        function getVisibility(d) {
            const visible = path(
                {type: 'Point', coordinates: [coords[d[0]].lng, coords[d[0]].lat]});
            
            return visible ? 'visible' : 'hidden';
        }

        // console.log(world)
        g.selectAll("*").remove()

        var graticule = d3.geoGraticule10();
        var gg = g.append("path")
            .attr("class", "grid")
            .datum(graticule)
            .attr("d", function(d) {
                return path(d)
            })
            .attr("stroke", "grey")
            .attr("stroke-width", "0.5px")
            .attr("fill", "none")

        g.selectAll("path")
            .data(topo)
            .enter()
            .append("path")
                .attr("class", "map")
                .attr("d", path)
                .attr("stroke-width", "0px")
                .attr("stroke", "red")
                .attr("fill", "grey")

        g.selectAll("circle")
            .data(data_by_city)
            .enter()
            .append("circle")
                .attr("cx", function(d) {
                    console.log(d)
                    return projection([coords[d[0]].lng, coords[d[0]].lat])[0]
                })
                .attr("cy", function(d) {
                    return projection([coords[d[0]].lng, coords[d[0]].lat])[1]
                })
                .attr("r", function (d) {
                    return 5 * Math.sqrt(d[1].length)
                })
                .style("opacity", 0.8)
                .style("fill", "red")
                .attr('visibility', getVisibility)
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("fill", "black")

                    var res = ""
                    d[1].forEach(function (e) {
                        var f = e.name.split(", ")
                        res += "<tr><td><p>" + f[1] + " " + f[0] + "</p></td><td><p><em>" + e.uni + "</p></td></td>"
                    })
    
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 1)
                    tooltip.html(
                        "<p><strong>" + d[0] + "</strong><table class=\"table table-sm table-striped\">" + res + "</table></p>")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .style("fill", "red")
    
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                })
    }

}