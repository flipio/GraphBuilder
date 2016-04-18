/**
 * Created by filip on 3.6.14..
 */

'use strict';
define(['jquery', 'raphael', '../../app/dyole/constants/PathTypes'], function ($, Raphael, ConnectionTypes) {
    //@body
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
        pathType = pathType || ConnectionTypes.BEIZER;

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

                var string, control, beginString, endString, controlString;

                coords = switchCoords(coords);

                beginString = "M" + coords.x1 + "," + coords.y1 + " ";

                endString = coords.x2 + "," + coords.y2;


                //TODO: use switch
                if(pathType === ConnectionTypes.LINE) {

                    string = beginString + endString;

                } else if(pathType === ConnectionTypes.BROKEN_LINE) {

                    string = beginString + (coords.x1 + coords.x2)/2 + ',' + coords.y1 + ' ' + (coords.x1 + coords.x2)/2 + ',' + coords.y2  + ' ' + endString;

                } else if(pathType === ConnectionTypes.PAVLOVLJEVA_LINE) {


                    //TODO: Check for edge cases and refactor
                     var x1_gt_x2 = coords.x1 > coords.x2;
                     var y1_gt_y2 = coords.y1 > coords.y2;


                     var firstArc = ' ',
                     secondArc = ' ';

                     firstArc = ' a 10,10 0 0 ' + (x1_gt_x2 ^ y1_gt_y2 ? 0 : 1) + ' ' + (x1_gt_x2 ? '-' : '') + '10,' + (y1_gt_y2 ? '-' : '')+ '10 L';
                     secondArc = ' a 10,10 0 0 ' + (x1_gt_x2 ^ y1_gt_y2 ? 1 : 0) + ' ' + (x1_gt_x2 ? '-' : '') + '10,' + (y1_gt_y2 ? '-' : '')+ '10 L';


                     string = beginString +
                     (coords.x1 + coords.x2)/2 + ',' + coords.y1 +
                     firstArc +
                     ((coords.x1 + coords.x2)/2 + 10) + ',' + (coords.y2 + (x1_gt_x2 ^ y1_gt_y2 ? 10 : -10)) +
                     secondArc +
                     coords.x2 + ',' + coords.y2;

                } else /*if(pathType === ConnectionTypes.BEIZER)*/ {

                    control = calculateControlPoints(coords);

                    controlString = "C" + control.x1 + "," + control.y1 + " " + control.x2 + "," + control.y2 + " ";

                    var c = Math.floor(coords.y1) === Math.floor(coords.y2) ? "L " : controlString;
                    string = beginString + c + endString;

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
    //@body
});
