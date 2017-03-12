var app = angular.module('CongressAPI', ['angularUtils.directives.dirPagination']);

app.run(function($rootScope) {
    /*
        Receive emitted message and broadcast it.
    */
    $rootScope.$on('handleEmit', function(event, args) {
        $rootScope.$broadcast('handleBroadcast', args);
    });
});


app.controller('favorites_controller',function($scope) {
	 $scope.populateFavorites = function() {
        $scope.$emit('handleEmit', {});
    };

});


app.controller('legislators_by_state_controller',function($scope, $http) {
	var results = null;
	$scope.legislators = []; //declare an empty array

	if(localStorage.getItem("legislators") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=legislators").success(function(response) {
			results = response.results;
			localStorage.setItem("legislators", JSON.stringify(results));
			$scope.legislators = results;
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("legislators"));
		$scope.legislators = results;
	}


	$scope.getDetails = function(bioguide_id) {
		showLegislatorDetails(bioguide_id);
  	};

});

function showLegislatorDetails(bioguide_id) {
	$("#legislatorDetailsRightDiv").empty();
	populateLegislatorDetails(bioguide_id);
	populateLegislatorCommittees(bioguide_id);
	populateLegislatorBills(bioguide_id);
	addFavoritesButton("#legislatorFavoriteButton",bioguide_id);
	setFavoritesButtonClass(bioguide_id);
	$("#legislatorsCarousel").carousel(1);
}

function addFavoritesButton(div, id) {
	$(div).empty();
	var button = '<button class="btn btn-default btn-md favoritesButton" id="'+id+'" onclick="toggleFavorites(\''+id+'\');"><i class="fa fa-star-o fa-lg"></i></button>';
	$(button).appendTo(div);
}

function showLegislatorsMainPage() {
    $("#legislatorsCarousel").carousel(0);
}

function getProgressBarHtml(start, end) {
	var now  = moment().format('MMM D, YYYY');

	//calculating numerator
	var num_ms = moment(now,'MMM D, YYYY').diff(moment(start,'MMM D, YYYY'));
	var num_d = moment.duration(num_ms);
	var num_s = Math.floor(num_d.asHours());

	//calculating denominator
	var den_ms = moment(end,'MMM D, YYYY').diff(moment(start,'MMM D, YYYY'));
	var den_d = moment.duration(den_ms);
	var den_s = Math.floor(den_d.asHours());

	//calculating percentage
	var percentage = (num_s/den_s) * 100;
	percentage = Math.round(percentage);
	percentage = Math.min(100, percentage)
	var html = '<div class="img-rounded" id="termProgress"><div id="termBar" style="width:'+ percentage +'%;"><div id="progressLabel">'+ percentage +'%</div></div>&nbsp;</div>';

	return html;
}

function getParty(party) {
	var retVal = '';
	switch(party) {
	    case "D":
	        retVal = "Democrat";
	        break;
	    case "R":
	        retVal = "Republican";
	        break;
	    case "I":
	        retVal = "Independent";
	        break;
	    default:
	        retVal = "Republican";
	}
	return retVal;
}

