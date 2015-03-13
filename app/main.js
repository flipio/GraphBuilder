require(['jquery', 'dyole/graph', 'dyole/constants/NodeModel'], function ($, Graph, NodeModel) {

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        editMode: true
    });

    var constraints = {
        labelOffset: 50,
        radius:70
    };

    var n1, n2;

    n1 = canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
    n2 = canvas.addNode(NodeModel.get(), {x: 400, y: 200}, false);

    console.log(canvas.getNodeById(n1));
    
    canvas.connectNodes(n1, n2);

    canvas.Event.subscribe('node:showInfo', function (node) {

        console.log('info', node)

    });
    canvas.Event.subscribe('node:select', function (node) {

        console.log('select', node)
    });
});