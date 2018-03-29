
// basic SVG object
var svg = d3.select("svg"),
    margin = 50,
    width = svg.attr("width") - 2 * margin,
    height = svg.attr("height") - margin

// tick labels
var tick_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                    'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// define scales
var xScale = d3.scaleBand().range([0, width]).padding(0.05),
    yScale = d3.scaleLinear().range([height - 70, 0]);

// create g element
var g = svg.append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");



// load data
d3.csv("meteo.csv", function(d){ 

   return {
       year : d.year,
       month : d.month,
       day : d.day,
       temperature : +d.temperature // changing temperature to float
   };


    }, 
    
    function(data) {

//define min max year, used for interactivity
    var year0 = d3.min(data, function(d) { return d.year; }),
        year1 = d3.max(data, function(d) { return d.year; }),
        year = year1;

    // add title
    svg.append("text")
        .attr("class", "title")
        .attr('transform',`translate(${width-170},${85})`)
        .attr("x", 50)
        .attr("y", 50)
        .attr("font-size", "80")
        .attr('font-weight', 'bold')
        .attr('fill', 'rgba(0, 0, 0, 0.7)')
        .text(year);
        
            

    // filter data for one year
    var filtered_data = data.filter(function (el) {
        return el.year === year
    
        });

    // take only month and temperature
   var small_data = filtered_data.map(function(d) {
            return {
               month : d.month,
               temperature : d.temperature
           };

   });

   // final dataset for the plot
   var temp_by_month = d3.nest()
           .key(function(d) {    
                return d.month
            ;})
           .rollup(function(v) {
               return d3.mean(v, function(d) {
                   return d.temperature / 10;
               })
           })
           .entries(small_data);
   
    
    // recalculate the scale
   xScale.domain(data.map(function(d) { return d.month; }));
   yScale.domain([0, d3.max(temp_by_month, function(d) { 
        return d.value; })]);

    // call the x axis
   g.append("g")
        .attr("transform", `translate(0, ${height - 70})`)
        .call(d3.axisBottom(xScale)
        .tickFormat(function(d, i){ return tick_labels[i] }));
        

    // call the y axis
    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
        /*
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .text("Temperature");
        */

    //create rectangles
    g.selectAll(".bar")
        .data(temp_by_month)
        .enter().append("rect") 
        .attr("class", "bar") 
        .attr("x", function(d) { return xScale(d.key); })
        .attr("y", function(d) { return yScale(d.value); })
        .attr("width", xScale.bandwidth()) 
        .attr("height", function(d) { 
            return height - 70 - yScale(d.value); });

    //add labels
    g.selectAll(".bartext")
        .data(temp_by_month)
        .enter()
        .append("text")
        .attr("class", "bartext")
        .attr("text-anchor", "middle")
        .attr('font-size', '14')
        .attr('font-weight', '600')
        .attr("fill", 'rgba(0, 0, 0, 0.7)')
        .attr("x", function(d) {
            return xScale(d.key) + xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
            return yScale(d.value + 0.2);
        })
        .text(d => d.value.toFixed(1));

    //add y label
    g.append('text')
        .attr('class', 'label-y')
        .text('temp')
        .attr('font-size', '120')
        .attr('font-weight', 'bold')
        .attr('transform',`translate(${85},${height- 67})rotate(-90)`)
        .attr('fill', 'rgba(0, 0, 0, 0.35)');

    //add x label
    g.append('text')
        .attr('class', 'label-x')
        .text('months')
        .attr('font-size', '120')
        .attr('font-weight', 'bold')
        .attr('transform',`translate(${width - 503},${height-70})`)
        .attr('fill', 'rgba(0, 0, 0, 0.35)');

    // Allow the switching between years by arrows
    window.focus();
    d3.select(window).on("keydown", function() {
        switch (d3.event.keyCode) {
        case 37: year = Math.max(year0, parseInt(year) - 1); break;
        case 39: year = Math.min(year1, parseInt(year) + 1); break;
        }
        update();
    });

    //def update function
    function update() {
        year = String(year)
        console.log(typeof year)
        console.log(year)

        
        svg.select('text.title')
            .text(year)
            

        filtered_data = data.filter(function (el) {
            return el.year === year
        
            });
    
        
        small_data = filtered_data.map(function(d) {
                return {
                    month : d.month,
                    temperature : d.temperature
                };
    
        });
    
        
        temp_by_month = d3.nest()
                .key(function(d) {    
                    return d.month
                ;})
                .rollup(function(v) {
                    return d3.mean(v, function(d) {
                        return d.temperature / 10;
                    })
                })
                .entries(small_data);
        


        yScale.domain([0, d3.max(temp_by_month, function(d) { 
                return d.value; })]);
        
        g.select(".y.axis").transition()
            .call(d3.axisLeft(yScale));


     

        g.selectAll(".bar")
            .data(temp_by_month)
            .attr("x", function(d) { return xScale(d.key); })
            .attr("y", function(d) { return yScale(d.value); })
            .attr("width", xScale.bandwidth()) 
            .attr("height", function(d) { 
                return height - 70 - yScale(d.value); });

        g.selectAll(".bartext")
            .data(temp_by_month)
            .attr("class", "bartext")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("x", function(d) {
                return xScale(d.key) + xScale.bandwidth() / 2;
            })
            .attr("y", function(d) {
                return yScale(d.value + 0.2);
            })
            .text(d => d.value.toFixed(1));
            

    }
});
