var mesonet = {
	container:'',
	opacity:1,
	map:{},
	svg:{},
	g:{},
	datasource:'',
	geodata: {},
	interval:3500,
	ll:5,
	path:{},
	feature:{},
	nys:{},
	brewer:['YlGn','YlGnBu','GnBu','BuGn','PuBuGn','PuBu','BuPu','RdPu','PuRd','OrRd','YlOrRd','YlOrBr','Purples','Blues','Greens','Oranges','Reds','Greys','PuOr','BrBG','PRGn','PiYG','RdBu','RdGy','RdYlBu','Spectral','RdYlGn','Accent','Dark2','Paired','Pastel1','Pastel2','Set1','Set2','Set3'],
	brewer_index:1,
	bounds:[],
	init : function(container) {
		if(typeof container != 'undefined'){ mesonet.container = container; }
		toggles.init();
		loader.push(mesonet.loadNYS);
		if(mesonet.datasource !== '' ){ loader.push(mesonet.loadData); }
		loader.push(mesonet.drawMap);
		loader.run();
	},
	loadNYS :function(){
		$.ajax({url:'data/getNYS.php',
				type : 'POST',
				dataType:'json',
				async:false
		})
		.done(function(data) {
			mesonet.nys = data;
		})
		.fail(function(data) { console.log(data.responseText); });
		loader.run();
	},
	loadData : function() {
		$.ajax({url:mesonet.datasource,
				type : 'POST',
				data : {interval:mesonet.interval},
				dataType:'json',
				async:false
		})
		.done(function(data) {
			mesonet.geodata = data;
			//console.log(mesonet.geodata);
			$('#num_stations').html(data.count);
		})
		.fail(function(data) { console.log(data.responseText); });
		loader.run();
	},
	drawMap : function() {

		var satellite = new L.TileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0pml9h7/{z}/{x}/{y}.png");
		var terrain = new L.TileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0pna3ah/{z}/{x}/{y}.png");
		var streets = new L.TileLayer("http://{s}.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png");
		var baseMaps = {
			"Streets": streets,
			"Satellite": satellite,
			"Terrain": terrain
		};
		mesonet.map = new L.Map(mesonet.container, {
			center: [42.76314586689494,-74.7509765625],
			zoom: 7,
			attributionControl:false,
			layers: [streets, satellite,terrain]
		});
		L.control.layers(baseMaps,{},{position:'topleft'}).addTo(mesonet.map);
			
		mesonet.svg = d3.select(mesonet.map.getPanes().overlayPane).append("svg");
		mesonet.g = mesonet.svg.append("g").attr("class", "leaflet-zoom-hide stations");

		mesonet.bounds = d3.geo.bounds(mesonet.nys);
		console.log(mesonet.bounds);
		mesonet.path = d3.geo.path().projection(mesonet.project);
		
		mesonet.feature=mesonet.g.selectAll("path")
			.data(mesonet.geodata.features)
		.enter().append("path")
			.attr("class", function(d) { return 'station';})
			.attr("d", mesonet.path);
			
		mesonet.map.on("viewreset", mesonet.reset);
		mesonet.reset();
		
		// Reposition the SVG to cover the features.
		
		
		loader.run();
	},
	reset : function() {
			
		var bottomLeft = mesonet.project(mesonet.bounds[0]),
			topRight = mesonet.project(mesonet.bounds[1]);
			
		mesonet.svg.attr("width", topRight[0] - bottomLeft[0])
			.attr("height", bottomLeft[1] - topRight[1])
			.style("margin-left", bottomLeft[0] + "px")
			.style("margin-top", topRight[1] + "px");
		mesonet.g.attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");

		mesonet.feature.attr("d", mesonet.path);

	},
	project : function(x) {
		var point = mesonet.map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
		return [point.x, point.y];
	},
	updateMap : function() {
		loader.push(mesonet.loadData);
		loader.run();

		//mesonet.bounds = d3.geo.bounds(mesonet.geodata);
		mesonet.feature=mesonet.g.selectAll("path")
			.data(mesonet.geodata.features);

		mesonet.feature
			.enter()
				.append('path');

		mesonet.feature
			.attr("d", mesonet.path)
			.attr("class", function(d) { return 'station';});

		mesonet.feature
			.exit().remove();

		//mesonet.reset();

	},
};
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
var toggles = {
	init : function() {
		$("#legend h2 a").on("click", function() {
			$(this).toggleClass("closed");
			$("#legend-detail").slideToggle(300);
			return false;
		});
	}
};

//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
var loader = {
	queue: [],
	push: function(fn, scope, params) {
		this.queue.push(function(){ fn.apply(scope||window, params||[]); });
	},
	run: function(){
		if(this.queue.length) this.queue.shift().call();
	}
};
//------------------------------------------------------------------------------------------------------------
// Helper Functions
//--------------------------------------------------------------------------------------------------------------
function number_format(x){
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
	
