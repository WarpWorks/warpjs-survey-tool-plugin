class Assessment {
    constructor(assessmentId) {
        this.surveyId = null;
        this.assessmentId = assessmentId;
        this.detailLevel = 1;
        this.mainContact = null;
        this.projectName = null;
        this.projectStatus = null;
        this.solutionCanvas = null;
        this.questionModules = [];

        this.answers = [];
    }

    toHal(warpjsUtils) {
        const resource = warpjsUtils.createResource('', {
            surveyId: this.surveyId,
            assessmentId: this.assessmentId,
            detailLevel: this.detailLevel,
            mainContact: this.mainContact,
            projectName: this.projectName,
            projectStatus: this.projectStatus,
            solutionCanvas: this.solutionCanvas,
            questionModules: this.questionModules
        });

        resource.embed('answers', this.answers.map((answer) => answer.toHal(warpjsUtils)));

        return resource;
    }
}

module.exports = Assessment;
