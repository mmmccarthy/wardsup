var appToken = "?$$app_token=LqgOb1RpiWCJRl2BQEJbqme64";

var urls = {
	wardBoundary: "https://data.cityofchicago.org/resource/k9yb-bpqx.json", 
	wardInfo: "https://data.cityofchicago.org/resource/7ia9-ayc2.json", 
	elemSchools: "https://data.cityofchicago.org/resource/n45m-yz4n.json", 
	highSchools: "https://data.cityofchicago.org/resource/juf9-y87b.json", 
	sweepSections: "https://data.cityofchicago.org/resource/eiv4-4c3n.json", 
	sweepSchedule: "https://data.cityofchicago.org/resource/dkvj-fe84.json",
	cpsLink: "https://schoolinfo.cps.edu/schoolprofile/SchoolDetails.aspx?SchoolId=",
	rodentRequests: "https://data.cityofchicago.org/resource/dvua-vftq.json",
	graffitiRequests: "https://data.cityofchicago.org/resource/cdmx-wzbz.json"
};


function getLocation(){
	console.log('Getting Location...');

	var options = {
	  enableHighAccuracy: true,
	  timeout: 10000,
	  maximumAge: 0
	};

	function success(pos) {
	  var crd = pos.coords;
	  //console.log(`More or less ${crd.accuracy} meters.`);

	  $('.loc-unknown').addClass('d-none');
	  var geoloc = crd;

	  console.log('Your current position is:');
	  console.log(`Latitude : ${geoloc.latitude}`);
	  console.log(`Longitude: ${geoloc.longitude}`);

	  getWard(geoloc);
	  getSchools(geoloc);
	  getSweepSection(geoloc);
	  getRodentRequests(geoloc);
	  getGraffitiRequests(geoloc);
	};

	function error(err) {
	  $('.loc-disabled').removeClass('d-none');
	  $('.loc-unknown').addClass('d-none');
	  console.warn(`ERROR(${err.code}): ${err.message}`);
	  var geoloc = false;
	};

	navigator.geolocation.getCurrentPosition(success, error, options);
}

function getWard(geoloc){
  //if(window.geloc !== undefined && window.geoloc !== null){
  console.log('Getting Ward...');
  	$.ajax({
         url: urls.wardBoundary+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "intersects(the_geom, 'POINT ("+geoloc.longitude+" "+geoloc.latitude+")')",
    		 }
      }).done(function(data){
      	console.log(data[0]);
        getWardInfo(data[0].ward);
      });
}

function getWardInfo(wardNum){
console.log('Getting Ward Info...');

  	$.ajax({
         url: urls.wardInfo+appToken,
         method: "GET",
  		 dataType: "json",
		 data: {
		   "$select": "*",
		   "$where": "WARD = "+wardNum
		 }
		  
		 /*/,
         //beforeSend: function(xhr){
         	//xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
         	//xhr.setRequestHeader('X-SODA2-Fields', '["ward"]');
         //} */
      }).done(function(data){
      	console.log(data[0]);
        wardInfo = data[0];
        var aldLast = wardInfo.alderman.split(' ');
        wardInfo.aldLast = aldLast[aldLast.length-1]; //get the last space-separated word
        showWardInfo(wardInfo);
      });
}

function showWardInfo(wardInfo){
	if(wardInfo != null){
	$('#ward-num').append(wardInfo.ward);
	$('#ward-ald').append(wardInfo.alderman);
	$('#ward-office-title').append(`Contact Ald. ${wardInfo.aldLast}`);
	$('#ward-office').html(`<span>${wardInfo.address}</span><br/><span>${wardInfo.city}, ${wardInfo.state} ${wardInfo.zipcode}</span>`);
	$('#ward-online').html(`<span><strong>Web:</strong> <a href="${wardInfo.website}" target="_blank">${wardInfo.website}</a></span><br /> <span><strong>Email:</strong> <a href="mailto:${wardInfo.email}">${wardInfo.email}</a></span>`);
	$('#ward-phone').html(`<span><strong>Phone:</strong> ${wardInfo.ward_phone}</span>`);
	$('.loc-results').removeClass('d-none');
	}else{
		console.log(wardInfo);
	}
}

function getSchools(geoloc){
	console.log('Getting Schools...');
	getElemSchools(geoloc);
	getHighSchools(geoloc);
}

function getElemSchools(geoloc){
	console.log('Getting Elem Schools...');
	$.ajax({
         url: urls.elemSchools+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "intersects(the_geom, 'POINT ("+geoloc.longitude+" "+geoloc.latitude+")')",
    		 }
      }).done(function(data){
      	showElemSchools(data);
      });
}

function getHighSchools(geoloc){
	console.log('Getting High Schools...');
	$.ajax({
         url: urls.highSchools+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "intersects(the_geom, 'POINT ("+geoloc.longitude+" "+geoloc.latitude+")')",
    		 }
      }).done(function(data){
      	showHighSchools(data);
      });
}

