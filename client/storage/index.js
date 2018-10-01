const uuid = require('uuid/v4');

const STORAGE_KEY = 'warpjs-survey-tool-plugin';

class Storage {
    constructor() {
        this.storage = window.localStorage;
    }

    // Hopefully it will be possible to put all the assessments for a given
    // survey in a single key.
    storageKey(surveyId) {
        return `${STORAGE_KEY}-${surveyId}`;
    }

    createAssessment(surveyId) {
        const assessmentId = uuid();

        const assessment = {
            surveyId,
            assessmentId,
            name: `Untitled ${assessmentId}`,
            data: {
                levelOfDetail: 1,
                projectName: '',
                mainContact: '',
                projectStatus: '',
                solutionCanvas: ''
            }
        };

        this.updateAssessment(surveyId, assessmentId, assessment);
        return assessmentId;
    }

    getAssessments(surveyId) {
        return JSON.parse(this.storage.getItem(this.storageKey(surveyId)) || "[]").map((assessment) => {
            assessment.name = assessment.data.projectName || `Untitled ${assessment.assessmentId}`;
            return assessment;
        });
    }

    setAssessments(surveyId, assessments) {
        this.storage.setItem(this.storageKey(surveyId), JSON.stringify(assessments));
    }

    getAssessment(surveyId, assessmentId) {
        const assessments = this.getAssessments(surveyId);
        return assessments.find((assessment) => assessment.assessmentId === assessmentId);
    }

    removeAssessment(surveyId, assessmentId) {
        const assessments = this.getAssessments(surveyId);
        const filtered = assessments.filter((assessment) => assessment.assessmentId !== assessmentId);
        this.setAssessments(surveyId, filtered);
    }

    updateAssessment(surveyId, assessmentId, assessment) {
        const assessments = this.getAssessments(surveyId);
        const filtered = assessments.filter((assessment) => assessment.assessmentId !== assessmentId);
        this.setAssessments(surveyId, filtered.concat(assessment));
    }

    setCurrent(surveyId, assessmentId) {
        this.storage.setItem(`${STORAGE_KEY}-current`, JSON.stringify({ surveyId, assessmentId }));
    }

    getCurrent() {
        return JSON.parse(this.storage.getItem(`${STORAGE_KEY}-current`) || "{}");
    }
}

module.exports = Storage;
