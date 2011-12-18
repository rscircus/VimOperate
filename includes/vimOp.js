/** 
  *  Roland Siegbert <roland.siegbert@gmail.com>
  *  Powered by unicorns living on colorful rainbows!
  *  
  *  TODO:
  *  * I need an insertMode
  *  * I need a number cache with a ultra short memory
  * 
  **/

/*
 * 
 * CD START
 * 
 */

log("Starting...");

(function(window, document) {

	var CompletionDialog = function(options) {
		this.options = options;
	};

	CompletionDialog.prototype = {
		show : function() {
			if (!this.isShown) {
				this.isShown = true;
				this.query = [];
				if (!this.initialized) {
					initialize.call(this);
					this.initialized = true;
				}
				handlerStack.push({
					keydown : this.onKeydown
				});
				render.call(this);
				clearInterval(this._tweenId);
				this.container.style.display = "";
				this._tweenId = Tween.fade(this.container, 1.0, 150);
			}
		},

		hide : function() {
			if (this.isShown) {
				handlerStack.pop();
				this.isShown = false;
				this.currentSelection = 0;
				clearInterval(this._tweenId);
				var completionContainer = this.container;
				var cssHide = function() {
					completionContainer.style.display = "none";
				};
				this._tweenId = Tween.fade(this.container, 0, 150, cssHide);
			}
		},

		getDisplayElement : function() {
			if (!this.container)
				this.container = createDivInside(document.body);
			return this.container;
		},

		getQueryString : function() {
			return this.query.join("");
		}
	};

	var initialize = function() {
		var self = this;
		addCssToPage(completionCSS);

		self.currentSelection = 0;

		self.onKeydown = function(event) {
			var keyChar = getKeyChar(event);
			// change selection with up or Shift-Tab
			if (keyChar === "up" || (event.keyCode == 9 && event.shiftKey)) {
				if (self.currentSelection > 0) {
					self.currentSelection -= 1;
				}
				render.call(self, self.getQueryString(), self.completions);
			}
			// change selection with down or Tab
			else if (keyChar === "down"
					|| (event.keyCode == 9 && !event.shiftKey)) {
				if (self.currentSelection < self.completions.length - 1) {
					self.currentSelection += 1;
				}
				render.call(self, self.getQueryString(), self.completions);
			} else if (event.keyCode == keyCodes.enter) {
				self.options.onSelect(self.completions[self.currentSelection]);
			} else if (event.keyCode == keyCodes.backspace
					|| event.keyCode == keyCodes.deleteKey) {
				if (self.query.length > 0) {
					self.query.pop();
					self.options.source(self.getQueryString(), function(
							completions) {
						render.call(self, self.getQueryString(), completions);
					});
				}
			} else if (keyChar !== "left" && keyChar != "right") {
				self.query.push(keyChar);
				self.options.source(self.getQueryString(),
						function(completions) {
							render.call(self, self.getQueryString(),
									completions);
						});
			}

			event.stopPropagation();
			event.preventDefault();
			return true;
		};
	};

	var render = function(searchString, completions) {
		if (this.isShown) {
			this.searchString = searchString;
			this.completions = completions;
			var container = this.getDisplayElement();
			clearChildren(container);

			if (searchString === undefined) {
				this.container.className = "vimium-dialog";
				createDivInside(container).innerHTML = this.options.initialSearchText
						|| "Begin typing";
			} else {
				this.container.className = "vimium-dialog vimium-completions";
				var searchBar = createDivInside(container);
				searchBar.innerHTML = searchString;
				searchBar.className = "vimium-searchBar";

				searchResults = createDivInside(container);
				searchResults.className = "vimium-searchResults";
				if (completions.length <= 0) {
					var resultDiv = createDivInside(searchResults);
					resultDiv.className = "vimium-noResults";
					resultDiv.innerHTML = "No results found";
				} else {
					for ( var i = 0; i < completions.length; i++) {
						var resultDiv = createDivInside(searchResults);
						if (i === this.currentSelection) {
							resultDiv.className = "vimium-selected";
						}
						resultDiv.innerHTML = this.options.renderOption(
								searchString, completions[i]);
					}
				}
			}

			container.style.top = Math.max(0,
					(window.innerHeight / 2 - container.clientHeight / 2))
					+ "px";
			container.style.left = (window.innerWidth / 2 - container.clientWidth / 2)
					+ "px";
		}
	};
	var createDivInside = function(parent) {
		var element = document.createElement("div");
		parent.appendChild(element);
		return element;
	};

	var clearChildren = function(elem) {
		if (elem.hasChildNodes()) {
			while (elem.childNodes.length >= 1) {
				elem.removeChild(elem.firstChild);
			}
		}
	};

	var completionCSS = ".vimium-dialog {" + "position:fixed;"
			+ "background-color: #ebebeb;" + "z-index: 99999998;"
			+ "border: 1px solid #b3b3b3;" + "font-size: 12px;"
			+ "text-align:left;" + "color: black;" + "padding:10px;"
			+ "border-radius: 6px;"
			+ "font-family: Lucida Grande, Arial, Sans;" + "}"
			+ ".vimium-completions {" + "width:400px;" + "}"
			+ ".vimium-completions .vimium-searchBar {" + "height: 15px;"
			+ "border-bottom: 1px solid #b3b3b3;" + "}"
			+ ".vimium-completions .vimium-searchResults {" + "}"
			+ ".vimium-completions .vimium-searchResults .vimium-selected{"
			+ "background-color:#aaa;" + "border-radius: 6px;" + "}"
			+ ".vimium-completions div{" + "padding:4px;" + "}"
			+ ".vimium-completions div strong{" + "color: grey;"
			+ "font-weight:bold;" + "}"
			+ ".vimium-completions .vimium-noResults{" + "color:#555;" + "}";

	window.CompletionDialog = CompletionDialog;

}(window, document));

