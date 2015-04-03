/**
 * Created by filip on 11.3.15..
 */
define([
        'dyole/constants/NodeModel'
    ],
function (NodeModel) {
    //@body
    var TreeGraphModel = {
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
                                "model": NodeModel.get()
//                                ,
//                                "children": [
//                                    {
//                                        "model": NodeModel.get()
//                                    },
//                                    {
//                                        "model": NodeModel.get(),
//                                        "children": [
//                                            {
//                                                "model": NodeModel.get()
//                                            },
//                                            {
//                                                "model": NodeModel.get()
//                                            }
//                                        ]
//                                    }
//                                ]
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

                    },
                    {
                        "model": NodeModel.get()
                    }
                ]
            }
        ]
    };
    //@body
    return TreeGraphModel;
});