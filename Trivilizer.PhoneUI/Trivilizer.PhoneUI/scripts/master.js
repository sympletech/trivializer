$(function () {
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
function InitFindGamePage() {

}

function GetNearbyGames() {
    var game = {
        Id: 1,
        Name: 'Test Game',
        Description: 'This is a test game'
    };

    var games = [];

    for (var i = 0; i < 3; i++) {
        games.push(game);
    }

    for (var i in games) {
        $('#nearby-games').append("<li data-icon='toprated'>" +
            "<a class='game-link' data-game-id='" + games[i].Id + "' href='#tabstrip-ingame'>" +
            "<div class='game-name'>" + games[i].Name + "</div>" +
            "<div class=''>" + games[i].Description + "</div>" +
            "</a></li>");
    }
}