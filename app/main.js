
require(['jquery', 'dyole/graph', 'dyole/constants/NodeModel'], function($, Graph, NodeModel){

        var canvas = new Graph({
            $parent: $('.graph-placeholder'),
            editMode: true
        });

    canvas.addNode(NodeModel.get(), 200, 200);
    canvas.addNode(NodeModel.get(), 200, 200);
    canvas.addNode(NodeModel.get(), 200, 200);


    canvas.Event.subscribe('node:showInfo', function(node) {

        console.log('info',node)

    });
    canvas.Event.subscribe('node:select', function(node) {

        console.log('select',node)
    });
});