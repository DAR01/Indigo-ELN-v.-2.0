(function() {
    angular
        .module('indigoeln')
        .directive('indigoPreferredCompoundsSummary', indigoPreferredCompoundsSummary);

    function indigoPreferredCompoundsSummary() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: '=',
                batches: '=',
                batchesTrigger: '=',
                selectedBatch: '=',
                selectedBatchTrigger: '=',
                experimentName: '=',
                structureSize: '=',
                isHideColumnSettings: '=',
                isReadonly: '=',
                batchOperation: '=',
                onAddedBatch: '&',
                onSelectBatch: '&',
                onRemoveBatches: '&',
                onChanged: '&'
            },
            controller: controller,
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: 'scripts/components/entities/template/components/prefer-compounds-summary/prefer-compound-summary.html'
        };

        /* @ngInject */
        function controller() {
            var vm = this;

            vm.model = vm.model || {};
            vm.experiment = vm.experiment || {};
            vm.structureSize = 0.3;
        }
    }
})();
