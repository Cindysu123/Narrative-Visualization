var data, averages, svg, x, y, g, breedSvg, breedX, breedY, breedG, breedData;

// Load data and create bar chart
d3.csv("petfinder_data_modified.csv").then(function(loadedData) {
  data = loadedData; // Make data global
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

  // Sort in descending order of id count
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

  var xAxis = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // Rotate labels
  xAxis.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y)) // Removed the "%" argument
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
      .attr("y", function(d) { return y(d.value.id_count); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value.id_count); })
      .append("title")  // Append a title element to each rect
      .text(function(d) { return "ID Count: " + d.value.id_count; })  // Set the title text as the id count
      .on('click', function(d) { 
          // When a bar is clicked, call a function to create a new chart 
          createBreedChart(d.key); 
      });
});

function createBreedChart(species) {
  // Filter the data for the selected species
  breedData = data.filter(function(d) { return d.species === species; });
  breedData = d3.nest()
    .key(function(d) { return d.breed; })
    .rollup(function(v) { return v.length; })  // Count the IDs for each breed
    .entries(breedData);

  // Sort in descending order of id count
  breedData.sort(function(a, b) { return b.value - a.value; });

  breedSvg = d3.select("#breedSvg"),
  breedWidth = +breedSvg.attr("width") - margin.left - margin.right,
  breedHeight = +breedSvg.attr("height") - margin.top - margin.bottom;

  breedX = d3.scaleBand().rangeRound([0, breedWidth]).padding(0.1),
  breedY = d3.scaleLinear().rangeRound([breedHeight, 0]);

  breedG = breedSvg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  breedX.domain(breedData.map(function(d) { return d.key; }));
  breedY.domain([0, d3.max(breedData, function(d) { return d.value; })]);

  var breedXAxis = breedG.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + breedHeight + ")")
      .call(d3.axisBottom(breedX));

  // Rotate labels
  breedXAxis.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  breedG.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(breedY)) // Removed the "%" argument
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count of ID");

  breedG.selectAll(".bar")
    .data(breedData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return breedX(d.key); })
      .attr("y", function(d) { return breedY(d.value); })
      .attr("width", breedX.bandwidth())
      .attr("height", function(d) { return breedHeight - breedY(d.value); })
      .append("title")  // Append a title element to each rect
      .text(function(d) { return "ID Count: " + d.value; });  // Set the title text as the id count
}

function submitAnswer() {
  var childrenAnswer = document.querySelector('input[name="children"]:checked') ? document.querySelector('input[name="children"]:checked').value : null;
  var catsAnswer = document.querySelector('input[name="cats"]:checked') ? document.querySelector('input[name="cats"]:checked').value : null;
  var dogsAnswer = document.querySelector('input[name="dogs"]:checked') ? document.querySelector('input[name="dogs"]:checked').value : null;

  // Clear the old bars
  g.selectAll(".bar").remove();

  var filteredAverages = averages;

  // Filter based on children answer
  if (childrenAnswer === "yes") {
    // Remove species with average children value less than 0.5
    filteredAverages = filteredAverages.filter(function(d) { return d.value.children >= 0.5; });
  }

  // Filter based on cats answer
  if (catsAnswer === "yes") {
    // Remove species with average cats value less than 0.2
    filteredAverages = filteredAverages.filter(function(d) { return d.value.cats >= 0.2; });
  }

  // Filter based on dogs answer
  if (dogsAnswer === "yes") {
    // Remove species with average dogs value less than 0.2
    filteredAverages = filteredAverages.filter(function(d) { return d.value.dogs >= 0.2; });
  }

  g.selectAll(".bar")
    .data(filteredAverages)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.key); })
      .attr("y", function(d) { return y(d.value.id_count); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value.id_count); })
      .append("title")  // Append a title element to each rect
      .text(function(d) { return "ID Count: " + d.value.id_count; });  // Set the title text as the id count
}
