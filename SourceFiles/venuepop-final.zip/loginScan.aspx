<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="loginScan.aspx.cs" Inherits="VenuePop.loginScan" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link href="css/VenuePopMain.css" rel="stylesheet" type="text/css" />
    <script src="js/jquery-1.7.2.min.js" type="text/javascript"></script>
</head>
<body>
<audio id="popSound"><source src="audio/popSound.mp3" /></audio>
<div style="text-align:center;">
    <img src="images/venuepop-mini-header.png"/>
</div>
<div style="text-align:center;">
<img id="qrcode" src="images/qrcode.png"/>
</div>
<div class="largespacer"></div>
<div id="userInfo" style="display:none; text-align:center; height:100px; width:350px; background-color:#ffffff;color:#000000; font-size:24pt; font-weight:bold; border-radius:10px; margin-left:auto; margin-right:auto; border:5px solid #000000; font-family:Arial, Helvetica;">
    <img src="images/1ee08019a3f574bf5e19b8931b06849b.png" style="float:left;"/>
    <span style="color:#00aa00">Confirmed:</span>
    Denise Walker
</div>
<div class="largespacer"></div>
<div id ="nextButtonContainer" style="padding-top:15px; display:none;">
<div id="nextButton" class="bluebutton">Next</div>
</div>
    <script src="js/vpoploginScan.js" type="text/javascript"></script>
</body>
</html>
