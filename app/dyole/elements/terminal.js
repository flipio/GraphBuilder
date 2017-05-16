/**
 * Created by filip on 11.3.15..
 */

import $ from 'jquery';
import _ from 'lodash';
import {Common} from './../helpers/common';
import {PathTypes} from './../constants/PathTypes';

var CONSTRAINTS = {
    radius: 8,
    radiusInner: 4.4,

    available: {
        gradiant: '',
        fill: '#3eb157',
        stroke: ''
    },

    connected: {
        gradiant: '',
        fill: '#1E8BC3',
        stroke: ''
    },

    // defaults
    gradiant: '',
    fill: '#888888',
    stroke: ''
};

var CONNECTION_CONSTRAINTS = {
    width: 7,
    color: '#dddddd',
    pathType: PathTypes.BEIZER
};

var Terminal = function (options) {

    this.options = options;

    this.parent = options.parent;
    this.model = options.model;
    this.canvas = options.canvas;
    this.mouseover = false;
    this.terminalConnected = false;
    this.Pipeline = options.pipeline;

    this.pipelineWrap = options.pipelineWrap;
    this.id = this.model.id;

    this.el = null;

    this.terminals = {};

    this.connections = [];

    this.constraints = _.clone(CONSTRAINTS, true);
    this.connectionConfig = _.clone(CONNECTION_CONSTRAINTS, true);

    if (!!options.constraints && !!options.constraints.connectionConstraints) {
        _.extend(this.connectionConfig, options.constraints.connectionConstraints);
    }

    if (Common.checkObjectKeys(this.Pipeline.constraints.terminal)) {
        Common.setConstraints(this.constraints, this.Pipeline.constraints.terminal);
    }

    if (Common.checkObjectKeys(this.Pipeline.constraints.connection)) {
        if (Common.objectPropExists(this.Pipeline.constraints.connection.strokeWidth)) {
            this.connectionConfig.width = this.Pipeline.constraints.connection.strokeWidth;
        }
    }

    Common.setConstraints(this.constraints, options.constraints || {});

    // Arc near problem for vis-path fix
    if (this.connectionConfig.pathType === PathTypes.BROKEN_CURVED_LINE) {
        this.model.x += this.model.x < 0 ? 5 : -5;
    }

};

