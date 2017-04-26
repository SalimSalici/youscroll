/**
 *  YouScroll v0.0.0
 *
 *  youscroll.js
 *
 *  @license    MIT License
 *  @author     Salim Salici <https://github.com/salimsalici/>
 *  @copyright  Author
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory(root));
    } else if (typeof exports === "object") {
        module.exports = factory(root);
    } else {
        root.youScroll = factory(root);
    }
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {
    "use strict";
    var youScroll = {};
    // Public API
    // Default settings
    var defaultConfigs = {
        duration: 1200,
        easing: "easeInOutQuad",
        force: false,
        intervalTime: 5,
        endCallback: undefined
    };
    var scrollInstances = [];
    var focus, startY, deltaY, startX, deltaX;
    var instanceConfigs = Object.create(defaultConfigs);
    function youScrollInstance(focus, startX, deltaX, startY, deltaY, configs, resolve, reject) {
        var youScrollInstance = {};
        // Instance public API
        var interval, currentTime;
        var easing = easingFunctions[configs.easing];
        /**
         * Initialize the scroll instance.
         * @private
         */
        function init() {
            currentTime = 0;
            interval = setInterval(scrollStep, configs.intervalTime);
            addListeners();
        }
        /**
         * Stop the scroll instance.
         * @public
         */
        youScrollInstance.end = function() {
            clearInterval(interval);
            if (typeof configs.endCallback == "function") configs.endCallback();
            scrollInstances.splice(scrollInstances.indexOf(youScrollInstance), 1);
            removeListeners();
            resolve();
        };
        // Getters
        youScrollInstance.getFocus = function() {
            return focus;
        };
        youScrollInstance.getForce = function() {
            return configs.force;
        };
        /**
         * Scroll the page based on easing function.
         * @private
         */
        function scrollStep() {
            var newX = easing(currentTime, startX, deltaX, configs.duration);
            var newY = easing(currentTime, startY, deltaY, configs.duration);
            youScrollTo(newX, newY);
            currentTime += configs.intervalTime;
            if (currentTime >= configs.duration) {
                newX = startX + deltaX;
                newY = startY + deltaY;
                youScrollTo(newX, newY);
                youScrollInstance.end();
            }
        }
        function youScrollTo(x, y) {
            if (focus) {
                focus.scrollLeft = x;
                focus.scrollTop = y;
            } else {
                root.scrollTo(x, y);
            }
        }
        /**
         * Add listeners to prevent mouse wheel scrolling if force is true,
         * or to end youScroll instance if force is false
         * @private
         */
        function addListeners() {
            var target = focus || root;
            target.addEventListener("wheel", wheelEvt);
            target.addEventListener("mousewheel", wheelEvt);
        }
        /**
         * Remove listeners.
         * @private
         */
        function removeListeners() {
            var target = focus || root;
            target.removeEventListener("wheel", wheelEvt);
            target.removeEventListener("mousewheel", wheelEvt);
        }
        /**
         * Prevent mouse wheel scrolling if force is true,
         * end youScroll instance if force is false
         * @private
         */
        function wheelEvt(evt) {
            if (configs.force) evt.preventDefault(); else youScrollInstance.end();
        }
        init();
        return youScrollInstance;
    }
    /**
     * Start scrolling instance.
     * @public
     */
    youScroll.start = function() {
        var toReturn = {
            and: undefined,
            // Promess
            instance: undefined
        };
        var instance;
        var promess = new Promise(function(resolve, reject) {
            if (canScroll(focus)) {
                containScroll();
                instance = youScrollInstance(focus, startX, deltaX, startY, deltaY, instanceConfigs, resolve, reject);
                scrollInstances.push(instance);
            } else reject("Cannot start a new scroll if the element is already scrolling.");
        });
        focus = undefined;
        instanceConfigs = Object.create(defaultConfigs);
        toReturn.and = promess;
        toReturn.instance = instance;
        return toReturn;
    };
    /**
     * Set the container element to scroll.
     * @public
     * @param {String} selector - The selector for the element
     * @return {Object} The youScroll object
     */
    youScroll.focus = function(selector) {
        focus = document.querySelector(selector);
        return youScroll;
    };
    /**
     * Set the target element where to scroll.
     * @public
     * @param {String} selector
     * @param {Number} offset
     * @return {Object} The youScroll object
     */
    youScroll.to = function(selector, offsetX, offsetY) {
        if (offsetX === true) offsetX = 0; else if (arguments.length <= 2) return youScroll.ver(selector, offsetX);
        var target = document.querySelector(selector);
        startY = focus ? focus.scrollTop : root.pageYOffset;
        deltaY = focus ? elementYOffset(target) - elementYOffset(focus) : elementYOffset(target);
        deltaY += offsetY || 0;
        startX = focus ? focus.scrollLeft : root.pageXOffset;
        deltaX = focus ? elementXOffset(target) - elementXOffset(focus) : elementXOffset(target);
        deltaX += offsetX || 0;
        return youScroll;
    };
    /**
     * Set the target element where to scroll horizontally.
     * @public
     * @param {String} selector
     * @param {Number} offset
     * @return {Object} The youScroll object
     */
    youScroll.hor = function(selector, offset) {
        var target = document.querySelector(selector);
        startY = focus ? focus.scrollTop : root.pageYOffset;
        deltaY = 0;
        startX = focus ? focus.scrollLeft : root.pageXOffset;
        deltaX = focus ? elementXOffset(target) - elementXOffset(focus) : elementXOffset(target);
        deltaX += offset || 0;
        return youScroll;
    };
    /**
     * Set the target element where to scroll vertically.
     * @public
     * @param {String} selector
     * @param {Number} offset
     * @return {Object} The youScroll object
     */
    youScroll.ver = function(selector, offset) {
        var target = document.querySelector(selector);
        startY = focus ? focus.scrollTop : root.pageYOffset;
        deltaY = focus ? elementYOffset(target) - elementYOffset(focus) : elementYOffset(target);
        deltaY += offset || 0;
        startX = focus ? focus.scrollLeft : root.pageXOffset;
        deltaX = 0;
        return youScroll;
    };
    /**
     * Set how much the page will be scrolled.
     * @public
     * @param {Number} amountX - The x distance of the scroll
     * @param {Number} amountY - The y distance of the scroll
     * @return {Object} The youScroll object
     */
    youScroll.by = function(amountX, amountY) {
        // If only one parameter is passed, consider it a vertical scroll
        if (typeof amountY === "undefined") {
            amountY = amountX;
            amountX = 0;
        }
        startX = focus ? focus.scrollLeft : root.pageXOffset;
        deltaX = amountX;
        startY = focus ? focus.scrollTop : root.pageYOffset;
        deltaY = amountY;
        return youScroll;
    };
    /**
     * Set the scroll duration.
     * @public
     * @param {Number} duration - The duration of the scroll
     * @return {Object} The youScroll object
     */
    youScroll.lasts = function(duration) {
        instanceConfigs.duration = duration;
        return youScroll;
    };
    /**
     * Set the callback that will be called when the scroll is over.
     * @public
     * @param {Function} callback - The callback
     * @return {Object} The youScroll object
     */
    youScroll.setCallback = function(callback) {
        instanceConfigs.endCallback = callback;
        return youScroll;
    };
    /**
     * Set the force configuration.
     * @public
     * @param {Boolean} force
     * @return {Object} The youScroll object
     */
    youScroll.force = function(force) {
        instanceConfigs.force = force;
        return youScroll;
    };
    /**
     * Set default configuration for all future scrolls.
     * @public
     * @param {Object} configs
     */
    youScroll.config = function(configs) {
        if (typeof configs !== "object") return;
        for (var key in configs) defaultConfigs[key] = configs[key];
    };
    /**
     * Check if it is possible to start a new youScroll instance in an element.
     * @public
     * @param {Node} element
     * @return {Boolean} - If the element is currently subject to another youScroll instance
     * and its force config is set to true, deny the new youScroll. If the force config is
     * set to false, stop the current youScroll instance and allow the new scroll.
     */
    function canScroll(element) {
        for (var i = 0; i < scrollInstances.length; i++) {
            if (scrollInstances[i].getFocus() == element) {
                if (scrollInstances[i].getForce() === true) return false; else {
                    scrollInstances[i].end();
                    return true;
                }
            }
        }
        return true;
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
    /**
     * Get the X offset of an element relative to the window current scroll position.
     * @private
     * @param  {Node} element
     * @return {Number} The element's X coordinate
     */
    function elementXOffset(element) {
        return Math.round(element.getBoundingClientRect().left);
    }
    /**
     * Contains the scroll withing the container limits.
     * @private
     */
    function containScroll() {
        var targetX = startX + deltaX;
        var targetY = startY + deltaY;
        if (targetY < 0) deltaY += -targetY; else {
            var containerVisibleHeight = focus ? focus.clientHeight : root.innerHeight;
            var containerRealHeight = focus ? focus.scrollHeight : document.body.scrollHeight;
            if (targetY + containerVisibleHeight > containerRealHeight) deltaY -= targetY + containerVisibleHeight - containerRealHeight;
        }
        if (targetX < 0) deltaX += -targetX; else {
            var containerVisibleWidth = focus ? focus.clientWidth : root.innerWidth;
            var containerRealWidth = focus ? focus.scrollWidth : document.body.scrollWidth;
            if (targetX + containerVisibleWidth > containerRealWidth) deltaX -= targetX + containerVisibleWidth - containerRealWidth;
        }
    }
    // Easing functions
    /**
     * All the available easing functions.
     * @type {Object}
     * @const
     * @link http://gizma.com/easing/
     */
    var easingFunctions = {
        linear: function(t, b, c, d) {
            return c * t / d + b;
        },
        easeInOutQuad: function(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        },
        easeOutCubic: function(t, b, c, d) {
            t /= d;
            t--;
            return c * (t * t * t + 1) + b;
        }
    };
    return youScroll;
});