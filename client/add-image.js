const errorTemplate = require('./error.hbs');
const imageOnload = require('./image-onload');

module.exports = ($, cache, image) => {
    if (image && image._links && image._links.image) {
        const img = new Image();
        img.onload = function(e) {
            imageOnload($, cache, image, this, e);
        };
        img.onerror = function(e) {
            const content = errorTemplate({message: `Could not load image: ${image._links.image.href}`});
            $('[data-warpjs-placeholder="image"]', cache.MODAL_SELECTOR).html(content);
        };
        img.src = image._links.image.href;
    }
};
