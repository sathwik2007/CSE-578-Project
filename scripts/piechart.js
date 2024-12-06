document.addEventListener("DOMContentLoaded", function () {
  Promise.all([d3.csv("data/Music Mental Health Survey Results.csv")]).then(
    (values) => {
      console.log("Pie chart js");
      glob_data = values[0];
      console.log(glob_data);
      glob_data.forEach((d) => {
        d["Age"] = +d["Age"];
        d["Hours per day"] = +d["Hours per day"];
        d["BPM"] = +d["BPM"];
        d["Anxiety"] = +d["Anxiety"];
        d["Depression"] = +d["Depression"];
        d["Insomnia"] = +d["Insomnia"];
        d["OCD"] = +d["OCD"];
      });

      console.log(glob_data);

      computePieChart(glob_data);
    }
  );
});

function computePieChart(data) {
  improveData = data.filter((d) => d["Music effects"] === "Improve");
  console.log(improveData);
  improveCount = improveData.length;
  console.log(improveData.length);

  worsenData = data.filter((d) => d["Music effects"] === "Worsen");
  console.log(worsenData);
  worsenCount = worsenData.length;
  console.log(worsenCount);

  noEffectData = data.filter((d) => d["Music effects"] === "No effect");
  console.log(noEffectData);
  noEffectCount = noEffectData.length;
  console.log(noEffectCount);

  let pie_data = {
    Improve: improveCount,
    Worsen: worsenCount,
    "No effect": noEffectCount,
  };

  drawPieChart(pie_data);
}

function drawPieChart(pie_data) {
  const radius = Math.min(width, height) / 2 - 40;
  const pie_svg = d3
    .select("#piechart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const colorScale = d3
    .scaleOrdinal()
    .domain(["Improve", "Worsen", "No effect"])
    .range(["#4CAF50", "#F44336", "#9E9E9E"]);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px 10px")
    .style("border-radius", "5px")
    .style("box-shadow", "0px 0px 10px rgba(0,0,0,0.1)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const pie = d3.pie().value(function (d) {
    return d[1];
  });

  const data_ready = pie(Object.entries(pie_data));

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  pie_svg
    .selectAll("mySlices")
    .data(data_ready)
    .join("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) => {
      return colorScale(d.data[0]);
    })
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", 0.7)
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`${d.data[0]}: ${d.data[1]}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY}px`);
      d3.select(this).style("opacity", 1).style("stroke-width", "2px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this).style("opacity", 0.7).style("stroke-width", "1px");
    });

    const labelArc = d3
      .arc()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10);

    pie_svg
      .selectAll("myLines")
      .data(data_ready)
      .join("polyline")
      .attr("points", (d) => {
        const posA = arcGenerator.centroid(d);
        const posB = labelArc.centroid(d);
        const posC = [...labelArc.centroid(d)];
        posC[0] += (posC[0] > 0 ? 1 : -1) * 10;
        return [posA, posB, posC];
      })
      .attr("stroke", "black")
      .style("fill", "none")
      .style("stroke-width", 1);

    pie_svg
      .selectAll("myLabels")
      .data(data_ready)
      .join("text")
      .text((d) => `${d.data[0]}: ${d.data[1]}`)
      .attr("transform", (d) => {
        const pos = labelArc.centroid(d);
        pos[0] += (pos[0] > 0 ? 1 : -1) * 30; 
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) =>
        (d.startAngle + d.endAngle) / 2 > Math.PI ? "end" : "start"
      )
      .style("font-size", "12px");

    pie_svg
      .selectAll("myLabels")
      .data(data_ready)
      .join("text")
      .text((d) => `${Math.round((d.data[1] / 736) * 100)}%`)
      .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px");
}
