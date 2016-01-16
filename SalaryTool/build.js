var rand = function(){ return Math.random()};
var num_canv = 4;
var num_charts = 4;
var padding = 10;
var charts = [];

var c_bar_fill = "rgba(62, 152, 106, 0.4)";
var c_bar_fill_highlight = "rgba(62, 152, 106, 0.3)";
var c_nav_highlight = "rgba(178, 229, 127, 0.8)";

window.onload = function(){
	
	var global = Chart.defaults.global;

	global.animationSteps = 100;
	global.animationEasing = "easeOutSine";	
	global.maintainAspectRatio = false;
	global.responsive = true;
	global.multiTooltipTemplate = "<%= datasetLabel %> - <%= value %>";
	
	var graph_column = document.getElementById("graph_column");
	
	populateLists();
	
	for(i = 0; i < num_canv; i++){
		createGraphDiv(graph_column, i);
	}
	
	window.onresize();
	window.onscroll();
		
	initCharts();
	
	document.getElementById("b_compute").addEventListener("click", bCompute);
	updateCharts();
}

window.onresize = function(){
	var win_width = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	var win_height = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;
	
	if(win_width > 700) win_width = 700;
	if(win_height > 900) win_height = 900;
	
	var div_width = (0.72*win_width);
	var div_height = (0.85 * (win_height-30));
	
	sizeForms(win_width);
	sizeColumns(div_width, div_height);
}

window.onscroll = function(){
	var el = document.getElementById("form");
	if(el.getBoundingClientRect().bottom-60 > 0){
		scrollHighlight(document.getElementById("salaries"));
		return;
	}
	for(i = 0; i < num_charts; i++){
		el = document.getElementById("section"+i);
		if(el.getBoundingClientRect().bottom-60 > 0){
			scrollHighlight(document.getElementById("nav"+i));
			return;
		}
	}
}

function keyPress(e){
	if( (e.keyCode ? e.keyCode : e.which) == 13){
		bCompute();
	}
}

function initCharts(){
	updateNaive(60000, 80000, "City", "City");
	updateEssentials(60000, 80000, "City", "City");
	updateSavings("City", "City");
	updateHouse("City", "City");
}

function bCompute(){
	var first_salary = document.getElementById("first_salary").value;
	var second_salary = document.getElementById("second_salary").value;
	var first_city = document.getElementById("first_city").value;
	var second_city = document.getElementById("second_city").value;	
	
	updateNaive(first_salary, second_salary, first_city, second_city);
	updateEssentials(first_salary, second_salary, first_city, second_city);
	updateHouse(first_city, second_city);
	updateSavings(first_city, second_city);
	
	updateCharts();
}

function updateNaive(first_salary, second_salary, first_city, second_city){
	if(charts[0] != null){
		charts[0].destroy();
	}
	
	var naive_data = {
		labels : ["Raw Income","Naive Normalization"],
		datasets : [
			{
				label: "First City",
				fillColor : c_bar_fill,
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: c_bar_fill_highlight,
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [100, 90]
			},
			{
				label: "Second City",
				fillColor : "rgba(178, 129, 217, 0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(178, 129, 217, 0.3)",
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [80, 92]
			}
		]
	}
	if(first_city != "City"){
		naive_data.datasets[0].label = first_city;
	}
	if(second_city != "City"){
		naive_data.datasets[1].label = second_city;
	}
	var first_col = COL_Data[first_city][0];
	var second_col = COL_Data[second_city][0];
	
	naive_data.datasets[0].data[0] = first_salary;
	naive_data.datasets[0].data[1] = Math.round((first_salary*(100/first_col)));
	
	naive_data.datasets[1].data[0] = second_salary;
	naive_data.datasets[1].data[1] = Math.round((second_salary*(100/second_col)));

	var ctx = document.getElementById("canvas0").getContext("2d");
	charts[0] = new Chart(ctx).Bar(naive_data, {});	
}

