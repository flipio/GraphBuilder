require(['jquery', 'dyole/graph', 'dyole/constants/NodeModel'], function ($, Graph, NodeModel) {

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        editMode: true
    });

    var constraints = {
        labelOffset: 50
    };

    canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
    canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
    canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);
    canvas.addNode(NodeModel.get(), {x: 200, y: 200}, false, constraints);


    canvas.Event.subscribe('node:showInfo', function (node) {

        console.log('info', node)

    });
    canvas.Event.subscribe('node:select', function (node) {

        console.log('select', node)
    });
});