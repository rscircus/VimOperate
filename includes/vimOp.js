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
 * TODO: Open link in new tab
 * TODO: options 
 * TODO: Google handling
 * 
 */


var isHelpVisible = false;
var previousKeyCode = 0; 
var settings = {
	values : {},
	get : function(key) {
		return this.values[key];
	},
	set : function(key, value) {
		this.values[key] = value;
	}
};
var keyCodes = { 
  ESC: 27, 
  backspace: 8, 
  deleteKey: 46,
  ESC: 27,
  Up: 38,
  k: 75,
  Down: 40,
  j: 74,
  Left: 37,
  h: 72,
  Right: 39,
  l: 76,
  questionmark: 191,
  f: 70,
  g: 71,
  t: 84,
  d: 68,
  u: 85,
  r: 82,
  w: 87,
};

// Initilize defaults:
settings.set("scrollStep", 100);


/**
 * Controlling the keydown events and launching the appropriate action/service.
 */
window.addEventListener("keydown", function(e) {

	log("KeyDown Event firing: " + e.keyCode);

	// Exit if insertMode!
	if (document.activeElement && isEditable(document.activeElement)) {
		log("InsertMode");
		return;
	}

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
		window.scrollBy(0, -1 * settings.get("scrollStep"));
	}

	// Down (DownArrow or j)
	if (e.keyCode == keyCodes.Down || e.keyCode == keyCodes.j) {
		window.scrollBy(0, settings.get("scrollStep"));
	}

	// Left (LeftArrow or h)
	if (e.keyCode == keyCodes.Left || e.keyCode == keyCodes.h) {
		window.scrollBy(-1 * settings.get("scrollStep") / 2, 0);
	}

	// Right (RightArrow or l)
	if (e.keyCode == keyCodes.Right || e.keyCode == keyCodes.l) {
		window.scrollBy(settings.get("scrollStep") / 2, 0);
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
