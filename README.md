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
            "option": "OptionQ",
            "attempt": "IPT_Attempt",
            "imageLibrary": "IMGLIB",
            "image": "Image",
            "map": "Map",
            "resultSet": "ResultSet",
            "result": "Result",
            "relevantHigh": "Relevant_If_High",
            "relevantLow": "Relevant_If_Low",
            "content": "Content"
          }
        }
      }]
    }

- `schema` is the bridge between IPT entities in studio and what is sent with HAL to the front end.
- `questionnaire` is for questionnaires
- `category` is for categories
- `question` is for questions and interim detail pages
- `option` is for options for questions
- `attemp` is for attempts on a specific questionnaire
- `imageLibrary` is for the images associated with the questionnaire at the top level
- `image` is for the image associated with a category or quesiton
- `map` is for the image mapping for an image
- `resultSet` is for the result sets for the suggested readings section
- `result` is for the individual result
- `relevantHigh`
- `relevantLow`
- `content`
