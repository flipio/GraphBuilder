
require(['jquery', 'dyole/graph'], function($, Graph){
    $(function(){
        console.log('loaded');

        var b = new Graph({
            $parent: $('.graph-placeholder'),
            editMode: true
        });

    });
});