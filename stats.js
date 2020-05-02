Promise.all([
    d3.csv("data.csv"),
]).then(function (files) {
    load(...files)
})

var state_abbrevs = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District of Columbia",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hamspire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
}

function load(data) {
    var city_count = {}, uni_count = {}, state_count = {}
    state_count["United States"] = 0
    data.forEach(d => {
        var city = d["Where?"]
        var state = city.split(", ")[1]
        if (city != "" && city.charAt(city.length - 1) != "%") {
            if (!(state in state_count)) {
                state_count[state] = 0
            }
            if (!(city in city_count)) {
                city_count[city] = 0
            }
            if (!(d["Destination!"] in uni_count)) {
                uni_count[d["Destination!"]] = 0
            }

            uni_count[d["Destination!"]]++
            city_count[city]++
            state_count[state]++
            if (state in state_abbrevs) state_count["United States"]++
        }
    })

    function make_table(id, count, title, key_function) {
        var t = d3.select(id)
        t.append("h1")
            .text("By " + title)
        var body = t.append("p")
            .attr("class", "table-responsive")
            .append("table")
            .attr("class", "table table-bordered table-sm table-fixed")
        body.append("thead")
            .append("tr")
            .html("<th scope=\"col\" style=\"width: 8%;\">#</th><th scope=\"col\" style=\"width: 77%;\">" + title + "</th><th scope=\"col\" style=\"width: 15%;\">Count</th>")
        body = body.append("tbody")
        var num = 1
        var last = -1, obj = null
        Object.keys(count).sort(function(a,b) {
            console.log(a, b, (a > b))
            if (count[b] == count[a]) return (b > a ? -1 : 1)
            return count[b]-count[a]
        }).forEach(key => {
            var row = body.append("tr")
            if (count[key] == last) {
                obj.attr("rowspan", function() {
                    return parseInt(obj.attr("rowspan")) + 1
                })
            }
            else {
                obj = row.append("td")
                    .attr("scope", "row")
                    .attr("rowspan", 1)
                    .style("width", "8%")
                    .text(num)
            }
            row.append("td")
                .attr("scope", "row")
                .style("width", "77%")
                .html(key_function(key))
            row.append("td")
                .attr("scope", "row")
                .style("width", "15%")
                .text(count[key])
            last = count[key]
            num++
        })
    }

    make_table("#uni", uni_count, "University", function(d) {return d})
    make_table("#city", city_count, "City", function(d) {return d})
    make_table("#state", state_count, "State or Country", function(d) {return (d in state_abbrevs ? state_abbrevs[d] : "<b>" + d + "</b>")})
}