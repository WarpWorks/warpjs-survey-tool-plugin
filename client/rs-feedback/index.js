const Promise = require('bluebird');

const errorTemplate = require('./../error.hbs');
const shared = require('./../shared');
const resultsetTemplate = require('./resultset.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                const content = resultsetTemplate({ page: result.data });
                shared.setSurveyContent($, placeholder, content);
            }
            shared.postRender($, result.data);
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
