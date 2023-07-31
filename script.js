var data, averages, svg, x, y, g, breedSvg, breedX, breedY, breedG, breedData, color, filteredData, filteredAverages, us;

var width = 700,
    height = 300;

var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#scene3").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("petfinder_data_modified_new.csv").then(function(loadedData) {
  data = loadedData;
  filteredData = data; 
  averages = d3.nest()
    .key(function(d) { return d.species; })
    .rollup(function(v) { 
      return {
        id_count: v.length,
        children: d3.mean(v, function(d) { return d.children; }),
        cats: d3.mean(v, function(d) { return d.cats; }),
        dogs: d3.mean(v, function(d) { return d.dogs; })
      };
    })
    .entries(data);

  averages.sort(function(a, b) { return b.value.id_count - a.value.id_count; });

  svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
  y = d3.scaleLinear().rangeRound([height, 0]);

  g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(averages.map(function(d) { return d.key; }));
  y.domain([0, d3.max(averages, function(d) { return d.value.id_count; })]);

  var species = [...new Set(data.map(d => d.species))];
  var barColors = ["#f4e2ce", "#db7858", "#eacfc4", "#f1b89b", "#d98e6f", "#fed8c3", "#ffbeaa", "#d9796c", "#eac0a8", "#f1ae79", "#c4884a","#b8cecc","#9fb4b5", "#87abab", "#b3b689", "#d6dbd7", "#d7bdc0", "#7c5e60", "#a15d64", "#3a615e", "#647f6e", "#5b6d55", "#7a8b67", "#334a50", "#b2b7a0", "#8e9989", "#d3b054", "#bca86d", "#f2d076"];
  color = d3.scaleOrdinal()
  .domain(species)
  .range(barColors);

  var xAxis = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  xAxis.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count of ID");

  g.selectAll(".bar")
  .data(averages)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.key); })
  .attr("y", function(d) { return y(0); })
  .attr("width", x.bandwidth())
  .attr("height", function(d) { return 0; })
  .style("fill", function(d) { return color(d.key); })
  .style("cursor", "pointer")
  .on('mouseover', function(d, i) { 
    d3.select(this).style('fill', d3.rgb(color(d.key)).brighter(0.5)); 
  })
  .on('mouseout', function(d, i) { 
    d3.select(this).style('fill', color(d.key)); 
  })
  .on('click', function(d) { 
    createBreedChart(d.key); 
  })
  .append("title")
  .text(function(d) { return "ID Count: " + d.value.id_count; });

  g.selectAll(".bar")
  .transition()
  .duration(800)
  .attr("y", function(d) { return y(d.value.id_count); })
  .attr("height", function(d) { return height - y(d.value.id_count); })
  .delay(function(d,i){ return(i*100) });

  if(filteredAverages.length > 0) { 
    updateTop3Pets(filteredAverages);
  }

}).catch(function(error) {
  console.log("Error loading CSV data: ", error);
});

d3.json("us_states.json").then(function(loadedUs) {
  us = loadedUs;

    drawMap(us, filteredData);

  }).catch(function(error) {
    console.log("Error loading GeoJSON data: ", error);
  });

  function drawMap(us, filteredData) {
    var petCounts = d3.nest()
      .key(function(d) { return d.state; })
      .rollup(function(v) { return v.length; })
      .object(filteredData);
  
    var color = d3.scaleSequential(d3.interpolate("#deb887", "#8b4513"))
        .domain([0, d3.max(Object.values(petCounts))]);
  
    d3.select("#scene3").select("svg").remove();
  
    d3.select("#scene3").append("svg")
    .attr("width", width)
    .attr("height", height)
    .selectAll("path")
    .data(us.features) 
    .enter().append("path")
    .attr("d", path)
    .style("fill", function(d) {
      var count = petCounts[d.id];
      return count ? color(count) : "#ccc";
    })
    .append("title")
    .text(function(d) {
      var count = petCounts[d.id];
      return count ? count + " pets" : "No data";
    });
  }


