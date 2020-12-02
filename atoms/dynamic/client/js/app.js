import * as d3 from 'd3'
import {numberWithCommas} from 'shared/js/util.js'

const isMobile = window.matchMedia('(max-width: 600px)').matches;

const breakPoints = [

{date: new Date('2020 03 11'), scale: 100},
{date: new Date('2020 03 12'), scale: 100},
{date: new Date('2020 03 13'), scale: 100},
{date: new Date('2020 03 17'), scale: 200},
{date: new Date('2020 03 23'), scale: 1000},
{date: new Date('2020 03 24'), scale: 1500},
{date: new Date('2020 03 25'), scale: 1500},
{date: new Date('2020 03 27'), scale: 2000},
{date: new Date('2020 03 31'), scale: 10000},
{date: new Date('2020 04 01'), scale: 10000},
{date: new Date('2020 04 02'), scale: 10000},
{date: new Date('2020 04 03'), scale: 10000},
{date: new Date('2020 04 13'), scale: 30000},
{date: new Date('2020 04 17'), scale: 30000},
{date: new Date('2020 04 27'), scale: 40000},
{date: new Date('2020 05 10'), scale: 50000},
{date: new Date('2020 05 12'), scale: 50000},
{date: new Date('2020 05 20'), scale: 50000},
{date: new Date('2020 05 22'), scale: 60000},
{date: new Date('2020 05 23'), scale: 60000},
{date: new Date('2020 06 16'), scale: 60000},
{date: new Date('2020 06 18'), scale: 60000},
{date: new Date('2020 06 30'), scale: 60000},
{date: new Date('2020 07 04'), scale: 60000},
{date: new Date('2020 08 17'), scale: 60000},
{date: new Date('2020 08 25'), scale: 60000},
{date: new Date('2020 09 03'), scale: 60000},
{date: new Date('2020 09 09'), scale: 60000},
{date: new Date('2020 09 22'), scale: 60000},
{date: new Date('2020 10 12'), scale: 60000},
{date: new Date('2020 11 01'), scale: 60000},
{date: new Date('2020 12 01'), scale: 70000}

]

let iniDate = new Date('2020 01 30');
let endDate = new Date('2020 12 01');

const wrapperEl = d3.select('.interactive-uk-covid').node();

// Set the dimensions of the canvas / graph
const margin = {top: 30, right: 0, bottom: 25, left: 50};
const width = wrapperEl.getBoundingClientRect().width;
const height = isMobile ? window.innerHeight*0.5 : Math.min(500, Math.max(window.innerHeight*0.75 - 100, 350));


// Adds the svg canvas
let svg = d3.select(".interactive-uk-covid")
.append("svg")
.attr("width", width -5)
.attr("height", height)

// Parse the date / time
let parseDate = d3.timeParse("%d/%m/%Y")

// Set the ranges
let xScale = d3.scaleTime().range([margin.left, width - margin.right]);
let yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Define the line
let valueline = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value));


const data = [];

let yAxis = (g) => {
	return g
	.attr("class", 'y axis')
	.call(d3.axisLeft(yScale)
			.tickFormat(d => numberWithCommas(d))
			.tickSizeInner(-width - 20)
			.ticks(3)
	)
	.selectAll("text")
	.style("text-anchor", "start")
	.attr('x', 0)
	.attr('y', -10);
	}

let xAxis = (g) => {
		return g
		.attr('transform', `translate(0, ${height - margin.bottom})`)
		.attr("class", 'x axis')
		.call(d3.axisBottom(xScale)
			.tickFormat(d => d.getDate() == 1 ? d3.timeFormat("%b")(d) : d3.timeFormat("%d %b")(d))
			.ticks(isMobile ? 2 : 4))

	}
   
// Get the data
d3.json('https://interactive.guim.co.uk/docsdata-test/1-_nmS7kPobbWHghj1a-IWAtSsgW5b7RKiaYXfobQjVs.json').then(results => {

    results.sheets.data.map(d => data.push({
        date: parseDate(d.Date),
        value: +d.Deaths
    })
    );

    xScale.domain([iniDate, new Date('2020 03 11')]);
    yScale.domain([0, 200]);

   	svg.append("g")
	.call(xAxis); 

	svg.append("g")
	.call(yAxis);

    // Add the valueline path.
    svg.append("path")
    .data([data])
	.attr("class", "linePath")
	.attr("d", valueline)

});


const updateData = (data, scale) => {

    xScale.domain(d3.extent(data, d => d.date));
	yScale.domain([0, scale]);

    svg.selectAll(".y.axis")
	.transition()
	.duration(1000)
	.call(yAxis);

	svg.selectAll(".x.axis")
	.transition()
	.duration(1000)
	.call(xAxis);

	svg.select(".linePath")
	.transition()
	.duration(1000)	
	.attr("d", valueline)
}

breakPoints.map( d => {

	d3.select(".interactive-uk-covid")
	.append('button')
	.html(d.date.getDate() + '/'  + (d.date.getMonth() + 1))
	.on('click', b => updateData(data.filter(data => data.date <= d.date), d.scale))

})


