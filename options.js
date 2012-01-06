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

var storage = widget.preferences;
var defaultSettings = {
  excludedURLs:
    "http*://mail.google.com/*\n" +
    "http*://www.google.com/reader/*\n",
  scrollStepLarge: 100,
  scrollStepSmall: 20
};
  
//Get elements
var excludedURLs = document.getElementById("excludedURLs");
var scrollStepLarge = document.getElementById("scrollStepLarge");
var scrollStepSmall = document.getElementById("scrollStepSmall");

//Track changes
excludedURLs.addEventListener('change', function(){
  storage.excludedURLs = this.value;
}, false);

scrollStepLarge.addEventListener('change', function() {
  storage.scrollStepLarge = this.value;
}, false);

scrollStepSmall.addEventListener('change', function() {
  storage.scrollStepSmall = this.value; 
}, false);

//Set Defaults
excludedURLs.value = storage.excludedURLs || defaultSettings.excludedURLs;
scrollStepLarge.value = storage.scrollStepLarge || defaultSettings.scrollStepLarge;
scrollStepSmall.value = storage.scrollStepSmall || defaultSettings.scrollStepSmall;