/*
 * 
 * CD END
 * 
 */

function addCssToPage(css) {
	var head = document.getElementsByTagName("head")[0];
	if (!head) {
		head = document.createElement("head");
		document.documentElement.appendChild(head);
	}
	var style = document.createElement("style");
	style.type = "text/css";
	style.appendChild(document.createTextNode(css));
	head.appendChild(style);
}

var scrollStepSize = 60;
var linkHintCharacters = "sadfjklewcmpgh";
var filterLinkHints = false;
var userDefinedLinkHintCss = ".vimiumHintMarker {\n\n}\n"
		+ ".vimiumHintMarker > .matchingCharacter {\n\n}";
var excludedUrls = "http*://mail.google.com/*\n"
		+ "http*://www.google.com/reader/*\n";
var handlerStack = [];

var linkHints = {
	hintMarkers : [],
	hintMarkerContainingDiv : null,
	// The characters that were typed in while in "link hints" mode.
	shouldOpenInNewTab : false,
	shouldOpenWithQueue : false,
	// flag for copying link instead of opening
	shouldCopyLinkUrl : false,
	// Whether link hint's "open in current/new tab" setting is currently toggled
	openLinkModeToggle : false,
	// Whether we have added to the page the CSS needed to display link hints.
	cssAdded : false,
	// While in delayMode, all keypresses have no effect.
	delayMode : false,
	// Handle the link hinting marker generation and matching. Must be initialized after settings have been
	// loaded, so that we can retrieve the option setting.
	markerMatcher : undefined,

	/*
	 * To be called after linkHints has been generated from linkHintsBase.
	 */
	init : function() {
		this.onKeyDownInMode = this.onKeyDownInMode.bind(this);
		this.onKeyUpInMode = this.onKeyUpInMode.bind(this);
		this.markerMatcher = alphabetHints;
	},

	/*
	 * Generate an XPath describing what a clickable element is.
	 * The final expression will be something like "//button | //xhtml:button | ..."
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

	// We need this as a top-level function because our command system doesn't yet support arguments.
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
			addCssToPage(linkHintCss); // linkHintCss is declared by vimiumFrontend.js
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
	},

	/*
	 * Builds and displays link hints for every visible clickable item on the page.
	 */
	buildLinkHints : function() {
		var visibleElements = this.getVisibleClickableElements();
		this.hintMarkers = this.markerMatcher.getHintMarkers(visibleElements);

		// Note(philc): Append these markers as top level children instead of as child nodes to the link itself,
		// because some clickable elements cannot contain children, e.g. submit buttons. This has the caveat
		// that if you scroll the page and the link has position=fixed, the marker will not stay fixed.
		// Also note that adding these nodes to document.body all at once is significantly faster than one-by-one.
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
	 * Returns all clickable elements that are not hidden and are in the current viewport.
	 * We prune invisible elements partly for performance reasons, but moreso it's to decrease the number
	 * of digits needed to enumerate all of the links on screen.
	 */
	getVisibleClickableElements : function() {
		var resultSet = document
				.evaluate(
						this.clickableElementsXPath,
						document.body,
						function(namespace) {
							return namespace == "xhtml" ? "http://www.w3.org/1999/xhtml"
									: null;
						}, window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

		var visibleElements = [];

		// Find all visible clickable elements.
		for ( var i = 0, count = resultSet.snapshotLength; i < count; i++) {
			var element = resultSet.snapshotItem(i);
			// Note: this call will be expensive if we modify the DOM in between calls.
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
					// Ignore child elements which are not floated and not absolutely positioned for parent elements with zero width/height
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
		// Exclude links which have just a few pixels on screen, because the link hints won't show for them
		// anyway.
		if (!clientRect || clientRect.top < 0
				|| clientRect.top >= window.innerHeight - 4
				|| clientRect.left < 0
				|| clientRect.left >= window.innerWidth - 4)
			return false;

		if (clientRect.width < 3 || clientRect.height < 3)
			return false;

		// eliminate invisible elements (see test_harnesses/visibility_test.html)
		var computedStyle = window.getComputedStyle(element, null);
		if (computedStyle.getPropertyValue('visibility') != 'visible'
				|| computedStyle.getPropertyValue('display') == 'none')
			return false;

		return true;
	},

	/*
	 * Handles shift and esc keys. The other keys are passed to markerMatcher.matchHintsByKey.
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
				// When we're opening the link in the current tab, don't navigate to the selected link immediately;
				// we want to give the user some feedback depicting which link they've selected by focusing it.
				setTimeout(this.simulateClick.bind(this, matchedLink), 400);
				matchedLink.focus();
				this.deactivateMode(delay, function() {
					that.delayMode = false;
				});
			}
		}
	},

	/*
	 * Selectable means the element has a text caret; this is not the same as "focusable".
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
		// When focusing a textbox, put the selection caret at the end of the textbox's contents.
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
		// When "clicking" on a link, dispatch the event with the appropriate meta key (CMD on Mac, CTRL on windows)
		// to open it in a new tab if necessary.
		var metaKey = (platform == "Mac" && linkHints.shouldOpenInNewTab);
		var ctrlKey = (platform != "Mac" && linkHints.shouldOpenInNewTab);
		event.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
				ctrlKey, false, false, metaKey, 0, null);

		// Debugging note: Firefox will not execute the link's default action if we dispatch this click event,
		// but Webkit will. Dispatching a click on an input box does not seem to focus it; we do that separately
		link.dispatchEvent(event);

		// TODO(int3): do this for @role='link' and similar elements as well
		var nodeName = link.nodeName.toLowerCase();
		if (nodeName == 'a' || nodeName == 'button')
			link.blur();
	},

	/*
	 * If called without arguments, it executes immediately.  Othewise, it
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
		}
		// we invoke the deactivate() function directly instead of using setTimeout(callback, 0) so that
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

var alphabetHints = {
	hintKeystrokeQueue : [],
	logXOfBase : function(x, base) {
		return Math.log(x) / Math.log(base);
	},

	getHintMarkers : function(visibleElements) {
		//Initialize the number used to generate the character hints to be as many digits as we need to highlight
		//all the links on the page; we don't want some link hints to have more chars than others.
		var digitsNeeded = Math.ceil(this.logXOfBase(visibleElements.length,
				linkHintCharacters.length));
		var hintMarkers = [];

		for ( var i = 0, count = visibleElements.length; i < count; i++) {
			var hintString = this.numberToHintString(i, digitsNeeded);
			var marker = hintUtils.createMarkerFor(visibleElements[i]);
			marker.innerHTML = hintUtils.spanWrap(hintString);
			marker.setAttribute("hintString", hintString);
			hintMarkers.push(marker);
		}

		return hintMarkers;
	},
	/*
	 * Converts a number like "8" into a hint string like "JK". This is used to sequentially generate all of
	 * the hint text. The hint string will be "padded with zeroes" to ensure its length is equal to numHintDigits.
	 */
	numberToHintString : function(number, numHintDigits) {
		var base = linkHintCharacters.length;
		var hintString = [];
		var remainder = 0;
		do {
			remainder = number % base;
			hintString.unshift(linkHintCharacters[remainder]);
			number -= remainder;
			number /= Math.floor(base);
		} while (number > 0);

		// Pad the hint string we're returning so that it matches numHintDigits.
		// Note: the loop body changes hintString.length, so the original length must be cached!
		var hintStringLength = hintString.length;
		for ( var i = 0; i < numHintDigits - hintStringLength; i++)
			hintString.unshift(linkHintCharacters[0]);

		// Reversing the hint string has the advantage of making the link hints
		// appear to spread out after the first key is hit. This is helpful on a
		// page that has http links that are close to each other where link hints
		// of 2 characters or more occlude each other.
		hintString.reverse();
		return hintString.join("");
	},

	matchHintsByKey : function(event, hintMarkers) {
		var linksMatched = hintMarkers;
		var keyChar = getKeyChar(event);
		if (!keyChar)
			return {
				'linksMatched' : linksMatched
			};

		if (event.keyCode == keyCodes.backspace
				|| event.keyCode == keyCodes.deleteKey) {
			if (this.hintKeystrokeQueue.length == 0) {
				var linksMatched = [];
			} else {
				this.hintKeystrokeQueue.pop();
				var matchString = this.hintKeystrokeQueue.join("");
				var linksMatched = linksMatched.filter(function(linkMarker) {
					return linkMarker.getAttribute("hintString").indexOf(
							matchString) == 0;
				});
			}
		} else if (linkHintCharacters.indexOf(keyChar) >= 0) {
			this.hintKeystrokeQueue.push(keyChar);
			var matchString = this.hintKeystrokeQueue.join("");
			var linksMatched = linksMatched.filter(function(linkMarker) {
				return linkMarker.getAttribute("hintString").indexOf(
						matchString) == 0;
			});
		}
		return {
			'linksMatched' : linksMatched
		};
	},

	deactivate : function() {
		this.hintKeystrokeQueue = [];
	}

};

var filterHints = {
	hintKeystrokeQueue : [],
	linkTextKeystrokeQueue : [],
labelMap : {},

	/*
	 * Generate a map of input element => label
	 */
	generateLabelMap : function() {
		var labels = document.querySelectorAll("label");
		for ( var i = 0, count = labels.length; i < count; i++) {
			var forElement = labels[i].getAttribute("for");
			if (forElement) {
				var labelText = labels[i].textContent.trim();
				// remove trailing : commonly found in labels
				if (labelText[labelText.length - 1] == ":")
					labelText = labelText.substr(0, labelText.length - 1);
				this.labelMap[forElement] = labelText;
			}
		}
	},

	setMarkerAttributes : function(marker, linkHintNumber) {
		var hintString = (linkHintNumber + 1).toString();
		var linkText = "";
		var showLinkText = false;
		var element = marker.clickableItem;
		// toLowerCase is necessary as html documents return 'IMG'
		// and xhtml documents return 'img'
		var nodeName = element.nodeName.toLowerCase();

		if (nodeName == "input") {
			if (this.labelMap[element.id]) {
				linkText = this.labelMap[element.id];
				showLinkText = true;
			} else if (element.type != "password") {
				linkText = element.value;
			}
			// check if there is an image embedded in the <a> tag
		} else if (nodeName == "a" && !element.textContent.trim()
				&& element.firstElementChild
				&& element.firstElementChild.nodeName.toLowerCase() == "img") {
			linkText = element.firstElementChild.alt
					|| element.firstElementChild.title;
			if (linkText)
				showLinkText = true;
		} else {
			linkText = element.textContent || element.innerHTML;
		}
		linkText = linkText.trim().toLowerCase();
		marker.setAttribute("hintString", hintString);
		marker.innerHTML = hintUtils.spanWrap(hintString
				+ (showLinkText ? ": " + linkText : ""));
		marker.setAttribute("linkText", linkText);
	},

	getHintMarkers : function(visibleElements) {
		this.generateLabelMap();
		var hintMarkers = [];
		for ( var i = 0, count = visibleElements.length; i < count; i++) {
			var marker = hintUtils.createMarkerFor(visibleElements[i]);
			this.setMarkerAttributes(marker, i);
			hintMarkers.push(marker);
		}
		return hintMarkers;
	},

	matchHintsByKey : function(event, hintMarkers) {
		var linksMatched = hintMarkers;
		var delay = 0;
		var keyChar = getKeyChar(event);

		if (event.keyCode == keyCodes.backspace
				|| event.keyCode == keyCodes.deleteKey) {
			// backspace clears hint key queue first, then acts on link text key queue
			if (this.hintKeystrokeQueue.pop())
				linksMatched = this.filterLinkHints(linksMatched);
			else if (this.linkTextKeystrokeQueue.pop())
				linksMatched = this.filterLinkHints(linksMatched);
			else
				// both queues are empty. exit hinting mode
				linksMatched = [];
		} else if (event.keyCode == keyCodes.enter) {
			// activate the lowest-numbered link hint that is visible
			for ( var i = 0, count = linksMatched.length; i < count; i++)
				if (linksMatched[i].style.display != 'none') {
					linksMatched = [ linksMatched[i] ];
					break;
				}
		} else if (keyChar) {
			var matchString;
			if (/[0-9]/.test(keyChar)) {
				this.hintKeystrokeQueue.push(keyChar);
				matchString = this.hintKeystrokeQueue.join("");
				linksMatched = linksMatched.filter(function(linkMarker) {
					return linkMarker.getAttribute('filtered') != 'true'
							&& linkMarker.getAttribute("hintString").indexOf(
									matchString) == 0;
				});
			} else {
				// since we might renumber the hints, the current hintKeyStrokeQueue
				// should be rendered invalid (i.e. reset).
				this.hintKeystrokeQueue = [];
				this.linkTextKeystrokeQueue.push(keyChar);
				linksMatched = this.filterLinkHints(linksMatched);
			}

			if (linksMatched.length == 1 && !/[0-9]/.test(keyChar)) {
				// In filter mode, people tend to type out words past the point
				// needed for a unique match. Hence we should avoid passing
				// control back to command mode immediately after a match is found.
				var delay = 200;
			}
		}
		return {
			'linksMatched' : linksMatched,
			'delay' : delay
		};
	},

	/*
	 * Hides the links that do not match the linkText search string and marks them with the 'filtered' DOM
	 * property. Renumbers the remainder.  Should only be called when there is a change in
	 * linkTextKeystrokeQueue, to avoid undesired renumbering.
	 */
	filterLinkHints : function(hintMarkers) {
		var linksMatched = [];
		var linkSearchString = this.linkTextKeystrokeQueue.join("");

		for ( var i = 0; i < hintMarkers.length; i++) {
			var linkMarker = hintMarkers[i];
			var matchedLink = linkMarker.getAttribute("linkText").toLowerCase()
					.indexOf(linkSearchString.toLowerCase()) >= 0;

			if (!matchedLink) {
				linkMarker.setAttribute("filtered", "true");
			} else {
				this.setMarkerAttributes(linkMarker, linksMatched.length);
				linkMarker.setAttribute("filtered", "false");
				linksMatched.push(linkMarker);
			}
		}
		return linksMatched;
	},

	deactivate : function(delay, callback) {
		this.hintKeystrokeQueue = [];
		this.linkTextKeystrokeQueue = [];
		this.labelMap = {};
	}

};

var hintUtils = {
	/*
	 * Make each hint character a span, so that we can highlight the typed characters as you type them.
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

var linkHintCss = '.internalVimiumHintMarker {' + 'position:absolute;'
		+ 'background-color:black;' + 'color:white;' + 'font-weight:bold;'
		+ 'font-size:12px;' + 'padding:0 1px;' + 'line-height:100%;'
		+ 'width:auto;' + 'display:block;' + 'border:1px solid grey;'
        + "border-radius: 4px;" + 'z-index:99999999;'
		+ 'font-family: "Arial", "Sans";'
		+ 'top:-1px;' + 'left:-1px;' + '}'
		+ '.internalVimiumHintMarker > .matchingCharacter {' + 'color:#C79F0B;'
		+ '}';


log("Activating link hinting.");
linkHints.init();
log("link hinting activated");

var insertMode = false;
var isHelpVisible = false;
var lastKeyCode;
var settings = {
    values: {}, 
    get: function(key) {
        return this.values[key];
    },
    set: function(key, value) {
        this.values[key] = value;
    }
};

//Init defaults:
settings.set("scrollStep",100);

function lastKeyTimeout() {
    setTimeout("lastKeyCode=0",500);
}

function log(msg) {
    opera.postError("VimOperate: "+msg);
}

window.addEventListener('DOMContentLoaded', function() { log("READY"); }, false);
window.addEventListener("keydown",function(e) {

    log("KeyDown Event firing: " + e.keyCode);
  
    //Exit if insertMode!
    if(document.activeElement && isEditable(document.activeElement)) {
        log("InsertMode");
        return;
    }

    //ESC
    if(e.keyCode == 27) {
        //insertMode = false;
        if(isHelpVisible) toggleHelp("");
        linkHints.deactivateMode;
        return;
    }
          
     //Up (UpArrow or k)
    if(e.keyCode == 38 || e.keyCode == 75) {
        window.scrollBy(0, -1*settings.get("scrollStep"));
    }
     
    //Down (DownArrow or j)
    if(e.keyCode == 40 || e.keyCode == 74) {
        window.scrollBy(0, settings.get("scrollStep"));
    }
    
    //Left (LeftArrow or h)
    if(e.keyCode == 37 || e.keyCode == 72) {
        window.scrollBy(-1 * settings.get("scrollStep")/2, 0);
    }
        
    //Right (RightArrow or l)
    if(e.keyCode == 39 || e.keyCode == 76) {
        window.scrollBy(settings.get("scrollStep")/2, 0);
    }
    
    //?
    if(e.keyCode == 191 && e.shiftKey) {
        toggleHelp(strVar)
    }

    //f
    if(e.keyCode == 70) {
        linkHints.activateMode();
    }
    
    //G
    if(e.keyCode == 71 && e.shiftKey) {
        window.scrollTo(0, document.body.clientHeight);
    }

    //H
    if(e.keyCode == 72 && e.shiftKey) {
        window.history.back();
    }
    
    //L
    if(e.keyCode == 76 && e.shiftKey) {
        window.history.forward();
    }
    
    //t
    if(e.keyCode == 84) {
        opera.extension.postMessage('createTab');
    }
    
    //gg
    if(e.keyCode == 71 && lastKeyCode == 71) {
        window.scrollTo(0, 0);
    }
    
    //d and PageDown
    if(e.keyCode == 68) {
        window.scrollBy(0, window.innerHeight);
    }
    
    //u and PageUp
    if(e.keyCode == 85) {
        window.scrollBy(0, -1*window.innerHeight);
    }
    
    //r
    if(e.keyCode == 82) {
        window.location.reload();
    }

    //W
    if (e.keyCode == 87 && e.shiftKey) {
        opera.extension.postMessage('createWindow');
    }
    
    lastKeyCode = e.keyCode;
    lastKeyTimeout();
}, false);


function toggleHelp(html) {
  if (!document.body) return;
  
  if(isHelpVisible) {  
      var helpDialog = document.getElementById("inlineHelp");
      if (helpDialog) helpDialog.parentNode.removeChild(helpDialog);
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
  log(nodeName);
  if (target.isContentEditable) return true;
  var nodeName = target.nodeName.toLowerCase();
  var noFocus = ["radio", "checkbox"];
  if (nodeName == "input" && noFocus.indexOf(target.type) == -1) return true;
  var focusableElements = ["textarea", "select"];
  return focusableElements.indexOf(nodeName) >= 0;
}


var strVar="";
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
 * 40=down
 * 74=j
 * 38=up
 * 75=k
 *
 */


//~ function scrollUp() {
    //~ window.scrollBy(0, -1 * settings.get("scrollStep"));
//~ }
//~ 
//~ function scrollDown() {
    //~ window.scrollBy(0, settings.get("scrollStep"));
//~ }

//TODO: Following symbols
//~ ?       show the help dialog for a list of all available keys
//~ h       scroll left
//~ j       scroll down
//~ k       scroll up
//~ l       scroll right



//~ function scrollLeft() { window.scrollBy(-1 * settings.get("scrollStepSize"), 0); }
//~ function scrollRight() { window.scrollBy(settings.get("scrollStepSize"), 0); }


//~ function createTab() { }; //TODO: createTab
//~ function closeTab() { }; //TODO: closeTab


//~ function scrollToBottom() { window.scrollTo(window.pageXOffset, document.body.scrollHeight); }
//~ function scrollToTop() { window.scrollTo(window.pageXOffset, 0); }
//~ function scrollPageUp() { window.scrollBy(0, -1 * window.innerHeight / 2); }
//~ function scrollPageDown() { window.scrollBy(0, window.innerHeight / 2); }
//~ function scrollFullPageUp() { window.scrollBy(0, -window.innerHeight); }
//~ function scrollFullPageDown() { window.scrollBy(0, window.innerHeight); }

