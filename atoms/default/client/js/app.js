import * as d3 from 'd3'

const data =[]

const wrapperEl = d3.select('.interactive-uk-covid').node();

const isMobile = window.matchMedia('(max-width: 600px)').matches

const margin = {top: 20, right: 20, bottom: 25, left: 30}

const width = wrapperEl.getBoundingClientRect().width;

const height = isMobile ? window.innerHeight*0.5 : Math.min(500, Math.max(window.innerHeight*0.75 - 100, 350))

const parseTime = d3.timeParse("%d/%m/%Y")

let xScale = d3.scaleTime().range([margin.left, width  - margin.right]);

let yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

let valueline = d3.line()
.x(function(d) { return xScale(d.date); })
.y(function(d) { return yScale(d.value); })

let svg = d3.select(".interactive-uk-covid")
.append("svg")
.attr("width", width)
.attr("height", height)


let curtain;

d3.json('https://interactive.guim.co.uk/docsdata-test/1-_nmS7kPobbWHghj1a-IWAtSsgW5b7RKiaYXfobQjVs.json').then(results => {

	results.sheets.data.map(entry => data.push({date:parseTime(entry.Date), value:+entry.Deaths}));

	let max = d3.max(data, d => d.value);

	xScale.domain([parseTime('30/01/2020'), parseTime('01/12/2020')]);
	yScale.domain([0, max]);

	let yaxis = svg.append("g")
	.attr("class", "y axis")
	.attr("text-anchor", "start")
	.call(d3.axisLeft(yScale)
		.ticks(5)
		.tickSizeInner(-width)
	)
	.selectAll("text")
    .style("text-anchor", "start");

    let xaxis = svg.append("g")
	.attr("transform", "translate(0," + (height - margin.bottom) + ")")
	.attr("class", "x axis")
	.call(
			d3.axisBottom(xScale)
			.tickFormat(d3.timeFormat("%b"))
			.ticks(isMobile ? 3 : d3.timeMonth)
		);


	let line = svg.append("path")
	.data([data])
	.attr("class", "linePath")
	.attr("d", valueline)

	curtain = svg.append('g').attr('class', 'curtain');

	curtain
	.append('rect')
	.attr('height', height - margin.bottom + 4)
	.attr('width', width)

	let ticks = d3.selectAll(".y.axis .tick").nodes()

	ticks.map((line,i) => {

		curtain.append('line')
		.attr('x1', 0)
		.attr('x2', width)
		.attr('y1', 0)
		.attr('y2', 0)
		.attr('transform', "translate(0,"+ Number(d3.select(line).attr('transform').split("translate(0,")[1].split(')')[0]) +")")
		.attr('class', 'line')

	})

	makeTransition('01/12/2020')
})


const makeTransition = (date) => {

	let target = xScale(parseTime(date)) -1

	curtain
	.transition()
	.ease(d3.easeSin)
	.duration(1000)
	.attr('transform', 'translate(' + target + ', 0)')

	
}