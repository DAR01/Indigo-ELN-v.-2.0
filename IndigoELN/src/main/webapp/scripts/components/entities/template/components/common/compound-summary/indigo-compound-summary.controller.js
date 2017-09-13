(function() {
    angular
        .module('indigoeln')
        .controller('IndigoCompoundSummaryController', IndigoCompoundSummaryController);

    /* @ngInject */
    function IndigoCompoundSummaryController($scope, $log, ProductBatchSummaryOperations) {
        var vm = this;

        init();

        function init() {
            vm.model = vm.model || {};
            vm.columns = [
                {
                    id: 'structure',
                    name: 'Structure',
                    type: 'image',
                    isVisible: false,
                    width: vm.structureSize
                },
                {
                    id: 'nbkBatch',
                    name: 'Nbk Batch #'
                },
                {
                    id: '$$select',
                    name: 'Select',
                    type: 'boolean',
                    noDisablable: true,
                    noDirty: true,
                    actions: [
                        {
                            name: 'Select All',
                            action: function() {
                                _.each(getBatches(), function(row) {
                                    row.$$select = true;
                                });
                            }
                        },
                        {
                            name: 'Deselect All',
                            action: function() {
                                _.each(getBatches(), function(row) {
                                    row.$$select = false;
                                });
                            }
                        }
                    ]
                },
                {
                    id: 'virtualCompoundId', name: ' Virtual Compound ID', type: 'input'
                },
                {
                    id: 'molWeight', name: 'Mol Wgt', type: 'scalar'
                },
                {
                    id: 'formula', name: 'Mol Formula', type: 'input', readonly: true
                },
                {
                    id: 'stereoisomer',
                    name: 'Stereoisomer',
                    type: 'select',
                    dictionary: 'Stereoisomer Code',
                    values: function() {
                        return null;
                    },
                    width: '350px'
                },
                {
                    id: 'structureComments',
                    name: 'Structure Comments',
                    type: 'input',
                    bulkAssignment: true
                }
            ];

            vm.onRowSelected = onRowSelected;
            vm.deleteBatches = deleteBatches;
            vm.addNewBatch = addNewBatch;
            vm.duplicateBatches = duplicateBatches;
            vm.registerVC = registerVC;
            vm.importSDFile = importSDFile;
            vm.exportSDFile = exportSDFile;
            vm.isHasCheckedRows = isHasCheckedRows;
            vm.vnv = vnv;
            vm.onBatchOperationChanged = onBatchOperationChanged;
            vm.isBatchLoading = false;

            bindEvents();
        }

        function duplicateBatches() {
            vm.batchOperation = ProductBatchSummaryOperations.duplicateBatches(getCheckedBatches())
                .then(successAddedBatches);
        }

        function addNewBatch() {
            vm.batchOperation = ProductBatchSummaryOperations.addNewBatch().then(successAddedBatch);
        }

        function onRowSelected(row) {
            vm.onSelectBatch({batch: row});
        }

        function successAddedBatches(batches) {
            if (batches.length) {
                _.forEach(batches, function(batch) {
                    vm.onAddedBatch({batch: batch});
                });
                vm.onChanged();
                vm.onRowSelected(_.last(batches));
            }
        }

        function successAddedBatch(batch) {
            vm.onAddedBatch({batch: batch});
            vm.onChanged();
            vm.onRowSelected(batch);
        }

        function getCheckedBatches() {
            return _.filter(vm.batches, function(batch) {
                return batch.$$select;
            });
        }

        function isHasCheckedRows() {
            return !!_.find(getBatches(), function(item) {
                return item.$$select;
            });
        }

        function deleteBatches() {
            vm.onRemoveBatches({batches: getCheckedBatches()});
        }

        function importSDFile() {
            vm.batchOperation = ProductBatchSummaryOperations.importSDFile().then(successAddedBatches);
        }

        function exportSDFile() {
            ProductBatchSummaryOperations.exportSDFile(getBatches());
        }

        function getBatches() {
            return vm.batches;
        }

        function registerVC() {

        }

        function vnv() {
            $log.debug('VnV');
        }

        function onBatchOperationChanged(completed) {
            vm.isBatchLoading = completed;
        }

        function bindEvents() {
            $scope.$watch('vm.structureSize', function(newVal) {
                var column = _.find(vm.columns, function(item) {
                    return item.id === 'structure';
                });
                column.width = (500 * newVal) + 'px';
            });
        }
    }
})();
