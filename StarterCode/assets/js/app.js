// @TODO: YOUR CODE HERE!
// set up the image variables

let svgHeight = 500;
let svgWidth = 960;

let margin = {
    top: 20,
    left: 100,
    right: 40,
    bottom: 80
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// set svg elements up for html
let svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);
let scatterGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// set initial axes
let chosenX = 'poverty';
let chosenY = 'healthcare';
let labelX = '';
let labelY = '';

// function to set the scale axes - input (data, chosenAxis, 'X' or 'Y')
// most languages I know stop executing on a return, but JS is weird so I'll explicityly define the else just in case
function axScale(stateData, chosenAxis, axis) {
    if (axis == 'X') {
        let xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenAxis]) * 0.8, 
                d3.max(stateData, d => d[chosenAxis]) * 1.2])
            .range([0, width]);
        return xLinearScale;
    }else if (axis == 'Y') {
        let yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(stateData, d => d[chosenAxis]) * 1.2])
            .range([height, 0]);
        return yLinearScale;
    }else{
        return axis;
    }
}

// going to store xAxis and yAxis in object called axes, access xAxis with axes.X, yAxis is axes.Y
// this is for the function defined below
// also making two arrays to store which text is X and which is Y
// this will be used much later in the program to filter which function to call
let axes = {}
let choicesX = ['poverty', 'age'];
let choicesY = ['healthcare', 'smokes'];

// function to update axes - input (newScale, axis_accessor, 'X' or 'Y')
function updateAxes(newScale, axes, axis) {
//    console.log(`Updating axis ${axis}`);
//    console.log(`${axes}`);
    console.log(`${newScale}`)
    if (axis == 'X') {
        let bottomAxis = d3.axisBottom(newScale);
        axes.X.transition()
            .duration(1000)
            .call(bottomAxis);
        return axes.X;
    }else if (axis == 'Y') {
        let leftAxis = d3.axisLeft(newScale);
        axes.Y.transition()
            .duration(1000)
            .call(leftAxis);
        return axes.Y;
    }else{
        return axes;
    }
}

// function to move circles when changing axes
// input (circleGroup, newScale, chosenAxis, 'X' or 'Y')
function updateCircles(circleGroup, newScale, chosenAxis, axis) {
    if (axis == 'X') {
        circleGroup.transition()
            .duration(1000)
            .attr('cx', d => newScale(d[chosenAxis]));
        return circleGroup;
    }else if (axis == 'Y') {
        circleGroup.transition()
            .duration(1000)
            .attr('cy', d => newScale(d[chosenAxis]));
        return circleGroup;
    }else{
        return circleGroup;
    }
}

// function to update tooltips
// input (circleGroup, 'X' or 'Y')
// updates global labelX, labelY
function updateTooltip(circleGroup, axis) {
    if (axis == 'X') {
        if (chosenX == choicesX[0]) {
            labelX = 'Poverty %:';
        }else{
            labelX = 'Age:';
        }
    }else if (axis == 'Y') {
        if (chosenY == choicesY[0]) {
            labelY = 'Healthcare %:';
        }else{
            labelY = 'Smoking %:';
        }
    }else{
        return axis;
    }
    let tooltip = d3.tip()
        .attr('class', 'tooltip')
        .offset([80, -60])
        .html(function(d) {
            return `${d.state}<hr>${labelX} ${d[chosenX]}<br>${labelY} ${d[chosenY]}`;
        });
    circleGroup.call(tooltip);

    circleGroup.on('mouseover', function(data) {
        tooltip.show(data, this);
    }).on('mouseout', function(data) {
        tooltip.hide(data);
    });
    return circleGroup;
}