function populateLegislatorDetails(bioguide_id) {

	if(localStorage.getItem("legislators") != null) {
		var results = JSON.parse(localStorage.getItem("legislators"));
		var idx = 0;
		var legislator = null;
		for (var i = 0; i < results.length; i++) {
			legislator = JSON.parse(JSON.stringify(results[i]));
			if(legislator.bioguide_id == bioguide_id) {
				break;
			}
		}

		//collecting all the values
		var imgSrc = 'https://theunitedstates.io/images/congress/original/'+ bioguide_id + '.jpg';
		var name = legislator.title + '. ' + legislator.last_name + ', ' + legislator.first_name;
		
		var email = '<div>&nbsp;</div>';

		if(legislator.oc_email != null) {
			email = '<a href="mailto:'+ legislator.oc_email +'" target="_blank">'+legislator.oc_email + '</a>';
		}

		var chamber = 'Chamber: ' + firstCharCapitalize(legislator.chamber);
		
		var contact = 'Contact: ';
		if(legislator.phone != null) {
			contact = 'Contact: <a href="tel:'+ legislator.phone +'" target="_blank">' + legislator.phone + '</a>';
		}

		var party = '<img src="images/'+ legislator.party +'.png" alt="'+legislator.party+'" height="25" width="25">&nbsp;&nbsp;' + getParty(legislator.party);

		var startTerm = moment(legislator.term_start).format('MMM D, YYYY');
		var endTerm = moment(legislator.term_end).format('MMM D, YYYY');
		var term = getProgressBarHtml(startTerm, endTerm);
		var office = legislator.office;
		var state = legislator.state_name;

		var fax = '<div>&nbsp;</div>';
		if(legislator.fax != null) {
			fax = '<a href="fax:'+ legislator.fax +'" target="_blank">' + legislator.fax + '</a>';
		}

		var birthday = moment(legislator.birthday).format('MMM D, YYYY');

		//creating social links
		var socialLinks = '';

		if(!isEmpty(legislator.twitter_id)) {
			var twitter = '<a href="https://twitter.com/'+legislator.twitter_id+'" target="_blank"><img height="30" width="30" src="images/twitter.png" alt="Twitter"></a>&nbsp;&nbsp;&nbsp;';
			socialLinks += twitter;
		}
		
		if(!isEmpty(legislator.facebook_id)) {
			var facebook = '<a href="https://www.facebook.com/'+legislator.facebook_id+'" target="_blank"><img height="30" width="30" src="images/facebook.png" alt="Facebook"></a>&nbsp;&nbsp;&nbsp;';
			socialLinks += facebook;
		}

		if(!isEmpty(legislator.website)) {
			var website = '<a href="'+legislator.website+'" target="_blank"><img height="30" width="30" src="images/website.png" alt="Website"></a>&nbsp;&nbsp;&nbsp;';
			socialLinks += website;
		}


		//setting all the values
		$('#legislatorImageDiv img').attr('src', imgSrc);
		$('#legislatorName').html(name);
		$('#legislatorEmail').html(email);
		$('#legislatorChamber').html(chamber);
		$('#legislatorContact').html(contact);
		$('#legislatorParty').html(party);
		$('#legislatorStartTerm').html(startTerm);
		$('#legislatorEndTerm').html(endTerm);
		$('#legislatorTerm').html(term);
		$('#legislatorOffice').html(office);
		$('#legislatorState').html(state);
		$('#legislatorFax').html(fax);
		$('#legislatorBirthday').html(birthday);
		$('#legislatorSocialLinks').html(socialLinks);
	}
    
}

function populateLegislatorCommittees(bioguide_id) {
	var results = null;
	var url = "http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getTopCommittees&entity=" + bioguide_id;
	$.getJSON(url, function(data) {
		results = data.results;
	});
	var idx = 0;
	var committee = null;
	var span = '<span id="legislatorDetailsCommitteesHeading">Committees</span>';
	var table = '<table class="table details-data" id="legislatorCommittees"><thead><tr><th>Chamber</th><th class="legislatorCommitteeID">Committee ID</th><th class="hideResponsive">Name</th></tr></thead><tbody>';

	for (var i = 0; i < results.length; i++) {
		table += '<tr>';
		committee = JSON.parse(JSON.stringify(results[i]));
		table += '<td>' + firstCharCapitalize(committee.chamber) + '</td>';
		table += '<td class="legislatorCommitteeID">' + committee.committee_id + '</td>';
		table += '<td class="hideResponsive">' + committee.name + '</td>';
		table += '</tr>';
	}
	table += '</tbody></table>';

	$(span).appendTo('#legislatorDetailsRightDiv');
	$(table).appendTo('#legislatorDetailsRightDiv');

}

