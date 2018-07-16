# Warpjs IPT Plugin

This plugin sets up the IPT questionnaire.

## Configuration

Add the following to `.warp-works-warpjsrc` of your project:

    {
      plugins: [{
        "name": "ipt",
        "moduleName": "@warp-works/warpjs-ipt-plugin",
        "path": "/ipt",
        "type": "action",
        "config": {
          "glyphicon": "plane",
          "label": "IPT Survey",
          "schema": {
            "questionnaire": "IPT",
            "category": "CategoryQ",
            "question": "DimensionQ",
            "option": "OptionQ"
          }
        }
      }]
    }
