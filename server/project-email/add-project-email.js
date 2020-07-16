const constants = require('./../../lib/constants');
const utils = require('./../utils');

const ENTITY_NAME = 'IPT';
const EMAIL_RELATIONSHIP = 'Email';
const EMAIL_ENTITY_NAME = 'Email';

module.exports = async (req, res) => {
    const { surveyId } = req.params;
    let { fullName, projectEmail } = req.body;

    if (projectEmail) {
        projectEmail = projectEmail.trim();

        let persistence;

        try {
            const pluginInfo = utils.getPluginInfo(req);
            const domain = pluginInfo.domain;

            const pluginConfig = req.app.get(constants.appKeys.pluginConfig);
            const Persistence = require(pluginConfig.persistence.module);
            persistence = new Persistence(pluginConfig.persistence.host, domain);

            const domainModel = await req.app.get(constants.appKeys.warpCore).getDomainByName(domain);
            const surveyToolEntity = domainModel.getEntityByName(ENTITY_NAME);

            const surveys = await surveyToolEntity.getDocuments(persistence);

            const survey = surveys.find((doc) => doc.id === surveyId);

            const relationship = surveyToolEntity.getRelationshipByName(EMAIL_RELATIONSHIP);
            const emailEntity = relationship.getTargetEntity();

            const emails = await relationship.getDocuments(persistence, survey);

            const foundEmail = emails.find((email) => email.Email === projectEmail);

            if (foundEmail) {
                if (foundEmail.FullName !== fullName) {
                    foundEmail.Name = projectEmail;
                    foundEmail.FullName = fullName;
                    await emailEntity.updateDocument(persistence, foundEmail);
                }
            } else {
                const child = await relationship.addAggregation(persistence, surveyToolEntity, survey, EMAIL_ENTITY_NAME);

                child.Name = projectEmail;
                child.Email = projectEmail;
                child.FullName = fullName;

                await emailEntity.createDocument(persistence, child);
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error adding project email: err=", err);
            res.status(500).send('Error saving email.');
        } finally {
            if (persistence) {
                persistence.close();
            }
        }
    }
    res.status(204).send();
};