function populateLegislatorBills(bioguide_id) {
	var results = null;
	var url = "http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getTopBills&entity=" + bioguide_id;
	$.getJSON(url, function(data) {
		results = data.results;
	});
	var idx = 0;
	var bill = null;
	var span = '<span id="legislatorDetailsBillsHeading">Bills</span>';
	var table = '<table class="table details-data" id="legislatorBills"><thead><tr><th>Bill ID</th><th class="hideResponsive">Title</th><th class="hideResponsive">Chamber</th><th class="hideResponsive">Bill Type</th><th class="hideResponsive">Congress</th>';
	table += '<th>Link</th></tr></thead><tbody>';

	for (var i = 0; i < results.length; i++) {
		table += '<tr>';
		bill = JSON.parse(JSON.stringify(results[i]));
		table += '<td>' + upperCase(bill.bill_id) + '</td>';
		table += '<td class="hideResponsive">' + bill.official_title + '</td>';
		table += '<td class="hideResponsive">' + firstCharCapitalize(bill.chamber) + '</td>';
		table += '<td class="hideResponsive">' + bill.bill_type + '</td>';
		table += '<td class="hideResponsive">' + bill.congress + '</td>';
		if(bill.last_version != null) {
			if(bill.last_version.urls != null) {
				if(bill.last_version.urls.pdf != null) {
					table += '<td><a href="' + bill.last_version.urls.pdf + '" target="_blank">Link</a></td>';
				}
				else {
					table += '<td></td>';
				}
			}
			else {
				table += '<td></td>';
			}
		}
		else {
			table += '<td></td>';
		}
		
		table += '</tr>';
	}
	table += '</tbody></table>';

	$(span).appendTo('#legislatorDetailsRightDiv');
	$(table).appendTo('#legislatorDetailsRightDiv');

}


app.filter('regex', function() {
  return function(input, field, regex) {
    var patt = new RegExp(regex);
    var out = [];
    for (var i = 0; i < input.length; i++) {
      if (patt.test(input[i][field]))
        out.push(input[i]);
    }
    return out;
  };
});


function firstCharCapitalize(text) {
	return (!!text) ?  text.charAt(0).toUpperCase() + text.substr(1).toLowerCase() : '';
}

function isEmpty(text) {
	return (!!text) ?  (  (!!(text.trim()))  ? false : true ) : true;
}

function upperCase(text) {
	return (!!text) ? text.toUpperCase() : '';
}

app.filter('first_char_capitalize', function() {
	return function(input) {
    	return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});


app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.toUpperCase() : '';
    }
});

