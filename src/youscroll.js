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
    if (typeof define === "function" && define.amd) {
        define([], factory(root));
    } else if (typeof exports === "object") {
        module.exports = factory(root);
    } else {
        root.youScroll = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {

    "use strict";

    var youScroll = {}; // Public API
    var interval, startY, deltaY, currentTime, isYouScrolling;
    var duration, easing, scrollEndCallback, focus;

    // Default settings
    var configs = {
        duration: 1200,
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

        if (scrollEndCallback === undefined)
            scrollEndCallback = configs.defaultCallback;

        if (duration === undefined)
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

        if (focus)
            focus.scrollTop = startY + deltaY;
        else
            root.scrollTo(0, startY + deltaY);

        isYouScrolling = false;
        focus = undefined;

        // Assigning scrollEndCallback to cb so that if the callback starts another
        // youScroll scroll, the callback for that won't be set to undefined
        var cb = scrollEndCallback;
        scrollEndCallback = undefined;

        cb();

    }

    /**
     * Set the container element to scroll.
     * @public
     * @param {String} selector - The selector for the element
     * @return {Object} The youScroll object
     */
    youScroll.focus = function (selector) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        focus = document.querySelector(selector);

        return youScroll;

    }

    /**
     * Set the target element where to scroll.
     * @public
     * @param {String} selector - The selector for the element
     * @param {Number} offset - The selector for the element
     * @return {Object} The youScroll object
     */
    youScroll.to = function (selector, offset) {

        // If in a middle of a scroll (and with force enabled) ignore
        if (isYouScrolling && configs.force) return youScroll;

        var target = document.querySelector(selector);

        startY = focus ? focus.scrollTop                                : root.pageYOffset;
        deltaY = focus ? elementYOffset(target) - elementYOffset(focus) : elementYOffset(target);

        deltaY += offset || 0;

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

        startY = focus ? focus.scrollTop : root.pageYOffset;
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

        focus ? (focus.scrollTop = newY) : root.scrollTo(0, newY);

        currentTime += configs.intervalTime;

        if (currentTime >= duration)
            youScroll.end();

    }

    /**
     * Get the Y coordinate of an element.
     * @private
     * @param  {Node} element
     * @return {Number} The element's Y coordinate
     */
    function documentOffsetTop(element) {
        return element.offsetTop + (element.offsetParent ? documentOffsetTop(element.offsetParent) : 0);
    }

    /**
     * Get the Y offset of an element relative to the window current scroll position.
     * @private
     * @param  {Node} element
     * @return {Number} The element's Y coordinate
     */
    function elementYOffset(element) {
        return Math.round(element.getBoundingClientRect().top);
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
