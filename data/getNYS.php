<?php
include 'config.php';


$query = "SELECT ST_AsGeoJSON(geom) as geojson from dtl_st WHERE  STATE_FIPS = '36'";


$result = pg_query($query) or die("Query:<br> $query<br> failed:<br> " . pg_last_error());

$output = array();
$output['type'] = 'FeatureCollection';
$output['features'] = array();
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