function updateTop3Pets(petData) {
  var top3Div = d3.select("#top3");
  top3Div.selectAll("p").remove();

  var top3 = petData.slice(0, 3);

  top3.forEach(function(pet, i) {
    top3Div.append("p")
      .text((i + 1) + ". " + pet.key);
  });
}

function createBreedChart(species) {
  breedData = filteredData.filter(function(d) { return d.species === species; });
  breedData = d3.nest()
    .key(function(d) { return d.breed; })
    .rollup(function(v) { return v.length; })  
    .entries(breedData);

  var width = 520;
  var height = 380;
  var radius = Math.min(width, height) / 2.8;
  var svg = d3.select("#scene2")
    .select('svg')
    .attr("width", width)
    .attr("height", height);

  svg.selectAll("*").remove();

  var g = svg.append('g')
    .attr('transform', 'translate(' + (width / 2 - 50) + ',' + (height / 2 + 20) + ')');

  svg.append("text")
  .attr("transform", "translate("+ (width / 2 - 50) +",30)")
  .attr("text-anchor", "middle")
  .style("font-size", "16px") 
  .style("text-decoration", "underline")  
  .text("Breed Distribution in " + species);

  var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
    .padAngle(0.02);

  var arcOver = d3.arc()
    .innerRadius(0)
    .outerRadius(radius + 10);

    var pie = d3.pie()
    .value(function(d) { return d.value; })
    .sort(function(a, b) { return b.value - a.value; });
  
  var pieColors = ["#f4e2ce", "#db7858", "#eacfc4", "#f1b89b", "#d98e6f", "#fed8c3", "#ffbeaa", "#d9796c", "#eac0a8", "#f1ae79", "#c4884a","#b8cecc","#9fb4b5", "#87abab", "#b3b689", "#d6dbd7", "#d7bdc0", "#7c5e60", "#a15d64", "#3a615e", "#647f6e", "#5b6d55", "#7a8b67", "#334a50", "#b2b7a0", "#8e9989", "#d3b054", "#bca86d", "#f2d076"];
  var pieColor = d3.scaleOrdinal()
    .domain(breedData)
    .range(pieColors);

    var path = g.selectAll('path')
    .data(pie(breedData))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) { return pieColor(d.data.key); })
    .each(function(d, i) {
        if (i === -1) {
            var centroid = arc.centroid(d);
            g.append("text")
                .attr("x", centroid[0])
                .attr("y", centroid[1])
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text(d.data.key);
        }
    });

  path.append('title')
    .text(function(d) { return d.data.key + ": " + d.data.value; });

  path.on("mouseover", function() {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", arcOver);
  })
  .on("mouseout", function() {
    d3.select(this)
      .transition()
      .duration(200)
      .attr("d", arc);
  });

  var maxBreed = breedData[0];
  for (var i = 1; i < breedData.length; i++) {
    if (breedData[i].value > maxBreed.value) {
      maxBreed = breedData[i];
    }
  }

  var legendRectSize = 18;
  var legendSpacing = 4;
  var legend = svg.selectAll('.legend')
    .data(pie(breedData))
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = width - legendRectSize - 130;
      var vert = i * height + (height / 2) + 40;
      return 'translate(' + horz + ',' + vert + ')';
    });

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', function(d) { return pieColor(d.data.key); })
    .style('stroke', function(d) { return pieColor(d.data.key); });

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d.data.key; });

  svg.append("text")
  .attr("transform", "translate(" + (width / 2 - 50) + "," + (height / 2 + 20) + ")")
  .attr("text-anchor", "middle")
  .style("font-size", "16px") 
  
}

