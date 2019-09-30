const createAssessment = require('./create-assessment');
const createDefaultAssessment = require('./create-default-assessment');
const deleteAssessment = require('./delete-assessment');
const getVersion = require('./../get-version');
const shared = require('./../../shared');
const storage = require('./../../storage');
const template = require('./template.hbs');
const exportAssessement = require('./../../shared/export-assessment');
const loadAssessment = require('./../../shared/load-assessment');

let initialized = false;

module.exports = ($, placeholder, assessment, currentQuestion, rootUrl) => {
    const showCreate = !storage.getCurrent($, 'assessmentId');
    const surveyId = storage.getCurrent($, 'surveyId');
    const assessmentTemplateUrl = storage.getCurrent($, 'surveyToolAssessmentTemplateUrl');
    let assessments = storage.getAssessments(surveyId).map((assessment) => {
        assessment.href = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId: assessment.assessmentId });
        return assessment;
    });

    if (showCreate) {
        const warpjsUser = storage.getCurrent($, 'warpjsUser');
        assessment.mainContact = warpjsUser ? warpjsUser.Name : '';
    }

    $.each(assessments, (index, item) => {
        item.revision = getVersion(item);
    });

    const content = template({
        showCreate,
        assessment,
        assessments,
        question: currentQuestion,
        rootUrl: rootUrl
    });
    shared.setSurveyContent($, placeholder, content);

    if (!initialized) {
        console.log("initialize project-description event listeners...");
        initialized = true;
        createAssessment($, placeholder);
        deleteAssessment($, placeholder);
        createDefaultAssessment($, placeholder);
    }

    exportAssessement($, placeholder);
    loadAssessment($, placeholder);
};
