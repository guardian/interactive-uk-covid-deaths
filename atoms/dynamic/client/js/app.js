import * as d3 from 'd3'

const isMobile = window.matchMedia('(max-width: 600px)').matches;

const breakPoints = [

new Date('2020 01 30'),
new Date('2020 03 11'),
new Date('2020 03 12'),
new Date('2020 03 13'),
new Date('2020 03 17'),
new Date('2020 03 23'),
new Date('2020 03 24'),
new Date('2020 03 27'),
new Date('2020 03 31'),
new Date('2020 04 01'),
new Date('2020 04 02'),
new Date('2020 04 03'),
new Date('2020 04 13'),
new Date('2020 04 17'),
new Date('2020 04 27'),
new Date('2020 05 10'),
new Date('2020 05 12'),
new Date('2020 05 20'),
new Date('2020 05 22'),
new Date('2020 05 23'),
new Date('2020 06 16')
]

let iniDate = new Date('2020 01 30');
let endDate = new Date('2020 12 01');

const wrapperEl = d3.select('.interactive-uk-covid').node();

// Set the dimensions of the canvas / graph
const margin = {top: 30, right: 20, bottom: 20, left: 50};
const width = wrapperEl.getBoundingClientRect().width;
const height = isMobile ? window.innerHeight*0.5 : Math.min(500, Math.max(window.innerHeight*0.75 - 100, 350));


// Adds the svg canvas
let svg = d3.select(".interactive-uk-covid")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

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
			//.tickFormat(d => numberWithCommas(d))
			.tickSizeInner(-width)
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
			.ticks(4))

	}
   
// Get the data
d3.json('https://interactive.guim.co.uk/docsdata-test/1-_nmS7kPobbWHghj1a-IWAtSsgW5b7RKiaYXfobQjVs.json').then(results => {

    results.sheets.data.map(d => data.push({
        date: parseDate(d.Date),
        value: +d.Deaths
    })
    );

    xScale.domain([iniDate, new Date('2020 03 11')]);
    yScale.domain([d3.min(data.filter(data => data.date <= breakPoints[1]), d => d.value), d3.max(data.filter(data => data.date <= breakPoints[1]), d => d.value)]);

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


const updateData = (data) => {

    xScale.domain(d3.extent(data, d => d.date));
	yScale.domain([0, d3.max(data, d => d.value)]);

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

breakPoints.map( (d,i) => {

	if(i >= 1)
	{
		d3.select(".interactive-uk-covid")
		.append('button')
		.html(d.getDate())
		.on('click', b => updateData(data.filter(data => data.date <= d)))
	}

	

})


