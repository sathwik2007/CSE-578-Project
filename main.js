let cleanedData, filteredData, aggregatedData, barchartData, linechartData;
let factor, form, checkboxes, values, selected_factor, healthFactors;
let xScale, xAxis, yScale, yAxis;
let line_xScale, line_xAxis, line_yScale, line_yAxis;
let barchart_svg, linechart_svg;

const margin = { top: 10, right: 30, bottom: 75, left: 60 },
  width = 870 - margin.left - margin.right,
  height = 480 - margin.top - margin.bottom;

function handleData() {
  factor = document.getElementById("factor").value;
  console.log(factor);

  if (factor === "--Select a Factor--") {
    d3.select("#barchart").select("g").remove();
    alert("Select a factor to visualize");
  } else {
    d3.csv("data/Music Mental Health Survey Results.csv").then((data) => {
      console.log(data);
      const cleanedData = data.filter((row) => {
        return Object.values(row).every((value) => value !== "");
      });
      console.log(cleanedData);
      cleanedData.forEach((d) => {
        d["Age"] = +d["Age"];
        d["Hours per day"] = +d["Hours per day"];
        d["BPM"] = +d["BPM"];
        d["Anxiety"] = +d["Anxiety"];
        d["Depression"] = +d["Depression"];
        d["Insomnia"] = +d["Insomnia"];
        d["OCD"] = +d["OCD"];
      });

      filteredData = cleanedData.filter((d) => d["Fav genre"] && d[factor]);
      aggregatedData = d3.rollup(
        filteredData,
        (v) => ({
          factor: d3.mean(v, (d) => d[factor]),
        }),
        (d) => d["Fav genre"]
      );
      barchartData = Array.from(aggregatedData, ([genre, values]) => ({
        genre,
        factor: values.factor,
      }));
      console.log(barchartData);

      if (d3.select("#barchart").select("g").empty()) {
        barchart_svg = d3
          .select("#barchart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        xScale = d3.scaleBand().range([0, width]).padding(0.5);
        xAxis = barchart_svg
          .append("g")
          .attr("transform", `translate(0,${height})`);

        yScale = d3.scaleLinear().range([height, 0]);
        yAxis = barchart_svg.append("g").attr("class", "myYaxis");

        barchart_svg
          .append("text")
          .attr("id", "yLabel")
          .attr("transform", "rotate(-90)")
          .attr("y", "-40px")
          .attr("x", -height / 2)
          .style("text-anchor", "middle");
        //   .text(factor);
      }

      computeBarChart(barchartData);
    });
  }
}

function computeBarChart(barchartData) {
  xScale.domain([...new Set(barchartData.map((d) => d["genre"]))]);
  xAxis.call(d3.axisBottom(xScale));

  yScale.domain(d3.extent(barchartData, (d) => d.factor));
  yAxis.transition().duration(1000).call(d3.axisLeft(yScale));

  barchart_svg
    .select("#yLabel")
    .transition()
    .duration(1000)
    .text("Mean of " + factor);

  let g = barchart_svg.selectAll("rect").data(barchartData);

  g.join("rect")
    .transition()
    .duration(1000)
    .attr("x", (d) => xScale(d["genre"]))
    .attr("y", (d) => yScale(d.factor))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.factor))
    .attr("fill", "#69b3a2");
}

