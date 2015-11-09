require(['jquery', 'dyole/graph', 'dyole/constants/TreeGraphModel', 'dyole/constants/GraphModel', 'dyole/constants/NodeModel', 'lodash'], function($, Graph, TreeGraphModel, GraphModel, NodeModel, _) {
    var tree = [];
    tree.push(TreeGraphModel.get());

    var canvas = new Graph({
        $parent    : $('.graph-placeholder'),
        assetsUrl  : '/',
        editMode   : true,
        TreeModel: tree,
        constraints: {
            node      : {

                //radius     : 90,
                //borderWidth: 15,
                labelOffset: 12,

                selected: {
                    fill: '#ffffff'
                },

                //defaults
                fill  : '#011E37',
                stroke: 'none'
            },
            connection: {
                strokeWidth: 7,
                disableWire: true
            },
            //terminal  : {
            //  radius     : 9,
            //  radiusInner: 6
            //},
            buttons   : {
                radius: 8,
                border: 2
            },
            icons     : {
                default: 'preview_assets/images/icon-db.png'
            }
        }
    });

//    var constraints = {
//        labelOffset : 40,
//        radius      : 40,
//        width       : 250,
//        borderWidth : 4,
//        borderRadius: 4
//    };
//
//    var n1, n2, n3, n4, n5, n6, n7, squareNode;
//    n1 = canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false);
//    n2 = canvas.addNode(NodeModel.get(), {x: 450, y: 100}, false);
//    n3 = canvas.addNode(NodeModel.get(), {x: 600, y: 200}, false);
//
//    var m = NodeModel.get({type: 'square'});
//
//    m.inputs.push({
//        id  : _.random(100000, 999999) + '',
//        name: 'input'
//    });
//    //m.outputs.push({
//    //    id  : _.random(100000, 999999) + '',
//    //    name: 'output'
//    //});
//    squareNode = canvas.addNode(m, {x: 450, y: 300}, false);
//
////
//////    n4 = canvas.addNode(NodeModel.get(), {x: 800, y: 200}, false);
//////    n5 = canvas.addNode(NodeModel.get(), {x: 300, y: 300}, false);
//////    n6 = canvas.addNode(NodeModel.get(), {x: 500, y: 300}, false);
//////    n7 = canvas.addNode(NodeModel.get(), {x: 700, y: 300}, false);
//////
//    canvas.connectNodes(n1, n2, 'labelName');
////    canvas.connectNodes(n1, squareNode, 'labelName');
////    canvas.connectNodes(n2, n3);
////    canvas.connectNodes(squareNode, n3);
//////    canvas.connectNodes(n3, n4);
//////    canvas.connectNodes(n5, n2);
//////    canvas.connectNodes(n6, n3);
//////    canvas.connectNodes(n7, n4);
//
//    canvas.Event.subscribe('node:showInfo', function(node) {
//
//        console.log('%cnode:showInfo', 'color:#acacff;background:black;', node);
//
//    });
//
//    canvas.Event.subscribe('node:select', function(node) {
//        _.forEach(canvas.connections, function (c) {
//            c.glow({opacity: 0.9, color: 'red', width: 25})
//        });
//
//        console.log('%cnode:select', 'color:#acacff;background:black;', node);
//
//    });
//
//    canvas.Event.subscribe('node:deselected', function(node) {
//        _.forEach(canvas.connections, function (c) {
//            c.removeGlow()
//        });
//        console.log('%cnode:deselected', 'color:#acacff;background:black;', node);
//
//    });
//
    $('.get-json').on('click', function() {
        var json = canvas.getTreeJSON();

        $('#json-area').attr('disabled', false).val(JSON.stringify(json, null, 2));
    });

    $('.align-nodes').on('click', function() {
        canvas.alignGraph({}, {x: 70, y: 50});
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
