/*
 * Copyright 2015-2017 WorldWind Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @exports ScreenCreditController
 */
define([
        '../error/ArgumentError',
        '../util/Color',
        '../util/Font',
        '../layer/Layer',
        '../util/Logger',
        '../util/Offset',
        '../shapes/ScreenImage',
        '../shapes/ScreenText'
    ],
    function (ArgumentError,
              Color,
              Font,
              Layer,
              Logger,
              Offset,
              ScreenImage,
              ScreenText) {
        "use strict";

        /**
         * Constructs a screen credit controller.
         * @alias ScreenCreditController
         * @constructor
         * @augments Layer
         * @classdesc Collects and displays screen credits.
         */
        var ScreenCreditController = function () {
            Layer.call(this, "ScreenCreditController");

            // @markpet @emxsys: Image credits use a pool mechanism to avoid constant allocation and deallocation of
            // ScreenImage. Instances are acquired from the pool when an image credit is needed or created if the pool
            // is empty (see addImageCredit). Instances are released to the pool when they're no longer in use (see clear).
            // I used this type of pooling mechanism extensively in Android. It's more complicated than letting the
            // garbage collector do the work, but Android performance is outstanding.
            this.imageCredits = [];
            this.imageCreditPool = [];

            // @markpet @emxsys: String credits reuse a single array of instances. The controller keeps track of how
            // many are in use and creates new ones as needed (see addStringCredit). The use count is reset when the
            // instances are no longer in use (see clear). Offhand this sounded simpler to me, but I think the
            // implementation ends up more complex than pooling. Additionally, I think this pattern will be difficult to
            // apply to other cases, whereas pooling is a general and portable concept.
            this.textCredits = [];
            this.textCreditCount = 0;

            // Internal. Intentionally not documented.
            this.margin = 5;

            // Internal. Intentionally not documented.
            this.creditSpacing = 21;

            // Internal. Intentionally not documented.
            this.opacity = 0.5;
        };

        ScreenCreditController.prototype = Object.create(Layer.prototype);

        /**
         * Clears all credits from this controller.
         */
        ScreenCreditController.prototype.clear = function () {
            // Release image credits back into the pool.
            var instance;
            while ((instance = this.imageCredits.pop())) {
                this.imageCreditPool.push(instance);
            }

            this.textCreditCount = 0;
        };

        /**
         * Adds an image credit to this controller.
         * @param {String} imageUrl The URL of the image to display in the credits area.
         * @throws {ArgumentError} If the specified URL is null or undefined.
         */
        ScreenCreditController.prototype.addImageCredit = function (imageUrl) {
            if (!imageUrl) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "ScreenCreditController", "addImageCredit", "missingUrl"));
            }

            // Verify if image credit is not already in controller, if it is, don't add it.
            for (var i = 0, len = this.imageCredits.length; i < len; i++) {
                if (this.imageCredits[i].imageSource === imageUrl) {
                    return;
                }
            }

            var credit = this.imageCreditPool.pop(); // attempt to use an image credit from the pool
            if (!credit) { // create an image credit when the pool is empty
                var screenOffset = new Offset(WorldWind.OFFSET_PIXELS, 0, WorldWind.OFFSET_PIXELS, 0);
                credit = new ScreenImage(screenOffset, imageUrl);
                credit.imageOffset = new Offset(WorldWind.OFFSET_FRACTION, 1, WorldWind.OFFSET_FRACTION, 0.5);
            }

            if (credit.imageSource !== imageUrl) {
                credit.imageSource = imageUrl; // suppress forced retrieval of image source that hasn't changed
            }

            this.imageCredits.push(credit);
        };

        /**
         * Adds a string credit to this controller.
         * @param {String} stringCredit The string to display in the credits area.
         * @param (Color} color The color with which to draw the string.
         * @throws {ArgumentError} If either the specified string or color is null or undefined.
         */
        ScreenCreditController.prototype.addStringCredit = function (stringCredit, color) {
            if (!stringCredit) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "ScreenCreditController", "addStringCredit", "missingText"));
            }

            if (!color) {
                throw new ArgumentError(
                    Logger.logMessage(Logger.LEVEL_SEVERE, "ScreenCreditController", "addStringCredit", "missingColor"));
            }

            // Verify if text credit is not already in controller, if it is, don't add it.
            for (var i = 0; i < this.textCreditCount; i++) {
                if (this.textCredits[i].text === stringCredit) {
                    return;
                }
            }

            var len = this.textCredits.length, credit;
            if (len > this.textCreditCount) { // use an existing credit if the array has one
                credit = this.textCredits[this.textCreditCount];
            } else { // append a new credit to the end of the array
                var screenOffset = new Offset(WorldWind.OFFSET_PIXELS, 0, WorldWind.OFFSET_PIXELS, 0);
                credit = new ScreenText(screenOffset, stringCredit);
                credit.attributes.enableOutline = false;
                credit.attributes.offset = new Offset(WorldWind.OFFSET_FRACTION, 1, WorldWind.OFFSET_FRACTION, 0.5);
                this.textCredits.push(credit);
            }

            credit.text = stringCredit;
            credit.attributes.color.copy(color);
            this.textCreditCount++;
        };

        // Internal use only. Intentionally not documented.
        ScreenCreditController.prototype.doRender = function (dc) {
            var creditOrdinal = 1,
                i,
                len;

            for (i = 0, len = this.imageCredits.length; i < len; i++) { // at this point, the imageCredits array has no knowledge of the pool
                this.imageCredits[i].screenOffset.x = dc.viewport.width - (this.margin);
                this.imageCredits[i].screenOffset.y = creditOrdinal * this.creditSpacing;
                this.imageCredits[i].render(dc);
                creditOrdinal++;
            }

            for (i = 0; i < this.textCreditCount; i++) { // we can't iterate over the textCredits array without knowing which ones are active
                this.textCredits[i].screenOffset.x = dc.viewport.width - (this.margin);
                this.textCredits[i].screenOffset.y = creditOrdinal * this.creditSpacing;
                this.textCredits[i].render(dc);
                creditOrdinal++;
            }
        };

        return ScreenCreditController;
    });