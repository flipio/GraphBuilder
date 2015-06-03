/**
 * Created by filip on 11.3.15..
 */
define([
        'jquery',
        'lodash',
        'raphael',
        'dyole/event/event',
        'dyole/constants/GraphModel',
        'dyole/elements/node',
        'dyole/elements/terminal',
        'dyole/elements/connection',
        'dyole/helpers/sort',
        'dyole/helpers/common',

        'raphael-group'
    ],
function ($, _, Raphael, Event, GraphModel, Node, Terminal, Connection, Sort, Common) {
    
    //@body

    var Graph = function (options) {

        // cache options
        this.options = options;

        this.assetsUrl = options.assetsUrl;

        this.model = options.model || _.clone(GraphModel, true);

        if (options.TreeModel) {
            this._parseTreeGraphModel(options.TreeModel);
        }

        this.$parent = options.$parent;

        this.nodes = {};
        this.connections = {};

        /**
         * Clone event object for every pipeline
         */
        this.Event = _.clone(Event, true);

        /**
         * Graph in preview?
         * @type {.scope.editMode|*|Pipeline.editMode|$scope.view.editMode}
         */
        this.editMode = options.editMode;

        /**
         * Cache selected nodes
         *
         * @type {Array}
         */
        this.selectedNodes = [];

        // temporarily holding references to the terminals
        // needed for connection to render
        this.tempConnectionRefs = null;

        // flag for temporary connection
        this.tempConnectionActive = false;

        /**
         * Save ref to the current canvas scale
         * @type {*|number}
         */
        this.currentScale = this.model.display.canvas.zoom || 1.0;

        if (typeof options.constraints === 'object' && Object.keys(options.constraints).length  > 0) {
            this._overrideConstraints(options.constraints);
        }

        this._initCanvas();
        this._attachEvents();
        this._generateNodes();
        this._generateConnections();

        this._drawScrollbars();
    };

    Graph.prototype = {

        assetsUrl : '/',

        constraints: {},

        _overrideConstraints: function (constraints) {

            if (Common.checkObjectKeys(constraints.node)) {
                this.constraints.node = constraints.node;
            }

            if (Common.checkObjectKeys(constraints.terminal)) {
                this.constraints.terminal = constraints.terminal;
            }

            if (Common.checkObjectKeys(constraints.connection)) {
                this.constraints.connection = constraints.connection;
            }

            if (Common.checkObjectKeys(constraints.buttons)) {
                this.constraints.buttons = constraints.buttons;
            }

            if (Common.checkObjectKeys(constraints.icons)) {
                this.constraints.icons = constraints.icons;
            }

        },

        /**
         * Attach necessary listeners/subscribers
         *
         * @private
         */
        _attachEvents: function () {
            var _self = this,
                $canvasArea = this.$parent;

            this.Event.subscribe('temp:connection:state', function (state) {
                _self.tempConnectionActive = state;
            });

            this.Event.subscribe('scrollbars:draw', function () {
                _self._drawScrollbars();
            });

            /**
             * @param type {string}
             */
            this.Event.subscribe('pipeline:change', function () {
                // on graph change
            });

            this.Event.subscribe('node:add', function (model, constraints) {

                var node = new Node({
                    pipeline: _self,
                    model: model,
                    canvas: _self.canvas,
                    pipelineWrap: _self.pipelineWrap,
                    constraints: constraints
                });

                _self.nodes[model.id] = node;

                _self.pipelineWrap.push(node.render().el);

            });

            this.Event.subscribe('node:deselect', function () {
                _.each(_self.selectedNodes, function (node) {
                    if (node.selected) {
                        node._deselect();
                    }
                });

            });

            this.Event.subscribe('node:select', function (model) {

                //@todo add handler for this event

            });

            this.Event.subscribe('connection:create', function (endTerminal, startTerminal) {
                var end = endTerminal.model.input ? endTerminal :
                        startTerminal,
                    start = endTerminal.model.input ? startTerminal :
                        endTerminal;

                _self.tempConnectionRefs = {
                    end: end,
                    start: start
                };

                // connection id has to be set here because of dynamic connection creation
                var model = {
                    id: _.random(100000, 999999) + '', // it has to be a string
                    start_node: start.parent.model.id,
                    end_node: end.parent.model.id,
                    input_name: end.id,
                    output_name: start.id,
                    connection_name : ''
                };

                _self.createConnection(model);

                _self.Event.trigger('connection:add', model);
            });

            $canvasArea.mousemove(function (e) {
                _.each(_self.nodes, function (node) {

                    _.each(node.inputs, function (i) {
                        e.preventDefault();
                        // e.stopPropagation();

                        if (i.mousedown) {
                            if (!i.tempConnection) {
                                i.drawConnection(e);
                            } else {
                                i.redrawConnection(e);
                            }
                        }
                    });

                    _.each(node.outputs, function (o) {
                        e.preventDefault();
                        // e.stopPropagation();

                        if (o.mousedown) {
                            if (!o.tempConnection) {
                                o.drawConnection(e);
                            } else {
                                o.redrawConnection(e);
                            }
                        }
                    });

                });
            });

            $('body').on('mouseup', function (e) {

                _.each(_self.nodes, function (node) {

                    _.each(node.inputs, function (i) {
                        i.parent.deselectAvailableTerminals();
                        i._removeTempConnection();

                        i.onMouseUpCallback();

                        i.mouseoverTerminal = null;
                        i.mousedown = false;
                    });

                    _.each(node.outputs, function (o) {
                        o.parent.deselectAvailableTerminals();
                        o._removeTempConnection();

                        o.onMouseUpCallback();

                        o.mouseoverTerminal = null;
                        o.mousedown = false;
                    });

                });
            });
        },

        /**
         * Initialize canvas element
         *
         * @private
         */
        _initCanvas: function () {
            var width = 600,
                height = 600,
                $parent = this.$parent,
                $parentDim = {
                    width: $parent[0].offsetWidth - 10,
                    height: $parent[0].offsetHeight || $parent[0].parentNode.offsetHeight
                };

            width = $parentDim.width || width;
            height = $parentDim.height || height;

            if (height > 0) { height -= 10; }

            this.canvas = new Raphael(this.$parent[0], width, height);
            this.pipelineWrap = this.canvas.group();

            this._initCanvasPosition();
            this._initRect(this.canvas, width, height);
            this._initCanvasMove();
        },

        /**
         * Move canvas in last saved position
         *
         * @private
         */
        _initCanvasPosition: function () {
            this._move(this.model.display.canvas);
        },

        /**
         * Init Rect to watch for dragging canvas
         *
         * @param canvas
         * @param width
         * @param height
         * @private
         */
        _initRect: function (canvas, width, height) {

            this.rect = canvas.rect(0, 0, width, height);
            this.rect.dragged = false;

            this.rect.attr({
                stroke: 'none',
                fill: '#fff',
                opacity: '0'
            });

        },

        /**
         * Initialize zooming
         *
         * @param step
         * @private
         */
        _initZoomLevel: function (step) {

            this.getEl().scale(step, step);

            this._drawScrollbars();

        },

        /**
         * Move canvas
         *
         * @param position
         * @private
         */
        _move: function (position) {
            this.getEl().translate(position.x, position.y);
        },

        /**
         * Initialize canvas moving
         *
         * @private
         */
        _initCanvasMove: function () {

            var _self = this,
                canvas = this.getEl(),
                currentZoomLevel = canvas.getScale(),
                start, move, end, startCoords;

            start = function startDragging(x, y, event) {
                startCoords = canvas.getTranslation();

                startCoords.x = startCoords.x * currentZoomLevel.x;
                startCoords.y = startCoords.y * currentZoomLevel.y;

                //                globals.vents.trigger('inPlaceEdit:destroy');

                _self.Event.trigger('canvas:drag:start', startCoords);
            };

            move = function onMove(x, y) {

                var translation = startCoords,
                    canvasEmpty = Object.keys(_self.nodes).length === 0;

                if (!canvasEmpty) {

                    canvas.translate((translation.x + x) / currentZoomLevel.x, (
                        translation.y + y) / currentZoomLevel.y);

                    _self.rect.dragged = true;
                    _self._drawScrollbars();
                    _self.Event.trigger('pipeline:change');

                    _self.Event.trigger('canvas:drag:move', {x: (translation.x + x) / currentZoomLevel.x, y: (
                        translation.y + y) / currentZoomLevel.y});
                }



            };

            end = function endDragging(/*x, y, event*/) {

                // clone translation object
                var can, canvasTranslation = _.clone(canvas.getTranslation(), true);

                // add zoom level
                canvasTranslation.zoom = currentZoomLevel.x;

                // set it to the pipeline model
                can = _self.model.display.canvas;

                can.x = canvasTranslation.x;
                can.y = canvasTranslation.y;

                if (_self.rect.dragged) {
                    _self.Event.trigger('canvas:drag:end', can);

                }

                startCoords = {
                    x: 0,
                    y: 0
                };
            };

            this.rect.drag(move, start, end);
            this.rect.click(function () {
                if (!_self.rect.dragged) {
                    _self.Event.trigger('node:deselect');
                }

                _self.rect.dragged = false;
            });

            this.rect.mouseover(function () {
                _self.Event.trigger('remove:wire');
            });

        },

        /**
         * Generate canvas nodes from pipeline model
         *
         * @private
         */
        _generateNodes: function () {

            var _self = this;

            _.each(_self.model.nodes, function (nodeModel, index) {

                var nodeId = nodeModel['@id'] || nodeModel.id;
                // schema is not merged because nodes is a copy of schema with modified inputs and outputs for displaying on canvas
                // schema is only used for tool execution
                var model = _.extend(nodeModel, _self.model.display.nodes[nodeId]);

                _self.nodes[nodeId] = new Node({
                    pipeline: _self,
                    model: model,
                    canvas: _self.canvas,
                    pipelineWrap: _self.pipelineWrap
                });
            });

            _.each(_self.nodes, function (node) {
                _self.pipelineWrap.push(node.render().el);
            });

            this.pipelineWrap.translate(this.model.display.canvas.x, this.model.display.canvas.y);

            this.rect.toBack();
        },

        /**
         * Generate connections based on relations from model
         *
         * @private
         */
        _generateConnections: function () {
            var _self = this;

            _.each(this.model.relations, function (connection) {

                _self._createConnection(connection);

            });
        },

        /**
         * Create single connection
         * Creating from pipeline model
         *
         * @param connection
         * @private
         */
        _createConnection: function (connection) {
            var _self = this,
                input = _self.nodes[connection.start_node].getTerminalById(
                    connection.output_name, 'output'),
                output = _self.nodes[connection.end_node].getTerminalById(
                    connection.input_name, 'input');

            _self.connections[connection.id] = new Connection({
                model: connection,
                canvas: _self.canvas,
                parent: _self.pipelineWrap,
                nodes: _self.nodes,
                pipeline: _self,
                input: input,
                output: output,
                element: _self.$parent
            });

            _self.nodes[connection.start_node].addConnection(_self.connections[
                connection.id]);
            _self.nodes[connection.end_node].addConnection(_self.connections[
                connection.id]);
        },

        /**
         * Generate node id
         * Node id is represented as unique string for easier manual json formating later
         *
         * @param model
         * @returns {string}
         * @private
         */
        _generateNodeId: function (model) {
            var _id, check = true, name = (model.softwareDescription && model.softwareDescription.label) ? model.softwareDescription.label : model.label || model.name,
                n = 0;

            if (name.charAt(0) !== '#') {
                name = '#' + name;
            }

            while (check) {

                if (n === 0) {
                    check = this._checkIdAvailable(name);
                } else {
                    check = this._checkIdAvailable(name + '_' + n);
                }

                n = check ? n + 1 : n;
            }

            if (n === 0) {
                _id = name;
            } else {
                _id = name + '_' + n;
            }

            return _id;
        },

        /**
         * Check if id is available
         *
         * @param id
         * @returns {boolean}
         * @private
         */
        _checkIdAvailable: function (id) {
            return !!this.nodes[id];
        },

        /**
         * Mark drop areas for input/output creation
         *
         * @param isInput
         * @private
         */
        _markCreateArea: function (isInput) {

            var rect,
                areaWidth = this.constraints.dropArea.width;

            if (isInput) {
                rect = this.canvas.rect(0, 0, areaWidth, this.canvas.height);
            } else {
                rect = this.canvas.rect(this.canvas.width - areaWidth, 0,
                    areaWidth, this.canvas.height);
            }

            rect.attr({
                stroke: 'none',
                fill: '#f0ad4e',
                opacity: '0.3'
            });

            rect.toBack().animate({
                opacity: 0
            }, 600, function () {
                this.animate({
                    opacity: 0.3
                }, 600, function () {
                    this.animate({
                        opacity: 0
                    }, 600, function () {
                        this.animate({
                            opacity: 0.3
                        }, 600, function () {

                        });
                    });
                });

            });

            rect.isInput = isInput;

            this.dropZoneRect = rect;

        },

        /**
         * Draw canvas position indicators - scrollbars
         *
         * @private
         */
        _drawScrollbars: function () {

            var canvas = this.getEl(),
                canvasBox = canvas.node.getBBox(),
                color = '#B6B6B6',
                size = 8,
                doubleSize = size * 2,
                edgesRadius = size / 3, // rounding edges radius for both bars (Vertical / Horizontal Radius)
                hBar, vBar, canvasTransform, surface, surfaceDimensions,
                surfaceWidth, surfaceHeight,
                hX, hY, hW, vX, vY, vH, ratioL, ratioR, ratioT, ratioB,
                canvasTranslation;

            //            if (!canvasBox) {
            //                canvas.setTransform(new matrix.translate(0, 0));
            //                return;
            //            }

            hBar = this.horizontalBar;
            vBar = this.verticalBar;
            canvasTransform = canvas.node.getCTM(); // || matrix.identity;
            canvasTranslation = canvas.getTranslation();
            surface = this.canvas;
            surfaceDimensions = {
                width: surface.width,
                height: surface.height
            };

            surfaceWidth = surfaceDimensions.width;
            surfaceHeight = surfaceDimensions.height;
            canvasBox.l = canvasBox.x + canvasTransform.e;
            canvasBox.r = canvasBox.l + (canvasBox.width * canvasTransform.a);
            canvasBox.t = canvasBox.y + canvasTransform.f;
            canvasBox.b = canvasBox.t + (canvasBox.height * canvasTransform
                .d);

            if (hBar) {
                hBar.remove();
                this.horizontalBar = null;
            }
            if (vBar) {
                vBar.remove();
                this.verticalBar = null;
            }

            if (canvasBox.l < 0 || canvasBox.r > surfaceWidth) {

                ratioL = ratioR = 1;

                if (canvasBox.l < 0) {
                    ratioL = surfaceWidth / (surfaceWidth - canvasBox.l);
                }

                if (canvasBox.r > surfaceWidth) {
                    ratioR = surfaceWidth / canvasBox.r;
                }

                hX = (canvasBox.l < 0 ? surfaceWidth - surfaceWidth * ratioL :
                    0) + size / 2;
                hY = surfaceHeight - size * 1.5;
                hW = surfaceWidth * (ratioR * ratioL) - doubleSize;

                if (hX > surfaceWidth - doubleSize * 2) {
                    hX = surfaceWidth - doubleSize * 2;
                }
                if (hW < doubleSize) {
                    hW = doubleSize;
                }

                hBar = this.canvas.rect(hX, hY, hW, size, edgesRadius).attr({
                    fill: color,
                    stroke: 'none'
                });

                hBar.toFront();
                this.horizontalBar = hBar;
            }

            if (canvasBox.t < 0 || canvasBox.b > surfaceHeight) {

                ratioT = ratioB = 1;

                if (canvasBox.t < 0) {
                    ratioT = surfaceHeight / (surfaceHeight - canvasBox.t);
                }
                if (canvasBox.b > surfaceHeight) {
                    ratioB = surfaceHeight / canvasBox.b;
                }

                vX = surfaceWidth - size * 1.5;
                vY = (canvasBox.t < 0 ? surfaceHeight * (1 - ratioT) : 0) +
                    size / 2;
                vH = surfaceHeight * (ratioB * ratioT) - doubleSize;

                if (vY > surfaceHeight - doubleSize * 2) {
                    vY = surfaceHeight - doubleSize * 2;
                }
                if (vH < doubleSize) {
                    vH = doubleSize;
                }

                vBar = this.canvas.rect(vX, vY, size, vH, edgesRadius).attr({
                    fill: color,
                    stroke: 'none'
                });
                vBar.toFront();
                this.verticalBar = vBar;
            }
        },

        /**
         *  Transform node model for easier use
         *
         * @param nodeModel
         * @returns {*}
         * @private
         */
        _transformModel: function (nodeModel) {

            var model = nodeModel.json || nodeModel;

            _.forEach(model.inputs.properties, function (input, name) {
                input.name = name;
                input.id = input.id || name;
            });

            _.forEach(model.outputs.properties, function (output, name) {
                output.name = name;
                output.id = output.id || name;

            });

            return model;

        },

        /**
         * Transform workflow model
         *
         * @param nodeModel
         * @returns {*}
         * @private
         */
        _transformWorkflowModel: function (nodeModel) {
            var model = nodeModel.json;

            return model;
        },

        /**
         * Get element offset
         *
         * @param element
         * @returns {{top: number, left: number}}
         * @private
         */
        _getOffset: function (element) {

            var bodyRect = document.body.getBoundingClientRect();
            var elemRect = element.getBoundingClientRect();
            var top = elemRect.top - bodyRect.top;
            var left = elemRect.left - bodyRect.left;

            return {
                top: top,
                left: left
            };
        },

        /**
         * Get connections from pipeline model
         * Used when generating pipeline json
         *
         * @returns {*}
         * @private
         */
        _getConnections: function () {
            return _.pluck(this.connections, 'model');
        },

        /**
         * Get nodes from pipeline model
         * Used when generating pipeline json
         *
         * @returns {*}
         * @private
         */
        _getNodes: function () {
            return _.clone(_.pluck(this.nodes, 'model'), true);
        },

        /**
         * Generate connection based on temp connection
         * User interaction connection creating
         *
         * @param connectionModel
         */
        createConnection: function (connectionModel) {
            var _self = this,
                input, output;

            if (!this.tempConnectionRefs) {
                return;
            }

            input = this.tempConnectionRefs.end;
            output = this.tempConnectionRefs.start;

            _self.connections[connectionModel.id] = new Connection({
                model: connectionModel,
                canvas: _self.canvas,
                parent: _self.pipelineWrap,
                nodes: _self.nodes,
                pipeline: _self,
                input: input,
                output: output,
                element: _self.$parent
            });

            _self.nodes[connectionModel.start_node].addConnection(_self.connections[connectionModel.id]);
            _self.nodes[connectionModel.end_node].addConnection(_self.connections[connectionModel.id]);


            this.Event.trigger('pipeline:change');

        },

        /**
         * Get raphael canvas element
         *
         * @returns {*|Pipeline.pipelineWrap}
         */
        getEl: function () {
            return this.pipelineWrap;
        },

        /**
         * Remove connection
         *
         * @param connection
         */
        removeConnection: function (connection) {

            if (this.connections[connection.id]) {
                this.connections[connection.id] = null;
                delete this.connections[connection.id];
            }

        },


        /**
         * Zooming finished callback
         *
         * @private
         */
        _zoomingFinish: function () {
            this._drawScrollbars();
            this.model.display.canvas.zoom = this.currentScale;
        },
        
        _parseTreeGraphModel: function (TreeGraph) {
            var model = this.model,
                GAP = 250;

            var levelIndex = {};

            var _parseTree = function (node, level, parent) {

                node.model.parent = level === 0 ? false : parent.model.id;

                model.nodes.push(node.model);
                model.schemas[node.model.id] = node.model;

                levelIndex[level] = typeof levelIndex[level] === 'number' ? levelIndex[level] + 1 : 0;

                model.display.nodes[node.model.id] =  model.display.nodes[node.model.id] || _generateCoords(level, levelIndex[level]);

                if (parent) {

                    var relation = {
                        'id': _.random(100000, 999999) + '',
                        'start_node': parent.model.id,
                        'output_name': parent.model.outputs[0].id,
                        'end_node':  node.model.id,
                        'input_name':  node.model.inputs[0].id
                    };

                    model.relations.push(relation);
                }

                if (typeof node.children !== 'undefined' && _.isArray(node.children) && node.children.length > 0) {
                    level++;
                    var list = [];

                    _.forEach(node.children, function (c) {
                       list.push(c.model.id);
                    });

                    node.model.childrenList = list;

                    _.forEach(node.children, function (n, index) {
                        _parseTree(n, level, node, index);
                    });
                }
            };

            var _generateCoords = function (level, index, numOfItems) {
                var x = GAP*level,
                    y = index*GAP/2;

                return {
                    x: x,
                    y: y
                }
            };

            if (_.isArray(TreeGraph)) {
                _.forEach(TreeGraph, function (Graph) {
                    _parseTree(Graph, 0, false, 0);
                });
            } else {
                _parseTree(TreeGraph, 0, false, 0);
            }
        },

        /**
         * ------------------------------------------------------
         * Public Methods
         * ------------------------------------------------------
         */

        /**
         * Init zoom level
         * Returns current canvas scale
         *
         * @returns {*|number}
         */
        initZoom: function () {
            this._initZoomLevel(this.currentScale);

            return this.currentScale;
        },

        /**
         * Get connections from pipeline model
         * Used when generating pipeline json
         *
         * @returns {*}
         * @private
         */
        getConnections: function () {
            return this._getConnections();
        },

        /**
         * Get Node instance on canvas
         *
         * @param id
         * @returns {{}|*}
         */
        getNodeById: function (id) {
            if (!this.nodes[id]) {
                throw new Error('Node with id: ' + id + ' not found');
            }

            return this.nodes[id];
        },

        /**
         * Removes node from canvas
         *
         * @param nodeId
         */
        removeNode: function(nodeId) {
            var _self = this;

            if (typeof nodeId === 'undefined') {
                throw Error('Node ID must be supplied to remove node');
            }

            var node = this.nodes[nodeId],
                parent = _self.nodes[node.model.parent];

            if (typeof parent !== "undefined") {

                _.remove(parent.model.childrenList, function (n) {
                    return n === _self.model.id;
                });
            }


            if (node.model.childrenList && node.model.childrenList.length > 0) {
                _.forEach(node.model.childrenList, function (child) {
                    if (typeof _self.nodes[child] !== 'undefined') {

                        _self.removeNode(child);

                    }
                });
            }

            node.removeNode();
        },

        /**
         * Destroys pipeline and its references
         */
        destroy: function () {

            var _self = this,
                events = ['connection:create', 'scrollbars:draw', 'node:add', 'node:deselect'];

            this.canvas = null;
            this.model = null;

            this.$parent.find('svg').remove();

            _.each(this.connections, function (connection) {
                connection.destroy();
            });

            _.each(this.nodes, function (node) {
                node.destroy();
            });

            this.nodes = null;


            _.each(events, function (event) {
                _self.Event.unsubscribe(event);
            });

            this.Event = null;

            this.values = null;
            this.exposed = null;

            delete this.values;
            delete this.exposed;

            $('body').off('mouseup');
        },


        /**
         *  Connect two nodes
         *
         * @param n1
         * @param n2
         * @param [connectionName]
         */
        connectNodes: function (n1, n2, connectionName, connectionClass) {
            var n1t = this.getNodeById(n1).getFirstTerminal('output');
            var n2t = this.getNodeById(n2).getFirstTerminal('input');
            
            var connectionModel = {
                id: _.random(100000, 999999) + '', // it has to be a string
                start_node: n1,
                end_node: n2,
                input_name: n2t.id,
                output_name: n1t.id,
                connection_name :  connectionName || false,
                connection_class_name : connectionClass || false
            };
            
            this.tempConnectionRefs = {
                end: n2t,
                start: n1t
            };

            this.createConnection(connectionModel);
        },

        /**
         * Add node to the canvas
         *
         * @param nodeModel {object}
         * @param coords {object} {x: x, y: y}
         * @param [rawCoords] {boolean}
         * @param [constraints] {object}
         * 
         * @returns {string} Node ID created
         */
        addNode: function (nodeModel, coords, rawCoords, constraints, onCreate) {

            var rawModel = _.clone(nodeModel, true),
                model;

            var clientX = coords.x;
            var clientY = coords.y;

            rawCoords = rawCoords || false;
            constraints = constraints || {};

            if (nodeModel.type && nodeModel.type === 'workflow') {
                model = this._transformWorkflowModel(nodeModel);
            } else {
                model = this._transformModel(nodeModel);
            }

            var zoom = this.getEl().getScale().x;

            var canvas = this._getOffset(this.$parent[0]);

            var x = ( clientX - canvas.left )  - this.pipelineWrap.getTranslation().x,
                y = ( clientY - canvas.top  ) - this.pipelineWrap.getTranslation().y;

            if (rawCoords) {
                x = clientX - this.pipelineWrap.getTranslation().x;
                y = clientY - this.pipelineWrap.getTranslation().y;
            }

            model.x = x / zoom;
            model.y = y / zoom;

            var _id = model.id || this._generateNodeId(model);

            model.id = _id;



            this.model.schemas[model.id] = rawModel;

            this.Event.trigger('node:add', model, constraints);
            onCreate(_id);
            return _id;
        },

        /**
         * Adjust canvas dimensions to fit the parent
         */
        adjustSize: function () {

            var width = this.$parent[0].offsetWidth - 10;
            var height = this.$parent[0].offsetHeight || this.$parent[0].parentNode.offsetHeight;

            if (height > 0) { height -= 10; }

            // handling bug with svg in hidden element
            if (width < 0 || height < 0) { return false; }

            this.canvas.setSize(width, height);

            this.rect.attr({
                width: width,
                height: height
            });

            this._drawScrollbars();

        },

        /**
         * Get pipeline model
         *
         * @returns {*}
         */
        getJSON: function () {
            var json = _.clone(this.model, true);

            json.relations = this._getConnections();
            json.nodes = this._getNodes();

            json.display.nodes = {};

            _.each(json.nodes, function (node) {
                var nodeId = node.id || node['@id'];

                json.display.nodes[nodeId] = {
                    x: node.x,
                    y: node.y
                };

                delete node.x;
                delete node.y;
            });

            json.display.canvas.x = this.getEl().getTranslation().x;
            json.display.canvas.y = this.getEl().getTranslation().y;

            return json;
        },

        /**
         * Get tree graph model
         *
         * @returns {*}
         */
        getTreeJSON: function () {
            var _self = this,
                json = [],

                connections = this._getConnections();

            var sorted = Sort.tsort(connections);

            if (sorted.errors.length > 0) {
                throw Error('There are some errors in graph: ' + sorted.errors.toString());
            }

            if (connections.length === 0) {
                return this.getJSON();
            }

            var _createChildren = function (list, parent) {
                _.forEach(list , function (nodeId) {
                    _createModel(nodeId, parent);
                });
            };

            var _createModel = function (nodeId, parent) {
                var node = _self.getNodeById(nodeId),
                    model = {
                        model: {},
                        children: []
                    },
                    children = node.model.childrenList; // list of ids

                _.remove(sorted.sorted, function (i) {
                    return i === nodeId;
                });

                model.model = node.model;

                if (typeof children !== 'undefined' && children.length > 0) {
                    model.children = [];
                    _createChildren(children, model.children);
                }


                if (model.children.length === 0) {
                    delete model.children;
                }

                parent.push(model);

            };


            var _create = function (item) {
                _createModel(item, json);
            };

            while (sorted.sorted.length !== 0) {
                _create(sorted.sorted[0]);
            }

            return json;
        },

        /**
         * Canvas zoom in
         * Returns current canvas scale
         *
         * @returns {*|number}
         */
        zoomIn: function () {
            var canvas = this.getEl(),
                zoomLevel = canvas.getScale(),
                canvasBox = canvas.node.getBBox(),
                canvasTransform = canvas.node.getCTM(),
                canvasRect = canvasBox,
                scale = 0.05;

            canvasBox.l = canvasBox.x + canvasTransform.e;
            canvasBox.t = canvasBox.y + canvasTransform.f;
            canvasBox.r = canvasBox.l + (canvasRect.width * canvasTransform.a);

            if (zoomLevel.x < 1.2 && zoomLevel.y < 1.2) {

                this.currentScale += scale;

                canvas.scaleAtPoint(
                    this.currentScale,
                    {
                        x: canvasBox.r - canvasRect.width / 2,
                        y: canvasBox.t - canvasRect.height / 2
                    }
                );

                this._zoomingFinish();
            }

            return this.currentScale;
        },

        /**
         * Canvas zoom out
         * Returns current canvas scale

         * @returns {*|number}
         */
        zoomOut: function () {
            var canvas = this.getEl(),
                zoomLevel = canvas.getScale(),
                canvasBox = canvas.node.getBBox(),
                canvasTransform = canvas.node.getCTM(),
                canvasRect = canvasBox,
                scale = 0.05;

            canvasBox.l = canvasBox.x + canvasTransform.e;
            canvasBox.t = canvasBox.y + canvasTransform.f;
            canvasBox.r = canvasBox.l + (canvasRect.width * canvasTransform.a);

            if (zoomLevel.x > 0.6 && zoomLevel.y > 0.6) {
                this.currentScale -= scale;

                canvas.scaleAtPoint(
                    this.currentScale,
                    {
                        x: canvasBox.r - canvasRect.width / 2,
                        y: canvasBox.t - canvasRect.height / 2
                    }
                );

                this._zoomingFinish();
            }

            return this.currentScale;

        }


    };

    //@body
    return Graph;
});