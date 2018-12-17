const Promise = require('bluebird');

const errorTemplate = require('./../error.hbs');
const shared = require('./../shared');
const resultsetTemplate = require('./resultset.hbs');
const openModal = require('./open-modal');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                const content = resultsetTemplate({ page: result.data, detailedEnabled: result.data.warpjsUser !== null });
                shared.setSurveyContent($, placeholder, content);
            }
            shared.postRender($, result.data);
        })
        .then(() => {
            placeholder.on('click', '.thumb', (event) => {
                const url = $(event.target).data('warpjsUrl');
                console.log('data: ', url);

                Promise.resolve()
                    .then(() => window.WarpJS.toast.loading($, "Loading data...", "Loading"))
                    .then((toastLoading) => Promise.resolve()
                        .then(() => window.WarpJS.proxy.get($, $(event.target).data('warpjsUrl')))
                        .then((res) => openModal($, event.target, res))
                        .catch((err) => {
                            console.error("Error:", err);
                            window.WarpJS.toast.error($, err.message, "Error getting data");
                        })
                        .finally(() => window.WarpJS.toast.close($, toastLoading))
                    )
                ;
            });
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
