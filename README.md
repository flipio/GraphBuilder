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
`grunt serve`.


## API

### Instantiating the canvas

    var canvas = new Graph({
        $parent: $('.graph-placeholder'),
        assetsUrl : '/',
        editMode: true
    });

### Instantiation Options

    {
        $parent: $('.graph-placeholder'),   // required
        assetsUrl : '/',                    // required
        TreeModel: TreeModel,               // optional: it instantiate tree graph
        model: model,                       // optional: it instantiate DAG graph
        editMode: true                      // optional: enable edit mode; Default: false
    }

### TreeModel structure

    {
        "model": NodeModel.get(),
        "children": [
            {
                "model": NodeModel.get(),
                "children": [
                    {
                        "model": NodeModel.get(),
                        "children": [
                            {
                                "model": NodeModel.get()
                            },
                            {
                                "model": NodeModel.get(),
                                "children": [
                                    {
                                        "model": NodeModel.get()
                                    },
                                    {
                                        "model": NodeModel.get(),
                                        "children": [
                                            {
                                                "model": NodeModel.get()
                                            },
                                            {
                                                "model": NodeModel.get()
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "model": NodeModel.get(),
                        "children": [
                            {
                                "model": NodeModel.get(),
                                "children": [
                                    {
                                        "model": NodeModel.get()
                                    },
                                    {
                                        "model": NodeModel.get()
                                    }
                                ]
                            },
                            {
                                "model": NodeModel.get()
                            }
                        ]

                    },
                    {
                        "model": NodeModel.get(),
                        "children": [
                            {
                                "model": NodeModel.get()
                            },
                            {
                                "model": NodeModel.get()
                            }
                        ]
                    }
                ]
            }
        ]
    };
    
    
##### Multiple tree graphs on canvas
Just pass array of TreeGraph models to TreeGraph option like this:
    ```
    [
        TreeGraph
    ]
    ```
    
    
### Graph API
###### See docs for full spec of Public api calls

    
    canvasInstance.zoomIn();                                                        // returns current canvas scale; Canvas zoom in
    canvasInstance.zoomOut();                                                       // returns current canvas scale; Canvas zoom out
    canvasInstance.adjustSize();                                                    // returns null; Adjust canvas dimensions to fit the parent
    canvasInstance.getNodeById(id);                                                 // returns node instance; Get Node instance on canvas
    canvasInstance.removeNode(id);                                                  // returns null; Removes node from canvas
    canvasInstance.addNode(nodeModel, coords, rawCoords, constraints, onCreate);    // returns node id; Add node to the canvas
    canvasInstance.connectNodes(n1, n2, connectionName);                            // returns null; Connect two nodes
    canvasInstance.destroy();                                                       // returns null; Destroys graph and its references
    canvasInstance.getJSON();                                                       // returns graph model    
    canvasInstance.getTreeJSON();                                                   // returns tree graph model    
    

##### Default Node Constraints
    ```
    constraints: {

        radius     : 48,
        borderWidth: 10,
        labelOffset: 15,

        outdated: {
            fill    : '#F5AB35',
            gradient: ''
        },

        deleted: {
            fill    : 'red',
            gradient: ''
        },

        selected: {
            fill: '#FF9800'
        },

        //defaults
        fill    : '#424E4F',
        stroke  : 'none'
    }
    ```

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


####`connection:add` || `connection:create`

Triggered when connection has been added.
arguments:

* `connection` : connection model

example:

    canvasInstance.Event.subscribe('connection:add', function (connection) {


    });


####`connection:remove` || `connection:destroy`

Triggered when connection has been removed.
arguments:

example:

    canvasInstance.Event.subscribe('connection:remove ', function (connection) {


    });