app.controller('legislators_by_house_controller',function($scope, $http) {
	var results = null;
	$scope.legislators_by_house = []; //declare an empty array

	if(localStorage.getItem("legislators") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=legislators").success(function(response) {
			results = response.results;
			localStorage.setItem("legislators", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.chamber == "house") {
					$scope.legislators_by_house[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("legislators"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.chamber == "house") {
				$scope.legislators_by_house[idx++] = results[i];
			}
		}
	}

	$scope.getDetails = function(bioguide_id){
    	showLegislatorDetails(bioguide_id);
  	};

});


app.controller('legislators_by_senate_controller',function($scope, $http) {
	var results = null;
	$scope.legislators_by_senate = []; //declare an empty array

	if(localStorage.getItem("legislators") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=legislators").success(function(response) {
			results = response.results;
			localStorage.setItem("legislators", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.chamber == "senate") {
					$scope.legislators_by_senate[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("legislators"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.chamber == "senate") {
				$scope.legislators_by_senate[idx++] = results[i];
			}
		}
	}

	$scope.getDetails = function(bioguide_id){
    	showLegislatorDetails(bioguide_id);
  	};

});

function showBillsMainPage() {
    $("#billsCarousel").carousel(0);
}

function populateBillDetails(bill_id) {
	var results = null;
	if(localStorage.getItem("bills") != null) {
		var results = JSON.parse(localStorage.getItem("bills"));
		var idx = 0;
		var bill = null;

		for (var i = 0; i < results.length; i++) {
			bill = JSON.parse(JSON.stringify(results[i]));
			if(bill.bill_id == bill_id) {
				break;
			}
		}

		var table = '<table class="table details-data"><tbody>';

		table += '<tr>';
		table += '<td><b>Bill ID</td>';
		table += '<td>' + upperCase(bill.bill_id) + '</td>';
		table += '</tr>';

		table += '<tr class="hideResponsive">';
		table += '<td><b>Title</td>';
		table += '<td>' + bill.official_title + '</td>';
		table += '</tr>';

		table += '<tr>';
		table += '<td><b>Bill Type</td>';
		table += '<td>' + upperCase(bill.bill_type) + '</td>';
		table += '</tr>';

		table += '<tr>';
		table += '<td><b>Sponsor</td>';

		if(bill.sponsor != null)
			table += '<td>' + bill.sponsor.title + '. ' + bill.sponsor.last_name + ', ' + bill.sponsor.first_name + '</td>';
		else
			table += '<td></td>';
		table += '</tr>';

		table += '<tr>';
		table += '<td><b>Chamber</td>';
		table += '<td>' + firstCharCapitalize(bill.chamber) + '</td>';
		table += '</tr>';


		var status = 'Active';
		if(bill.history.active == false) {
			status = 'New';
		}

		table += '<tr>';
		table += '<td><b>Status</td>';
		table += '<td>' + status + '</td>';
		table += '</tr>';

		table += '<tr>';
		table += '<td><b>Introduced On</td>';

		if(bill.introduced_on != null) {
			table += '<td>' + moment(bill.introduced_on).format('MMM D, YYYY'); + '</td>';
		}
		else {
			table += '<td></td>';
		}

		table += '</tr>';


		table += '<tr>';
		table += '<td><b>Congress URL</td>';
		if(bill.urls != null)
			if(bill.urls.congress != null)
				table += '<td><a href="' + bill.urls.congress + '" target="_blank">URL</a></td>';
			else 
				table += '<td></td>';
		else
			table += '<td></td>';

		table += '</tr>';

		table += '<tr>';
		table += '<td><b>Version Status</td>';
		if(bill.last_version != null) 
			table += '<td>' + bill.last_version.version_name + '</td>';
		else
			table += '<td></td>';

		table += '</tr>';


		table += '<tr>';
		table += '<td><b>Bill URL</td>';

		if(bill.last_version != null)
			if(bill.last_version.urls != null)
				if(bill.last_version.urls.pdf != null)
					table += '<td><a href="' + bill.last_version.urls.pdf + '" target="_blank">Link</a></td>';
				else
					table += '<td></td>';
			else
				table += '<td></td>';
		else
			table += '<td></td>';
		
		table += '</tr>';


		table += '</tbody></table>';

		$(table).appendTo('#billDetailsLeftDiv');
	}
}


function embedBillPdf(bill_id) {
	var results = null;
	if(localStorage.getItem("bills") != null) {
		var results = JSON.parse(localStorage.getItem("bills"));
		var idx = 0;
		var bill = null;

		for (var i = 0; i < results.length; i++) {
			bill = JSON.parse(JSON.stringify(results[i]));
			if(bill.bill_id == bill_id) {
				break;
			}
		}

		if(bill.last_version != null)
			if(bill.last_version.urls != null)
				if(bill.last_version.urls.pdf != null) {
					var pdfURL = bill.last_version.urls.pdf;

					var html = '<object width="500" height="460" data="'+ pdfURL +'" class="hideResponsive"></object>';

					$(html).appendTo('#billDetailsRightDiv');
				}
		
	}
}

app.controller('active_bills_controller',function($scope, $http) {
	var results = null;
	$scope.active_bills = []; //declare an empty array

	if(localStorage.getItem("bills") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=bills").success(function(response) {
			results = response.results;
			localStorage.setItem("bills", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.history.active == true) {
					$scope.active_bills[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("bills"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.history.active == true) {
				$scope.active_bills[idx++] = results[i];
			}
		}
	}

	$scope.getDetails = function(bill_id){
    	showBillDetails(bill_id);
  	};

});

function showBillDetails(bill_id) {
	$("#billDetailsLeftDiv").empty();
	$("#billDetailsRightDiv").empty();
	populateBillDetails(bill_id);
	embedBillPdf(bill_id);
	addFavoritesButton("#billsFavoriteButton",bill_id);
	setFavoritesButtonClass(bill_id);
	$("#billsCarousel").carousel(1);
}

app.controller('new_bills_controller',function($scope, $http) {
	var results = null;
	$scope.new_bills = []; //declare an empty array

	if(localStorage.getItem("bills") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=bills").success(function(response) {
			results = response.results;
			localStorage.setItem("bills", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.history.active == false) {
					$scope.new_bills[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("bills"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.history.active == false) {
				$scope.new_bills[idx++] = results[i];
			}
		}
	}

	$scope.getDetails = function(bill_id){
    	showBillDetails(bill_id);
  	};

});

app.controller('house_committees_controller',function($scope, $http) {

	var results = null;
	$scope.house_committees = []; //declare an empty array

	if(localStorage.getItem("committees") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=committees").success(function(response) {
			results = response.results;
			localStorage.setItem("committees", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.chamber == "house") {
					$scope.house_committees[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("committees"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.chamber == "house") {
				$scope.house_committees[idx++] = results[i];
			}
		}
	}

	$scope.getClass = function(id) {
		if(localStorage.getItem(id) == null) {
			return 'fa fa-star-o fa-lg';
		}
		else {
			return 'fa fa-star fa-lg yellowStar';
		}
	};

	$scope.toggleFavoritesButton = function(id) {
		toggleFavorites(id);
    };

});

function toggleFavorites(id) {

	if(localStorage.getItem(id) == null) {
		$('#' + id).find("i").attr('class', 'fa fa-star fa-lg yellowStar');
		localStorage.setItem(id, id);
	}
	else {
		$('#' + id).find("i").attr('class', 'fa fa-star-o fa-lg');
		localStorage.removeItem(id);
	}
	
}

function setFavoritesButtonClass(id) {
	if(localStorage.getItem(id) != null) {
		$('#' + id).find("i").attr('class', 'fa fa-star fa-lg yellowStar');
	}
	else {
		$('#' + id).find("i").attr('class', 'fa fa-star-o fa-lg');
	}
}


app.controller('senate_committees_controller',function($scope, $http) {
	var results = null;
	$scope.senate_committees = []; //declare an empty array

	if(localStorage.getItem("committees") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=committees").success(function(response) {
			results = response.results;
			localStorage.setItem("committees", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.chamber == "senate") {
					$scope.senate_committees[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("committees"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.chamber == "senate") {
				$scope.senate_committees[idx++] = results[i];
			}
		}
	}

	$scope.getClass = function(id) {
		if(localStorage.getItem(id) == null) {
			return 'fa fa-star-o fa-lg';
		}
		else {
			return 'fa fa-star fa-lg yellowStar';
		}
	};

	$scope.toggleFavoritesButton = function(id) {
		toggleFavorites(id);
    };

});


app.controller('joint_committees_controller',function($scope, $http) {
	var results = null;
	$scope.joint_committees = []; //declare an empty array

	if(localStorage.getItem("committees") == null) {
		$http.get("http://custom-env.tq8tnpyzsz.us-west-2.elasticbeanstalk.com/u1OP1b6aJbTy.php?operation=getData&entity=committees").success(function(response) {
			results = response.results;
			localStorage.setItem("committees", JSON.stringify(results));
			var idx = 0;
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.chamber == "joint") {
					$scope.joint_committees[idx++] = results[i];
				}
			}
		});		
	}
	else {
		results = JSON.parse(localStorage.getItem("committees"));
		var idx = 0;
		for (var i = 0; i < results.length; i++) {
			var object = JSON.parse(JSON.stringify(results[i]));
			if(object.chamber == "joint") {
				$scope.joint_committees[idx++] = results[i];
			}
		}
	}

	$scope.getClass = function(id) {
		if(localStorage.getItem(id) == null) {
			return 'fa fa-star-o fa-lg';
		}
		else {
			return 'fa fa-star fa-lg yellowStar';
		}
	};

	$scope.toggleFavoritesButton = function(id) {
		toggleFavorites(id);
    };

});

function isLegislatorID(id) {
	var retValue = false;
	if(id != null) {
		if( (id == "legislators") || (id == "bills") || (id == "committees") ) {
			retValue = false;
		}
		else {
			//checking all the legislators data 
			if(localStorage.getItem("legislators") != null) {
				var results = JSON.parse(localStorage.getItem("legislators"));
				for (var i = 0; i < results.length; i++) {
					var object = JSON.parse(JSON.stringify(results[i]));
					if(object.bioguide_id == id) {
						retValue = true;
						break;
					}
				}
			}
		}
	}
	return retValue;
}

function getLegislator(id) {
	var legislator = null;
	if(id != null) {
		if(localStorage.getItem("legislators") != null) {
			var results = JSON.parse(localStorage.getItem("legislators"));
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.bioguide_id == id) {
					legislator = results[i];
					break;
				}
			}
		}
	}
	return legislator;
}

app.controller('favorite_legislators_controller',function($scope, $http) {
	$scope.$on('handleBroadcast', function(event, args) {
		var results = null;
		$scope.favorite_legislators = []; //declare an empty array
		var idx = 0;
		for (var i = 0; i < localStorage.length; i++) {
			var id = localStorage.key(i);
			if(isLegislatorID(id)) {
				$scope.favorite_legislators[idx++] = getLegislator(id);
			}
		    
		}
	});

	$scope.removeRow = function(id) {				
		var index = -1;		
		var legislatorsArr = eval($scope.favorite_legislators);
		for(var i = 0; i < legislatorsArr.length; i++) {
			var legislator = JSON.parse(JSON.stringify(legislatorsArr[i]));
			if(legislator.bioguide_id == id) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.favorite_legislators.splice(index, 1);

		toggleFavorites(id);
	};

	$scope.getDetails = function(bioguide_id) {
		$("#legislatorsDiv").show();
		showLegislatorDetails(bioguide_id);
		$("#favoritesDiv").hide();
		
  	};

  	$scope.hoverIn = function(event) {
		$(event.target).children().first().addClass("deleteButtonHover");
  	};

  	$scope.hoverOut = function(event) {
		$(event.target).children().first().removeClass("deleteButtonHover");
  	};

	
});

function deleteButtonHoverIn(button) {
	$(button).addClass("deleteButtonHover");
	alert("Done");
}

function isBillID(id) {
	var retValue = false;
	if(id != null) {
		if( (id == "legislators") || (id == "bills") || (id == "committees") ) {
			retValue = false;
		}
		else {
			//checking all the bills data 
			if(localStorage.getItem("bills") != null) {
				var results = JSON.parse(localStorage.getItem("bills"));
				for (var i = 0; i < results.length; i++) {
					var object = JSON.parse(JSON.stringify(results[i]));
					if(object.bill_id == id) {
						retValue = true;
						break;
					}
				}
			}
		}
	}
	return retValue;
}

function getBill(id) {
	var bill = null;
	if(id != null) {
		if(localStorage.getItem("bills") != null) {
			var results = JSON.parse(localStorage.getItem("bills"));
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.bill_id == id) {
					bill = results[i];
					break;
				}
			}
		}
	}
	return bill;
}


app.controller('favorite_bills_controller',function($scope, $http) {

	$scope.$on('handleBroadcast', function(event, args) {
		var results = null;
		$scope.favorite_bills = []; //declare an empty array
		var idx = 0;
		for (var i = 0; i < localStorage.length; i++) {
			var id = localStorage.key(i);
			if(isBillID(id)) {
				$scope.favorite_bills[idx++] = getBill(id);
			}
		    
		}
    });

    $scope.removeRow = function(id){				
		var index = -1;		
		var billsArr = eval($scope.favorite_bills);
		for(var i = 0; i < billsArr.length; i++) {
			var bill = JSON.parse(JSON.stringify(billsArr[i]));
			if(bill.bill_id == id) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.favorite_bills.splice(index, 1);
		toggleFavorites(id);

	};

	$scope.getDetails = function(bill_id){
		$("#billsDiv").show();
    	showBillDetails(bill_id);
    	$("#favoritesDiv").hide();
  	};

  	$scope.hoverIn = function(event) {
		$(event.target).children().first().addClass("deleteButtonHover");
  	};

  	$scope.hoverOut = function(event) {
		$(event.target).children().first().removeClass("deleteButtonHover");
  	};

});

function isCommitteeID(id) {
	var retValue = false;
	if(id != null) {
		if( (id == "legislators") || (id == "bills") || (id == "committees") ) {
			retValue = false;
		}
		else {
			//checking all the committees data 
			if(localStorage.getItem("committees") != null) {
				var results = JSON.parse(localStorage.getItem("committees"));
				for (var i = 0; i < results.length; i++) {
					var object = JSON.parse(JSON.stringify(results[i]));
					if(object.committee_id == id) {
						retValue = true;
						break;
					}
				}
			}
		}
	}
	return retValue;
}

function getCommittee(id) {
	var committee = null;
	if(id != null) {
		if(localStorage.getItem("committees") != null) {
			var results = JSON.parse(localStorage.getItem("committees"));
			for (var i = 0; i < results.length; i++) {
				var object = JSON.parse(JSON.stringify(results[i]));
				if(object.committee_id == id) {
					committee = results[i];
					break;
				}
			}
		}
	}
	return committee;
}


app.controller('favorite_committees_controller',function($scope, $http) {
	$scope.$on('handleBroadcast', function(event, args) {
		var results = null;
		$scope.favorite_committees = []; //declare an empty array
		var idx = 0;
		for (var i = 0; i < localStorage.length; i++) {
			var id = localStorage.key(i);
			if(isCommitteeID(id)) {
				$scope.favorite_committees[idx++] = getCommittee(id);
			}
		    
		}
	});

	$scope.removeRow = function(id) {				
		var index = -1;		
		var committeesArr = eval($scope.favorite_committees);
		for(var i = 0; i < committeesArr.length; i++) {
			var committee = JSON.parse(JSON.stringify(committeesArr[i]));
			if(committee.committee_id == id) {
				index = i;
				break;
			}
		}
		if( index === -1 ) {
			alert( "Something gone wrong" );
		}
		$scope.favorite_committees.splice(index, 1);
		toggleFavorites(id);
	};	


	$scope.hoverIn = function(event) {
		$(event.target).children().first().addClass("deleteButtonHover");
  	};

  	$scope.hoverOut = function(event) {
		$(event.target).children().first().removeClass("deleteButtonHover");
  	};

});


$(document).ready(function() {

	fillStatesList();

	$("#toggleNavBar").click(function(e) {
	    e.preventDefault();
	    $("#wrapper").toggleClass("toggled");
	});

	// Activate Legislators Carousel
    $("#legislatorsCarousel").carousel();
    
    // Enable Carousel Controls
    $("#left").click(function(){
        $("#legislatorsCarousel").carousel(0);
    });

    $.ajaxSetup({
		async: false
	})

	

});

function fillStatesList() {

	var states = new Array("All States", "Alabama", "Alaska", "American Samoa", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
		"District of Columbia", 
		"Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
		"Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
		"New Mexico", "New York", "North Carolina", "North Dakota", "Northern Mariana Islands", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", 
		"South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virgin Island", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming");

	for(var idx=0; idx < states.length; idx++) {
		if(idx == 0) {
			$('#state_selector').append('<option value=".*" selected>' + states[idx] + '</option>');
		}
		else if(states[idx] == "Virgin Island") {
			$('#state_selector').append('<option value="^' + "US Virgin Islands" + '$">' + states[idx] + '</option>');
		}
		else {
			$('#state_selector').append('<option value="^' + states[idx] + '$">' + states[idx] + '</option>');	
		}
		
	}
}


$("#legislatorsLabel").click(function(){
	$("#billsDiv").hide();
	$("#committeesDiv").hide();
	$("#favoritesDiv").hide();
    $("#legislatorsDiv").fadeIn("slow");
    
    
});

$("#billsLabel").click(function(){
	$("#legislatorsDiv").hide();
	$("#committeesDiv").hide();
	$("#favoritesDiv").hide();
	$("#billsDiv").fadeIn("slow");
    
});

$("#committeesLabel").click(function(){
    $("#legislatorsDiv").hide();
    $("#billsDiv").hide();
    $("#favoritesDiv").hide();
    $("#committeesDiv").fadeIn("slow");
});

$("#favoritesLabel").click(function(){
    $("#legislatorsDiv").hide();
    $("#billsDiv").hide();
    $("#committeesDiv").hide();
    $("#favoritesDiv").fadeIn("slow");
});



