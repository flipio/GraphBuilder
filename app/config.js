require.config({
    // make components more sensible
    // expose jquery
    paths: {
        'components': '../bower_components',
        'jquery': '../bower_components/jquery/dist/jquery',
        'lodash': '../bower_components/lodash/lodash',
        'raphael': '../vendor/raphael/raphael',
        'raphael-curve': '../vendor/raphael/raphael.curve',
        'raphael-button': '../vendor/raphael/raphael.button',
        'raphael-group': '../vendor/raphael/raphael.group'
    },
    shim: {
        lodash: {
            exports: '_'
        },
        'raphael-curve' : ['raphael'],
        'raphael-button': ['raphael'],
        'raphael-group': [ 'raphael-curve', 'raphael-button' ]
    }
});





