<?php
include 'config.php';
$interval = 3500;
if(isset($_GET['interval'])){
	$interval = $_GET['interval']*1;
}else if(isset($_POST['interval'])){
	$interval = $_POST['interval']*1;
}

$query = "SELECT ST_AsGeoJSON(grid.the_geom) as geojson FROM (select st_setsrid(st_point(x, y), 4326) AS the_geom from  (select cast(generate_series(-797627, -71856, $interval) as float)/cast(10000 as float) AS x) AS a, (select cast(generate_series(404962, 450158,$interval)as float)/cast(10000 as float) AS y) AS b) AS grid, dtl_st WHERE ST_Within(grid.the_geom, dtl_st.geom) and STATE_FIPS = '36'";


$result = pg_query($query) or die("Query:<br> $query<br> failed:<br> " . pg_last_error());

$output = array();
$output['type'] = 'FeatureCollection';
$output['features'] = array();
$output['sql'] = $query;
$i = 0;
while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) {
	$feature = array();
	$feature['type'] = 'Feature';
	$feature['geometry'] = json_decode($row['geojson']);
	$fearure['properties'] = array();
	$feature['properties']['id'] = $i++;
	$output['features'][] = $feature;
}
$output['count'] = $i;
echo json_encode($output);
?>