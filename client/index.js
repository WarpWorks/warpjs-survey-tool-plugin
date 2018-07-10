const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const constants = require('./../lib/constants');
const createAreasOnServer = require('./create-areas-on-server');
const template = require('./template.hbs');
const updateContent = require('./update-content');

(($) => $(document).ready(() => {
    $(document).on('click', `[data-warpjs-plugin-identifier="${constants.basename}"]`, function(e) {
        const url = $(this).data('warpjsPluginRootUrl');

        const cache = {
            MODAL_SELECTOR: `[data-warpjs-modal="${constants.modalName}"]`,
            newAreas: [],
            button: null,
            docLevel: $(this).data('warpjsDocLevel'),
            url: $(this).data('warpjsPluginRootUrl')
        };

        return Promise.resolve()
            .then(() => $(cache.MODAL_SELECTOR))
            .then((modal) => {
                if (!modal.length) {
                    $(document.body).append($(template({ modalName: constants.modalName })));
                }
            })

            // Add modal event
            .then(() => $(`[data-warpjs-modal="${constants.modalName}"]`)
                .one('hide.bs.modal', function(e) {
                    cache.button = $(document.activeElement);
                })
                .one('hidden.bs.modal', function(e) {
                    const button = cache.button;

                    // If there are new areas and the save button was clicked.
                    if (cache.newAreas.length && button && button.data && (button.data('warpjsAction') === 'save')) {
                        // TODO: Save was clicked. Need to save to server.
                        return Promise.resolve()
                            .then(() => createAreasOnServer($, cache.url, cache.docLevel, cache.newAreas))
                            .then(() => warpjsUtils.toast.error(
                                $,
                                "Map has been modified, please reload the page.",
                                "Updated Map"
                            ))
                            .catch((err) => {
                                console.log("err=", err);
                                warpjsUtils.toast.error(
                                    $,
                                    "Error while saving new areas.",
                                    "Error Update Map"
                                );
                            })
                        ;
                    }
                })
            )

            .then(() => $(cache.MODAL_SELECTOR).modal('show'))
            .then(() => warpjsUtils.proxy.post($, url, $(this).data()))
            .then((result) => updateContent($, cache, result))
            .catch((err) => {
                console.error("error=", err);
                warpjsUtils.toast.error(
                    $,
                    "Error getting initial Map data.",
                    "Map data"
                );
            })
        ;
    });
}))(jQuery);
