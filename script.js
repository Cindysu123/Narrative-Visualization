// Initialize global variables
var data, averages, svg, x, y, g, breedSvg, breedX, breedY, breedG, breedData, color;

// Load data and create bar chart
d3.csv("petfinder_data_modified_new.csv").then(function(loadedData) {
  data = loadedData;

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
  color = d3.scaleOrdinal()
  .domain(species)
  .range(d3.schemeCategory10.map(function(color) {
    var hsl = d3.hsl(color);
    hsl.s *= 0.8;
    hsl.l *= 1.2;
    if (hsl.l > 1) {
      hsl.l = 1;
    }
    return hsl.toString();
  }));

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
  .attr("y", function(d) { return y(0); }) // start y at 0
  .attr("width", x.bandwidth())
  .attr("height", function(d) { return 0; }) // start height at 0
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

  // Add transition to bars
  g.selectAll(".bar")
  .transition()
  .duration(800)
  .attr("y", function(d) { return y(d.value.id_count); })
  .attr("height", function(d) { return height - y(d.value.id_count); })
  .delay(function(d,i){ return(i*100) });

  // List top three pets
  updateTop3Pets(filteredAverages);
});

function updateTop3Pets(petData) {
  // Clear old top 3 pets
  var top3Div = d3.select("#top3");
  top3Div.selectAll("p").remove();

  // Get new top 3 pets
  var top3 = petData.slice(0, 3);

  // Add new top 3 pets
  top3.forEach(function(pet, i) {
    top3Div.append("p")
      .text((i + 1) + ". " + pet.key + " - Count: " + pet.value.id_count);
  });
}

function createBreedChart(species) {
  breedData = data.filter(function(d) { return d.species === species; });
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
    .padAngle(0.02); // add padding between sectors

  var arcOver = d3.arc()
    .innerRadius(0)
    .outerRadius(radius + 10);

  var pie = d3.pie()
    .value(function(d) { return d.value; })
    .sort(null);

  var path = g.selectAll('path')
    .data(pie(breedData))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', function(d) { return color(d.data.key); });

  path.append('title')
    .text(function(d) { return d.data.key + ": " + d.data.value; });

  path.on("mouseover", function(d) {
    d3.select(this).attr("d", arcOver);
  })
  .on("mouseout", function(d) {
    d3.select(this).attr("d", arc);
  });

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
    .style('fill', function(d) { return color(d.data.key); })
    .style('stroke', function(d) { return color(d.data.key); });

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return d.data.key; });
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

  var filteredData = data;
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

  // Add transition to new bars
  bars.transition()
  .duration(800)
  .attr("y", function(d) { return y(d.value.id_count); })
  .attr("height", function(d) { return height - y(d.value.id_count); })
  .delay(function(d,i){ return(i*100) });

  // Update top 3 pets
  updateTop3Pets(filteredAverages);
}
