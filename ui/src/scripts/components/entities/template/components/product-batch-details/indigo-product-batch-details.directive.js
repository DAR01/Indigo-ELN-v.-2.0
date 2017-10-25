(function() {
    angular
        .module('indigoeln')
        .directive('indigoProductBatchDetails', indigoProductBatchDetails);

    function indigoProductBatchDetails() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/components/entities/template/components/product-batch-details/product-batch-details.html',
            controller: 'IndigoProductBatchDetailsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                model: '=',
                batches: '=',
                experiment: '=',
                experimentForm: '=',
                selectedBatch: '=',
                selectedBatchTrigger: '=',
                reactants: '=',
                reactantsTrigger: '=',
                isReadonly: '=',
                saveExperimentFn: '&',
                batchOperation: '=',
                onAddedBatch: '&',
                onSelectBatch: '&',
                onRemoveBatches: '&',
                onChanged: '&'
            }
        };
    }
})();
