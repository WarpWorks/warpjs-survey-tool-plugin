const Promise = require('bluebird');
const warpjsUtils = require('@warp-works/warpjs-utils');

const errorTemplate = require('./../error.hbs');
const template = require('./../template.hbs');
const quesitonnaireIntroTemplate = require('./questionnaire-intro.hbs');
const quesitonnairePrivacyTemplate = require('./questionnaire-privacy.hbs');
const quesitonnaireDescriptionTemplate = require('./questionnaire-description.hbs');
const quesitonnaireLevelsTemplate = require('./questionnaire-levels.hbs');
const quesitonnaireSolutionCanvasTemplate = require('./quesitonnaire-solution-canvas.hbs');

(($) => $(document).ready(() => {
    const loader = warpjsUtils.toast.loading($, "Page is loading");
    const placeholder = $('#warpjs-content-placeholder');
    placeholder.html(template());

    return warpjsUtils.getCurrentPageHAL($)
        .then((result) => {
            warpjsUtils.toast.close($, loader);
            if (result.error) {
                placeholder.html(errorTemplate(result.data));
            } else {
                return Promise.resolve()
                    .then(() => quesitonnaireIntroTemplate())
                    .then((content) => $('.ipt-body').html(content))
                    .then(() => warpjsUtils.documentReady($))
                    .then(() => {
                        $(document).on('click', '.intro-next', (event) => {
                            event.preventDefault();
                            $('.ipt-body').html(quesitonnairePrivacyTemplate());
                        });
                        $(document).on('click', '.privacy-next', (event) => {
                            event.preventDefault();
                            $('.ipt-body').html(quesitonnaireDescriptionTemplate());
                        });
                        $(document).on('click', '.description-next', (event) => {
                            event.preventDefault();
                            // const url = result.data._links.self.href;
                            // const data = {
                            //     projectName: $('#project-name').val(),
                            //     mainContact: $('#main-contact').val(),
                            //     projectStatus: $('#project-status').val()
                            // };

                            result.data.projectName = $('#project-name').val();
                            result.data.mainContact = $('#main-contact').val();
                            result.data.projectStatus = $('#project-status').val();

                            // Promise.resolve()
                            //     .then(() => warpjsUtils.proxy.patch($, url, data))
                            //     .then((update) => {
                            //       console.log('update:: ', update);
                            // })

                            $('.ipt-body').html(quesitonnaireLevelsTemplate());

                            $('input:radio').hide().each(function() {
                                $(this).attr('data-radio-fx', this.name);
                                var label = $("label[for=" + '"' + this.id + '"' + "]").text();
                                $('<a ' + (label !== '' ? 'title=" ' + label + ' "' : '') + ' data-radio-fx="' + this.name + '" class="radio-fx" href="#">' +
                                    '<span class="radio' + (this.checked ? ' radio-checked' : '') + '"></span></a>').insertAfter(this);
                            });
                            $('a.radio-fx').on('click', function(event) {
                                event.preventDefault();
                                var unique = $(this).attr('data-radio-fx');
                                $("a[data-radio-fx='" + unique + "'] span").removeClass('radio-checked');
                                $(":radio[data-radio-fx='" + unique + "']").attr('checked', false);
                                $(this).find('span').addClass('radio-checked');
                                $(this).prev('input:radio').attr('checked', true);
                            });
                        });

                        $(document).on('click', '.levels-next', (event) => {
                            event.preventDefault();
                            result.data.levelOfDetail = $("input[name='questionnaire-level'][checked='checked']").val();
                            $('.ipt-body').html(quesitonnaireSolutionCanvasTemplate());
                        });

                        $(document).on('click', '.solution-canvas-next', (event) => {
                            event.preventDefault();
                        });
                    })
                ;
            }
        })
    ;
}))(jQuery);
