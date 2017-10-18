(function() {
    angular
        .module('indigoeln.Components', [
            'indigoeln.componentButtons'
        ])
        .run(function($templateCache, Components) {
            var defaultAttributes = ' model="vm.model"' +
                ' reactants="vm.reactants"' +
                ' reactants-trigger="vm.reactantsTrigger"' +
                ' experiment="vm.experiment"' +
                ' is-readonly="vm.isReadonly"' +
                ' on-changed="vm.onChangedComponent({componentId: component.id})"';

            var batchAttributes = defaultAttributes +
                ' batches="vm.batches"' +
                ' on-added-batch="vm.onAddedBatch(batch)"' +
                ' batches-trigger="vm.batchesTrigger"' +
                ' selected-batch="vm.selectedBatch"' +
                ' is-exist-stoich-table="::!!vm.model.stoichTable"' +
                ' selected-batch-trigger="vm.selectedBatchTrigger"' +
                ' on-select-batch="vm.onSelectBatch(batch)"' +
                ' on-remove-batches="vm.onRemoveBatches(batches)"' +
                ' batch-operation="vm.batchOperation"' +
                ' save-experiment-fn="vm.saveExperimentFn()"';

            var stoichTableAttributes = defaultAttributes +
                ' on-precursors-changed="vm.onPrecursorsChanged(precursors)"' +
                ' info-reactants="vm.model.reaction.infoReactants"' +
                ' info-products="vm.model.reaction.infoProducts"';

            _.forEach(Components, function(component) {
                $templateCache.put(component.id, getTemplate(component.id));
            });

            function getTemplate(id) {
                var directiveName = 'indigo-' + id;

                return '<' + directiveName + getComponentAttributes(id) + '></' + directiveName + '>';
            }

            function getComponentAttributes(id) {
                var component = _.find(Components, {id: id});
                if (component.isBatch) {
                    return batchAttributes;
                }
                if (id === 'stoich-table') {
                    return stoichTableAttributes;
                }

                return defaultAttributes;
            }
        });
})();