Terminal.prototype = {

    initHandlers: function () {
        var _self = this;

        this.mousedown = false;

        if (this.Pipeline.editMode && !this.Pipeline.disableConnectionCreation) {

            this.terminal.mousedown(function (e) {
                var translation;

                translation = _self._getElTranslation();

                _self.startCoords = translation;

                _self.mousedown = true;

                _self.Pipeline.Event.trigger('terminal:selectAvailable', _self.model, _self.parent.model.id);

                e.preventDefault();
                e.stopPropagation();
            });

        }

        this.terminal.mouseup(function () {
            _self.Pipeline.Event.trigger('terminal:deselectAvailable');

            _self._removeTempConnection(_self.onMouseUpCallback);

            _self.mousedown = false;
        });

        var terMouseOver = function (terminal) {

            if (_self.mousedown && _self.tempConnection) {
                _self.mouseoverTerminal = terminal;
                _self.Pipeline.mouseoverTerminal = terminal;
            }

        }, terMouseOut = function () {

            _self.mouseoverTerminal = null;
            _self.Pipeline.mouseoverTerminal = null;

        }, terSelectAvail = function (terminal, nodeId) {

            _self.checkAvailibility(terminal, nodeId);

        }, terDeselectAvail = function () {

            _self.setDefaultState();

        };

        var events = [];

        this.Pipeline.Event.subscribe('terminal:mouseover', terMouseOver);

        events.push({
            event: 'terminal:mouseover',
            handler: terMouseOver
        });

        this.Pipeline.Event.subscribe('terminal:mouseout', terMouseOut);

        events.push({
            event: 'terminal:mouseout',
            handler: terMouseOut
        });

        this.Pipeline.Event.subscribe('terminal:selectAvailable', terSelectAvail);

        events.push({
            event: 'terminal:selectAvailable',
            handler: terSelectAvail
        });

        this.Pipeline.Event.subscribe('terminal:deselectAvailable', terDeselectAvail);

        events.push({
            event: 'terminal:deselectAvailable',
            handler: terDeselectAvail
        });

        this.events = events;

    },

    onMouseUpCallback: function () {
        var _self = this,
            available;

        if (_self.mouseoverTerminal) {
            available = this.checkAvailibility(this.mouseoverTerminal.model, this.mouseoverTerminal.parent.model.id);

            if (available.status) {
                _self.Pipeline.Event.trigger('connection:create', _self.mouseoverTerminal, _self);

                _self.mouseoverTerminal = null;
            } else {
                console.error('Node cannot connect');
            }

        }

    },

    checkAvailibility: function (terminal, nodeId) {
        var available = false;

        var start_node = this.parent.model,
            end_node = this.Pipeline.nodes[nodeId].model,
            output_name = this.model.id,
            input_name = terminal.id;

        if (terminal.input !== this.model.input && nodeId !== this.parent.model.id) {

//                    console.log('Input name: %s, Output name: %s, start_node: %s, end_node: %s', input_name, output_name, start_node.name, end_node.name);
            var check = _.filter(this.Pipeline.connections, function (connection) {
                var rel = connection.model;

                var check = rel.start_node === start_node.id && rel.end_node === end_node.id, portCheck = rel.input_name === input_name && rel.output_name === output_name, reverseCheck, reversePortCheck;

                reverseCheck = rel.start_node === end_node.id && rel.end_node === start_node.id;
                reversePortCheck = rel.input_name === output_name && rel.output_name === input_name;

                return (check && portCheck) || ( reverseCheck && reversePortCheck);
            });

            if (check.length === 0) {

                this.showAvailableState();

                available = true;

            }

        }

        return {
            status: available
        };
    },

    render: function () {

        var _self = this,
            model = this.model,
            canvas = this.canvas,
            el, terminalBorder, terminalInner, label, borders,
            required = this.model.required ? '(required)' : '';

        el = canvas.group();

        terminalBorder = canvas.circle(0, 0, this.constraints.radius);
        terminalBorder.attr({
            fill: this.model.required ? '#f4d794' : '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
//                stroke: '#cccccc'
            stroke: this.model.required ? '#cbac6f' : '#cccccc'
        });

        terminalInner = canvas.circle(0, 0, this.constraints.radiusInner);
        terminalInner.attr({
            fill: this.constraints.fill,
            stroke: this.constraints.stroke
        });

        if (typeof model.name === 'string' && model.name !== '') {

            label = this._createLabel(model);

        }

        borders = canvas.group();

        borders.push(terminalBorder).push(terminalInner);

        borders.hover(function () {
            _self.mouseover = true;

            if (!_self.Pipeline.tempConnectionActive) {
                _self.showTerminalName();
            }

            _self.Pipeline.Event.trigger('terminal:mouseover', _self);
        }, function () {
            _self.mouseover = false;
            _self.hideTerminalName();
            _self.Pipeline.Event.trigger('terminal:mouseout');
        });

        el.push(borders);

        if (label) {
            el.push(label);
        }

        el.translate(model.x, model.y);

        this.el = el;
        this.terminal = borders;
        this.terminalInner = terminalInner;
        this.terminalBorder = terminalBorder;

        this.initHandlers();

        return this;
    },

    _createLabel: function (model) {

        var labelXOffset,
            xOffset = 12,
            label = this.canvas.text(0, 0, model.name);

        label.attr({
            'font-size': '12px'
        });

        if (model.input) {
            labelXOffset = -1 * (label.getBBox().width / 2) - xOffset;
        } else { // output
            labelXOffset = (label.getBBox().width / 2) + xOffset;
        }

        label.translate(labelXOffset, 0);

        label.attr('fill', 'none');

        this.label = label;

        return label;
    },

    showTerminalName: function () {

        if (this.label) {
            this.label.attr('fill', '#666');
        }

        return this;
    },

    hideTerminalName: function () {

        if (!this.mouseover && this.label) {
            this.label.attr('fill', 'none');
        }

    },

    setConnectedState: function () {
        this.terminalConnected = true;
        this.terminalInner.attr({
            gradient: this.constraints.connected.gradiant,
            fill: this.constraints.connected.fill,
            stroke: this.constraints.connected.stroke
        });

        if (this.model.required) {
            this.terminalBorder.attr({
                fill: '90-#F4F4F4-#F4F4F4:50-#F4F4F4:50-#F4F4F4',
                stroke: '#cccccc'
            });
        }

    },

    showAvailableState: function () {
        this.terminalInner.attr({
            gradient: 'none',
            fill: this.constraints.available.fill,
            stroke: this.constraints.available.stroke
        });
    },

    setDefaultState: function () {

        this.terminalInner.attr({
            gradient: this.constraints.gradient,
            fill: this.constraints.fill,
            stroke: this.constraints.stroke
        });

        if (this.model.required) {
            this.terminalBorder.attr({
                fill: '#f4d794',
//                stroke: '#cccccc'
                stroke: '#cbac6f'
            });
        }

        if (this.terminalConnected) {
            this.setConnectedState();
        } else {
            this.terminalConnected = false;
        }

    },

    addConnection: function (connectionId) {
        this.connections.push(connectionId);
    },

    _getElTranslation: function () {
        var scale, translation, parent, pipeline;

        scale = this.Pipeline.getEl().getScale();
        parent = this.parent.el.getTranslation();
        pipeline = this.Pipeline.pipelineWrap.getTranslation();
        translation = this.el.getTranslation();

        translation.x += parent.x;
        translation.y += parent.y;

        translation.x += pipeline.x / scale.x;
        translation.y += pipeline.y / scale.y;

        translation.x = translation.x * scale.x;
        translation.y = translation.y * scale.y;

        return translation;
    },

    _getConnectionCoordsDiff: function (e) {
        var diff = {},
            ctm = this.terminal.node.getScreenCTM(),
            translation;

        translation = this._getElTranslation();

        diff.x = e.clientX - ( ctm.e - translation.x);
        diff.y = e.clientY - ( ctm.f - translation.y);

        return diff;
    },

    drawConnection: function (e) {

        var attr, coords,
            diff = this._getConnectionCoordsDiff(e),
            scale = this.pipelineWrap.getScale().x;

        coords = {
            x1: this.startCoords.x,
            y1: this.startCoords.y,
            x2: diff.x,
            y2: diff.y
        };

        attr = {
            stroke: '#FBFCFC',
            'stroke-width': this.connectionConfig.width * scale
        };

        this.tempConnection = this.canvas.curve(coords, attr, this.connectionConfig.pathType);
        this.tempConnection.toBack();

        this.Pipeline.Event.trigger('temp:connection:state', true);

    },

    redrawConnection: function (e) {
        var coords,
            scale = this.pipelineWrap.getScale().x,
            diff = this._getConnectionCoordsDiff(e);

        coords = {
            x1: this.startCoords.x,
            y1: this.startCoords.y,
            x2: diff.x,
            y2: diff.y
        };

        this.tempConnection.redraw(coords, this.connectionConfig.width * scale);
    },

    removeConnection: function (connectionId) {
        var index;

        _.each(this.connections, function (id, ind) {
            if (id === connectionId) {
                index = ind;
            }
        });

        delete this.terminals[this.connections[index]];

        this.connections.splice(index, 1);

        return this.connections.length !== 0;
    },

    _removeTempConnection: function (callback) {

        if (this.tempConnection) {

            this.tempConnection.remove();
            this.tempConnection = null;

            if (callback && typeof callback === 'function') {
                callback();
            }

            this.Pipeline.Event.trigger('temp:connection:state', false);
        }

    },

    changeTerminalName: function (name) {
        this.model.name = name;

        if (this.label) {
            this.label.attr('text', this.model.name);
        } else {
            this._createLabel(this.model);
        }
    },

    destroy: function () {
        var _self = this;

        _.each(this.events, function (ev) {
            _self.Pipeline.Event.unsubscribe(ev.event, ev.handler);
        });

        this.terminal.unbindMouse().unhover().unclick().unkeyup();

        this.el.remove();
        this.el = null;
        this.terminal = null;
        this.label = null;
        this.terminalInner = null;
        this.terminalBorder = null;
    }

};

export { Terminal };