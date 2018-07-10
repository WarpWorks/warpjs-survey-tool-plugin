# Warpjs ImageMap Editor Plugin

This plugin allows to use the mouse to add Rect shape image areas to the image.

## Configuration

Add the following to `.warp-works-warpjsrc` of your project:

    {
      plugins: [{
        "name": "imagemap-editor",
        "moduleName": "@warp-works/warpjs-imagemap-editor-plugin",
        "path": "/imagemap-editor",
        "type": "action",
        "config": {
          "glyphicon": "picture",
          "label": "Edit ImageMap"
        }
      }]
    }

To be able to use it, the schema must have the following in the view:

    actions: [{
      name: "EditImageMap",
      desc: "Action to launch ImageMap editor",
      type: "Action",
      id: <some-id>,
      pluginName: "imagemap-editor"
    }]

The schema's `pluginName` must match the RC file's `plugin.name`.
