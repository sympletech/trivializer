window.onload = function () {
    $("#questionSection").fadeIn('fast');
    startCountDown(15, 1000, myFunction);
};

function startCountDown(i, p, f) {
    // store parameters
    var pause = p;
    var fn = f;
    // make reference to div
    var countDownObj = document.getElementById("theTimer");
    if (countDownObj == null) {
        // error
        alert("div not found, check your id");
        // bail
        return;
    }
    countDownObj.count = function (i) {

        if (clicked == 1) {
            i = 0;
            clearTimeout(this);
        }

        // write out count
        var x = i.toString();
        if (x.length < 2) {
            x = '0' + i.toString();
        } else { x = i.toString(); }
        countDownObj.innerHTML = ':' + x;
        if (i == 0) {
            // execute function

            fn();
            // stop
            return;
        }


        setTimeout(function () {
            // repeat
            countDownObj.count(i - 1);

        },
 pause
 );
    };
    // set it going
    countDownObj.count(i);
}

function myFunction() {
    $('#nextButtonContainer').fadeIn('fast');
    popSound.play();
}

$("#nextButton").click(function () {
    popSound.play();
});

function AnswerClicked(answerClicked) {
    if (answerClicked == correctAnswer) {
        $('#answer' + answerClicked.toString()).addClass("correctAnswer");
        $('#nextButtonContainer').fadeIn('fast');
        popSound.play();
        clicked = 1;
    } else {
        $('#answer' + answerClicked.toString()).addClass("wrongAnswer").delay(50).fadeOut('fast');
    }
}

$('#answer1').click(function () {
    AnswerClicked(1);
});

$('#answer2').click(function () {
    AnswerClicked(2);
});

$('#answer3').click(function () {
    AnswerClicked(3);
});

$('#answer4').click(function () {
    AnswerClicked(4);
});