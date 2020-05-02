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

    var uni = d3.select("#uni")
    uni.append("h1")
        .text("By University")
    var uni_body = uni.append("p")
        .append("table")
        .attr("class", "table table-bordered table-sm")
    uni_body.append("thead")
        .append("tr")
        .html("<th scope=\"col\" style=\"width: 85%;\">University</th><th scope=\"col\">Count</th>")
    Object.keys(uni_count).sort(function(a,b){return uni_count[b]-uni_count[a]}).forEach(key => {
        uni_body.append("tr")
            .html("<td scope=\"row\">" + key + "</td><td class=\"text-right\">" + uni_count[key] + "</td>")
    })

    var city = d3.select("#city")
    city.append("h1")
        .text("By City")
    var city_body = city.append("p")
        .append("table")
        .attr("class", "table table-bordered table-sm")
    city_body.append("thead")
        .append("tr")
        .html("<th scope=\"col\" style=\"width: 85%;\">City</th><th scope=\"col\">Count</th>")
    Object.keys(city_count).sort(function(a,b){return city_count[b]-city_count[a]}).forEach(key => {
        city_body.append("tr")
            .html("<td scope=\"row\">" + key + "</td><td class=\"text-right\">" + city_count[key] + "</td>")
    })

    var state = d3.select("#state")
    state.append("h1")
        .text("By State or Country")
    var state_body = state.append("p")
        .append("table")
        .attr("class", "table table-bordered table-sm")
    state_body.append("thead")
        .append("tr")
        .html("<th scope=\"col\" style=\"width: 85%;\">State or Country</th><th scope=\"col\">Count</th>")
    Object.keys(state_count).sort(function(a,b){return state_count[b]-state_count[a]}).forEach(key => {
        state_body.append("tr")
            .html("<td scope=\"row\">" + (key in state_abbrevs ? state_abbrevs[key] : "<strong>" + key + "<strong>") + "</td><td class=\"text-right\">" + state_count[key] + "</td>")
    })
}