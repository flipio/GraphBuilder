/**
 * Created by filip on 11.3.15..
 */
'use strict';

define([
        'lodash'
    ],
    function (_) {

        var model = {
                    id: _.random(100000, 999999) + '',
                    name: 'Test node',
                    inputs: [{
                        id: _.random(100000, 999999) + '',
                        name: 'input'
                    }],
                    outputs: [{
                        id: _.random(100000, 999999) + '',
                        name: 'output'
                    }],
                    properties: {}
                };

        return {
            get : function() {
                var m = _.clone(model, true);

                m.id =  _.random(100000, 999999) + '';
                m.inputs[0].id =  _.random(100000, 999999) + '';
                m.outputs[0].id =  _.random(100000, 999999) + '';
                m.name = m.name + ' ' + m.id;

                return m;
            }
        };
    });