// read in csv for use in the rest of the program
d3.csv('assets/data/data.csv').then(function(stateData) {
    // make types numeric
    stateData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
    });
    
    // create scales
    let xLinearScale = axScale(stateData, chosenX, 'X');
    let yLinearScale = axScale(stateData, chosenY, 'Y');

    // create initial axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append axes
    axes.X = scatterGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);
    axes.Y = scatterGroup.append('g')
        .call(leftAxis);
    
    // append initial circles and text
    // why is adding text so difficult???
    let circs = scatterGroup.selectAll('.circles')
        .data(stateData)
        .enter()
        .append('g')
        .classed('circles', true)
//        .attr('transform', d => `translate(${xLinearScale(d[chosenX])}, ${yLinearScale(d[chosenY])})`);

    let circleGroup = circs.append('circle')
        .attr('r', 20)
        .attr('stroke', '#000000')
        .attr('fill', '#8888ff')
        .attr('opacity', '0.8')
        .attr('cx', d => xLinearScale(d[chosenX]))
        .attr('cy', d => yLinearScale(d[chosenY]));
//
    circs.append('text')
        .attr('transform', d => `translate(${xLinearScale(d[chosenX])}, ${yLinearScale(d[chosenY])})`)
        .attr('dx', -12)
        .attr('dy', 6)
        .text(d => d.abbr);

    // group labels together
    let labelsGroup = scatterGroup.append('g');

    // group x-labels and move them
    let xLabels = labelsGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 20})`);
    let povLabel = xLabels.append('text')
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", 'poverty')
        .classed('active', true)
        .text('Poverty % by State');
    let ageLabel = xLabels.append('text')
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", 'age')
        .classed('inactive', true)
        .text('Med. Age by State');
    
    // group y-labels and move them
    let yLabels = labelsGroup.append('g')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em");
    let healthLabel = yLabels.append('text')
        .attr("x", -140)
        .attr("y", -40)
        .attr("value", 'healthcare')
        .classed('active', true)
        .text('Healthcare % by State');
    let smokeLabel = yLabels.append('text')
        .attr("x", -140)
        .attr("y", -20)
        .attr("value", 'smokes')
        .classed('inactive', true)
        .text('Smoking % by State');

    // update axes tooltips
    circleGroup = updateTooltip(circleGroup, 'X');
    circleGroup = updateTooltip(circleGroup, 'Y');

    // event listener on labelsGroup (X and Y labels)
    labelsGroup.selectAll('g').selectAll('text')
        .on('click', function() {
            let value = d3.select(this).attr('value');
            let axis = '';
            if (choicesX.includes(value)) {
                axis = 'X';
                if (value != chosenX) {
                    chosenX = value;
                }
            }else if (choicesY.includes(value)) {
                axis = 'Y';
                if (value != chosenY) {
                    chosenY = value;
                }
            }else{
                console.log(value, axis);
            }

            // do updates on chart elements
            let newLinearScale = axScale(stateData, value, axis);
            //console.log(`${newLinearScale}`);
            axes[axis] = updateAxes(newLinearScale, axes, axis);
            circleGroup = updateCircles(circleGroup, newLinearScale, value, axis);
            circleGroup = updateTooltip(circleGroup, axis);

            // bold/lighten text depending on active axis
            // x axis
            if (chosenX == choicesX[0]) {
                povLabel
                    .classed('active', true)
                    .classed('inactive', false);
                ageLabel
                    .classed('active', false)
                    .classed('inactive', true);
            }else if (chosenX == choicesX[1]) {
                povLabel
                    .classed('active', false)
                    .classed('inactive', true);
                ageLabel
                    .classed('active', true)
                    .classed('inactive', false);
            }
            // y axis
            if (chosenY == choicesY[0]) {
                healthLabel
                    .classed('active', true)
                    .classed('inactive', false);
                smokeLabel
                    .classed('active', false)
                    .classed('inactive', true);
            }else if (chosenY == choicesY[1]) {
                healthLabel
                    .classed('active', false)
                    .classed('inactive', true);
                smokeLabel
                    .classed('active', true)
                    .classed('inactive', false);
            }
        });
});