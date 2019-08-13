module.exports = async (Promise, pluginInfo, entity, instance, relationshipName, TargetClass) => {
    const relationship = await entity.getRelationshipByName(relationshipName);
    let documents = [];

    if (relationship) {
        documents = await relationship.getDocuments(pluginInfo.persistence, instance);
    }

    return Promise.map(
        documents,
        async (doc) => {
            const targetInstance = new TargetClass();
            return targetInstance.fromPersistence(Promise, pluginInfo, relationship.getTargetEntity(), doc);
        }
    );
};
