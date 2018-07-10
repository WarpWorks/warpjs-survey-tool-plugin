const ATTR = { style: 'fill:none;stroke-width:1;stroke:orange' };

module.exports = ($, cache, draw) => {
    let currentElem;

    // Register start and finish.
    draw.click((evt) => {
        if (currentElem) {
            // Second click.
            if (evt.offsetX > currentElem.x1 && evt.offsetY > currentElem.y1) {
                currentElem.x2 = evt.offsetX;
            }
            currentElem.y2 = evt.offsetY;
            cache.newAreas.push(currentElem);
            currentElem = null;
        } else {
            // First click.
            const rect = draw.rect(5, 5).move(evt.offsetX, evt.offsetY).attr(ATTR);
            currentElem = {
                x1: evt.offsetX,
                y1: evt.offsetY,
                rect
            };
        }
    });

    // Continuous drawing while moving.
    draw.mousemove((evt) => {
        if (currentElem) {
            currentElem.rect.width(Math.max(5, evt.offsetX - currentElem.x1));
            currentElem.rect.height(Math.max(5, evt.offsetY - currentElem.y1));
        }
    });
};