function submitAnswer() {
  var childrenAnswer = document.querySelector('input[name="children"]:checked') ? document.querySelector('input[name="children"]:checked').value : null;
  var catsAnswer = document.querySelector('input[name="cats"]:checked') ? document.querySelector('input[name="cats"]:checked').value : null;
  var dogsAnswer = document.querySelector('input[name="dogs"]:checked') ? document.querySelector('input[name="dogs"]:checked').value : null;
  var coatAnswers = Array.from(document.querySelectorAll('input[name="coat"]:checked')).map(e => e.value);
  var attrAnswers = Array.from(document.querySelectorAll('input[name="attr"]:checked')).map(e => e.value);
  var sizeRange = document.getElementById('sizeRange').value;
  var ageRange = document.getElementById('ageRange').value;
  document.getElementById("ageValue").innerHTML = ageRange;

  g.selectAll(".bar").remove();

  filteredData = data;
  
  if (childrenAnswer === "yes") {
    filteredData = filteredData.filter(function(d) { return d.children >= 0.5; });
  }
  if (catsAnswer === "yes") {
    filteredData = filteredData.filter(function(d) { return d.cats >= 0.2; });
  }
  if (dogsAnswer === "yes") {
    filteredData = filteredData.filter(function(d) { return d.dogs >= 0.2; });
  }
  if (coatAnswers.length > 0) {
    filteredData = filteredData.filter(function(d) { return coatAnswers.includes(d.coat); });
  }
  if (attrAnswers.length > 0) {
    filteredData = filteredData.filter(function(d) { 
      return attrAnswers.every(attr => d[attr] != 0);
    });
  }
  if (sizeRange == "30") {
    filteredData = filteredData.filter(function(d) { return d.size >= 28 && d.size <= 30; });
  } else if (sizeRange == "28") {
    filteredData = filteredData.filter(function(d) { return d.size >= 20 && d.size < 28; });
  } else if (sizeRange == "20") {
    filteredData = filteredData.filter(function(d) { return d.size >= 6 && d.size < 20; });
  } else if (sizeRange == "10") {
    filteredData = filteredData.filter(function(d) { return d.size >= 0 && d.size < 6; });
  }
  filteredData = filteredData.filter(function(d) { return d.age <= ageRange; });

  filteredAverages = d3.nest()
    .key(function(d) { return d.species; })
    .rollup(function(v) { 
      return {
        id_count: v.length,
        children: d3.mean(v, function(d) { return d.children; }),
        cats: d3.mean(v, function(d) { return d.cats; }),
        dogs: d3.mean(v, function(d) { return d.dogs; })
      };
    })
    .entries(filteredData);

  filteredAverages.sort(function(a, b) { return b.value.id_count - a.value.id_count; });

  x.domain(filteredAverages.map(function(d) { return d.key; }));
  y.domain([0, d3.max(filteredAverages, function(d) { return d.value.id_count; })]);

  g.select(".x.axis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom(x));

  g.select(".y.axis")
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y));

  g.selectAll(".bar").remove();

  var bars = g.selectAll(".bar")
  .data(filteredAverages)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.key); })
  .attr("y", function(d) { return y(d.value.id_count); })
  .attr("width", x.bandwidth())
  .attr("height", function(d) { return height - y(d.value.id_count); })
  .style("fill", function(d, i) { return color(i); })
  .on('mouseover', function(d, i) { d3.select(this).style('fill', color(i)); })
  .on('mouseout', function(d, i) { d3.select(this).style('fill', color(i)); })
  .on('click', function(d) { 
    createBreedChart(d.key); 
  })
  .append("title")
  .text(function(d) { return "ID Count: " + d.value.id_count; });

  bars.transition()
  .duration(800)
  .attr("y", function(d) { return y(d.value.id_count); })
  .attr("height", function(d) { return height - y(d.value.id_count); })
  .delay(function(d,i){ return(i*100) });

  updateTop3Pets(filteredAverages);

  if (filteredAverages.length > 0) {
    createBreedChart(filteredAverages[0].key);
  }

  drawMap(us, filteredData);

}
