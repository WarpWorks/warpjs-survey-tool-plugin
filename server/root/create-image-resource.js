// const debug = require('debug')('W2:plugin:imagemap-editor:server/root/create-image-resource');
const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const createImageAreaResources = require('./create-image-area-resources');

module.exports = (persistence, entity, instance, docLevel) => Promise.resolve()
    .then(() => warpjsUtils.createResource('', {
        // FIXME: use model to find the right field names.
        type: instance.type,
        id: instance._id,
        altText: instance.AltText,
        caption: instance.Caption,
        width: instance.Width,
        height: instance.Height,
        docLevel
    }))
    .then((resource) => Promise.resolve()
        .then(() => instance.ImageURL) // FIXME: use model to find the right field.
        .then((imageUrl) => {
            if (imageUrl) {
                resource.link('image', instance.ImageURL);
            }
        })

        .then(() => createImageAreaResources(persistence, entity, instance, docLevel))
        .then((resources) => resource.embed('areas', resources))

        .then(() => resource)
    )
;
