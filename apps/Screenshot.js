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
requirejs(['../examples/WorldWindShim'],
    function (WorldWind) {
        "use strict";

        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        var wwd = new WorldWind.WorldWindow("canvasOne");
        wwd.addLayer(new WorldWind.AtmosphereLayer());
        wwd.addLayer(new WorldWind.StarFieldLayer());

        var imageLayer = new WorldWind.BMNGLandsatLayer();
        imageLayer.detailControl = 1.0;
        wwd.addLayer(imageLayer);

        var tessellator = wwd.globe.tessellator;
        tessellator.detailControl = 20.0;
        wwd.addLayer(new WorldWind.ShowTessellationLayer());
    });
