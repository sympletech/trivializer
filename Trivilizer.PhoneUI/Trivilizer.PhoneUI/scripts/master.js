$(function () {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
});

var onSuccess = function (position) {
    console.log('Latitude: ' + position.coords.latitude + '\n' +
          'Longitude: ' + position.coords.longitude + '\n' +
          'Altitude: ' + position.coords.altitude + '\n' +
          'Accuracy: ' + position.coords.accuracy + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
          'Heading: ' + position.coords.heading + '\n' +
          'Speed: ' + position.coords.speed + '\n' +
          'Timestamp: ' + new Date(position.timestamp) + '\n');
};

function onError(error) {
    alert('code: ' + error.code + '\n' +
          'message: ' + error.message + '\n');
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