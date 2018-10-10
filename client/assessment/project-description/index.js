const createAssessment = require('./create-assessment');
const deleteAssessment = require('./delete-assessment');
const shared = require('./../../shared');
const storage = require('./../../storage');
const template = require('./template.hbs');

let initialized = false;

module.exports = ($, placeholder, assessment, currentQuestion, rootUrl) => {
    const showCreate = !storage.getCurrent($, 'assessmentId');
    const surveyId = storage.getCurrent($, 'surveyId');
    const assessmentTemplateUrl = storage.getCurrent($, 'surveyToolAssessmentTemplateUrl');
    const assessments = storage.getAssessments(surveyId).map((assessment) => {
        assessment.href = window.WarpJS.expandUrlTemplate(assessmentTemplateUrl, { surveyId, assessmentId: assessment.assessmentId });
        return assessment;
    });

    if (showCreate) {
        const warpjsUser = storage.getCurrent($, 'warpjsUser');
        assessment.mainContact = warpjsUser ? warpjsUser.Name : '';
    }
    console.log('in dropdown url: ', rootUrl);
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
    }
};
