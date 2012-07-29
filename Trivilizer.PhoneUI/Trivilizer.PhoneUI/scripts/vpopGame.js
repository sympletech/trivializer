$(function () {
    $("#questionSection").fadeIn('fast');
    startCountDown(15, 1000, myFunction);

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
});





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
        // write out count
        var x = i.toString();
        if (x.length < 2) {
            x = '0' + i.toString();
        } else { x = i.toString(); }

        countDownObj.innerHTML = ':' + x;
        if (i == 0) {
            // execute function
            if (i < 14) {
                $("#theTimer").addClass("almostDone");
            }
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
    };      // set it going
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
    var correctAnswer = parseInt($("#correctAnswer").val());
    console.log({ a: answerClicked, b: correctAnswer });
    if (answerClicked == correctAnswer) {
        $('#answer' + answerClicked.toString()).addClass("correctAnswer");
        $('#inGame #nextButtonContainer').fadeIn('fast');
        
        popSound.play();
        $("#theTimer").html(":00");
    } else {
        $('#answer' + answerClicked.toString()).addClass("wrongAnswer").delay(1000).fadeOut('fast');
    }
}

