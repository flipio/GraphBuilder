/**
 * Created by filip on 3.6.14..
 */

import Raphael from 'raphael';
import {PathTypes} from './../../app/dyole/constants/PathTypes';

/**
 * Helper element for drawing terminal connections
 *
 * @param {object} config
 * @param {number} config.x1
 * @param {number} config.x2
 * @param {number} config.y1
 * @param {number} config.y2
 *
 * @param {object} attributes
 *
 * @param {string} pathType ('beizer', 'line')
 *
 * @returns {*}
 */
Raphael.fn.curve = function (config, attributes, pathType) {
    var r = this,
        defaults = {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0
        };

    config = config || defaults;
    attributes = attributes || {};
    pathType = pathType || PathTypes.BEIZER;

    var endCoords = {
        x2: config.x2,
        y2: config.y2
    };

    function Curve(conf, attr) {

        var pub, path = r.group(),
            pathInner, pathOutter, glow;


        function initialize(conf) {
            var string = generatePathString(conf);

            pathOutter = r.path(string);
            pathOutter.attr({
                stroke: '#868686',
                'stroke-width': attr['stroke-width'] + 1
            }).toBack();


            pathInner = r.path(string);
            pathInner.attr(attr);

            path.push(pathInner).push(pathOutter);

        }

        function switchCoords(coords) {
            var temp;

            if (coords.x1 > coords.x2 && coords.y1 > coords.y2) {
                temp = coords.x1;
                coords.x1 = coords.x2;
                coords.x2 = temp;

                temp = coords.y1;
                coords.y1 = coords.y2;
                coords.y2 = temp;
            }

            if (coords.y1 < coords.y2 && coords.x1 > coords.x2) {
                temp = coords.x1;
                coords.x1 = coords.x2;
                coords.x2 = temp;

                temp = coords.y1;
                coords.y1 = coords.y2;
                coords.y2 = temp;
            }

            endCoords = coords;
            return coords;

        }

        function generatePathString(coords) {

            var string, control, beginString, endString, controlString, straightLine;

            coords = switchCoords(coords);

            beginString = "M" + coords.x1 + "," + coords.y1 + " ";

            endString = coords.x2 + "," + coords.y2;

            straightLine = beginString + endString;

            switch(pathType) {

                case PathTypes.LINE:

                    string = straightLine;
                    break;

                case PathTypes.BROKEN_LINE:

                    string = beginString + (coords.x1 + coords.x2)/2 + ',' + coords.y1 + ' ' + (coords.x1 + coords.x2)/2 + ',' + coords.y2  + ' ' + endString;
                    break;

                case PathTypes.BROKEN_CURVED_LINE:

                    if (coords.x1 === coords.x2 || coords.y1 === coords.y2){
                        string = straightLine;
                    } else {
                        string = generateVisPath(coords);
                    }
                    break;

                case PathTypes.BEIZER:
                default:

                    control = calculateControlPoints(coords);

                    controlString = "C" + control.x1 + "," + control.y1 + " " + control.x2 + "," + control.y2 + " ";

                    var c = Math.floor(coords.y1) === Math.floor(coords.y2) ? "L " : controlString;
                    string = beginString + c + endString;

                    break;

            }

            return string;
        }

        function calculateControlPoints(coords) {
            var control = {},
                diffX = (coords.x1 < coords.x2 ? coords.x2 - coords.x1 : coords.x1 - coords.x2);

            control.x1 = Math.floor(coords.x1 + diffX);
            control.y1 = coords.y1;
            control.x2 = Math.floor(coords.x2 - diffX);
            control.y2 = coords.y2;

            return control;
        }

        /**
         * Generate Vis Path - PathTypes.BROKEN_LINE with rounded corners
         *
         * Find the position of first node (1) relative to second node (2) and use this information for drawing the arcs
         *
         * --------------------------------------
         *
         * _|__x
         *  |                 |
         *  y          _ 2    |    1 _
         *            |       |       |
         *         1 _|       |       |_ 2
         *   [1]              |               [2]
         *
         * @param {object} coords
         */
        function generateVisPath(coords) {

            var first_below = coords.y1 > coords.y2; // case 1

            // maximal radius, dx and dy (rdx)
            var rxy = Math.min(Math.abs(coords.y2 - coords.y1), Math.abs(coords.x2 - coords.x1)) / 2;
            if (rxy >= 10) {
                rxy = 10;
            }

            var arc = ' a ' + rxy + ',' + rxy + ' 0 0 {{SWEEP_FLAG}} ' + rxy + ',' + (first_below ? - rxy : rxy) + ' L';

            var firstArc = arc.replace('{{SWEEP_FLAG}}', (first_below ? 0 : 1));
            var secondArc = arc.replace('{{SWEEP_FLAG}}', (first_below ? 1 : 0));

            return 'M' + coords.x1 + ',' + coords.y1 + ' ' +
                (coords.x1 + coords.x2 - rxy) / 2 + ',' + coords.y1 +
                firstArc +
                (coords.x1 + coords.x2 + rxy) / 2  + ',' + (coords.y2 + (first_below ? rxy : -rxy)) +
                secondArc +
                coords.x2 + ',' + coords.y2;
        }

        initialize(conf);

        /**
         * Exposed public methods of element
         *
         * @type {{redraw: redraw, glow: glow, toBack: toBack}}
         */
        pub = {

            redraw: function (coords, strokeWidth) {
                var string = generatePathString(coords);

                pathOutter.attr({
                    path: string,
                    'stroke-width': strokeWidth + 1
                }).toBack();

                pathInner.attr({
                    path: string,
                    'stroke-width': strokeWidth
                });

                endCoords.x2 = coords.x2;
                endCoords.y2 = coords.y2;

                if (glow) {
                    this.unGlow();
                    this.glow();
                }

                return this;
            },

            glow: function (options) {
                var attr = {
                    opacity: 0.3
                };

                if (typeof options === 'object') {
                    for (var key in options) {
                        attr[key] = options[key];
                    }
                }

                if (!glow) {
                    glow = pathOutter.glow(attr);
                }

                return this;
            },

            unGlow: function () {
                if (glow) {
                    glow.remove();
                    glow = null;
                }
            },

            remove: function () {
                if (pathInner && pathOutter) {
                    pathInner.remove();
                    pathOutter.remove();
                    path.remove();
                }
            },

            mouseover: function (func, scope) {
                pathInner.mouseover(func, scope);
            },

            mouseout: function (func, scope) {
                path.mouseout(func, scope);
            },

            click: function (func, scope) {
                scope = scope || this;

                path.click(func, scope);

            },

            unclick: function () {
                path.unclick();
            },

            toBack: function () {
                pathInner.toBack();
                pathOutter.toBack();

                path.toBack();
            },

            getPath: function () {
                return path;
            },

            getNode: function () {

                return path.node;
            },

            getPathInner: function () {

                return pathInner;
            },
            getPathOuter: function () {

                return pathOutter;
            },

            getBBox: function () {
                return path.getBBox();
            },

            getEndPointCoords: function () {
                return endCoords;
            },

            push: function (el) {
                return path.push(el);
            }

        };

        return pub;
    }

    return new Curve(config, attributes);
};
