/**
 * Mother of this code:
 * ====================
 * Roland Siegbert <roland.siegbert@gmail.com> 
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
 * TODOs:
 * ======
 * DONE: Open link in new tab
 * DONE: options 
 * TODO: Google handling
 * 
 */


var isHelpVisible = false;
var previousKeyCode = 0; 
var settingsStorage = widget.preferences;
var settings = {
  excludedURLs:
    "http*://mail.google.com/*\n" +
    "http*://www.google.com/reader/*\n",
  scrollStepLarge: 100,
  scrollStepSmall: 20
};

settings.scrollStepLarge = typeof(settingsStorage.scrollStepLarge) != 'undefined' ? settingsStorage.scrollStepLarge : settings.scrollStepLarge;
settings.scrollStepSmall = typeof(settingsStorage.scrollStepSmall) != 'undefined' ? settingsStorage.scrollStepSmall : settings.scrollStepSmall;
settings.excludedURLs = typeof(settingsStorage.excludedURLs) != 'undefined' ? settingsStorage.excludedURLs : settings.excludedURLs;

/**
 * Controlling the keydown events and launching the appropriate action/service.
 */
window.addEventListener("keydown", function(e) {

	log("KeyDown Event firing: " + e.keyCode);
	
	// Exit if excluded URL
	if(isExcludedUrl(window.location.href, settings.excludedURLs))
	  return;

	// Exit if insertMode!
	if (document.activeElement && isEditable(document.activeElement))
		return;


	// ESC
	if (e.keyCode == keyCodes.ESC) {
		if (isHelpVisible)
			toggleHelp("");
		deactivateLinkHintsMode();
		linkHintsModeActivated = false;
		return;
	}

	// Up (UpArrow or k)
	if (e.keyCode == keyCodes.Up || e.keyCode == keyCodes.k) {
		window.scrollBy(0, -1 * settings.scrollStepLarge);
	}

	// Down (DownArrow or j)
	if (e.keyCode == keyCodes.Down || e.keyCode == keyCodes.j) {
		window.scrollBy(0, settings.scrollStepLarge);
		log('down');
	}

	// Left (LeftArrow or h)
	if (e.keyCode == keyCodes.Left || e.keyCode == keyCodes.h) {
		window.scrollBy(-1 * settings.scrollStepLarge / 2, 0);
	}

	// Right (RightArrow or l)
	if (e.keyCode == keyCodes.Right || e.keyCode == keyCodes.l) {
		window.scrollBy(settings.scrollStepLarge / 2, 0);
	}

	// ?
	if (e.keyCode == keyCodes.questionmark && e.shiftKey) {
		toggleHelp(strVar);
	}

	// f
	if (e.keyCode == keyCodes.f) {
		activateLinkHintsMode();
		linkHintsModeActivated = true;
	}
	
	// F
	if (e.keyCode == keyCodes.f && e.shiftKey) {
	  activateLinkHintsMode(true);
	  linkHintsModeActivated = true;
	}

	// G
	if (e.keyCode == keyCodes.g && e.shiftKey) {
		window.scrollTo(0, document.body.clientHeight);
	}

	// H
	if (e.keyCode == keyCodes.h && e.shiftKey) {
		window.history.back();
		log("history back");
	}

	// L
	if (e.keyCode == keyCodes.l && e.shiftKey) {
		window.history.forward();
		log("history forward");
	}

	// t
	if (e.keyCode == keyCodes.t) {
		opera.extension.postMessage('createTab');
	}

	// gg
	if (e.keyCode == keyCodes.g) {
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

	//Pretty simple memory
	previousKeyCode = e.keyCode;
}, false);
