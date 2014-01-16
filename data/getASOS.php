<?php
include 'config.php';


$query = "select station_name,latitute,longitude from asos_stations;";


$result = pg_query($query) or die("Query:<br> $query<br> failed:<br> " . pg_last_error());

$output = array();
$i = 0;
while ($row = pg_fetch_array($result, null, PGSQL_ASSOC)) {
	$feature = array();
	$feature['station_name'] = $row['station_name'];
	$feature['latitude'] = $row['latitute'];
	$feature['longitude'] = $row['longitude'];
	$output[] = $feature;
}

echo json_encode($output);
?>