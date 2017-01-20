/**
 * Created by Stepan_Litvinov on 2/8/2016.
 */
angular.module('indigoeln')
    .directive('productBatchDetails', function (InfoEditor, AppValues, CalculationService, $filter) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'scripts/components/entities/template/components/productBatchDetails/productBatchDetails.html',
            controller: function ($scope, $uibModal, AlertModal) {
                $scope.model = $scope.model || {};
                $scope.showSummary = false;
                $scope.model.productBatchDetails = $scope.model.productBatchDetails || {};
                if($scope.model.productBatchSummary){
                    $scope.model.productBatchSummary.batches = $scope.model.productBatchSummary.batches || [];
                }
                $scope.detailTable = [];

                $scope.selectControl = {};

                $scope.onSelectBatch = function () {
                    if($scope.share.selectedRow){
                        $scope.share.selectedRow.$$selected = false;
                    }
                    $scope.share.selectedRow = $scope.selectedBatch || null;
                    $scope.share.selectedRow.$$selected = true;
                    setProductBatchDetails($scope.share.selectedRow);
                    $scope.detailTable[0] = $scope.share.selectedRow;
                };



                var grams = AppValues.getGrams();
                var liters = AppValues.getLiters();
                var moles = AppValues.getMoles();

                $scope.saltCodeValues = AppValues.getSaltCodeValues();
                $scope.productTableColumns = [
                    {
                        id: 'totalWeight',
                        name: 'Total Weight',
                        type: 'unit',
                        width: '150px',
                        unitItems: grams,
                        onClose: function (data) {
                            CalculationService.setEntered(data);
                            CalculationService.calculateProductBatch(data);
                        }
                    },
                    {
                        id: 'totalVolume',
                        name: 'Total Volume',
                        type: 'unit',
                        width: '150px',
                        unitItems: liters,
                        onClose: function (data) {
                            CalculationService.setEntered(data);
                            CalculationService.calculateProductBatch(data);
                        }
                    },
                    {
                        id: 'mol',
                        name: 'Total Moles',
                        type: 'unit',
                        width: '150px',
                        unitItems: moles,
                        onClose: function (data) {
                            CalculationService.setEntered(data);
                            CalculationService.calculateProductBatch(data);
                        }
                    },
                    {
                        id: 'theoWeight',
                        name: 'Theo. Wgt.',
                        type: 'unit',
                        unitItems: grams,
                        width: '150px',
                        hideSetValue: true,
                        readonly: true
                    },
                    {
                        id: 'theoMoles',
                        name: 'Theo. Moles',
                        width: '150px',
                        type: 'unit',
                        unitItems: moles,
                        hideSetValue: true,
                        readonly: true
                    },
                    {id: 'yield', name: '%Yield', type: 'primitive', sigDigits: 2},
                    {
                        id: 'registrationDate', name: 'Registration Date', format: function (val) {
                        return val ? $filter('date')(val, 'MMM DD, YYYY HH:mm:ss z') : null;
                    }
                    },
                    {id: 'registrationStatus', name: 'Registration Status'}
                ];

                function getProductBatchDetails() {
                    return $scope.model.productBatchDetails;
                }

                function setProductBatchDetails(batch) {
                    $scope.model.productBatchDetails = batch;
                }

                var stoichTable, productBatches;

                function getStoicTable() {
                    return stoichTable;
                }

                function setStoicTable(table) {
                    stoichTable = table;
                }

                var getProductBatches = function () {
                    return productBatches;
                };
                var setProductBatches = function (batches) {
                    productBatches = batches;
                };

                var onBatchSummaryRowSelectedEvent = $scope.$on('batch-summary-row-selected', function (event, data) {
                    setProductBatchDetails(data.row);
                    setStoicTable(data.stoichTable);
                    setProductBatches(data.actualProducts);
                    $scope.detailTable[0] = data.row;
                    $scope.selectedBatch = data.row;
                    $scope.selectControl.setSelection(data.row);
                });
                var onBatchSummaryRowDeselectedEvent = $scope.$on('batch-summary-row-deselected', function () {
                    setProductBatchDetails({});
                    $scope.detailTable[0] = {};
                    $scope.selectedBatch = {};
                    $scope.selectControl.unSelect();
                });
                $scope.$on('$destroy', function () {
                    onBatchSummaryRowSelectedEvent();
                    onBatchSummaryRowDeselectedEvent();
                });

                $scope.editSolubility = function () {
                    var callback = function (result) {
                        getProductBatchDetails().solubility = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editSolubility(getProductBatchDetails().solubility, callback);
                };
                $scope.editResidualSolvents = function () {
                    var callback = function (result) {
                        getProductBatchDetails().residualSolvents = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editResidualSolvents(getProductBatchDetails().residualSolvents, callback);
                };
                $scope.editExternalSupplier = function () {
                    var callback = function (result) {
                        getProductBatchDetails().externalSupplier = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editExternalSupplier(getProductBatchDetails().externalSupplier, callback);
                };
                $scope.editMeltingPoint = function () {
                    var callback = function (result) {
                        getProductBatchDetails().meltingPoint = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editMeltingPoint(getProductBatchDetails().meltingPoint, callback);
                };
                $scope.editPurity = function () {
                    var callback = function (result) {
                        getProductBatchDetails().purity = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editPurity(getProductBatchDetails().purity, callback);
                };
                $scope.editHealthHazards = function () {
                    var callback = function (result) {
                        getProductBatchDetails().healthHazards = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editHealthHazards(getProductBatchDetails().healthHazards, callback);
                };
                $scope.editHandlingPrecautions = function () {
                    var callback = function (result) {
                        getProductBatchDetails().handlingPrecautions = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editHandlingPrecautions(getProductBatchDetails().handlingPrecautions, callback);
                };
                $scope.editStorageInstructions = function () {
                    var callback = function (result) {
                        getProductBatchDetails().storageInstructions = result;
                        $scope.experimentForm.$setDirty();
                    };
                    InfoEditor.editStorageInstructions(getProductBatchDetails().storageInstructions, callback);
                };
                $scope.registerBatch = function () {
                    AlertModal.info('not implemented yet');
                };
                $scope.recalculateSalt = function (reagent) {
                    CalculationService.recalculateSalt(reagent).then(function () {
                        CalculationService.recalculateStoich();
                    });
                };
                var unsubscribe = $scope.$watch('share.stoichTable', function (stoichTable) {
                    if (stoichTable && stoichTable.reactants) {
                        getProductBatchDetails().precursors = _.filter(_.map(stoichTable.reactants, function (item) {
                            return item.compoundId || item.fullNbkBatch;
                        }), function (val) {
                            return !!val;
                        }).join(', ');
                    }
                }, true);
                $scope.$on('$destroy', function () {
                    unsubscribe();
                });
            }
        };
    });