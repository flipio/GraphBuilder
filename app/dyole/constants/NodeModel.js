/**
 * Created by filip on 11.3.15..
 */
'use strict';

define([
        'lodash'
    ],
    function (_) {
        return {
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
    });