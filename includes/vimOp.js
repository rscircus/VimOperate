/**
 * Roland Siegbert <roland.siegbert@gmail.com> Powered by unicorns living on
 * colorful rainbows!
 * 
 * TODO: * I need an insertMode * I need a number cache with a ultra short
 * memory
 * 
 */

var insertMode = false;
var isHelpVisible = false;
var lastKeyCode;
var settings = {
	values : {},
	get : function(key) {
		return this.values[key];
	},
	set : function(key, value) {
		this.values[key] = value;
	}
};

// Initilize defaults:
settings.set("scrollStep", 100);

function lastKeyTimeout() {
	setTimeout("lastKeyCode=0", 500);
}

function log(msg) {
	opera.postError("VimOperate: " + msg);
}

window.addEventListener('DOMContentLoaded', function() {
	log("READY");
}, false);
window.addEventListener("keydown", function(e) {

	log("KeyDown Event firing: " + e.keyCode);

	// Exit if insertMode!
	if (document.activeElement && isEditable(document.activeElement)) {
		log("InsertMode");
		return;
	}

	// ESC
	if (e.keyCode == 27) {
		// insertMode = false;
		if (isHelpVisible)
			toggleHelp("");
		linkHints.deactivateMode;
		return;
	}

	// Up (UpArrow or k)
	if (e.keyCode == 38 || e.keyCode == 75) {
		window.scrollBy(0, -1 * settings.get("scrollStep"));
	}

	// Down (DownArrow or j)
	if (e.keyCode == 40 || e.keyCode == 74) {
		window.scrollBy(0, settings.get("scrollStep"));
	}

	// Left (LeftArrow or h)
	if (e.keyCode == 37 || e.keyCode == 72) {
		window.scrollBy(-1 * settings.get("scrollStep") / 2, 0);
	}

	// Right (RightArrow or l)
	if (e.keyCode == 39 || e.keyCode == 76) {
		window.scrollBy(settings.get("scrollStep") / 2, 0);
	}

	// ?
	if (e.keyCode == 191 && e.shiftKey) {
		toggleHelp(strVar)
	}

	// f
	if (e.keyCode == 70) {
		linkHints.activateMode();
	}

	// G
	if (e.keyCode == 71 && e.shiftKey) {
		window.scrollTo(0, document.body.clientHeight);
	}

	// H
	if (e.keyCode == 72 && e.shiftKey) {
		window.history.back();
		log("history back");
	}

	// L
	if (e.keyCode == 76 && e.shiftKey) {
		window.history.forward();
		log("history forward");
	}

	// t
	if (e.keyCode == 84) {
		opera.extension.postMessage('createTab');
	}

	// gg
	if (e.keyCode == 71 && lastKeyCode == 71) {
		window.scrollTo(0, 0);
	}

	// d and PageDown
	if (e.keyCode == 68) {
		window.scrollBy(0, window.innerHeight);
	}

	// u and PageUp
	if (e.keyCode == 85) {
		window.scrollBy(0, -1 * window.innerHeight);
	}

	// r
	if (e.keyCode == 82) {
		window.location.reload();
	}

	// W
	if (e.keyCode == 87 && e.shiftKey) {
		opera.extension.postMessage('createWindow');
	}

	lastKeyCode = e.keyCode;
	lastKeyTimeout();
}, false);

function toggleHelp(html) {
	if (!document.body)
		return;

	if (isHelpVisible) {
		var helpDialog = document.getElementById("inlineHelp");
		if (helpDialog)
			helpDialog.parentNode.removeChild(helpDialog);
	} else {
		var div = document.createElement("div");
		div.id = "inlineHelp";
		div.innerHTML = html;
		div.getElementsByClassName("close")[0].addEventListener("click",
				toggleHelp, false);
		document.body.appendChild(div);
	}

	isHelpVisible = !isHelpVisible;
}

function isEditable(target) {
	log(nodeName);
	if (target.isContentEditable)
		return true;
	var nodeName = target.nodeName.toLowerCase();
	var noFocus = [ "radio", "checkbox" ];
	if (nodeName == "input" && noFocus.indexOf(target.type) == -1)
		return true;
	var focusableElements = [ "textarea", "select" ];
	return focusableElements.indexOf(nodeName) >= 0;
}

