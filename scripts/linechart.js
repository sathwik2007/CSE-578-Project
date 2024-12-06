let selected_factor, line_factor;
let linechartData;
let linechart_svg, line_xScale, line_xAxis, line_yScale, line_yAxis;
document.addEventListener("DOMContentLoaded", function () {
  Promise.all([d3.csv("data/Music Mental Health Survey Results.csv")]).then(
    (values) => {
        console.log("Line chart js")
      glob_data = values[0];
      console.log(glob_data);
      cleanedData = glob_data.filter((row) => {
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

      console.log(cleanedData);

      computeLineChart();
    }
  );
});

function computeLineChart() {
    form = document.getElementById("checkboxForm");
    checkboxes = form.querySelectorAll('input[type="checkbox"]');

    form_values = {};
    healthFactors = ["Anxiety", "Depression", "Insomnia", "OCD"];

    checkboxes.forEach((checkbox) => {
      form_values[checkbox.value] = checkbox.checked;
    });

    console.log(form_values);

    selected_factor = document.getElementById("line_factor").value;
    console.log(selected_factor);

    const requiredColumns = Object.keys(form_values).filter(
      (key) => form_values[key]
    );

    console.log(requiredColumns);

    filteredData = cleanedData.filter((row) => {
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
  
        line_xScale = d3.scaleBand().range([0, width]).padding(1);
        line_xAxis = linechart_svg
          .append("g")
          .attr("transform", `translate(0, ${height})`);
  
        line_yScale = d3
          .scaleLinear()
          .domain([0, d3.max(filteredData, (d) => d[selected_factor])])
          .range([height, 0]);
  
        line_yAxis = linechart_svg.append("g").call(d3.axisLeft(line_yScale));

        linechart_svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom / 2)
          .style("text-anchor", "middle")
          .text("Age Group");

        linechart_svg
          .append("text")
          .attr("id", "lineYLabel")
          .attr("transform", "rotate(-90)")
          .attr("y", "-40px")
          .attr("x", -height / 2)
          .style("text-anchor", "middle");
      }
      drawLineChart(linechartData);
}

function drawLineChart(linechartData) {
    const colorScale = d3
      .scaleOrdinal()
      .domain(healthFactors)
      .range(d3.schemeSet2);

    linechart_svg
      .select("#lineYLabel")
      .transition()
      .duration(1000)
      .text("Mean of " + selected_factor);
  
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
