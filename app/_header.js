(function(global, factory) {
    if (typeof define === 'function' && typeof define.amd !== 'undefined') {
        // AMD. Register as an anonymous module.
        console.log('Registering dyole/Graph to requrejs module.');
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS. Define export.
        console.log('Registering dyole/Graph to commonjs module.');
        module.exports = factory();
    } else {
        // Browser globals
        console.log('Registering dyole/Graph to Globals', global);
        global.Graph = factory();
    }
}(this, function() {
