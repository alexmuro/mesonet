<?php
	$markers = $_POST["markers"];
	file_put_contents("exports/mesonet_stations.csv", "");
    $output = fopen("exports/mesonet_stations.csv",'w') or die("Can't open exports/mesonet_stations.csv");
	fputcsv($output, array('id','lat','lng'));
	foreach($markers as $marker) {
    	fputcsv($output, $marker);
	}
	fclose($output) or die("Can't close exports/mesonet_stations.csv");
	echo '{"status":"success"}';
?>