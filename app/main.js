require(['jquery', 'dyole/graph', 'dyole/constants/NodeModel'], function ($, Graph, NodeModel) {

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        editMode: true
    });

    var constraints = {
        labelOffset: 50,
        radius:70
    };

    var n1, n2, n3, n4, n5, n6 , n7;

    n1 = canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
    n2 = canvas.addNode(NodeModel.get(), {x: 400, y: 200}, false);
    n3 = canvas.addNode(NodeModel.get(), {x: 600, y: 200}, false);
    n4 = canvas.addNode(NodeModel.get(), {x: 800, y: 200}, false);
    n5 = canvas.addNode(NodeModel.get(), {x: 300, y: 300}, false);
    n6 = canvas.addNode(NodeModel.get(), {x: 500, y: 300}, false);
    n7 = canvas.addNode(NodeModel.get(), {x: 700, y: 300}, false);

    canvas.connectNodes(n1, n2);
    canvas.connectNodes(n2, n3);
    canvas.connectNodes(n3, n4);
    canvas.connectNodes(n5, n2);
    canvas.connectNodes(n6, n3);
    canvas.connectNodes(n7, n4);

    canvas.Event.subscribe('node:showInfo', function (node) {

        console.log('info', node)

    });
    canvas.Event.subscribe('node:select', function (node) {

        console.log('select', node)
    });
});