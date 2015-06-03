/**
 * Created by filip on 11.3.15..
 */
define([
        'jquery',
        'lodash',
        'dyole/elements/terminal',
        'dyole/helpers/common'
    ],
    function($, _, Terminal, Common) {

        //@body
        var Node = (function() {

            var Constraints = {};

            var Node = function(options) {
                // cache options
                this.options = options;

                this.canvas = options.canvas;

                this.parent = options.pipelineWrap;
                this.Pipeline = options.pipeline;
                this.baseUrl = this.Pipeline.assetsUrl;

                // node instance on canvas
                this.el = null;
                this.model = options.model;

                this.inputs = [];
                this.outputs = [];

                this.id = this.model.id;

                // map of connections connected to current node
                this.connections = {};

                // dragged flag
                this.dragged = false;

                this.selected = false;

                this.inputRefs = this.model.inputs;

                this.outputRefs = this.model.outputs;

                if (Common.checkObjectKeys(this.Pipeline.constraints.node)) {
                    Common.setConstraints(this.constraints, this.Pipeline.constraints.node)
                }

                if (Common.checkObjectKeys(this.Pipeline.constraints.buttons)) {
                    Common.setConstraints(this.buttons, this.Pipeline.constraints.buttons)
                }

                if (Common.checkObjectKeys(this.Pipeline.constraints.icons)) {
                    Common.setConstraints(this.icons, this.Pipeline.constraints.icons)
                }

                if (typeof options.constraints !== 'undefined') {
                    Constraints = _.extend({}, this.constraints, options.constraints);
                } else {
                    Constraints = this.constraints;
                }

                this._initTerminals();

            };

            Node.prototype = {



                constraints: {

                    radius     : 38,
                    borderWidth: 7,
                    labelOffset: 12,

                    outdated: {
                        fill    : '#F5AB35',
                        gradient: ''
                    },

                    deleted: {
                        fill    : 'red',
                        gradient: ''
                    },

                    selected: {
                        fill: '#C6D4E2'
                    },

                    //defaults
                    fill    : '#011E37',
                    stroke  : 'none'
                },

                icons: {
                    input  : 'preview_assets/images/icon-input-2.png',
                    output : 'preview_assets/images/icon-output-2.png',
                    default: 'preview_assets/images/cloud.png'
                },

                buttons: {
                    radius: 12,
                    border: 3,

                    // if you want to change buttons distance from node uncomment and change distance
                    //            distance: 5,

                    info: {
                        fill    : '#3FC380',
                        disabled: '#ccc',

                        image: {
                            name  : 'preview_assets/images/icon-info.png',
                            width : 6,
                            height: 11
                        }

                    },

                    delete: {
                        fill: '#EF4836',

                        image: {
                            name  : 'preview_assets/images/icon-delete.png',
                            width : 10,
                            height: 10
                        }

                    },

                    rename: {
                        fill: 'transparent',

                        image: {
                            name  : 'preview_assets/images/icon-pencil.png',
                            width : 12,
                            height: 12
                        }
                    }
                },

                getFirstTerminal: function(type) {
                    return this[type + 's'][0];
                },

                render: function() {

                    var self = this,
                        constraints = Constraints,
                        model = this.model,
                        canvas = this.canvas,
                        radius = constraints.radius,
                        borderWidth = constraints.borderWidth,
                        labelOffset = constraints.labelOffset,
                        inputs = this.inputs,
                        outputs = this.outputs,

                        node, outerBorder, innerBorder, borders, label, icon, img,
                        imgUrl;

                    node = canvas.group();

                    outerBorder = canvas.circle(0, 0, radius);
                    outerBorder.attr({
                        fill  : '#FBFCFC',
                        stroke: '#dddddd'
                    });

                    innerBorder = canvas.circle(0, 0, radius - borderWidth);
                    innerBorder.attr({
                        fill  : constraints.fill,
                        stroke: constraints.stroke
                        //                    gradient: constraints.gradient
                    });

                    borders = canvas.group();
                    borders.push(outerBorder).push(innerBorder);

                    var name = model.label ? model.label: model.name || model['@id'];
                    label = canvas.text(0, radius + labelOffset, ((model.softwareDescription && model.softwareDescription.name) ? model.softwareDescription.name: name));

                    label.attr({
                        'font-size': 14
                    });

                    imgUrl = this.icons.default;

                    if (model.type === 'workflow') {
                        imgUrl = this.icons.workflow;
                    }

                    img = new Image();
                    imgUrl = self.baseUrl + imgUrl;
                    img.src = imgUrl;

                    $(img).load(function() {
                        icon = canvas.image(imgUrl, -img.width / 2, -img.height / 2, img.width, img.height);
                        borders.push(icon);

                        self._attachEvents();
                    });


                    // add all elements to the group container
                    node.push(borders).push(label);

                    // render input terminals
                    _.each(inputs, function(terminal) {
                        node.push(terminal.render().el);
                    });

                    // render output terminals
                    _.each(outputs, function(terminal) {
                        node.push(terminal.render().el);
                    });

                    // move node to the coordinates written in it's model
                    node.translate(model.x, model.y);

                    this.el = node;
                    this.label = label;
                    this._innerBorder       = innerBorder;
                    this._outerBorder       = outerBorder;

                    this.circle = borders;

                    return this;
                },

                _initTerminals: function() {
                    var canvas = this.canvas,
                        inputs = this.inputs,
                        outputs = this.outputs,
                        modelInputs = this.inputRefs,
                        modelOutputs = this.outputRefs,
                        radius = Constraints.radius,
                        inputStartingAngle = 120,
                        outputStartingAngle = -60,
                        inputsLen = modelInputs.length,
                        outputsLen = modelOutputs.length,
                        i, inputsAngles, data, outputsAngles;

                    if (inputsLen > 0) {
                        inputsAngles = this._calculateTerminalAngles(inputsLen,
                            inputStartingAngle, radius, true);
                    }

                    for (i = 0; i < inputsLen; i++) {

                        data = _.extend({
                            x    : inputsAngles[i].x,
                            y    : inputsAngles[i].y,
                            input: true
                        }, modelInputs[i]);

                        inputs.push(new Terminal({
                            model       : data,
                            parent      : this,
                            canvas      : canvas,
                            pipeline    : this.Pipeline,
                            pipelineWrap: this.parent
                        }));
                    }

                    if (outputsLen > 0) {
                        outputsAngles = this._calculateTerminalAngles(outputsLen,
                            outputStartingAngle, radius, false);
                    }

                    for (i = 0; i < outputsLen; i++) {

                        data = _.extend({
                            x    : outputsAngles[i].x,
                            y    : outputsAngles[i].y,
                            input: false
                        }, modelOutputs[i]);

                        outputs.push(new Terminal({
                            model       : data,
                            parent      : this,
                            canvas      : canvas,
                            pipeline    : this.Pipeline,
                            pipelineWrap: this.parent
                        }));
                    }

                },

                _calculateTerminalAngles: function(count, offset, r, isInput) {

                    var toRadians,
                        floor = Math.floor,
                        sin = Math.sin,
                        cos = Math.cos,
                        range = 120,
                        step = range / count,
                        halfStep = step / 2,
                        coords = [],
                        i, stepDeg, deg, rad;

                    toRadians = function(deg) {
                        return deg * Math.PI / 180;
                    };

                    if (isInput) {
                        while (count--) {

                            stepDeg = count * step;
                            deg = stepDeg + halfStep + offset;
                            rad = toRadians(deg);

                            coords.push({
                                x: floor(cos(rad) * (r)),
                                y: floor(sin(rad) * (r))
                            });
                        }
                    } else {
                        for (i = 0; i < count; i++) {

                            stepDeg = i * step;
                            deg = stepDeg + halfStep + offset;
                            rad = toRadians(deg);

                            coords.push({
                                x: floor(cos(rad) * (r)),
                                y: floor(sin(rad) * (r))
                            });
                        }
                    }

                    return coords;
                },

                _attachEvents: function() {

                    var _self = this,
                        node = this.el,
                        borders = this.circle,
                        outerBorder = this._outerBorder,
                        inputs = this.inputs,
                        outputs = this.outputs;

                    borders.mouseover(function() {

                        node.toFront();

                        _self.glow = outerBorder.glow({
                            width  : 15,
                            filled : true,
                            opacity: 0.3
                        }).attr({
                            stroke: '#9b9b9b'
                        });

                        // show input and output terminals' labels
                        _.each(inputs, function(input) {
                            input.showTerminalName();
                        });
                        _.each(outputs, function(output) {
                            output.showTerminalName();
                        });

                    });

                    node.mouseout(function() {

                        if (typeof _self.glow !== 'undefined') {
                            _self.glow.remove();
                        }
                        // hide input and output terminals' labels
                        _.each(inputs, function(input) {
                            input.hideTerminalName();
                        });
                        _.each(outputs, function(output) {
                            output.hideTerminalName();
                        });

                        //_self.hideTooltip();
                    });

                    borders.click(function() {

                        var dragged = this.dragged;

                        if (typeof dragged !== 'undefined' && !dragged) {

                            this.Pipeline.Event.trigger('node:deselect');

                            if (this.Pipeline.editMode) {
                                this._select();
                            } else {
                                this._showInfo();
                            }

                            // }
                        }

                        this.dragged = false;
                    }, this);

                    borders.drag(this.onMove, this.onMoveStart, this.onMoveEnd,
                        this, this, this);

                },

                onMoveStart: function(x, y, event, startCoords) {

                    var parent = this.parent,
                        parentCoords = parent.node.getCTM(),
                        scale = parent.getScale();

                    startCoords.x -= parentCoords.e;
                    startCoords.y -= parentCoords.f;

                    // if canvas iz zoomed ( scaled ) you also need to adjust starting coordinates according to zoom level
                    startCoords.x = startCoords.x / scale.x;
                    startCoords.y = startCoords.y / scale.y;

                },

                onMove: function(dx, dy, x, y, event, start) {

                    var parent = this.parent,
                        node = this.el,
                        scale = parent.getScale();

                    // divide movement proportionally
                    // so you get equal movement in zoom state
                    // if scale is 1 it wont matter
                    dx = dx / scale.x;
                    dy = dy / scale.y;

                    node.translate(start.x + dx, start.y + dy);

                    this.redrawConnections();

                    this.dragged = true;

                    this.Pipeline.Event.trigger('scrollbars:draw');
                    this.Pipeline.Event.trigger('pipeline:change');
                    this.Pipeline.Event.trigger('node:drag', this.model, start.x + dx, start.y + dy);

                },

                onMoveEnd: function() {

                    var position = this.el.getTranslation(),
                        model = this.model;

                    if (model.x !== position.x || model.y !== position.y) {
                        model.x = position.x;
                        model.y = position.y;

                        if (this.dragged) {
                            this.Pipeline.Event.trigger('pipeline:change', 'display');
                        }
                    }

                },

                getTerminalById: function(id, type) {

                    var terminal;

                    terminal = _.find(this[type + 's'], function(term) {
                        var terId = term.model['@id'] || term.model.id;
                        return terId === id;
                    });

                    return terminal;
                },

                redrawConnections: function() {
                    _.each(this.connections, function(connection, id) {
                        if (connection) {
                            connection.draw();
                        }
                    });

                },

                addConnection: function(connection) {
                    this.connections[connection.id] = connection;

                    // recalculate file types only for regular input node
                    //            if (this.model.type.indexOf('input/') !== -1) {
                    //                this._recalculateFileTypes();
                    //            }
                },

                removeConnection: function(connection) {
                    if (this.connections[connection.id]) {

                        this.connections[connection.id] = null;

                        delete this.connections[connection.id];

                        this.Pipeline.removeConnection(connection);
                    }

                    // recalculate file types only for input nodes
                    //            if (this.model.type.indexOf('input/') !== -1) {
                    //                this._recalculateFileTypes();
                    //            }
                },

                deselectAvailableTerminals: function() {

                    _.each(this.inputs, function(terminal) {
                        terminal.setDefaultState();
                    });

                    _.each(this.outputs, function(terminal) {
                        terminal.setDefaultState();
                    });

                },

                _showButtons: function() {
                    var _self = this,
                        bbox,
                        nodeRadius = Constraints.radius,
                        buttonDistance = typeof this.buttons.distance !== 'undefined' ? -this.buttons.distance - nodeRadius - this.buttons.radius: -nodeRadius * 1.5;

                    if (!this.infoButton && !this.removeNodeButton) {

                        this.buttons.rename.image.url = this.baseUrl + this.buttons.rename.image.name;

                        this.infoButton = this.canvas.button({
                            fill  : this.buttons.info.fill,
                            x     : +16,
                            y     : buttonDistance,
                            radius: this.buttons.radius,
                            border: this.buttons.border,
                            image : {
                                url   : this.baseUrl + this.buttons.info.image.name,
                                width : 14,
                                height: 14
                            }
                        }, {
                            onClick: this._showInfo,
                            scope  : this
                        });

                        this.removeNodeButton = this.canvas.button({
                            fill  : this.buttons.delete.fill,
                            x     : -16,
                            y     : buttonDistance,
                            radius: this.buttons.radius,
                            border: this.buttons.border,
                            image : {
                                url   : this.baseUrl + this.buttons.delete.image.name,
                                width : 14,
                                height: 14
                            }
                        }, {
                            onClick: this._removeNodeButtonClick,
                            scope  : this
                        });

                        _self.el.push(_self.infoButton.getEl())
                            .push(_self.removeNodeButton.getEl());

                    }

                },

                _destroyButtons: function() {


                    if (this.infoButton) {
                        this.infoButton.remove();
                        this.infoButton = null;
                    }


                    if (this.removeNodeButton) {
                        this.removeNodeButton.remove();
                        this.removeNodeButton = null;
                    }

                },

                _removeNodeButtonClick: function() {
                    this._destroyButtons();
                    this.Pipeline.removeNode(this.model.id);
                },

                /**
                 * Lunch modal box with node description
                 *
                 * @private
                 */
                _showInfo: function() {
                    //show info node info

                    this.Pipeline.Event.trigger('node:showInfo', this.model);
                },

                _select: function() {


                    if (!this.Pipeline.editMode) {
                        return;
                    }


                    this.Pipeline.selectedNodes.push(this);

                    this._showButtons();

                    // Show selected state
                    this._outerBorder.attr({
                        fill: Constraints.selected.fill
                    });

                    this.selected = true;

                    this.Pipeline.Event.trigger('node:select', this.model);
                },

                _deselect: function() {
                    this._destroyButtons();

                    // Show default state


                    this._outerBorder.attr({fill: "#ffffff"});




                    this.selected = false;

                    this.Pipeline.Event.trigger('node:deselected', this.model);
                },

                /**
                 * Set inner border style properties
                 *
                 * @public
                 */
                setStyle: function(obj) {

                    if (typeof obj !== 'object') {
                        console.error('Parametar has to be object, got: ' + typeof obj, obj);
                        return false;
                    }

                    //obj[prop] = value;
                    Constraints.selectedNewProp = obj
                    this._innerBorder.attr(obj);

                },

                removeNode: function() {

                    var _self = this;


                    _.each(this.connections, function(connection) {
                        if (connection) {
                            connection.destroyConnection();
                        }
                    });

                    _.each(this.inputs, function(t) {
                        t.destroy();
                    });

                    _.each(this.outputs, function(t) {
                        t.destroy();
                    });

                    this.connections = {};

                    if (typeof this.glow !== 'undefined') {
                        this.glow.remove();
                    }
                    var parentId = null,  parentModel = null;
                    if (this.model.parent ) {
                        parentId = this.model.parent;
                        parentModel = this.Pipeline.nodes[parentId].model;
                    }




                    this.destroy();

                    delete this.Pipeline.model.schemas[this.model.id];
                    delete this.Pipeline.nodes[this.model.id];

                    this.Pipeline.Event.trigger('node:remove', this.model);
                },

                destroy: function() {

                    this.circle.unbindMouse().unhover().unclick().unkeyup();
                    // remove element which has events attached to it, safety purposes :)
                    this.circle.remove();

                    this.el.remove();
                }
            };

            return Node;
        })();

        //@body

        return Node;
    });