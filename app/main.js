
require(['dyole/graph'], function(Graph){
    console.log('loaded');

    var b = new Graph({
        $parent: $('.graph-placeholder'),
        editMode: true
    });

});