function updateEssentials(first_salary, second_salary, first_city, second_city){
	if(charts[1] != null){
		charts[1].destroy();
	}
	
	var essentials_data = {
		labels : ["First City","Second City"],
		datasets : [
			{
				label: "Basic needs",
				fillColor : "rgba(180,180,180,0.8)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(180,180,180,0.6)",
				highlightStroke: "rgba(220,220,220,0.8)",
				data : [20, 35]
			},
			{
				label: "Federal tax burden",
				fillColor : "rgba(178, 0, 0, 0.3)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(178, 0, 0, 0.2)",
				highlightStroke: "rgba(220,220,220,0.8)",
				data : [20, 25]
			},
			{
				label: "State/local tax burden",
				fillColor : "rgba(255, 150, 50, 0.4)",
				strokeColor : "rgba(220,220,220,0.)",
				highlightFill: "rgba(255, 150, 50, 0.25)",
				highlightStroke: "rgba(220,220,220,0.8)",
				data : [7, 9]
			},
			{
				label: "After Essentials",
				fillColor : c_bar_fill,
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: c_bar_fill_highlight,
				highlightStroke: "rgba(220,220,220,0.8)",
				data : [20, 25]
			}
		]
	}
	
	if(first_city != "City"){
		essentials_data.labels[0] = first_city;
	}
	if(second_city != "City"){
		essentials_data.labels[1] = second_city;
	}	
	
	var f_federal_rate;
	var s_federal_rate;	
	var f_stack = [];
	var s_stack = [];
	
	//First, calculate federal rates on raw income.
	f_federal_rate = averageFederalRate(first_salary, first_city);
	//Living wage data on top, subtract from raw income.
	f_stack[0] = COL_Data[first_city][2];
	first_salary -= f_stack[0];
	//Federal taxes next. (allways after living wage data)
	if(first_salary < 0){
		f_stack[1] = 0;
		first_salary = 0;
	}else{
		f_stack[1] = Math.round(f_federal_rate * first_salary);
	}
	first_salary -= f_stack[1];
	//State and local next.
	f_stack[2] = Math.round(COL_Data[first_city][1] * first_salary);
	first_salary -= f_stack[2];
	f_stack[3] = first_salary;
	
	for(i = 0; i < f_stack.length; i++){
		if(f_stack[i] < 0){
			f_stack[i] = 0;
		}
		essentials_data.datasets[i].data[0] = f_stack[i];
	}
	
	s_federal_rate = averageFederalRate(second_salary, second_city);
	s_stack[0] = COL_Data[second_city][2];
	second_salary -= s_stack[0];
	if(second_salary < 0){
		s_stack[1] = 0;
		second_salary = 0;
	}else{
		s_stack[1] = Math.round(s_federal_rate * second_salary);
	}
	second_salary -= s_stack[1];
	s_stack[2] = Math.round(COL_Data[second_city][1] * second_salary);
	second_salary -= s_stack[2];
	s_stack[3] = second_salary;
	
	for(i = 0; i < s_stack.length; i++){
		essentials_data.datasets[i].data[1] = s_stack[i];
	}	
	
	var ctx = document.getElementById("canvas1").getContext("2d");
	charts[1] = new Chart(ctx).StackedBar(essentials_data, {});
}

