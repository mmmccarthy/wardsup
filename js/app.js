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
         url: "https://data.cityofchicago.org/resource/k9yb-bpqx.json?$$app_token=LqgOb1RpiWCJRl2BQEJbqme64",
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
         url: "https://data.cityofchicago.org/resource/7ia9-ayc2.json?$$app_token=LqgOb1RpiWCJRl2BQEJbqme64",
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
	$('#ward-online').html(`<span><strong>Web:</strong> <a href="${wardInfo.website}">${wardInfo.website}</a></span><br /> <span><strong>Email:</strong> <a href="mailto:${wardInfo.email}">${wardInfo.email}</a></span>`);
	$('#ward-phone').html(`<span><strong>Phone:</strong> ${wardInfo.ward_phone}</span>`);
	$('.loc-results').removeClass('d-none');
	}else{
		console.log(wardInfo);
	}
}


window.onload = getLocation();
