const Storage = require('./../storage');

function loadFile($, event) {
    const obj = JSON.parse(event.target.result);

    const storage = new Storage();
    const current = storage.getCurrent();

    if (obj.id) {
        // TODO: Convert old format.
        obj.assessmentId = obj.id;
        delete obj.id;

        // Assume current survey to be default for old format.
        obj.surveyId = current.surveyId;

        obj.data = {
            answers: obj.answers,
            detailLevel: obj.detailLevel,
            mainContact: obj.mainContact,
            projectName: obj.projectName,
            projectStatus: obj.projectStatus,
            solutionCanvas: obj.solutionCanvas
        };

        delete obj.answers;
        delete obj.detailLevel;
        delete obj.mainContact;
        delete obj.projectName;
        delete obj.projectStatus;
        delete obj.solutionCanvas;
    }

    if (obj.assessmentId === current.assessmentId) {
        window.WarpJS.toast.info($, "Same assessment. Ask: Replace | Clone | Cancel");
    } else if (current.assessmentId) {
        window.WarpJS.toast.info($, "Will move to new page. Ask: Ok | Cancel");
    } else {
        window.WarpJS.toast.info($, "Auto-load new page.");
    }
}

module.exports = ($, placeholder) => {
    $('[data-survey-tool-action="load-json"]', placeholder).on('click', function() {
        $('#inputFile', placeholder).trigger('click');
    });

    $('#inputFile', placeholder).on('change', function(event) {
        const reader = new FileReader();
        reader.onload = (evt) => loadFile($, evt);
        reader.readAsText(event.target.files[0]);
    });
};
