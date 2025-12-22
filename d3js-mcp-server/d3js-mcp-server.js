#!/usr/bin/env node
// D3.js MCP Server - Data Visualization & Chart Generation
// Provides tools for creating D3.js visualizations and data processing

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// D3.js MCP Tools
const D3_TOOLS = {
  // Generate bar chart
  generateBarChart: async ({ data, options = {} }) => {
    try {
      const {
        width = 800,
        height = 600,
        margin = { top: 20, right: 30, bottom: 40, left: 90 },
        title = 'Bar Chart',
        xLabel = 'X Axis',
        yLabel = 'Y Axis',
        color = '#69b3a2'
      } = options;

      const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    .bar { fill: ${color}; }
    .bar:hover { fill: orange; }
    .axis { font: 12px sans-serif; }
    .axis-label { font: 14px sans-serif; font-weight: bold; }
    .title { font: 20px sans-serif; font-weight: bold; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const data = ${JSON.stringify(data)};
    const margin = ${JSON.stringify(margin)};
    const width = ${width} - margin.left - margin.right;
    const height = ${height} - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.label))
      .padding(0.1);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value));

    // Title
    svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .text("${title}");

    // X axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .text("${xLabel}");

    // Y axis label
    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("${yLabel}");
  </script>
</body>
</html>`;

      const outputPath = path.join(__dirname, 'd3-charts', `bar-chart-${Date.now()}.html`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html);

      return { success: true, path: outputPath, type: 'bar-chart' };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate line chart
  generateLineChart: async ({ data, options = {} }) => {
    try {
      const {
        width = 800,
        height = 600,
        margin = { top: 20, right: 30, bottom: 40, left: 90 },
        title = 'Line Chart',
        xLabel = 'X Axis',
        yLabel = 'Y Axis',
        color = '#69b3a2'
      } = options;

      const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    .line { fill: none; stroke: ${color}; stroke-width: 2; }
    .dot { fill: ${color}; }
    .axis { font: 12px sans-serif; }
    .grid line { stroke: lightgrey; stroke-opacity: 0.7; shape-rendering: crispEdges; }
    .grid path { stroke-width: 0; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const data = ${JSON.stringify(data)};
    const margin = ${JSON.stringify(margin)};
    const width = ${width} - margin.left - margin.right;
    const height = ${height} - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y));

    // Add grid
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // Add axes
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add line
    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    // Add dots
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 4);

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("${title}");
  </script>
</body>
</html>`;

      const outputPath = path.join(__dirname, 'd3-charts', `line-chart-${Date.now()}.html`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html);

      return { success: true, path: outputPath, type: 'line-chart' };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate pie chart
  generatePieChart: async ({ data, options = {} }) => {
    try {
      const {
        width = 600,
        height = 600,
        radius = Math.min(width, height) / 2 - 40,
        title = 'Pie Chart'
      } = options;

      const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    .arc text { font: 12px sans-serif; text-anchor: middle; }
    .arc path { stroke: #fff; }
    .legend { font: 12px sans-serif; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const data = ${JSON.stringify(data)};
    const width = ${width};
    const height = ${height};
    const radius = ${radius};

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const pie = d3.pie()
      .value(d => d.value);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .style("fill", d => color(d.data.label));

    arcs.append("text")
      .attr("transform", d => "translate(" + arc.centroid(d) + ")")
      .text(d => d.data.label + " (" + d.data.value + ")");

    // Title
    svg.append("text")
      .attr("y", -height/2 + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("${title}");
  </script>
</body>
</html>`;

      const outputPath = path.join(__dirname, 'd3-charts', `pie-chart-${Date.now()}.html`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html);

      return { success: true, path: outputPath, type: 'pie-chart' };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate scatter plot
  generateScatterPlot: async ({ data, options = {} }) => {
    try {
      const {
        width = 800,
        height = 600,
        margin = { top: 20, right: 30, bottom: 40, left: 90 },
        title = 'Scatter Plot',
        xLabel = 'X Axis',
        yLabel = 'Y Axis',
        colorScale = d3.schemeCategory10
      } = options;

      const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    .dot { stroke: #fff; stroke-width: 1.5px; }
    .axis { font: 12px sans-serif; }
    .tooltip {
      position: absolute;
      text-align: center;
      padding: 8px;
      font: 12px sans-serif;
      background: lightsteelblue;
      border: 0px;
      border-radius: 8px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script>
    const data = ${JSON.stringify(data)};
    const margin = ${JSON.stringify(margin)};
    const width = ${width} - margin.left - margin.right;
    const height = ${height} - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Add axes
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    // Add dots
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .style("fill", (d, i) => color(d.category || i));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text("${title}");
  </script>
</body>
</html>`;

      const outputPath = path.join(__dirname, 'd3-charts', `scatter-plot-${Date.now()}.html`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html);

      return { success: true, path: outputPath, type: 'scatter-plot' };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Process CSV data
  processCSV: async ({ csvText, delimiter = ',' }) => {
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(delimiter);
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        const row = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim();
        });
        data.push(row);
      }

      return { success: true, data, rowCount: data.length, columns: headers };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Generate D3 component code
  generateD3Component: async ({ type, framework = 'vanilla' }) => {
    try {
      let code = '';
      const outputPath = path.join(__dirname, 'd3-components', `${type}-${framework}-${Date.now()}.js`);

      if (framework === 'react') {
        code = generateReactD3Component(type);
      } else if (framework === 'vue') {
        code = generateVueD3Component(type);
      } else {
        code = generateVanillaD3Component(type);
      }

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, code);

      return { success: true, path: outputPath, code };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Helper functions
function generateVanillaD3Component(type) {
  return `// D3.js ${type} Component (Vanilla JavaScript)
class D3${type.charAt(0).toUpperCase() + type.slice(1)} {
  constructor(selector, data, options = {}) {
    this.selector = selector;
    this.data = data;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      margin: options.margin || { top: 20, right: 30, bottom: 40, left: 90 },
      ...options
    };
    this.render();
  }

  render() {
    // Clear existing content
    d3.select(this.selector).selectAll("*").remove();

    const svg = d3.select(this.selector)
      .append("svg")
      .attr("width", this.options.width)
      .attr("height", this.options.height);

    // Add your D3 visualization code here
    console.log('Rendering ${type} with data:', this.data);
  }

  update(newData) {
    this.data = newData;
    this.render();
  }
}

// Usage:
// const chart = new D3${type.charAt(0).toUpperCase() + type.slice(1)}('#chart', data);
`;
}

function generateReactD3Component(type) {
  return `// D3.js ${type} Component (React)
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3${type.charAt(0).toUpperCase() + type.slice(1)} = ({ data, width = 800, height = 600 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear previous render
    svg.selectAll("*").remove();

    // Add your D3 visualization code here
    console.log('Rendering ${type} with data:', data);

  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default D3${type.charAt(0).toUpperCase() + type.slice(1)};
`;
}

function generateVueD3Component(type) {
  return `// D3.js ${type} Component (Vue 3)
<template>
  <svg ref="svgRef" :width="width" :height="height"></svg>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'D3${type.charAt(0).toUpperCase() + type.slice(1)}',
  props: {
    data: {
      type: Array,
      required: true
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 600
    }
  },
  setup(props) {
    const svgRef = ref(null);

    const render = () => {
      if (!props.data || !svgRef.value) return;

      const svg = d3.select(svgRef.value);

      // Clear previous render
      svg.selectAll("*").remove();

      // Add your D3 visualization code here
      console.log('Rendering ${type} with data:', props.data);
    };

    onMounted(render);
    watch(() => props.data, render);

    return { svgRef };
  }
};
</script>
`;
}

// MCP endpoints
app.post('/call-tool', async (req, res) => {
  const { name, arguments: args } = req.body;

  if (D3_TOOLS[name]) {
    const result = await D3_TOOLS[name](args);
    res.json(result);
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});

// Dashboard
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>D3.js MCP Server</title>
  <style>
    body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f5853b, #f97316); color: white; padding: 30px; border-radius: 12px; }
    .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tool { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 6px; }
    code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 D3.js MCP Server</h1>
    <p>Data Visualization & Chart Generation</p>
  </div>

  <div class="card">
    <h2>Available Tools</h2>
    <div class="tool">
      <h3>generateBarChart</h3>
      <p>Create interactive bar charts</p>
    </div>
    <div class="tool">
      <h3>generateLineChart</h3>
      <p>Create line charts for time series data</p>
    </div>
    <div class="tool">
      <h3>generatePieChart</h3>
      <p>Create pie charts for categorical data</p>
    </div>
    <div class="tool">
      <h3>generateScatterPlot</h3>
      <p>Create scatter plots for correlation analysis</p>
    </div>
    <div class="tool">
      <h3>processCSV</h3>
      <p>Process CSV data for visualization</p>
    </div>
    <div class="tool">
      <h3>generateD3Component</h3>
      <p>Generate D3.js component code for React, Vue, or Vanilla JS</p>
    </div>
  </div>

  <div class="card">
    <h2>Status</h2>
    <p><strong>Port:</strong> 3021</p>
    <p><strong>Status:</strong> 🟢 Running</p>
  </div>
</body>
</html>
  `);
});

// Start server
const PORT = 3021;
app.listen(PORT, () => {
  console.log('📊 D3.js MCP Server');
  console.log(`📈 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 API endpoint: http://localhost:${PORT}/call-tool`);
  console.log('✨ Ready to create data visualizations!');
});