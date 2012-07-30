<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="gamepage.aspx.cs" Inherits="VenuePop.gamepage" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <script src="js/jquery-1.7.2.min.js" type="text/javascript"></script>
    <link href="css/VenuePopMain.css" rel="stylesheet" type="text/css" />
</head>
<script type="text/javascript">
    var correctAnswer = "1, 2, 4";
    var clicked = 0;
    var score = 0;
</script>
<body>
<div id="displayAnnouncement">
    <span>Announcement:</span> <span id="AnnounceText">$1 shots for the next 1/2 hour.</span>
</div>
<audio id="popSound"><source src="audio/popSound.mp3" /></audio>
<div style="text-align:center;">
    <img src="images/venuepop-mini-header.png"/>
</div>

<table style="width:400px;" align="center">
    <tr>
        <td>
     <div class="gameHeaderItem">
      Denise Walker
     </div>
       
        </td>
        <td>
     <div id="theTimer" class="timerStyle">:15</div>
       
        </td>
        <td>
        <div class="gameHeaderItem">Score: <span id="currentScore"></span></div>
        </td>
    </tr>
</table>
<div style="padding-top:8px;"></div>
<div id="questionSection" style="-webkit-box-shadow:0px 0px 2px 2px #000000; display:none;padding:10px; font-size:15px; background-color:#000000; border: 10px solid #aaaaaa; border-radius:10px; width:300px; margin-left:auto; margin-right:auto; color:#ffffff; font-family:Arial, Helvetica; font-size:18pt;">Which app is going to win the AT&amp;T Hackathon?</div>
<div id="answerContainer">
    <div class="largespacer"></div>
    <div id="answer1" class="answers">1. Definately, Venue Pop</div>
    <div class="spacer"></div>
    <div id="answer2" class="answers">2. Most likely, Venue Pop</div>
    <div class="spacer"></div>
    <div id="answer3" class="answers">3. Venue Pop. For Sure.</div>
    <div class="spacer"></div>
    <div id="answer4" class="answers">4. Dude... Venue Pop</div>
    <div class="spacer"></div>
</div>
<div id ="nextButtonContainer" style="padding-top:15px; display:none;">
<div id="nextButton" class="bluebutton">Next</div>
</div>
    <script type="text/javascript" src="js/vpopGame.js"></script>
</body>
</html>
