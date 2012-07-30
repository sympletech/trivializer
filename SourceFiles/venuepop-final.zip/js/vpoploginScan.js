$('#qrcode').click(function () {
    $("#userInfo").fadeIn('fast').delay(500);
    showNext();
});

function showNext() {
    $('#nextButtonContainer').delay(500).fadeIn('fast');
}