
require(['jquery', 'dyole/graph', 'dyole/constants/NodeModel'], function($, Graph, NodeModel){

        var canvas = new Graph({
            $parent: $('.graph-placeholder'),
            editMode: true
        });

    canvas.addNode(NodeModel, 200, 200);
});