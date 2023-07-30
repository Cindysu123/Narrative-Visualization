var data, averages, svg, x, y, g, breedSvg, breedX, breedY, breedG, breedData;

// Load data and create bar chart
d3.csv("petfinder_data_modified_new.csv").then(function(loadedData) {
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
      .on('mouseover', function() { d3.select(this).style('fill', 'darkblue'); })
      .on('mouseout', function() { d3.select(this).style('fill', 'steelblue'); })
      .on('click', function(d) { 
          // When a bar is clicked, call a function to create a new chart 
          createBreedChart(d.key); 
      })
      .append("title")  // Append a title element to each rect
      .text(function(d) { return "ID Count: " + d.value.id_count; });  // Set the title text as the id count
    
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
    var coatAnswers = Array.from(document.querySelectorAll('input[name="coat"]:checked')).map(e => e.value);
    var attrAnswers = Array.from(document.querySelectorAll('input[name="attr"]:checked')).map(e => e.value);
    var sizeRange = document.getElementById('sizeRange').value;
    var ageRange = document.getElementById('ageRange').value;
    document.getElementById("ageValue").innerHTML = ageRange;

    // Clear the old bars
    g.selectAll(".bar").remove();

    var filteredData = data;

    // Filter based on children answer
    if (childrenAnswer === "yes") {
      // Remove species with average children value less than 0.5
      filteredData = filteredData.filter(function(d) { return d.children >= 0.5; });
    }

    // Filter based on cats answer
    if (catsAnswer === "yes") {
      // Remove species with average cats value less than 0.2
      filteredData = filteredData.filter(function(d) { return d.cats >= 0.2; });
    }

    // Filter based on dogs answer
    if (dogsAnswer === "yes") {
      // Remove species with average dogs value less than 0.2
      filteredData = filteredData.filter(function(d) { return d.dogs >= 0.2; });
    }

    // Filter based on coat answer
    if (coatAnswers.length > 0) {
      // Filter the data for the selected coat types
      filteredData = filteredData.filter(function(d) { return coatAnswers.includes(d.coat); });
    }

    // Filter based on attribute answer
    if (attrAnswers.length > 0) {
        // Filter the data for the selected attributes
        filteredData = filteredData.filter(function(d) { 
        return attrAnswers.every(attr => d[attr] != 0);  // Filter out if any selected attribute equals 0
        });
    }

    // Filter the data for the selected size
    if (sizeRange == "any") {
        // Do not filter the data by size
    } else if (sizeRange == "30") {
        filteredData = filteredData.filter(function(d) { return d.size >= 28 && d.size <= 30; });
    } else if (sizeRange == "28") {
        filteredData = filteredData.filter(function(d) { return d.size >= 20 && d.size < 28; });
    } else if (sizeRange == "20") {
        filteredData = filteredData.filter(function(d) { return d.size >= 6 && d.size < 20; });
    } else if (sizeRange == "10") {
        filteredData = filteredData.filter(function(d) { return d.size >= 0 && d.size < 6; });
    }

    // Filter the data for the selected age range
    filteredData = filteredData.filter(function(d) { return d.age <= ageRange; });
  
    // Generate averages
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
  
    // Sort in descending order of id count
    filteredAverages.sort(function(a, b) { return b.value.id_count - a.value.id_count; });

    // Update x and y domains
    x.domain(filteredAverages.map(function(d) { return d.key; }));
    y.domain([0, d3.max(filteredAverages, function(d) { return d.value.id_count; })]);

    // Redraw the axes
    g.select(".x.axis")
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x));

    g.select(".y.axis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    // Clear the old bars
    g.selectAll(".bar").remove();

    // Draw the new bars
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
  
  
  
  
