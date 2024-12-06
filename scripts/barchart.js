let glob_data, cleanedData;
let filteredData, aggregatedData, barchartData;
let barchart_svg, xScale, yScale, xAxis, yAxis;

const margin = { top: 10, right: 30, bottom: 75, left: 60 },
  width = 870 - margin.left - margin.right,
  height = 480 - margin.top - margin.bottom;

document.addEventListener("DOMContentLoaded", function() {
    Promise.all([d3.csv('data/Music Mental Health Survey Results.csv')]).then((values) => {
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

        computeBarChart();
    })
})

function computeBarChart() {
    factor = document.getElementById("factor").value;
    console.log(factor);

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
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2)
        .style("text-anchor", "middle")
        .text("Music Genre");

      barchart_svg
        .append("text")
        .attr("id", "yLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", "-40px")
        .attr("x", -height / 2)
        .style("text-anchor", "middle");
    }

    drawBarChart(barchartData);
}

function drawBarChart(barchartData) {
    xScale.domain([...new Set(barchartData.map((d) => d["genre"]))]);
    xAxis.call(d3.axisBottom(xScale));

    yScale.domain([0, 10]);
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