var strVar = "";
strVar += "<!--";
strVar += "  Shown, when asking for help.";
strVar += "  Thank you vimium!";
strVar += "-->";
strVar += "<div id=\"HelpDialog\">";
strVar += "  <style>";
strVar += "    #HelpDialog * {";
strVar += "      font-size:11px;";
strVar += "      line-height:130%;";
strVar += "      color:black;";
strVar += "      background-color:white;";
strVar += "    }";
strVar += "    ";
strVar += "    #HelpDialog {";
strVar += "      text-align:left;";
strVar += "      border:3px solid red;";
strVar += "      background-color:white;";
strVar += "      position:fixed;";
strVar += "      width:600px;";
strVar += "      font-family:helvetica, arial, sans;";
strVar += "      border:6px solid #efefef;";
strVar += "      border-radius:12px;";
strVar += "      padding:8px 12px;";
strVar += "      width:640px;";
strVar += "      left:50%;";
strVar += "      \/* This needs to be 1\/2 width to horizontally center the help dialog *\/";
strVar += "      margin-left:-320px;";
strVar += "      top:50px;";
strVar += "      -webkit-box-shadow: rgba(0, 0, 0, 0.4) 0px 0px 6px;";
strVar += "      z-index:99999998;";
strVar += "    }";
strVar += "    ";
strVar += "    #HelpDialog a { color:red; }";
strVar += "    #title, #title * { font-size:20px; }";
strVar += "    .column {";
strVar += "      width:50%;";
strVar += "      float:left;";
strVar += "    }";
strVar += "    ";
strVar += "    .column table, .column td, .column tr { padding:0; margin:0; }";
strVar += "    .column table { width:100%; table-layout:auto; }";
strVar += "    .column td { vertical-align:top; padding:1px; }";
strVar += "    #HelpDialog .column tr > td:first-of-type {";
strVar += "      text-align:right;";
strVar += "      font-weight:bold;";
strVar += "      color:#2f508e;";
strVar += "      white-space:nowrap;";
strVar += "    }";
strVar += "    ";
strVar += "    \/* Make the description column as wide as it can be. *\/";
strVar += "    #HelpDialog .column tr > td:nth-of-type(3) { width:100%; }";
strVar += "    #HelpDialog .divider {";
strVar += "      height:1px;";
strVar += "      width:92%;";
strVar += "      margin:10px auto;";
strVar += "      background-color:#9a9a9a;";
strVar += "    }";
strVar += "    ";
strVar += "    #HelpDialog .sectionTitle {";
strVar += "      font-weight:bold;";
strVar += "      padding-top:3px;";
strVar += "    }";
strVar += "    ";
strVar += "    #HelpDialog .commandName { font-family:\"courier new\"; }";
strVar += "";
strVar += "    #HelpDialog .close {";
strVar += "      position:absolute;";
strVar += "      right:10px;";
strVar += "      top:5px;";
strVar += "      font-family:\"courier new\";";
strVar += "      font-weight:bold;";
strVar += "      color:#990000;";
strVar += "      text-decoration:none;";
strVar += "      padding-left:10px;";
strVar += "      font-size:16px;";
strVar += "    }";
strVar += "";
strVar += "    #HelpDialog .closeButton:hover {";
strVar += "      color:black;";
strVar += "      cursor:default;";
strVar += "      text-decoration:none;";
strVar += "      -webkit-user-select:none;";
strVar += "    }";
strVar += "    ";
strVar += "    #HelpDialogFooter { position: relative; }";
strVar += "    #HelpDialogFooter * { font-size:10px; }";
strVar += "  <\/style>";
strVar += "";
strVar += "  <a class=\"close\" href=\"#\">X<\/a>";
strVar += "  <div id=\"title\">Vim<span style=\"color:red\">Opera<\/span>tor<\/div>";
strVar += "  <div class=\"column\">";
strVar += "    <table>";
strVar += "      <tr><td><\/td><td><\/td><td class=\"sectionTitle\">Navigating the page<\/td><\/tr>";
strVar += "      {{pageNavigation}}";
strVar += "    <\/table>";
strVar += "  <\/div>";
strVar += "  <div class=\"column\">";
strVar += "    <table>";
strVar += "      <tr><td><\/td><td><\/td><td class=\"sectionTitle\">Using find<\/td><\/tr>";
strVar += "      {{findCommands}}";
strVar += "      <tr><td><\/td><td><\/td><td class=\"sectionTitle\">Navigating history<\/td><\/tr>";
strVar += "      {{historyNavigation}}";
strVar += "      <tr><td><\/td><td><\/td><td class=\"sectionTitle\">Manipulating tabs<\/td><\/tr>";
strVar += "      {{tabManipulation}}";
strVar += "      <tr><td><\/td><td><\/td><td class=\"sectionTitle\">Miscellaneous<\/td><\/tr>";
strVar += "      {{misc}}";
strVar += "    <\/table>";
strVar += "  <\/div>";
strVar += "";
strVar += "  <br clear=\"both\"\/>";
strVar += "  <div class=\"divider\"><\/div>";
strVar += "";
strVar += "  <div id=\"HelpDialogFooter\">";
strVar += "    <div class=\"column\">";
strVar += "        <a href=#TOCOME target=\"_blank\">Feedback, Comments?<\/a>";
strVar += "<!--        Kudos to the guys from <a href=http:\/\/github.com\/philc\/vimium\" href=\"_blank\">vimium<\/a> for the inspiration and linkhinting!";
strVar += "-->";
strVar += "    <\/div>";
strVar += "    <div class=\"column\" style=\"text-align:right\">";
strVar += "      <span>Version 0.1<\/span><br\/>";
strVar += "    <\/div>";
strVar += "  <\/div>";
strVar += "<\/div>";
strVar += "";

/*
 * Keycodes (JavaScript):
 * 
 * 40=down 74=j 38=up 75=k
 * 
 */

// ~ function scrollUp() {
// ~ window.scrollBy(0, -1 * settings.get("scrollStep"));
// ~ }
// ~
// ~ function scrollDown() {
// ~ window.scrollBy(0, settings.get("scrollStep"));
// ~ }
// TODO: Following symbols
// ~ ? show the help dialog for a list of all available keys
// ~ h scroll left
// ~ j scroll down
// ~ k scroll up
// ~ l scroll right
// ~ function scrollLeft() { window.scrollBy(-1 *
// settings.get("scrollStepSize"), 0); }
// ~ function scrollRight() { window.scrollBy(settings.get("scrollStepSize"),
// 0); }
// ~ function createTab() { }; //TODO: createTab
// ~ function closeTab() { }; //TODO: closeTab
// ~ function scrollToBottom() { window.scrollTo(window.pageXOffset,
// document.body.scrollHeight); }
// ~ function scrollToTop() { window.scrollTo(window.pageXOffset, 0); }
// ~ function scrollPageUp() { window.scrollBy(0, -1 * window.innerHeight / 2);
// }
// ~ function scrollPageDown() { window.scrollBy(0, window.innerHeight / 2); }
// ~ function scrollFullPageUp() { window.scrollBy(0, -window.innerHeight); }
// ~ function scrollFullPageDown() { window.scrollBy(0, window.innerHeight); }
