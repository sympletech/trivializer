$(function () {
    $('#vpophdr').fadeIn();

    $(".img-btn").live("click", function () {
        var href = $(this).attr("data-link");
        window.location.href = href;
    });

    InitFindGamePage();
});


//****************************
//      Utulities 
//****************************
function ReadQueryString(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function LoadPages() {
    $('div[data-role="view"]').each(function () {
        var src = $(this).attr('data-src');
        var target = this;
        if (src != null) {
            $.get(src, function (data) {
                $(target).html(data);
            });
        }
    });
}

function GetLocation() {
    navigator.geolocation.getCurrentPosition(LocationSuccess, LocationError);
}

var LocationSuccess = function (position) {
    console.log('Latitude: ' + position.coords.latitude + '\n' +
          'Longitude: ' + position.coords.longitude + '\n' +
          'Altitude: ' + position.coords.altitude + '\n' +
          'Accuracy: ' + position.coords.accuracy + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
          'Heading: ' + position.coords.heading + '\n' +
          'Speed: ' + position.coords.speed + '\n' +
          'Timestamp: ' + new Date(position.timestamp) + '\n');
};

function LocationError(error) {
    alert('code: ' + error.code + '\n' +
          'message: ' + error.message + '\n');
}

//****************************
//      Find A Game Page 
//****************************
$("#tabstrip-home #login").click(function() {
});


//****************************
//      Find A Game Page 
//****************************
function InitFindGamePage() {

}

