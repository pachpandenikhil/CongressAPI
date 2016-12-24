<?php
//fetching query string
parse_str($_SERVER['QUERY_STRING']);

switch ($operation) {
    case "getData":
    	switch ($entity) {
    		case "legislators":
                $url = "./data/legislators.json";
                echo file_get_contents($url, FILE_USE_INCLUDE_PATH);
                break;
    		case "committees":
                $url = "./data/committees.json";
                echo file_get_contents($url, FILE_USE_INCLUDE_PATH);
                break;
		    case "bills":
                $active_bills_url = "./data/active_bills.json";
                $new_bills_url = "./data/new_bills.json";
                $active_bills_results = json_decode(file_get_contents($active_bills_url, FILE_USE_INCLUDE_PATH), TRUE);
                $new_bills_results = json_decode(file_get_contents($new_bills_url, FILE_USE_INCLUDE_PATH), TRUE);
                //merging two results
                $merged_result = array_merge($active_bills_results["results"],$new_bills_results["results"]);
                //$json = "{"results":" . 
                $final_result = "{\"results\":" . json_encode($merged_result) . "}";
                echo $final_result;
		        break;
    	}

        break;
    case "getTopCommittees":
        $url = "./data/barbara_boxer_top_5_committees.json";
		echo file_get_contents($url, FILE_USE_INCLUDE_PATH);
        break;
    case "getTopBills":
        $url = "./data/barbara_boxer_top_5_bills.json";
		echo file_get_contents($url, FILE_USE_INCLUDE_PATH);
        break;
}

?>