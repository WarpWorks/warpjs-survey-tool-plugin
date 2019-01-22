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
                Promise.resolve()
                    .then(() => window.WarpJS.toast.loading($, "Loading data...", "Loading"))
                    .then((toastLoading) => Promise.resolve()
                        .then(() => window.WarpJS.proxy.get($, $(event.currentTarget).data('warpjsUrl')))
                        .then((res) => openModal($, event.currentTarget, res))
                        .catch((err) => {
                            console.error("Error:", err);
                            window.WarpJS.toast.error($, err.message, "Error getting data");
                        })
                        .finally(() => window.WarpJS.toast.close($, toastLoading))
                    )
                ;
            });

            placeholder.on('click', '.user-feedback-toggle', (event) => {
                $('.results-container').toggleClass('hide-feedback');
            });

            placeholder.on('change', '.select-detail-level', (event) => {
                const value = $(event.target).val();
                $('.results-container').attr('data-detail-level', value);
            });
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
