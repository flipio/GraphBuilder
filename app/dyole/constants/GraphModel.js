/**
 * Created by filip on 11.3.15..
 */
define(function () {
    //@body
    var GraphModel = {
        display: {
            canvas: {
                x: 50,
                y: 50,
                zoom: 1
            },
            nodes: {}
        },
        nodes: [],
        schemas: {},
        relations: []
    };
    //@body
    return GraphModel;
});