function updateSavings(first_city, second_city){
	if(charts[2] != null){
		charts[2].destroy();
	}

	var savings_data = {
		labels : ["Yearly","1 year", "5 years", "10 years", "20 years", "30 years"],
		datasets : [
			{
				label: "First City",
				fillColor : c_bar_fill,
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: c_bar_fill_highlight,
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [1000, 13000, 90000, 240000, 500000, 2000000]
			},
			{
				label: "Second City",
				fillColor : "rgba(178, 129, 217, 0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(178, 129, 217, 0.3)",
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [1000, 13000, 90000, 240000, 500000, 2000000]
			}
		]
	}

	if(first_city != "City"){
		savings_data.datasets[0].label = first_city;
	}
	if(second_city != "City"){
		savings_data.datasets[1].label = second_city;
	}
	
	var interest_rate = 0.07;
	//first in the array is the yearly savings rate;
	//second in the array is after 1 year of savings (with interest);
	//then 5 years, 10 years, 20 years, and 30 years.
	
	var city1_data = savings_data.datasets[0].data;
	var city2_data = savings_data.datasets[1].data;
	var left_over1 = charts[1].data.datasets[3].data[0];
	var left_over2 = charts[1].data.datasets[3].data[1];
	var contribution_rate = 0.25;
	
	left_over1 = Math.round(contribution_rate*left_over1);
	left_over2 = Math.round(contribution_rate*left_over2);
	
	city1_data[0] = left_over1;
	city1_data[1] = investmentGrowth(0, interest_rate, 1, left_over1);
	city1_data[2] = investmentGrowth(0, interest_rate, 5, left_over1);
	city1_data[3] = investmentGrowth(0, interest_rate, 10, left_over1);
	city1_data[4] = investmentGrowth(0, interest_rate, 20, left_over1);
	city1_data[5] = investmentGrowth(0, interest_rate, 30, left_over1);
	
	city2_data[0] = left_over2;
	city2_data[1] = investmentGrowth(0, interest_rate, 1, left_over2);
	city2_data[2] = investmentGrowth(0, interest_rate, 5, left_over2);
	city2_data[3] = investmentGrowth(0, interest_rate, 10, left_over2);
	city2_data[4] = investmentGrowth(0, interest_rate, 20, left_over2);
	city2_data[5] = investmentGrowth(0, interest_rate, 30, left_over2);
	
	var city1_div = document.getElementById("savings_city1");
	var city2_div = document.getElementById("savings_city2");
	city1_div.querySelector('div[title="name_city"]').innerHTML = "<h3>"+savings_data.datasets[0].label+"</h3>";
	city1_div.querySelector('div[title="yearly"]').innerHTML = "Yearly rate: $"+formatNumber(city1_data[0]);
	city1_div.querySelector('div[title="year1"]').innerHTML = "Year 1: $"+formatNumber(city1_data[1]);
	city1_div.querySelector('div[title="year5"]').innerHTML = "Year 5: $"+formatNumber(city1_data[2]);	
	city1_div.querySelector('div[title="year10"]').innerHTML = "Year 10: $"+formatNumber(city1_data[3]);
	city1_div.querySelector('div[title="year20"]').innerHTML = "Year 20: $"+formatNumber(city1_data[4]);	
	city1_div.querySelector('div[title="year30"]').innerHTML = "Year 30: $"+formatNumber(city1_data[5]);	
	
	city2_div.querySelector('div[title="name_city"]').innerHTML = "<h3>"+savings_data.datasets[1].label+"</h3>";
	city2_div.querySelector('div[title="yearly"]').innerHTML = "Yearly rate: $"+formatNumber(city2_data[0]);
	city2_div.querySelector('div[title="year1"]').innerHTML = "Year 1: $"+formatNumber(city2_data[1]);
	city2_div.querySelector('div[title="year5"]').innerHTML = "Year 5: $"+formatNumber(city2_data[2]);	
	city2_div.querySelector('div[title="year10"]').innerHTML = "Year 10: $"+formatNumber(city2_data[3]);
	city2_div.querySelector('div[title="year20"]').innerHTML = "Year 20: $"+formatNumber(city2_data[4]);	
	city2_div.querySelector('div[title="year30"]').innerHTML = "Year 30: $"+formatNumber(city2_data[5]);				
	
	var ctx = document.getElementById("canvas2").getContext("2d");
	charts[2] = new Chart(ctx).Bar(savings_data, {});
}

function investmentGrowth(principle, rate, term_years, yearly_contribution){
	rate = 1 + rate;
	var balance = principle*Math.pow(rate, term_years);
	balance += (yearly_contribution*((Math.pow(rate, term_years+1)-rate)/(rate-1)));
	return Math.round(balance);
}

function formatNumber(num){
	num = "" + num;
	var curr_index = 0;
	var max_len = num.length;
	var result = "";
	switch(max_len % 3){
		case 0:
			result += num.charAt(curr_index++);
		case 2:
			result += num.charAt(curr_index++);
		case 1:
			result += num.charAt(curr_index++);
		while(curr_index < max_len){
			result += ",";
			result += num.charAt(curr_index++);
			result += num.charAt(curr_index++);
			result += num.charAt(curr_index++);
		}
	}
	
	return result;
}

function updateHouse(first_city, second_city){
	if(charts[3] != null){
		charts[3].destroy();
	}

	var house_data = {
		labels : ["Median Price","10 year", "15 year", "30 year"],
		datasets : [
			{
				label: "First City",
				fillColor : c_bar_fill,
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: c_bar_fill_highlight,
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [100, 90]
			},
			{
				label: "Second City",
				fillColor : "rgba(178, 129, 217, 0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(178, 129, 217, 0.3)",
				highlightStroke: "rgba(180,180,180,0.6)",
				data : [80, 92]
			}
		]
	}

	var mortgage_rate = 0.035;
	
	if(first_city != "City"){
		house_data.datasets[0].label = first_city;
	}
	if(second_city != "City"){
		house_data.datasets[1].label = second_city;
	}
	
	var hds = house_data.datasets;
	var first_price = COL_Data[first_city][3]*1000;
	var second_price = COL_Data[second_city][3]*1000;
	hds[0].data[0] = first_price;
	hds[1].data[0] = second_price;
	
	var first_yearly = [];
	var second_yearly = [];
	
	first_yearly[0] = 12*monthlyPayment(first_price, 10, mortgage_rate);
	second_yearly[0] = 12*monthlyPayment(second_price, 10, mortgage_rate);
	first_yearly[1] = 12*monthlyPayment(first_price, 15, mortgage_rate+0.0025);
	second_yearly[1] = 12*monthlyPayment(second_price, 15, mortgage_rate+0.0025);
	first_yearly[2] = 12*monthlyPayment(first_price, 30, mortgage_rate+0.005);
	second_yearly[2] = 12*monthlyPayment(second_price, 30, mortgage_rate+0.005);
	
	for(i = 0; i < 3; i++){
		hds[0].data[1+i] = first_yearly[i];
		hds[1].data[1+i] = second_yearly[i];
	}
	
	var ctx = document.getElementById("canvas3").getContext("2d");
	charts[3] = new Chart(ctx).Bar(house_data, {});
}

