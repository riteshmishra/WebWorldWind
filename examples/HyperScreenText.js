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
requirejs(['./WorldWindShim',
        './LayerManager'],
    function (WorldWind,
              LayerManager) {
        "use strict";

        // Tell WorldWind to log only warnings.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        // Create the WorldWindow.
        var wwd = new WorldWind.WorldWindow("canvasOne");

        /**
         * Added imagery layers.
         */
        var layers = [
            {layer: new WorldWind.BMNGLayer(), enabled: true},
            {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            wwd.addLayer(layers[l].layer);
        }

        var hyperlinkCredit,
            textAttributes = new WorldWind.TextAttributes(null),
            textLayer = new WorldWind.RenderableLayer("Screen Text");

        textAttributes.color = WorldWind.Color.MEDIUM_GRAY;

        hyperlinkCredit = new WorldWind.ScreenText(
            new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 1, WorldWind.OFFSET_FRACTION, 0.05), "NASA WorldWind (https://worldwind.arc.nasa.gov)");
        textAttributes = new WorldWind.TextAttributes(textAttributes);
        textAttributes.offset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 1, WorldWind.OFFSET_FRACTION, 0);
        textAttributes.enableOutline = false;
        hyperlinkCredit.attributes = textAttributes;
        hyperlinkCredit.userProperties.url = "https://worldwind.arc.nasa.gov";
        hyperlinkCredit.pickDelegate = hyperlinkCredit.userProperties;
        textLayer.addRenderable(hyperlinkCredit);

        wwd.addLayer(textLayer);

        var layerManager = new LayerManager(wwd);

        var eventHandler = {
            onGestureEvent: function (e) {
                if (e.type !== "pointerdown") {
                    return false;
                }
                var pickPoint = wwd.canvasCoordinates(e.clientX, e.clientY);

                var pickList = wwd.pick(pickPoint);
                if (pickList.objects.length > 0) {
                    for (var p = 0; p < pickList.objects.length; p++) {
                        var pickedObject = pickList.objects[p];
                        if (!pickedObject.isTerrain) {
                            if (pickedObject.userObject.url) {
                                window.open(pickedObject.userObject.url, "_blank");
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        };

        wwd.worldWindowController.addGestureListener(eventHandler);
    });