function showElemSchools(elem){
	if(elem != null){
		console.log(elem);
		$.each(elem, function(i, item){
			$('#elem-schools').append(`
				<div class="col">
				<div class="card" data-id="${i}">
  					<div class="card-header">
  						<h3 class="school-name">${elem[i].school_nm} <small class="text-muted float-right" style="text-transform: uppercase;">${elem[i].boundarygr}</small></h3>
  					</div>
  					<div class="card-body">
  						<p class="lead">
  						<strong>Address</strong><br/>
  						${elem[i].school_add}
  						</p>

  						<a class="btn btn-outline-info" href="${urls.cpsLink}${elem[i].school_id}" target="_blank" role="button">Learn more</a>
  					</div>
  				</div>
  				</div>
				`);
		});
		$('.school-results').removeClass('d-none');
	}else{
		console.log(elem);
	}
}

function showHighSchools(elem){
	if(elem != null){
		console.log(elem);
		$.each(elem, function(i, item){
			$('#high-schools').append(`
				<div class="col">
				<div class="card" data-id="${i}">
  					<div class="card-header">
  						<h3 class="school-name">${elem[i].school_nm} <small class="text-muted float-right" style="text-transform: uppercase;">${elem[i].boundarygr}</small></h3>
  					</div>
  					<div class="card-body">
  						<p class="lead">
  						<strong>Address</strong><br/>
  						${elem[i].school_add}
  						</p>

  						<a class="btn btn-outline-info" href="https://schoolinfo.cps.edu/schoolprofile/SchoolDetails.aspx?SchoolId=${elem[i].school_id}" target="_blank" role="button">Learn more</a>
  					</div>
  				</div>
  				</div>
				`);
		});
		$('.school-results').removeClass('d-none');
	}else{
		console.log(elem);
	}
}

function getSweepSection(geoloc) {
	console.log('Getting Sweep Section...');
	$.ajax({
         url: urls.sweepSections+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "intersects(the_geom, 'POINT ("+geoloc.longitude+" "+geoloc.latitude+")')",
    		 }
      }).done(function(data){
      	if(data[0].code != null){
      		getSweepSchedule(data[0].code);
      	}else{
      		console.log(`Sweep section error ${data}`);
      	}
      });
}

function getSweepSchedule(code){
	console.log('Getting Sweep Schedule...');
	$.ajax({
         url: urls.sweepSchedule+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "ward_section_concatenated": code,
    		 }
      }).done(function(data){
      	if(data != null){
      		showSweepSchedule(data);
      	}else{
      		console.log(`Sweep schedule error ${data}`);
      	}
      });
}

function showSweepSchedule(data){
if(data != null){
		console.log(data);
		$.each(data, function(i, item){
			//data[i].datesplit = data[i].dates.split(',');
			$('#sweep-schedule').append(`
				<div class="col">
				<h4 class="school-name">
					${data[i].month_name}
				</h4>
				<p class="lead month-cal" data-sweep-month="${data[i].month_number}">
					${data[i].dates}
				</p>
				</div>`);
		});
		//console.log(data);
		$('.sanitation-results').removeClass('d-none');
	}else{
		console.log(elem);
	}
}

function getRodentRequests(geoloc) {
	console.log('Getting Rodent Requests...');
	$.ajax({
         url: urls.rodentRequests+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "within_circle(location, "+geoloc.latitude+", "+geoloc.longitude+", 500)",
    		   "$order": "creation_date DESC",
    		   "$limit": 10
    		 }
      }).done(function(data){
      	if(data != null){
      		showRodentRequests(data);
      	}else{
      		console.log(`Rodent Requests error ${data}`);
      	}
      });
}

function showRodentRequests(data){
if(data != null){
		console.log(data);
		$.each(data, function(i, item){
			//data[i].datesplit = data[i].dates.split(',');
			$('#rodent-requests').append(`
				<tr>
				<td>${data[i].creation_date}</td>
				<td>${data[i].status}</td>
				<td>${data[i].street_address}</td>
				</tr>`);
		});
		//console.log(data);
		$('.311-results,.rodent-results').removeClass('d-none');
	}else{
		console.log(data);
		$('.rodent-results-help').removeClass('d-none').text("We did not find any rodent complaints near your location.");
	}
}

function getGraffitiRequests(geoloc) {
	console.log('Getting Rodent Requests...');
	$.ajax({
         url: urls.graffitiRequests+appToken,
         method: "GET",
  		   dataType: "json",
    		 data: {
    		   "$select": "*",
    		   "$where": "within_circle(location, "+geoloc.latitude+", "+geoloc.longitude+", 500)",
    		   "$order": "creation_date DESC",
    		   "$limit": 10
    		 }
      }).done(function(data){
      	if(data != null){
      		showGraffitiRequests(data);
      	}else{
      		console.log(`Graffiti Requests error ${data}`);
      	}
      });
}

function showGraffitiRequests(data){
if(data != null){
		console.log(data);
		$.each(data, function(i, item){
			//data[i].datesplit = data[i].dates.split(',');
			$('#graffiti-requests').append(`
				<tr>
				<td>${data[i].creation_date}</td>
				<td>${data[i].status}</td>
				<td>${data[i].street_address}</td>
				</tr>`);
		});
		//console.log(data);
		$('.311-results,.graffiti-results').removeClass('d-none');
	}else{
		console.log(data);
		$('.graffiti-results-help').removeClass('d-none').text("We did not find any graffiti complaints near your location.");
	}
}


window.onload = getLocation();
