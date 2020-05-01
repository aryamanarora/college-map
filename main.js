Promise.all([
    d3.csv("https://docs.google.com/spreadsheets/d/1HdRliueGeYKPfcZcbPaB_8ky_X3azsLAvNxkSwzj-38/export?gid=0&format=csv&id=1HdRliueGeYKPfcZcbPaB_8ky_X3azsLAvNxkSwzj-38"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.json("locs.json"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
    d3.json("map.json")
]).then(function (files) {
    load(...files)
})

function load(data, map, coords, map2, map3) {
    var names = {}, data_by_city = {}, count = {}
    var known = 0
    data.forEach(d => {
        var city = d["Where?"]
        names[city.toLowerCase()] = city
        if (city != "" && city.charAt(city.length - 1) != "%") {
            if (!(city in data_by_city)) {
                count[city] = 0
                data_by_city[city] = {}
            }
            if (!(d["Destination!"] in data_by_city[city])) {
                data_by_city[city][d["Destination!"]] = []
            }
            count[city] += 1
            known += 1
            data_by_city[city][d["Destination!"]].push(d["Class Member"])
        }
    })

    d3.select("#count")
        .text("We know where " + known + " seniors are headed.")

    var width = window.innerWidth, height = window.innerHeight;
    var svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height)

    
    var projection = d3.geoOrthographic()
        .scale(500)
        .translate([width / 2, height / 2])
        .rotate([99.6, -36.2])

    var tooltip = d3.select("body").append("div")
        .attr("class", "card title shadow text-white bg-dark")
        .style("opacity", 0)
        .style("width", "350px")
    
    var path = d3.geoPath()
        .projection(projection)

    var scale = 1
    var slider = d3.select("#zoom-slider")
        .append("div")
            .attr("class", "card-body")

    slider.append("p")
        .attr("class", "mb-0 mt-0")
        .style("color", "white")
        .text("Zoom")
    slider.append("input")
        .attr("class", "form-control-range")
        .attr("type", "range")
        .attr("min", 0.5)
        .attr("max", 7)
        .attr("step", 0.1)
        .attr("value", 1)
        .on("input", function() {
            projection.scale(500 * this.value)
            scale = this.value
            update(2)
        })

    var v0 = 0, r0 = 0, q0 = 0
    function dragstarted() {
        v0 = versor.cartesian(projection.invert(d3.mouse(this)));
        r0 = projection.rotate()
        q0 = versor(r0)
    }
        
    function dragged() {
        var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this))),
            q1 = versor.multiply(q0, versor.delta(v0, v1)),
            r1 = versor.rotation(q1)
        projection.rotate(r1)
        update(1)
    }

    function zoomed() {
        projection.scale(500 * d3.event.transform.k)
        scale = d3.event.transform.k
        d3.select(".form-control-range")
            .attr("value", d3.event.transform.k)
        update(1)
    }
    
    svg.call(d3.zoom()
        .scaleExtent([0.5, 7])
        .on("zoom", zoomed)
        .on("end", function() {update(2)}))

    var topo = topojson.feature(map, map.objects.countries).features
    var topo2 = topojson.feature(map2, map2.objects.countries).features
    var lakes = topojson.feature(map3, map3.objects.ne_10m_lakes).features,
        rivers = topojson.feature(map3, map3.objects.ne_10m_rivers_lake_centerlines).features

    svg.append("path")
        .datum({type: "Sphere"})
        .attr("d", path)
        .attr("class", "sphere")
        .attr("fill", "#aadafc")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", function() {
                console.log("end")
                update(2)
            }))
    
    var g = svg.append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", function() {
                console.log("end")
                update(2)
            }))

    data_by_city = Object.entries(data_by_city)
    function getVisibility(d) {
        const visible = path(
            {type: 'Point', coordinates: [coords[d[0]].lng, coords[d[0]].lat]});
        
        return visible ? 'visible' : 'hidden';
    }

    var g2 = svg.append("g")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", function() {
                console.log("end")
                update(2)
        }))
        
    var clicked = ""
    g2.selectAll("circle")
        .data(data_by_city)
        .enter()
        .append("circle")
            .attr("data-name", function(d) {
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
                if (clicked == "") {
                    d3.select(this)
                        .style("fill", "black")

                    var res = "<ul class=\"list-group list-group-flush bg-dark\">"
                    res += "<li class=\"list-group-item text-white bg-dark\"><h5 class=\"mb-0 text-white\">" + d[0] + "</h5><p class=\"text-white mt-0\">" + count[d[0]] +
                        " senior" + (count[d[0]] == 1 ? " is" : "s are") + " going here.</p></li>"
                    for (const uni in d[1]) {
                        res += "<li class=\"list-group-item text-white bg-dark\"><strong>" + uni + "</strong> <small>(" + d[1][uni].length + ")</small><ul>"
                        for (const person in d[1][uni]) {
                            var n = d[1][uni][person].split(", ")
                            res += "<li>" + n[1] + " " + n[0] + "</li>"
                        }
                        res += "</ul></li>"
                    }
                    res += "</ul>"

                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 1)
                    tooltip.html(
                        res)
                        .style("right", 20 + "px")
                        .style("top", 20 + "px")
                }
            })
            .on("mouseout", function (d) {
                if (clicked == "") {
                    d3.select(this)
                        .style("fill", "red")

                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                }
            })
            .on("click", function (d) {
                console.log(clicked)
                if (clicked != d[0]) {
                    clicked = d[0]
                    d3.select("#clicked")
                        .style("fill", "red")
                        .attr("id", "")
                    d3.select(this)
                        .attr("id", "clicked")
                        .style("fill", "black")

                    var res = "<ul class=\"list-group list-group-flush bg-dark\">"
                    res += "<li class=\"list-group-item text-white bg-dark\"><h5 class=\"mb-0 text-white\">" + d[0] + "</h5><p class=\"text-white mt-0\">" + count[d[0]] +
                        " senior" + (count[d[0]] == 1 ? " is" : "s are") + " going here.</p></li>"
                    for (const uni in d[1]) {
                        res += "<li class=\"list-group-item text-white bg-dark\"><strong>" + uni + "</strong> <small>(" + d[1][uni].length + ")</small><ul>"
                        for (const person in d[1][uni]) {
                            var n = d[1][uni][person].split(", ")
                            res += "<li>" + n[1] + " " + n[0] + "</li>"
                        }
                        res += "</ul></li>"
                    }
                    res += "</ul>"

                    tooltip.transition()
                        .duration(100)
                        .style("opacity", 1)
                    tooltip.html(res)
                        .style("right", 20 + "px")
                        .style("top", 20 + "px")
                }
                else {
                    clicked = ""
                    d3.select(this)
                        .attr("id", "")
                        .style("fill", "red")

                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                }
            })

    var graticule = d3.geoGraticule10();
    
    update(2)

    function update(topography) {

        // console.log(world)
        g.selectAll("*").remove()
        d3.select(".sphere")
            .datum({type: "Sphere"})
            .attr("d", path)
        var gg = g.append("path")
            .attr("class", "grid")
            .datum(graticule)
            .attr("d", function(d) {
                return path(d)
            })
            .attr("stroke", "white")
            .attr("stroke-width", "0.5px")
            .attr("fill", "none")

        g.selectAll(".map")
            .data(topography == 2 ? topo2 : topo)
            .enter()
            .append("path")
                .attr("class", "map")
                .attr("d", path)
                .attr("stroke-width", "1px")
                .attr("stroke", "#aeb2a4")
                .attr("fill", "#b8d8b5")

        if (topography == 2) {
            g.selectAll(".lake")
                .data(lakes)
                .enter()
                .append("path")
                    .attr("d", path)
                    .attr("fill", "#aadafc")
                    .attr("stroke-width", "1px")
                    .attr("stroke", "#aeb2a4")

            // g.selectAll(".river")
            //     .data(rivers)
            //     .enter()
            //     .append("path")
            //         .attr("d", path)
            //         .attr("stroke", "white")
            //         .attr("stroke-width", "0.3px")
            //         .attr("fill", "none")
        }

        g2.selectAll("circle")
            .attr("cx", function(d) {
                var id = d3.select(this).attr("data-name")
                return projection([coords[id].lng, coords[id].lat])[0]
            })
            .attr("cy", function(d) {
                var id = d3.select(this).attr("data-name")
                return projection([coords[id].lng, coords[id].lat])[1]
            })
            .attr('visibility', getVisibility)
    }

}