function computeLineChart() {
  console.log("Compute Line Chart Function");
  form = document.getElementById("checkboxForm");
  checkboxes = form.querySelectorAll('input[type="checkbox"]');

  values = {};
  healthFactors = ["Anxiety", "Depression", "Insomnia", "OCD"];

  checkboxes.forEach((checkbox) => {
    values[checkbox.value] = checkbox.checked;
  });

  console.log(values);

  d3.csv("data/Music Mental Health Survey Results.csv").then((data) => {
    console.log(data);
    data.forEach((d) => {
      d["Age"] = +d["Age"];
      d["Hours per day"] = +d["Hours per day"];
      d["BPM"] = +d["BPM"];
      d["Anxiety"] = +d["Anxiety"];
      d["Depression"] = +d["Depression"];
      d["Insomnia"] = +d["Insomnia"];
      d["OCD"] = +d["OCD"];
    });
    console.log(values);

    selected_factor = document.getElementById("line_factor").value;

    const requiredColumns = Object.keys(values).filter((key) => values[key]);

    console.log(requiredColumns);

    filteredData = data.filter((row) => {
      return requiredColumns.every((column) => row[column] === "Yes");
    });
    console.log(filteredData);

    aggregatedData = d3.rollup(
      filteredData,
      (v) => {
        const means = {};
        healthFactors.forEach((factor) => {
          means[factor] = d3.mean(v, (d) => d[factor]);
        });
        return means;
      },
      (d) => getAgeGroup(d["Age"])
    );

    linechartData = Array.from(aggregatedData, ([ageGroup, means]) => ({
      ageGroup,
      ...means,
    })).sort(
      (a, b) =>
        parseInt(a.ageGroup.split("-")[0]) - parseInt(b.ageGroup.split("-")[0])
    );

    console.log(linechartData);

    if (d3.select("#linechart").select("g").empty()) {
      linechart_svg = d3
        .select("#linechart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      line_xScale = d3.scaleBand().range([0, width]).padding(0.5);
      line_xAxis = linechart_svg
        .append("g")
        .attr("transform", `translate(0, ${height})`);

      line_yScale = d3
        .scaleLinear()
        .domain([0, d3.max(filteredData, (d) => d[selected_factor])])
        .range([height, 0]);

      line_yAxis = linechart_svg.append("g").call(d3.axisLeft(line_yScale));
    }
    drawLineChart(linechartData);
  });
}

function drawLineChart(linechartData) {
  const colorScale = d3
    .scaleOrdinal()
    .domain(healthFactors)
    .range(d3.schemeSet2);

  if (d3.select("#linechart").select("#linepath").empty()) {
    line_xScale.domain([...new Set(linechartData.map((d) => d["ageGroup"]))]);
    line_xAxis.call(d3.axisBottom(line_xScale));

    line_yScale.domain([0, d3.max(filteredData, (d) => d[selected_factor])]);
    line_yAxis.transition().duration(1000).call(d3.axisLeft(line_yScale));
    const line = linechart_svg
      .append("g")
      .append("path")
      .datum(linechartData)
      .attr("id", "linepath")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return line_xScale(d["ageGroup"]);
          })
          .y(function (d) {
            return line_yScale(d[selected_factor]);
          })
      )
      .attr("stroke", function (d) {
        return colorScale(selected_factor);
      })
      .attr("stroke-width", 4)
      .style("fill", "none");
  } else {
    console.log("updating the line chart");
    line_xScale.domain([...new Set(linechartData.map((d) => d["ageGroup"]))]);
    line_xAxis.transition().duration(1000).call(d3.axisBottom(line_xScale));

    line_yScale.domain([0, d3.max(filteredData, (d) => d[selected_factor])]);
    line_yAxis.transition().duration(1000).call(d3.axisLeft(line_yScale));

    linechart_svg
      .select("#linepath")
      .datum(linechartData)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return line_xScale(d["ageGroup"]);
          })
          .y(function (d) {
            return line_yScale(d[selected_factor]);
          })
      )
      .attr("stroke", function (d) {
        return colorScale(selected_factor);
      })
      .attr("stroke-width", 4)
      .style("fill", "none");
  }
}

function getAgeGroup(age) {
  if (age >= 0 && age <= 10) return "0-10";
  else if (age <= 20) return "11-20";
  else if (age <= 30) return "21-30";
  else if (age <= 40) return "31-40";
  else if (age <= 50) return "41-50";
  else if (age <= 60) return "51-60";
  else if (age <= 70) return "61-70";
  else if (age <= 80) return "71-80";
  else return "81+";
}
