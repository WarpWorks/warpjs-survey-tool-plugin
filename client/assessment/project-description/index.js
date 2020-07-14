const createAssessment = require('./create-assessment');
const createDefaultAssessment = require('./create-default-assessment');
const deleteAssessment = require('./delete-assessment');
const getVersion = require('./../get-version');
const shared = require('./../../shared');
const storage = require('./../../storage');
const template = require('./template.hbs');
const exportAssessement = require('./../../shared/export-assessment');
const loadAssessment = require('./../../shared/load-assessment');
const projectEmailChanged = require('./project-email-changed');

let initialized = false;

module.exports = ($, placeholder, assessment, currentQuestion, rootUrl, type, hasSampleProject) => {
    const showCreate = !storage.getCurrent($, storage.KEYS.ASSESSMENT_ID);
    const surveyId = storage.getCurrent($, storage.KEYS.SURVEY_ID);
    const assessmentTemplateUrl = storage.getCurrent($, storage.KEYS.ASSESSMENT_TEMPLATE_URL);
    const assessments = storage.getAssessments(surveyId).map((assessment) => {
        assessment.href = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId: assessment.assessmentId });
        return assessment;
    });

    if (showCreate) {
        const warpjsUser = storage.getCurrent($, storage.KEYS.USER);
        assessment.mainContact = warpjsUser ? warpjsUser.Name : '';
        assessment.projectEmail = warpjsUser ? warpjsUser.Email : '';
    }

    $.each(assessments, (index, item) => {
        item.revision = getVersion(item);
    });

    const content = template({
        showCreate,
        assessment,
        assessments,
        question: currentQuestion,
        rootUrl: rootUrl,
        hasSampleProject,
        customMessages: storage.getCurrent($, storage.KEYS.CUSTOM_MESSAGES).reduce(
            (cumul, customMessage) => ({
                ...cumul,
                [customMessage.key]: customMessage.value
            }),
            {}
        )
    });
    shared.setSurveyContent($, placeholder, content);

    if (!initialized) {
        // console.log("initialize project-description event listeners...");
        initialized = true;
        createAssessment($, placeholder);
        deleteAssessment($, placeholder);
        createDefaultAssessment($, placeholder, type);
        projectEmailChanged($, placeholder);
    }

    exportAssessement($, placeholder);
    loadAssessment($, placeholder);
};
