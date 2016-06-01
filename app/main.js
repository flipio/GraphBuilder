require([

    'jquery',
    'dyole/graph',
    'dyole/constants/TreeGraphModel',
    'dyole/constants/GraphModel',
    'dyole/constants/NodeModel',
    'dyole/constants/PathTypes',
    'lodash'

], function($, Graph, TreeGraphModel, GraphModel, NodeModel, PathTypes, _) {
    var tree = [], canvas = {};
    tree.push(TreeGraphModel.get());

    var init = function (json) {
        canvas = new Graph({
            $parent    : $('.graph-placeholder'),
            assetsUrl  : '/',
            editMode   : true,
            // TreeModel: tree,
            model: json || false,
            constraints: {
                node      : {

                    icon: false,
                    // showTerminalNames: false,
                    //radius     : 90,
                    borderWidth: 0,
                    borderRadius: 2,
                    width: 140,
                    height: 40,
                    labelOffset: function (label) {
                        label.attr({
                            x: -50,
                            y: 100
                        });
                    },


                    selected: {
                        fill: '#ffffff'
                    },

                    //defaults
                    fill  : '#011E37',
                    // fill  : '#ffffff',
                    stroke: 'none'
                },

                terminal: {
                    radius: 0,
                    radiusInner: 0
                },

                connection: {
                    strokeWidth: 3,
                    disableWire: true,
                    pathType: PathTypes.BEIZER
                },
                //terminal  : {
                //  radius     : 9,
                //  radiusInner: 6
                //},
                buttons   : {
                    //radius: 8,
                    border: 0,
                    fillOpacity: 0.1,

                    stroke  : 'none',
                    strokeWidth: 0,

                    delete: {
                        fill: "#dddddd",

                        position: function (el) {

                        }
                    },

                    info: {
                        fill: "#ffffff",

                        position: function (el) {
                            console.log(el);
                        }
                    }

                },

                icons     : {
                    default: 'preview_assets/images/icon-db.png'
                }
            }
        });

    };

    init();

//    var constraints = {
//        labelOffset : 40,
//        radius      : 40,
//        width       : 250,
//        borderWidth : 4,
//        borderRadius: 4
//    };
//
    var n1, n2, n3, n4, n5, n6, n7, squareNode;
    n1 = canvas.addNode(NodeModel.get({type: 'circle'}), {x: 200, y: 200}, false);
    n1 = canvas.getNodeById(n1);
    n1.translate({x: 100, y: 100});
    canvas.translate({x: 0, y: 0});
//     n2 = canvas.addNode(NodeModel.get({type: 'square'}), {x: 450, y: 100}, false);
//     //n3 = canvas.addNode(NodeModel.get(), {x: 600, y: 200}, false);
//
//     var m = NodeModel.get({type: 'square'});
//
//     //m.inputs.push({
//     //    id  : _.random(100000, 999999) + '',
//     //    name: ''
//     //});
//     //m.outputs.push({
//     //    id  : _.random(100000, 999999) + '',
//     //    name: 'output'
//     //});
//     //squareNode = canvas.addNode(m, {x: 450, y: 300}, false);
//
// //
//    n4 = canvas.addNode(NodeModel.get({type: 'square'}), {x: 800, y: 200}, false);
//    n5 = canvas.addNode(NodeModel.get({type: 'square'}), {x: 300, y: 300}, false);
//    n6 = canvas.addNode(NodeModel.get(), {x: 500, y: 300}, false);
//    n7 = canvas.addNode(NodeModel.get(), {x: 700, y: 300}, false);
//
//     canvas.connectNodes(n1, n2, 'labelName');
//    canvas.connectNodes(n1, squareNode, 'labelName');
//    canvas.connectNodes(n2, n3);
//    canvas.connectNodes(squareNode, n3);
//    canvas.connectNodes(n4, n5, 'testiram');
////    canvas.connectNodes(n5, n2);
////    canvas.connectNodes(n6, n3);
////    canvas.connectNodes(n7, n4);

    canvas.Event.subscribe('node:showInfo', function(node) {

        console.log('%cnode:showInfo', 'color:#acacff;background:black;', node);

    });

    canvas.Event.subscribe('node:select', function(node) {
        console.log('%cnode:select', 'color:#acacff;background:black;', node);
    });

    canvas.Event.subscribe('node:deselected', function(node) {
        console.log('%cnode:deselected', 'color:#acacff;background:black;', node);
    });

    $('.get-json').on('click', function() {
        var json = canvas.getJSON();

        $('#json-area').attr('disabled', false).val(JSON.stringify(json, null, 2));
    });

    $('.import-json').on('click', function () {
        canvas.destroy();
        canvas = null;

        try {
            var model = JSON.parse($('#json-area').val() || '{}')
        } catch (e) {
            console.error('Cannot parse provded json.');

        }

        init(model);
    });

    $('.align-nodes').on('click', function() {
        canvas.alignGraph({}, {x: 200, y: 200});
    });


//	canvas.destroy();
//	canvas = null;
//
//	canvas = new Graph({
//		$parent    : $('.graph-placeholder'),
//		assetsUrl  : '/',
//		editMode   : true,
//		model      : _.clone(GraphModel, true)
//	});
//
//	n2 = canvas.addNode(NodeModel.get(), {x: 450, y: 100}, false);

});
