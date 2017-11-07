var typeComponents = {
    conceptDetails: {
        field: 'conceptDetails',
        name: 'Concept Details',
        id: 'concept-details',
        desc: 'Allows user to specify Title, Therapeutic Area, Project Code, Co-authors, Designers, Keywords' +
        ' and Linked Experiments',
        isPrint: true
    },
    reactionDetails: {
        field: 'reactionDetails',
        name: 'Reaction Details',
        id: 'reaction-details',
        desc: 'Allows user to specify Title, Therapeutic Area, Project Code, Co-authors, Literature References, Keywords, Link to Previous and Future Experiments and Link to any Experiment',
        isPrint: true
    },
    productBatchSummary: {
        field: 'productBatchSummary',
        name: 'Product Batch Summary',
        id: 'product-batch-summary',
        desc: 'Represents all batches in table format. Allows user to review, create and edit batch' +
        ' details:Total amount weight, Yield%, Stereoisomer code, Purity, Solubility, Hazards,ect. Batch Registration (if it is allowed) is also executed here',
        isBatch: true,
        isPrint: true
    },
    productBatchDetails: {
        field: 'productBatchDetails',
        name: 'Product Batch Details',
        id: 'product-batch-details',
        desc: 'Provides details for the individual batch. Allows user to review, create and edit batch' +
        ' details:Total amount weight, Yield%, Stereoisomer code, Purity, Solubility, Hazards,ect. Batch Registration (if it is allowed) is also executed here',
        isBatch: true,
        isPrint: true
    },
    reaction: {
        field: 'reaction',
        name: 'Reaction Scheme',
        id: 'reaction-scheme',
        desc: 'Allows user to draw , import and export reaction schema',
        isPrint: true
    },
    stoichTable: {
        field: 'stoichTable',
        name: 'Stoich Table',
        id: 'stoich-table',
        desc: 'Allows user to specify Reactants, Reagents and Solvent using automatic reaction scheme analysis or manual search in database(s). Stoichiometry calculations of the Initial amounts and Theoretical amounts f the Intended Reaction Products are executed here',
        isPrint: true
    },
    batchStructure: {
        field: 'batchStructure',
        name: 'Batch Structure',
        id: 'batch-structure',
        desc: 'Allows user to draw , import and export batch structure',
        isBatch: true,
        isPrint: false
    },
    experimentDescription: {
        field: 'experimentDescription',
        name: 'Experiment Description',
        id: 'experiment-description',
        desc: 'Contains text editor with possibility to text formatting, insert pictures and table',
        isPrint: true
    },
    attachments: {
        field: 'attachments',
        name: 'Attachments',
        id: 'attachments',
        desc: 'Allows to manage attachment of any kind of file related to  this experiment',
        isPrint: true
    },
    preferredCompoundSummary: {
        field: 'preferredCompoundSummary',
        name: 'Preferred Compound Summary',
        id: 'preferred-compounds-summary',
        desc: 'Allows user to review, create and edit compounds details: Stereoisomer code, Comments, ect.' +
        ' Virtual Compound Registration (if it is allowed) is also executed here.',
        isBatch: true,
        isPrint: true
    },
    preferredCompoundDetails: {
        field: 'preferredCompoundDetails',
        name: 'Preferred Compound  Details',
        id: 'preferred-compound-details',
        desc: 'Provides details for the individual compound. Allows user to review, create and edit batch' +
        ' details: Stereoisomer code, Comments, ect. Virtual Compound Registration (if it is allowed) is also executed here.',
        isBatch: true,
        isPrint: false
    }
};

module.export = typeComponents;
