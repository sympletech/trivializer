<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="default.aspx.cs" Inherits="VenuePop._default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Venue Pop</title>
    <script src="js/jquery-1.7.2.min.js" type="text/javascript"></script>
    <script src="js/jquery.playSound.js" type="text/javascript"></script>
<link href="css/VenuePopMain.css" rel="stylesheet" type="text/css" />
</head>
<body>
<audio id="popSound"><source src="audio/popSound.mp3" /></audio>
<div style="text-align:center;">
 <div id="vpophdr" style="display:none;"><img src="images/venuepop-headerlogo.png" /></div>
 <br/>
<img id="login" src="images/login-up.png" onmousedown="this.src='images/login-click.png'; popSound.play();" onmouseup="this.src='images/login-up.png'"/>
<br />    
<img id="newgame" src="images/newgame-up.png" onmousedown="this.src='images/newgame-click.png'; popSound.play(); location.href='gamepage.aspx'" onmouseup="this.src='images/newgame-up.png'"/>
<br />
<img id="locategame" src="images/locategame-up.png" onmousedown="this.src='images/locategame-click.png'; popSound.play();" onmouseup="this.src='images/locategame-up.png'"/>
</div>    
<script src="js/vpopIndex.js" type="text/javascript"></script>
</body>
</html>
