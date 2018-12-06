const Promise = require('bluebird');

const errorTemplate = require('./../error.hbs');
const shared = require('./../shared');
const resultsetTemplate = require('./resultset.hbs');

(($) => $(document).ready(() => {
    const loader = window.WarpJS.toast.loading($, "Page is loading");
    const placeholder = shared.preRender($);
    const typeTemplate = {
        resultset: resultsetTemplate
    };

    return Promise.resolve()
        .then(() => window.WarpJS.getCurrentPageHAL($))
        .then((result) => {
            if (result.error) {
                shared.setSurveyContent($, placeholder, errorTemplate(result.data));
            } else {
                const content = typeTemplate[result.data.type]({ page: result.data });
                shared.setSurveyContent($, placeholder, content);
            }
            shared.postRender($, result.data);
        })
        .finally(() => window.WarpJS.toast.close($, loader))
    ;
}))(jQuery);
