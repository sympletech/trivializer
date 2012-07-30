<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="gamelist.aspx.cs" Inherits="VenuePop.gamelist" %>

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
<div id="availGames">Available Games</div>
<div class="availGameEntry">Johnny Bravo<br/>
category: Venue Pop
</div>
<div class="availGameEntry">Samuel Jackson<br/>
category: Venue Pop
</div>
</body>
</html>
