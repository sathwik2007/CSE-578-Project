let filteredScatterData, aggregatedScatterData;
let scatter_svg, x, scatter_xAxis, y, scatter_yAxis;
document.addEventListener("DOMContentLoaded", function () {
    Promise.all([d3.csv("data/Music Mental Health Survey Results.csv")]).then(
      (values) => {
          console.log("Scatterplot js")
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

        handleScatterPlot();
      }
    );
  });

function handleScatterPlot() {
    console.log("handle scatterplot");

    scatter_factor = document.getElementById("scatterFactor").value;
    console.log(scatter_factor);

    filteredScatterData = cleanedData.filter(
      (d) => d["Hours per day"] && d[scatter_factor]
    );
    console.log(filteredScatterData);

    aggregatedScatterData = d3.rollup(
      filteredScatterData,
      (v) => ({
        factor: d3.mean(v, (d) => d[scatter_factor]),
      }),
      (d) => d["Hours per day"]
    );

    scatterplotData = Array.from(aggregatedScatterData, ([hour, values]) => ({
      hour,
      factor: values.factor,
    })).sort((a, b) => a.hour - b.hour);
    console.log(scatterplotData);

    computeScatterPlot(scatterplotData, scatter_factor);
}

function computeScatterPlot(data, factor) {
    if (d3.select("#scatterplot").select("g").empty()) {
        scatter_svg = d3
          .select("#scatterplot")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
    
        x = d3.scaleLinear()
        .range([0, width]);
        scatter_xAxis = scatter_svg
          .append("g")
          .attr("transform", `translate(0,${height})`);
    
        y = d3.scaleLinear().range([height, 0]);
        scatter_yAxis = scatter_svg.append("g").attr("class", "myYaxis");

        scatter_svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom / 2)
          .style("text-anchor", "middle")
          .text("No. of hours listening to music");
    
        scatter_svg
          .append("text")
          .attr("id", "yLabel")
          .attr("transform", "rotate(-90)")
          .attr("y", "-40px")
          .attr("x", -height / 2)
          .style("text-anchor", "middle");
      }
      drawScatterPlot(data, factor)
}

function drawScatterPlot(data, factor) {
    x.domain([0, 24])
    scatter_xAxis.call(d3.axisBottom(x));
  
    y.domain([0, 10]);
    scatter_yAxis.call(d3.axisLeft(y));
  
    scatter_svg
    .select("#yLabel")
    .transition()
    .duration(1000)
    .text("Mean of " + factor);
  
    scatter_svg.selectAll("circle")
          .data(data)
          .join("circle")
          .attr("cx", d => x(d["hour"]))
          .attr("cy", d => y(d["factor"]))
          .attr("r", 5)
          .attr("fill", "steelblue")
  }