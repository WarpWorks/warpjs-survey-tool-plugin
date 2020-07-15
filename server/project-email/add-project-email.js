const constants = require('./../../lib/constants');
const utils = require('./../utils');

const ENTITY_NAME = 'IPT_ProjectEmail';
const SURVEY_TOOL_RELATIONSHIP_NAME = 'SurveyTool';

module.exports = async (req, res) => {
    const { surveyId } = req.params;
    const { projectEmail } = req.body;

    const email = projectEmail ? projectEmail.trim() : '';

    let persistence;

    try {
        const pluginInfo = utils.getPluginInfo(req);
        const domain = pluginInfo.domain;

        const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
        const Persistence = require(pluginConfig.persistence.module);
        persistence = new Persistence(pluginConfig.persistence.host, domain);

        const domainModel = await req.app.get(constants.appKeys.warpCore).getDomainByName(domain);
        const projectEmailEntity = domainModel.getEntityByName(ENTITY_NAME);

        const documents = await projectEmailEntity.getDocuments(persistence);
        const found = documents.find((doc) => doc.Name === email);

        const relationship = projectEmailEntity.getRelationshipByName(SURVEY_TOOL_RELATIONSHIP_NAME);
        const surveyDocuments = await relationship.getTargetEntity().getDocuments(persistence);
        const survey = surveyDocuments.find((survey) => survey.id === surveyId);
        const surveyData = {
            id: surveyId,
            type: survey.type,
            typeID: survey.typeID
        };

        if (found) {
            const reference = relationship.getTargetReferences(found).find((ref) => ref._id === surveyId);
            if (!reference) {
                const instance = await relationship.addAssociation(found, surveyData, persistence);
                await projectEmailEntity.updateDocument(persistence, instance);
            }
        } else {
            let instance = projectEmailEntity.newInstance();
            instance.Name = email;
            instance = await relationship.addAssociation(instance, surveyData, persistence);
            await projectEmailEntity.createDocument(persistence, instance);
        }

        res.status(204).send();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error adding project email: err=", err);
        res.status(500).send('Error saving email.');
    } finally {
        if (persistence) {
            persistence.close();
        }
    }
};
