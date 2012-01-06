/**
 * Mother of this code:
 * ====================
 * R - Roland Siegbert <roland.siegbert@gmail.com> 
 * Powered by unicorns living on colorful rainbows!
 * 
 * 
 * Special thanks go to:
 * =====================
 * 
 * Vimium:
 * -------
 * Kudos to the vimium project! Actually this is my very first js program 
 * I ever wrote and most of the R&D was done there and I ported it to Opera,
 * while learning the bits and pieces of js, Opera and the DOM.
 * 
 * Opera-Community and Devs:
 * -------------------------
 * For paciently answering my questions.
 * 
 *  
 * Thanks go to:
 * =============
 * Vimium - The hacker's browser - http://vimium.github.com/
 * Quirksmode - http://quirksmode.org/
 * 
 * 
 */

function log(msg) {
	opera.postError("VimOperate: " + msg);
}

function toggleHelp(html) {
	if(!document.body)
		return;

	if(isHelpVisible) {
		var helpDialog = document.getElementById("inlineHelp");
		if(helpDialog)
			helpDialog.parentNode.removeChild(helpDialog);
	}
	else {
		var div = document.createElement("div");
		div.id = "inlineHelp";
		div.innerHTML = html;
		div.getElementsByClassName("close")[0].addEventListener("click", toggleHelp, false);
		document.body.appendChild(div);
	}

	isHelpVisible = !isHelpVisible;
}

function isEditable(target) {
  if (target.isContentEditable)
    return true;
  var nodeName = target.nodeName.toLowerCase();
  var noFocus = ["radio", "checkbox"];
  if (nodeName == "input" && noFocus.indexOf(target.type) == -1)
    return true;
  var focusableElements = ["textarea", "select"];
  return focusableElements.indexOf(nodeName) >= 0;
}
