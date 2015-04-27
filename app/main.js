require(['jquery', 'dyole/graph', 'dyole/constants/TreeGraphModel', 'lodash'], function ($, Graph, TreeGraphModel, _) {
    var tree = [];
    tree.push(TreeGraphModel.get());
    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        assetsUrl : '/',
        editMode: true,
        TreeModel: tree
    });

    var constraints = {
        labelOffset: 40,
        radius:60
    };

//    var n1, n2, n3, n4, n5, n6 , n7;
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
        console.log(canvas.getTreeJSON());

    });


    canvas.Event.subscribe('node:deselected', function (node) {

        console.log('%cnode:deselected', 'color:#acacff;background:black;', node);

    });

    var temp = canvas.getJSON();

    // reinit to test new model thats fetched
    canvas.destroy();

    var canvasNew = new Graph({
        $parent: $('.graph-placeholder'),
        assetsUrl : '/',
        editMode: true,
        model: temp
    });

    console.log(canvasNew.getTreeJSON());

});