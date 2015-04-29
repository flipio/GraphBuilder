# GraphEditor

## Getting Started

Make sure you have the latest packages installed

```
npm install
bower install
```

Note: If you don't have `npm` installed, make sure you have
[node](http://nodejs.com) installed. If you don't have bower,
`npm install -g bower`.

The above steps will download all the required software to
build and run this app, such as [grunt](http://gruntjs.com),
[requirejs](http://requirejs.org), and [jquery](http://jquery.com).

## Running the server

You can run your app using `grunt serve`. This will start a
server on `localhost:8000`.

Alternatively you can use `grunt serve --port xxxx` for custom port



If you'd like to run the compiled version, run
`grunt preview-live`.


## API

### Instantiating the canvas

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        assetsUrl : '/',
        editMode: true
    });

### Events

####`node:select` 

Triggered when you select a node.

arguments:

* `node` : node model
    
example:    
    
    canvasInstance.Event.subscribe('node:select', function (node) {
    
    
    });

####`node:deselected` 

Triggered when you select a node.

arguments:

* `node` : node model
    
example:    
    
    canvasInstance.Event.subscribe('node:deselected', function (node) {
    
    
    });

####`node:showInfo` 

Triggered when you click node show info button.
arguments:

* `node` : node model
    
example:  

    canvasInstance.Event.subscribe('node:showInfo', function (node) {

    });


####`node:deselected` 

Triggered when you deselect node by clicking outside.
arguments:

* `node` : node model
    
example:  

    canvasInstance.Event.subscribe('node:deselected', function (node) {


    });



####`node:drag`

Triggered when you deselect node by clicking outside.
arguments:

* `node` : node model
* `x` : x coord
* `y` : y coord

example:

    canvasInstance.Event.subscribe('node:drag', function (model, x , y) {


    });


####`node:add`

Triggered when you deselect node by clicking outside.
arguments:

* `node` : node model

example:

    canvasInstance.Event.subscribe('node:add', function (model) {


    });


####`node:remove`

Triggered when you deselect node by clicking outside.
arguments:

* `node` : node model

example:

    canvasInstance.Event.subscribe('node:remove', function (model) {


    });


####`pipeline:change`

Triggered when graph has been changed.
arguments:

example:

    canvasInstance.Event.subscribe('pipeline:change', function () {


    });


####`connection:add`

Triggered when graph has been changed.
arguments:

* `connection` : connection model

example:

    canvasInstance.Event.subscribe('connection:add', function (connection) {


    });
