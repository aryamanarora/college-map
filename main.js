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
        .rotate([99.6, -36.2])

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip shadow card")
        .style("opacity", 0)
    
    var path = d3.geoPath()
        .projection(projection)

    var scale = 1
    var slider = d3.select("#zoom-slider")
        .append("div")
            .attr("class", "card-body")

    slider.append("p")
        .style("color", "white")
        .text("Zoom")
    slider.append("input")
        .attr("class", "form-control-range")
        .attr("type", "range")
        .attr("min", 0.5)
        .attr("max", 4)
        .attr("step", 0.1)
        .attr("value", 1)
        .on("input", function() {
            projection.scale(500 * this.value)
            scale = this.value
            update()
        })

    function zoomed() {
        projection.rotate([99.6 + d3.event.transform.x / 5, -36.2 - d3.event.transform.y / 5])
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

    var topo = topojson.feature(map, map.objects.countries).features
    
    var data_by_city = {}
    var count = {}
    data.forEach(d => {
        var city = d["Where?"]
        if (city != "" && city.charAt(city.length - 1) != "%") {
            if (!(city in data_by_city)) {
                count[city] = 0
                data_by_city[city] = {}
            }
            if (!(d["Destination!"] in data_by_city[city])) {
                data_by_city[city][d["Destination!"]] = []
            }
            count[city] += 1
            data_by_city[city][d["Destination!"]].push(d["Class Member"])
        }
    })

    data_by_city = Object.entries(data_by_city)
    function getVisibility(d) {
        const visible = path(
            {type: 'Point', coordinates: [coords[d[0]].lng, coords[d[0]].lat]});
        
        return visible ? 'visible' : 'hidden';
    }

    var g2 = svg.append("g")
        
    g2.selectAll("circle")
        .data(data_by_city)
        .enter()
        .append("circle")
            .attr("id", function(d) {
                return d[0]
            })
            .attr("cx", function(d) {
                console.log(d)
                return projection([coords[d[0]].lng, coords[d[0]].lat])[0]
            })
            .attr("cy", function(d) {
                return projection([coords[d[0]].lng, coords[d[0]].lat])[1]
            })
            .attr("r", function (d) {
                return 5 * Math.sqrt(count[d[0]])
            })
            .style("opacity", 0.8)
            .style("fill", "red")
            .attr('visibility', getVisibility)
            .on("mouseover", function(d) {
                d3.select(this)
                    .style("fill", "black")

                var res = "<ul class=\"list-group list-group-flush\">"
                res += "<li class=\"list-group-item\"><h5 class=\"mb-0\">" + d[0] + "</li>"
                for (const uni in d[1]) {
                    res += "<li class=\"list-group-item\"><strong>" + uni + " <small class=\"text-muted\">(" + d[1][uni].length + ")</small></strong><ul>"
                    for (const person in d[1][uni]) {
                        var n = d[1][uni][person].split(", ")
                        res += "<li>" + n[1] + " " + n[0] + "</li>"
                    }
                    res += "</ul></li>"
                }
                res += "</ul>"

                tooltip.transition()
                    .duration(250)
                    .style("opacity", 1)
                tooltip.html(
                    res)
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
                
                tooltip
                    .style("left", -1000 + "px")
                    .style("top", -1000 + "px")
            })

    var graticule = d3.geoGraticule10();
    
    update()

    function update() {

        // console.log(world)
        g.selectAll("*").remove()
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
                .attr("stroke-width", "0.5px")
                .attr("stroke", "#ccc")
                .attr("fill", "#ccc")

        g2.selectAll("circle")
            .attr("cx", function(d) {
                var id = d3.select(this).attr("id")
                return projection([coords[id].lng, coords[id].lat])[0]
            })
            .attr("cy", function(d) {
                var id = d3.select(this).attr("id")
                return projection([coords[id].lng, coords[id].lat])[1]
            })
            .attr('visibility', getVisibility)
    }

}