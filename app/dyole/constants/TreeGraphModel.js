/**
 * Created by filip on 11.3.15..
 */

import _ from 'lodash'
import {NodeModel} from './NodeModel'

var TreeGraphModel = (function() {

    var tree = {
        "model"   : NodeModel.get(),
        "children": [
            {
                "model"   : NodeModel.get(),
                "children": [
                    {
                        "model"   : NodeModel.get(),
                        "children": [
                            {
                                "model": NodeModel.get()
                            },
                            {
                                "model"   : NodeModel.get(),
                                "children": [
                                    {
                                        "model": NodeModel.get()
                                    },
                                    {
                                        "model"   : NodeModel.get(),
                                        "children": [
                                            {
                                                "model": NodeModel.get()
                                            },
                                            {
                                                "model": NodeModel.get()
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "model"   : NodeModel.get(),
                        "children": [
                            {
                                "model"   : NodeModel.get(),
                                "children": [
                                    {
                                        "model": NodeModel.get()
                                    },
                                    {
                                        "model": NodeModel.get()
                                    }
                                ]
                            },
                            {
                                "model": NodeModel.get()
                            }
                        ]

                    },
                    {
                        "model"   : NodeModel.get(),
                        "children": [
                            {
                                "model": NodeModel.get()
                            },
                            {
                                "model": NodeModel.get()
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return {
        get: function() {
            var model = _.clone(tree, true),
                temp = [model];

            var _do = function(arr) {
                _.forEach(arr, function(node) {

                    node.model = NodeModel.set({});

                    if (typeof node.children !== 'undefined' && _.isArray(node.children) && node.children.length > 0) {
                        _do(node.children);
                    }

                });
            };

            _do(temp);

            return model;
        }
    }
})();

export { TreeGraphModel }