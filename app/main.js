require(['jquery', 'dyole/graph', 'dyole/constants/TreeGraphModel', 'dyole/constants/GraphModel', 'dyole/constants/NodeModel', 'lodash'], function ($, Graph, TreeGraphModel, GraphModel, NodeModel, _) {
    var tree = [];
    tree.push(TreeGraphModel.get());

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        assetsUrl : '/',
        editMode: true,
//        model: _.clone(GraphModel, true),
        TreeModel: tree,
        constraints: {
            node: {

                radius     : 46,
                borderWidth: 8,
                labelOffset: 12,

                selected: {
                    fill: '#ffffff'
                },

                //defaults
                fill    : '#011E37',
                stroke  : 'none'
            },
            connection: {
                strokeWidth: 7,
                disableWire: true
            },
            terminal: {
                radius: 9,
                radiusInner: 6
            },
            buttons: {
                radius: 15,
                border: 4
            },
            icons: {
                default: 'preview_assets/images/icon-db.png'
            }
        }
    });

    var constraints = {
        labelOffset: 40,
        radius:60
    };

    var n1, n2, n3, n4, n5, n6 , n7;
//
//    n1 = canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
//    n2 = canvas.addNode(NodeModel.get(), {x: 450, y: 100}, false);
//    n3 = canvas.addNode(NodeModel.get(), {x: 600, y: 200}, false);
//    n4 = canvas.addNode(NodeModel.get(), {x: 800, y: 200}, false);
//    n5 = canvas.addNode(NodeModel.get(), {x: 300, y: 300}, false);
//    n6 = canvas.addNode(NodeModel.get(), {x: 500, y: 300}, false);
//    n7 = canvas.addNode(NodeModel.get(), {x: 700, y: 300}, false);
//
//    canvas.connectNodes(n1, n2, 'labelName');
//    canvas.connectNodes(n2, n3);
//    canvas.connectNodes(n3, n4);
//    canvas.connectNodes(n5, n2);
//    canvas.connectNodes(n6, n3);
//    canvas.connectNodes(n7, n4);

    canvas.Event.subscribe('node:showInfo', function (node) {

        console.log('%cnode:showInfo', 'color:#acacff;background:black;', node);

    });

    canvas.Event.subscribe('node:select', function (node) {

        console.log('%cnode:select', 'color:#acacff;background:black;', node);

    });


    canvas.Event.subscribe('node:deselected', function (node) {

        console.log('%cnode:deselected', 'color:#acacff;background:black;', node);

    });

    $('.get-json').on('click', function () {
        var json = canvas.getTreeJSON();
        
        console.log(json);
    });

});