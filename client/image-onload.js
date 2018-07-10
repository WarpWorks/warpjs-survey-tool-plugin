const defaultDimensionWarning = require('./default-dimension-warning.hbs');
const drawMap = require('./draw-map');
const drawNewAreas = require('./draw-new-areas');

module.exports = ($, cache, image, element, e) => {
    $(`${cache.MODAL_SELECTOR} [data-warpjs-placeholder="image"]`).empty();
    const draw = window.SVG('warpjs-imagemap-editor-placeholder');

    // Re-creating the image because I currently don't know a better way...
    const svgImage = draw.image(element.src).move(0, 0);

    // "Stretch" the image
    svgImage.attr('preserveAspectRatio', 'none');

    const naturalWidth = element.width;
    const naturalHeight = element.height;

    const customWidth = parseInt(image.width + '');
    const customHeight = parseInt(image.height + '');

    const hasCustomWidth = customWidth > 0;
    const hasCustomHeight = customHeight > 0;

    let canvasWidth;
    let canvasHeight;
    if (hasCustomWidth && hasCustomHeight) {
        canvasWidth = customWidth;
        canvasHeight = customHeight;
    } else if (hasCustomWidth) {
        canvasWidth = customWidth;
        canvasHeight = customWidth * (naturalHeight / naturalWidth);
    } else if (hasCustomHeight) {
        canvasWidth = customHeight * (naturalWidth / naturalHeight);
        canvasHeight = customHeight;
    } else {
        canvasWidth = naturalWidth;
        canvasHeight = naturalHeight;
        const content = defaultDimensionWarning({naturalWidth, naturalHeight});
        $('[data-warpjs-placeholder="image"]', cache.MODAL_SELECTOR).append($(content));
    }

    canvasWidth = Math.floor(canvasWidth);
    canvasHeight = Math.floor(canvasHeight);

    svgImage.width(canvasWidth);
    svgImage.height(canvasHeight);
    draw.size(canvasWidth, canvasHeight);
    draw.rect(canvasWidth, canvasHeight).move(0, 0).attr({
        style: 'fill:none;stroke-width:1;stroke:gray'
    });

    drawMap($, cache, draw, {w: canvasWidth, h: canvasHeight}, image && image._embedded && image._embedded.areas);
    drawNewAreas($, cache, draw);
};
