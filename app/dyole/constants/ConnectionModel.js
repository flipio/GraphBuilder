/**
 * Created by filip on 11.3.15..
 */
define(function() {
    //@body
    var ConnectionModel = {
        id             : _.random(100000, 999999) + '', // it has to be a string
        start_node     : '',
        end_node       : '',
        input_name     : '',
        output_name    : '',
        connection_name: ''
    };
    //@body
    return ConnectionModel;
});
