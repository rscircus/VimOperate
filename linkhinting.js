/*
 * Kudos to the vimium project!
 * 
 * This implements link hinting. Typing "F" will enter link-hinting mode, where all clickable items on the
 * page have a hint marker displayed containing a sequence of letters. Typing those letters will select a link.
 *
 * In our 'default' mode, the characters we use to show link hints are a user-configurable option. By default
 * they're the home row.  The CSS which is used on the link hints is also a configurable option.
 */

var linkHints = {
	hintMarkers : [],
	hintMarkerContainingDiv : null,
	// The characters that were typed in while in "link hints" mode.
	shouldOpenInNewTab : false,
	shouldOpenWithQueue : false,
	// flag for copying link instead of opening
	shouldCopyLinkUrl : false,
	// Whether link hint's "open in current/new tab" setting is currently
	// toggled
	openLinkModeToggle : false,
	// Whether we have added to the page the CSS needed to display link hints.
	cssAdded : false,
	// While in delayMode, all keypresses have no effect.
	delayMode : false,
	// Handle the link hinting marker generation and matching. Must be
	// initialized after settings have been
	// loaded, so that we can retrieve the option setting.
	markerMatcher : undefined,

	/*
	 * To be called after linkHints has been generated from linkHintsBase.
	 */
	init : function() {
		this.onKeyDownInMode = this.onKeyDownInMode.bind(this);
		this.onKeyUpInMode = this.onKeyUpInMode.bind(this);
	},

	/*
	 * Generate an XPath describing what a clickable element is. The final
	 * expression will be something like "//button | //xhtml:button | ..."
	 */
	clickableElementsXPath : (function() {
		var clickableElements = [ "a", "area[@href]", "textarea", "button",
				"select", "input[not(@type='hidden')]",
				"*[@onclick or @tabindex or @role='link' or @role='button']" ];
		var xpath = [];
		for ( var i in clickableElements)
			xpath.push("//" + clickableElements[i], "//xhtml:"
					+ clickableElements[i]);
		return xpath.join(" | ");
	})(),

	// We need this as a top-level function because our command system doesn't
	// yet support arguments.
	activateModeToOpenInNewTab : function() {
		this.activateMode(true, false, false);
	},

	activateModeToCopyLinkUrl : function() {
		this.activateMode(false, false, true);
	},

	activateModeWithQueue : function() {
		this.activateMode(true, true, false);
	},

	activateMode : function(openInNewTab, withQueue, copyLinkUrl) {
		if (!this.cssAdded)
			addCssToPage(linkHintCss); // linkHintCss is declared by
										// vimiumFrontend.js
		this.linkHintCssAdded = true;
		this.setOpenLinkMode(openInNewTab, withQueue, copyLinkUrl);
		this.buildLinkHints();
		handlerStack.push({ // modeKeyHandler is declared by vimiumFrontend.js
			keydown : this.onKeyDownInMode,
			keyup : this.onKeyUpInMode
		});

		this.openLinkModeToggle = false;
	},

	setOpenLinkMode : function(openInNewTab, withQueue, copyLinkUrl) {
		this.shouldOpenInNewTab = openInNewTab;
		this.shouldOpenWithQueue = withQueue;
		this.shouldCopyLinkUrl = copyLinkUrl;
		if (this.shouldCopyLinkUrl) {
			HUD.show("Copy link URL to Clipboard");
		} else if (this.shouldOpenWithQueue) {
			HUD.show("Open multiple links in a new tab");
		} else {
			if (this.shouldOpenInNewTab)
				HUD.show("Open link in new tab");
			else
				HUD.show("Open link in current tab");
		}
	},

	/*
	 * Builds and displays link hints for every visible clickable item on the
	 * page.
	 */
	buildLinkHints : function() {
		var visibleElements = this.getVisibleClickableElements();
		this.hintMarkers = this.markerMatcher.getHintMarkers(visibleElements);

		// Note(philc): Append these markers as top level children instead of as
		// child nodes to the link itself,
		// because some clickable elements cannot contain children, e.g. submit
		// buttons. This has the caveat
		// that if you scroll the page and the link has position=fixed, the
		// marker will not stay fixed.
		// Also note that adding these nodes to document.body all at once is
		// significantly faster than one-by-one.
		this.hintMarkerContainingDiv = document.createElement("div");
		this.hintMarkerContainingDiv.className = "internalVimiumHintMarker";
		for ( var i = 0; i < this.hintMarkers.length; i++)
			this.hintMarkerContainingDiv.appendChild(this.hintMarkers[i]);

		// sometimes this is triggered before documentElement is created
		// TODO(int3): fail more gracefully?
		if (document.documentElement)
			document.documentElement.appendChild(this.hintMarkerContainingDiv);
		else
			this.deactivateMode();
	},

	/*
	 * Returns all clickable elements that are not hidden and are in the current
	 * viewport. We prune invisible elements partly for performance reasons, but
	 * moreso it's to decrease the number of digits needed to enumerate all of
	 * the links on screen.
	 */
	getVisibleClickableElements : function() {
		var resultSet = document
				.evaluate(
						this.clickableElementsXPath,
						document.body,
						function(namespace) {
							return namespace == "xhtml" ? "http://www.w3.org/1999/xhtml"
									: null;
						}, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

		var visibleElements = [];

		// Find all visible clickable elements.
		for ( var i = 0, count = resultSet.snapshotLength; i < count; i++) {
			var element = resultSet.snapshotItem(i);
			// Note: this call will be expensive if we modify the DOM in between
			// calls.
			var clientRect = element.getClientRects()[0];

			if (this.isVisible(element, clientRect))
				visibleElements.push({
					element : element,
					rect : clientRect
				});

			// If the link has zero dimensions, it may be wrapping visible
			// but floated elements. Check for this.
			if (clientRect && (clientRect.width == 0 || clientRect.height == 0)) {
				for ( var j = 0, childrenCount = element.children.length; j < childrenCount; j++) {
					var computedStyle = window.getComputedStyle(
							element.children[j], null);
					// Ignore child elements which are not floated and not
					// absolutely positioned for parent elements with zero
					// width/height
					if (computedStyle.getPropertyValue('float') == 'none'
							&& computedStyle.getPropertyValue('position') != 'absolute')
						continue;
					var childClientRect = element.children[j].getClientRects()[0];
					if (!this.isVisible(element.children[j], childClientRect))
						continue;
					visibleElements.push({
						element : element.children[j],
						rect : childClientRect
					});
					break;
				}
			}

			if (element.localName === "area") {
				var map = element.parentElement;
				var img = document.querySelector("img[usemap='#"
						+ map.getAttribute("name") + "']");
				var clientRect = img.getClientRects()[0];
				var c = element.coords.split(/,/);
				var coords = [ parseInt(c[0], 10), parseInt(c[1], 10),
						parseInt(c[2], 10), parseInt(c[3], 10) ];
				var rect = {
					top : clientRect.top + coords[1],
					left : clientRect.left + coords[0],
					right : clientRect.left + coords[2],
					bottom : clientRect.top + coords[3],
					width : coords[2] - coords[0],
					height : coords[3] - coords[1]
				};

				visibleElements.push({
					element : element,
					rect : rect
				});
			}
		}
		return visibleElements;
	},

	/*
	 * Returns true if element is visible.
	 */
	isVisible : function(element, clientRect) {
		// Exclude links which have just a few pixels on screen, because the
		// link hints won't show for them
		// anyway.
		if (!clientRect || clientRect.top < 0
				|| clientRect.top >= window.innerHeight - 4
				|| clientRect.left < 0
				|| clientRect.left >= window.innerWidth - 4)
			return false;

		if (clientRect.width < 3 || clientRect.height < 3)
			return false;

		// eliminate invisible elements (see
		// test_harnesses/visibility_test.html)
		var computedStyle = window.getComputedStyle(element, null);
		if (computedStyle.getPropertyValue('visibility') != 'visible'
				|| computedStyle.getPropertyValue('display') == 'none')
			return false;

		return true;
	},

	/*
	 * Handles shift and esc keys. The other keys are passed to
	 * markerMatcher.matchHintsByKey.
	 */
	onKeyDownInMode : function(event) {
		if (this.delayMode)
			return;

		if (event.keyCode == keyCodes.shiftKey && !this.openLinkModeToggle) {
			// Toggle whether to open link in a new or current tab.
			this.setOpenLinkMode(!this.shouldOpenInNewTab,
					this.shouldOpenWithQueue, false);
			this.openLinkModeToggle = true;
		}

		// TODO(philc): Ignore keys that have modifiers.
		if (isEscape(event)) {
			this.deactivateMode();
		} else {
			var keyResult = this.markerMatcher.matchHintsByKey(event,
					this.hintMarkers);
			var linksMatched = keyResult.linksMatched;
			var delay = keyResult.delay !== undefined ? keyResult.delay : 0;
			if (linksMatched.length == 0) {
				this.deactivateMode();
			} else if (linksMatched.length == 1) {
				this.activateLink(linksMatched[0].clickableItem, delay);
			} else {
				for ( var i in this.hintMarkers)
					this.hideMarker(this.hintMarkers[i]);
				for ( var i in linksMatched)
					this.showMarker(linksMatched[i],
							this.markerMatcher.hintKeystrokeQueue.length);
			}
		}

		event.stopPropagation();
		event.preventDefault();
	},

	onKeyUpInMode : function(event) {
		if (event.keyCode == keyCodes.shiftKey && this.openLinkModeToggle) {
			// Revert toggle on whether to open link in new or current tab.
			this.setOpenLinkMode(!this.shouldOpenInNewTab,
					this.shouldOpenWithQueue, false);
			this.openLinkModeToggle = false;
		}
		event.stopPropagation();
		event.preventDefault();
	},

	/*
	 * When only one link hint remains, this function activates it in the
	 * appropriate way.
	 */
	activateLink : function(matchedLink, delay) {
		var that = this;
		this.delayMode = true;
		if (this.isSelectable(matchedLink)) {
			this.simulateSelect(matchedLink);
			this.deactivateMode(delay, function() {
				that.delayMode = false;
			});
		} else {
			if (this.shouldOpenWithQueue) {
				this.simulateClick(matchedLink);
				this.deactivateMode(delay, function() {
					that.delayMode = false;
					that.activateModeWithQueue();
				});
			} else if (this.shouldCopyLinkUrl) {
				this.copyLinkUrl(matchedLink);
				this.deactivateMode(delay, function() {
					that.delayMode = false;
				});
			} else if (this.shouldOpenInNewTab) {
				this.simulateClick(matchedLink);
				matchedLink.focus();
				this.deactivateMode(delay, function() {
					that.delayMode = false;
				});
			} else {
				// When we're opening the link in the current tab, don't
				// navigate to the selected link immediately;
				// we want to give the user some feedback depicting which link
				// they've selected by focusing it.
				setTimeout(this.simulateClick.bind(this, matchedLink), 400);
				matchedLink.focus();
				this.deactivateMode(delay, function() {
					that.delayMode = false;
				});
			}
		}
	},

	/*
	 * Selectable means the element has a text caret; this is not the same as
	 * "focusable".
	 */
	isSelectable : function(element) {
		var selectableTypes = [ "search", "text", "password" ];
		return (element.nodeName.toLowerCase() == "input" && selectableTypes
				.indexOf(element.type) >= 0)
				|| element.nodeName.toLowerCase() == "textarea";
	},

	copyLinkUrl : function(link) {
		chrome.extension.sendRequest({
			handler : 'copyLinkUrl',
			data : link.href
		});
	},

	simulateSelect : function(element) {
		element.focus();
		// When focusing a textbox, put the selection caret at the end of the
		// textbox's contents.
		element.setSelectionRange(element.value.length, element.value.length);
	},

	/*
	 * Shows the marker, highlighting matchingCharCount characters.
	 */
	showMarker : function(linkMarker, matchingCharCount) {
		linkMarker.style.display = "";
		for ( var j = 0, count = linkMarker.childNodes.length; j < count; j++)
			linkMarker.childNodes[j].className = (j >= matchingCharCount) ? ""
					: "matchingCharacter";
	},

	hideMarker : function(linkMarker) {
		linkMarker.style.display = "none";
	},

	simulateClick : function(link) {
		var event = document.createEvent("MouseEvents");
		// When "clicking" on a link, dispatch the event with the appropriate
		// meta key (CMD on Mac, CTRL on windows)
		// to open it in a new tab if necessary.
		var metaKey = (platform == "Mac" && linkHints.shouldOpenInNewTab);
		var ctrlKey = (platform != "Mac" && linkHints.shouldOpenInNewTab);
		event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
				ctrlKey, false, false, metaKey, 0, null);

		// Debugging note: Firefox will not execute the link's default action if
		// we dispatch this click event,
		// but Webkit will. Dispatching a click on an input box does not seem to
		// focus it; we do that separately
		link.dispatchEvent(event);

		// TODO(int3): do this for @role='link' and similar elements as well
		var nodeName = link.nodeName.toLowerCase();
		if (nodeName == 'a' || nodeName == 'button')
			link.blur();
	},

	/*
	 * If called without arguments, it executes immediately. Othewise, it
	 * executes after 'delay' and invokes 'callback' when it is finished.
	 */
	deactivateMode : function(delay, callback) {
		var that = this;
		function deactivate() {
			if (that.markerMatcher.deactivate)
				that.markerMatcher.deactivate();
			if (that.hintMarkerContainingDiv)
				that.hintMarkerContainingDiv.parentNode
						.removeChild(that.hintMarkerContainingDiv);
			that.hintMarkerContainingDiv = null;
			that.hintMarkers = [];
			handlerStack.pop();
			HUD.hide();
		}
		// we invoke the deactivate() function directly instead of using
		// setTimeout(callback, 0) so that
		// deactivateMode can be tested synchronously
		if (!delay) {
			deactivate();
			if (callback)
				callback();
		} else {
			setTimeout(function() {
				deactivate();
				if (callback)
					callback();
			}, delay);
		}
	},

};

var hintUtils = {
	/*
	 * Make each hint character a span, so that we can highlight the typed
	 * characters as you type them.
	 */
	spanWrap : function(hintString) {
		var innerHTML = [];
		for ( var i = 0; i < hintString.length; i++)
			innerHTML.push("<span>" + hintString[i].toUpperCase() + "</span>");
		return innerHTML.join("");
	},

	/*
	 * Creates a link marker for the given link.
	 */
	createMarkerFor : function(link) {
		var marker = document.createElement("div");
		marker.className = "internalVimiumHintMarker vimiumHintMarker";
		marker.clickableItem = link.element;

		var clientRect = link.rect;
		marker.style.left = clientRect.left + window.scrollX + "px";
		marker.style.top = clientRect.top + window.scrollY + "px";

		return marker;
	}
};
