const areasErrorsTemplate = require('./areas-errors.hbs');

const AREA_STYLE = { style: 'fill:none;stroke-width:1;stroke:blue' };

module.exports = ($, cache, draw, size, areas) => {
    const errors = [];

    if (areas) {
        areas.forEach((area) => {
            const areaError = {
                coords: area.coords,
                shape: area.shape,
                title: area.title,
                errors: []
            };

            if (area.isRect) {
                const coordsArray = area.coords.split(',');

                const x1 = parseInt(coordsArray[0], 10);
                const y1 = parseInt(coordsArray[1], 10);
                const x2 = parseInt(coordsArray[2], 10);
                const y2 = parseInt(coordsArray[3], 10);

                if ((x1 < 0) || (x1 > size.w)) {
                    areaError.errors.push(`${area.coords}: x1=${x1} outside of image boundaries`);
                } else if ((x2 < 0) || (x2 > size.w)) {
                    areaError.errors.push(`${area.coords}: x2=${x2} outside of image boundaries`);
                } else if ((y1 < 0) || (y1 > size.h)) {
                    areaError.errors.push(`${area.coords}: y1=${y1} outside of image boundaries`);
                } else if ((y2 < 0) || (y2 > size.h)) {
                    areaError.errors.push(`${area.coords}: y2=${y2} outside of image boundaries`);
                } else if (x1 > x2) {
                    areaError.errors.push(`${area.coords}: x1=${x1} is greater than x2=${x2}.`);
                } else if (y1 > y2) {
                    areaError.errors.push(`${area.coords}: y1=${y1} is greater than y2=${y2}.`);
                } else {
                    draw.rect((x2 - x1), (y2 - y1))
                        .move(x1, y1)
                        .attr(AREA_STYLE)
                    ;
                }
            } else {
                areaError.errors.push(`${area.coords || 'NO COORDS'}: Is not a Rect`);
            }

            if (areaError.errors.length) {
                errors.push(areaError);
            }
        });
    }

    if (errors.length) {
        const content = areasErrorsTemplate({errors});
        $('[data-warpjs-placeholder="image"]', cache.MODAL_SELECTOR).append($(content));
    }
};
