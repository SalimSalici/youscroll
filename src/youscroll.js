/**
 *  YouScroll v0.0.0
 *
 *  youscroll.js
 *
 *  @license    MIT License
 *  @author     Salim Salici <https://github.com/salimsalici/>
 *  @copyright  Author
 */

(function (root, factory) {
    if ( typeof define === "function" && define.amd ) {
        define([], factory(root));
    } else if ( typeof exports === "object" ) {
        module.exports = factory(root);
    } else {
        root.youScroll = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    "use strict";

    var youScroll = {}; // Public API
    var interval, startY, deltaY, currentTime, isYouScrolling;
    var duration, easing, scrollEndCallback;

    // Default settings
    var configs = {
        duration: 1000,
        easing: "easeInOutQuad",
        force: false,
        intervalTime: 5,
        defaultCallback: function () {}
    }

    // Public methods

    /**
     * Start scrolling.
     * @public
     */
    youScroll.start = function () {

        if (isYouScrolling && configs.force) return;

        currentTime = 0;
        easing = easingFunctions[configs.easing];

        if (scrollEndCallback == undefined)
            scrollEndCallback = configs.defaultCallback;

        if (duration == undefined)
            duration = configs.duration;

        clearInterval(interval);
        interval = setInterval(scrollStep, configs.intervalTime);

        isYouScrolling = true;

    }

    /**
     * Stop the current scroll.
     * @public
     */
    youScroll.end = function () {

        clearInterval(interval);
        window.scrollTo(0, startY + deltaY);
        isYouScrolling = false;

        scrollEndCallback();
        scrollEndCallback = undefined;

    }

    /**
     * Set the target element where to scroll.
     * @public
     * @param {String} selector - The selector for the element
     * @return {Object} The youScroll object
     */
    youScroll.to = function (selector) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        var element = document.querySelector(selector);

        startY = root.pageYOffset;
        deltaY = documentOffsetTop(element) - startY;

        return youScroll;

    }

    /**
     * Set how much the page will be scrolled.
     * @public
     * @param {Number} amount - The distance of the scroll
     * @return {Object} The youScroll object
     */
    youScroll.by = function (amount) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        startY = root.pageYOffset;
        deltaY = amount;

        return youScroll;

    }

    /**
     * Set the scroll duration.
     * @public
     * @param {Number} amount - The duration of the scroll
     * @return {Object} The youScroll object
     */
    youScroll.lasts = function (amount) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        duration = amount;

        return youScroll;

    }

    /**
     * Set the callback that will be called when the scroll is over.
     * @public
     * @param {Function} callback - The callback
     * @return {Object} The youScroll object
     */
    youScroll.setCallback = function (callback) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        scrollEndCallback = callback;

        return youScroll;

    }

    // Private helper functions

    /**
     * Scroll the page based on easing function.
     * @private
     */
    function scrollStep() {

        var newY = easing(currentTime, startY, deltaY, duration);
        window.scrollTo(0, newY);
        currentTime += configs.intervalTime;

        if (currentTime >= duration)
            youScroll.end();

    }

    /**
     * Get the Y coordinate of an element.
     * @private
     * @param  {Node} element - The element to get the height of
     * @return {Number} The element's Y coordinate
     */
    function documentOffsetTop(element) {
        return element.offsetTop + ( element.offsetParent ? documentOffsetTop(element.offsetParent) : 0 );
    }

    // Easing functions

    /**
     * All the available easing functions.
     * @type {Object}
     * @const
     * @link http://gizma.com/easing/
     */
    var easingFunctions = {

        linear: function (t, b, c, d) {
            return c*t/d + b;
        },

        easeInOutQuad: function (t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t + b;
            t--;
            return -c/2 * (t*(t-2) - 1) + b;
        },

        easeOutCubic: function (t, b, c, d) {
            t /= d;
            t--;
            return c*(t*t*t + 1) + b;
        }

    }

    return youScroll;

});