function monthlyPayment(principle, term_years, rate){
	rate = rate/12;
	var term = term_years*12;
	return Math.round(principle * (rate*Math.pow((1+rate), term)) / 
			(Math.pow((1+rate), term) - 1));
}

function updateCharts(){
	for (c of charts){
		c.update();
	}
}

function scrollHighlight(new_focus){
	var clear = document.getElementsByClassName("nav_selected");
	
	[].forEach.call(clear, function(el){
		el.classList.remove("nav_selected");
	});
	new_focus.className = "nav_selected";
}

function sizeForms(win_width){
	var salary_font_size = win_width/82;
	
	document.getElementById("nav_inner").style['font-size'] = salary_font_size+'pt';
	var form = document.getElementById("form");
	for(i = 0; i < form.childNodes.length; i++){
		var c = form.childNodes[i];
		if(c instanceof HTMLElement){
			c.style['font-size'] = (salary_font_size*1.5)+'pt';
			c.style['width'] = (win_width*0.25)+'px';
		}
	}
}

function createGraphDiv(div_parent, div_num){
	var chart_style = "float:left; padding:0px; position:relative;"
	chart_style += " margin-bottom:40px;";
	
	var new_div = document.createElement("div");
	new_div.setAttribute("id", "section"+div_num);
	new_div.style.cssText = chart_style;
	
	div_parent.appendChild(new_div);
	
	new_div.innerHTML = "<canvas id='canvas"+div_num+"'></canvas>";
	var can = document.getElementById("canvas"+div_num);
	can.style.cssText = "padding:10px;";
}

function sizeColumns(div_width, div_height){
	var graph_column = document.getElementById("graph_column");
	var ex_column = document.getElementById("ex_column");
	
	graph_column.style.width = div_width+"px";
	graph_column.style.height = (div_height*4)+"px";
	ex_column.style.width = div_width+"px";
	ex_column.style.height = (div_height*4)+"px";
	ex_column.style.left = (30 + div_width + graph_column.offsetLeft)+"px";
	var div;
	var ex_div;
	
	for(i = 0; i < num_canv; i++){
		div = document.getElementById("section"+i);
		ex_div = document.getElementById("ex_section"+i);
		
		div.style.width = div_width+"px";
		div.style.height = div_height+"px";
		ex_div.style.height = (div_height-90)+"px";
	}
}

function populateLists(){
	var select1 = document.getElementById("first_city");
	var select2 = document.getElementById("second_city");
	//COL_Data is included in the HTML page, its a JS file that declares an object.
	
	for(key in COL_Data){
		var new_option = document.createElement("option");		
		new_option.value = key;
		new_option.innerHTML = key;
		select1.appendChild(new_option);
				
		var new_option = document.createElement("option");		
		new_option.value = key;
		new_option.innerHTML = key;		
		select2.appendChild(new_option);
	}
	//<option value="Seattle, WA">Seattle, WA</option>
}

function averageFederalRate(raw_income, location){
	if(raw_income == "" || raw_income < 0){
		return 0.0;
	}
	if(location.indexOf("Canada") == -1){
		//Based on 2010 CBO data, and a best fit line for the average effective tax.
		return ((0.099*Math.log(raw_income))-0.9842);
	}
	
	if(location.indexOf("Alberta") != -1){	
		return ((0.1127*Math.log(raw_income))-1.0357);
	}else if(location.indexOf("Nova Scotia") != -1){
		return ((0.1301*Math.log(raw_income))-1.1876);
	}else if(location.indexOf("Quebec") != -1){
		return ((0.1363*Math.log(raw_income))-1.2519);
	}else if(location.indexOf("Ontario") != -1){
		return ((0.1127*Math.log(raw_income))-1.037);
	}else if(location.indexOf("B.C.") != -1){
		return ((0.109*Math.log(raw_income))-1.0058);
	}else if(location.indexOf("Manitoba") != -1){
		return ((0.123*Math.log(raw_income))-1.1113);
	}
	
}