const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../../lib/constants');

module.exports = (persistence, entity, instance, docLevel) => Promise.resolve()
    .then(() => entity.getRelationshipByName(constants.schema.relationship.for.imagearea))
    .then((relationship) => relationship.getDocuments(persistence, instance))
    .then((imageareas) => imageareas.map((imageArea) => warpjsUtils.createResource('', {
        type: imageArea.type,
        id: imageArea._id,
        coords: imageArea.Coords,
        isRect: (imageArea.Shape === "Rect") && ((imageArea.Coords || "").split(',').length === 4),
        href: imageArea.HRef,
        shape: imageArea.Shape,
        title: imageArea.Title,
        docLevel: [docLevel, `Relationship:${constants.schema.relationship.for.imagearea}`, `Entity:${imageArea._id}`].join('.')
    })))
;
