/**
 * Created by filip on 3.6.15..
 */
'use strict';
define(['lodash'], function (_) {

//@body

var Common = {
    objectPropExists: function (prop) {
        return typeof prop !== 'undefined';
    },

    checkObjectKeys: function (obj) {
        return this.objectPropExists(obj) && _.size(obj) > 0;
    },

    getPropType: function (prop) {
        var type = typeof prop,
            result;

        result = type;

        if (type === 'object') {
            if (_.isArray(prop)) {
                result = 'array';
            }
        }

        return result;
    },

    setConstraints: function (instance, constraints) {
        var _self = instance;

        _.forEach(constraints, function(constraint, prop) {

            if (Common.objectPropExists(constraint)) {
                if (Common.getPropType(constraint) == 'object') {
                    _.forEach(constraint, function(value, key) {
                        _self.constraints[prop][key] = value;
                    });
                } else {
                    _self.constraints[prop] = constraint;
                }
            }

        });
    }
};

//@body
return Common;

});