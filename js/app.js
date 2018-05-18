var appToken = "?$$app_token=LqgOb1RpiWCJRl2BQEJbqme64";

var urls = {
	wardBoundary: "https://data.cityofchicago.org/resource/k9yb-bpqx.json", 
	wardInfo: "https://data.cityofchicago.org/resource/7ia9-ayc2.json", 
	elemSchools: "https://data.cityofchicago.org/resource/n45m-yz4n.json", 
	highSchools: "https://data.cityofchicago.org/resource/juf9-y87b.json", 
	sweepSections: "", 
	sweepSchedule: "",
	cpsLink: "https://schoolinfo.cps.edu/schoolprofile/SchoolDetails.aspx?SchoolId="
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


window.onload = getLocation();
