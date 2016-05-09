/**
 * Created by filip on 11.3.15..
 */
'use strict';

define([
    'lodash'
], function(_) {

    //@body
    var NodeModel = (function() {
        var model = {
            id        : _.random(100000, 999999) + '',
            name      : 'Test node',
            inputs    : [
                {
                    id  : _.random(100000, 999999) + '',
                    name: 'input'
                }
            ],
            outputs   : [
                {
                    id  : _.random(100000, 999999) + '',
                    name: 'output'
                }
            ],
            properties: {}
        };

        return {
            
            get: function(options) {
                var m = _.clone(model, true);


                if (typeof options === 'object') {
                    switch (options.type) {
                        case 'square':
                            m.nodeType = 'square';
                            break;
                        default:
                            m.nodeType = 'circle';
                            break;
                    }
                }

                m.id = _.random(100000, 999999) + '';
                m.inputs[0].id = _.random(100000, 999999) + '';
                m.outputs[0].id = _.random(100000, 999999) + '';
                m.name = m.name + ' ' + m.id;

                return m;
            },

            set: function(setupNode) {
                var n = _.clone(model, true);

                n.id = _.random(100000, 999999) + '';
                n.inputs[0].id = _.random(100000, 999999) + '';
                n.outputs[0].id = _.random(100000, 999999) + '';
                n.name = n.name + ' ' + n.id;

                if (setupNode.name) {
                    n.name = setupNode.name;
                }

                if (setupNode.ubiquitousUnique) {
                    n.ubiquitousUnique = setupNode.ubiquitousUnique;
                }

                if (setupNode.dataCategory) {
                    n.dataCategory = setupNode.dataCategory;
                }
                if (setupNode.inputsName) {
                    n.inputs[0].name = setupNode.inputsName;
                }
                if (setupNode.outputName) {
                    n.outputs[0].name = setupNode.outputName;
                }
                if (setupNode.properties) {
                    n.properties = setupNode.properties;
                }
                if (typeof setupNode.hasParent !== "undefined") {
                    n.parent = setupNode.hasParent;
                }
                if (setupNode.instance) {
                    n.instance = setupNode.instance;
                }
                if (setupNode.propertyType) {
                    n.propertyType = setupNode.propertyType;
                }

                if (typeof setupNode.hasAsaNodeFilter !== "undefined" ) {
                    n.hasAsaNodeFilter = setupNode.hasAsaNodeFilter;
                }
                if (typeof setupNode.hasFilterInstances !== "undefined") {
                    n.hasFilterInstances = setupNode.hasFilterInstances;
                }
                if (typeof setupNode.filterInstances !== "undefined") {
                    n.filterInstances = setupNode.filterInstances;
                }
                if (setupNode.selected) {
                    n.selected = setupNode.selected;
                }
                if (setupNode.nodeType) {
                    n.nodeType = setupNode.nodeType;
                }


                if (!n.childrenList) {
                    n.childrenList = [];
                }
                return n;
            }
        };

    })();

    //@body

    return NodeModel;
});
