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
        treeGraph: true                     // optional: Sets flag if you want to create new tree graph
        constraints: {}                     // optional: Override global constraitns for elements
    }
    
    
    *** NOTE:
        treeGraph: boolean
        - set this flag if you are creating empty treeGraph and you are ensuring that every node that you create via API
          has 'parent' property on model set ( if node has parent ) and 'childrenList' property which is array and it's 
          required ( it represents list of node id's who are direct descendants of that node )
          'parent' : string - represents id of parent
          'childrenList': [{string}]
          
### Element Models
    
##### Node:
    
    var NodeModel = {
        id        : _.random(100000, 999999) + '',
        name      : 'Test node',
        inputs    : [
        // Array of terminal models
            {
               id  : _.random(100000, 999999) + '',
               name: 'input'
            }
        ],
        outputs   : [
        // Array of terminal models
            {
               id  : _.random(100000, 999999) + '',
               name: 'output'
            }
        ],
        // additional properties stored in node instance model
        properties: {}
    };
    
##### Connection:

    var ConnectionModel = {
        id: _.random(100000, 999999) + '', // it has to be a string
        start_node: n1_id,
        end_node: n2_id,
        input_name: n2t.id,
        output_name: n1t.id,
        connection_name: connectionName || false, // optional 
        connection_class_name: connectionClass || false // optional
    };
     

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
    canvasInstance.alignNodes(gap, rootCoords);                                     // returns boolean: Align nodes from rootCoords, only available in treeGraph mode (both params are optional)    
    

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

####`nodes:align`

Triggered when nodes are finished aligning.

example:

    canvasInstance.Event.subscribe('nodes:align', function () {


    });


####`pipeline:change`

Triggered when graph has been changed.
arguments:

example:

    canvasInstance.Event.subscribe('pipeline:change', function () {


    });

####`canvas:drag:start`

Triggered when whole canvas has been moved.
arguments:

example:

    canvasInstance.Event.subscribe('canvas:drag:start', function (startCoords) {


    });

####`canvas:drag:move`

Triggered when whole canvas has been moved.
arguments:

example:

    canvasInstance.Event.subscribe('canvas:drag:move', function (currentCoords) {


    });

####`canvas:drag:end`

Triggered when whole canvas has been moved.
arguments:

example:

    canvasInstance.Event.subscribe('canvas:drag:end', function (endCoords) {


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


### Overriding element(s) constraints

Example:

    var canvas = new Graph({
            $parent: $('.graph-placeholder'),
            assetsUrl : '/',
            editMode: true,
            TreeModel: tree,
            constraints: {
                node: {
    
                    radius     : 46,
                    borderWidth: 8,
                    labelOffset: 12,
    
                    selected: {
                        fill: '#ffffff'
                    },
    
                    //defaults
                    fill    : '#011E37',
                    stroke  : 'none'
                },
                connection: {
                    strokeWidth: 7
                },
                terminal: {
                    radius: 9,
                    radiusInner: 6
                },
                buttons: {
                    radius: 15
                },
                icons: {
                    default: 'preview_assets/images/icon-db.png'
                }
            }
        });

Overriding elements add element name as key in constraints object passed in configuration and override propreties. 

##### Default constraints for every element

    // Node
    {
    
        radius     : 38,
        borderWidth: 7,
        labelOffset: 12,

        selected: {
            fill: '#C6D4E2'
        },

        //defaults
        fill    : '#011E37',
        stroke  : 'none'
    }
    
    // Terminal
    {
        radius: 8,
        radiusInner: 4.4,
    
        available: {
            gradiant: '',
            fill: '#3eb157',
            stroke: ''
        },
    
        connected: {
            gradiant: '',
            fill: '#1E8BC3',
            stroke: ''
        },
    
        // defaults
        gradiant: '',
        fill: '#888888',
        stroke: ''
    }
    
    // Connection
    {
        strokeWidth: 7,
        strokeColor: '#FBFCFC',
        labelColor : '#8989FF',
        disableWire: false,
        
        images: {
            wirePath: 'preview_assets/images/wire-cut.png'
        }
    }
    
    // Buttons
    {
        radius: 12,
        border: 3,
    
        distance: -nodeRadius * 1.5,
    
        info: {
            fill    : '#3FC380',
            disabled: '#ccc',
            // must supply whole image object if you want to override it
            image: {
                name  : 'preview_assets/images/icon-info.png',
                width : 6,
                height: 11
            }
    
        },
    
        delete: {
            fill: '#EF4836',
            // must supply whole image object if you want to override it
            image: {
                name  : 'preview_assets/images/icon-delete.png',
                width : 10,
                height: 10
            }
    
        },
    
        rename: {
            fill: 'transparent',
            // must supply whole image object if you want to override it
            image: {
                name  : 'preview_assets/images/icon-pencil.png',
                width : 12,
                height: 12
            }
        }
    }
    // Icons
    {
        input  : 'preview_assets/images/icon-input-2.png',
        output : 'preview_assets/images/icon-output-2.png',
        default: 'preview_assets/images/cloud.png'
    }