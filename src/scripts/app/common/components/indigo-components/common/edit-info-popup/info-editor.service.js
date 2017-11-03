angular
    .module('indigoeln.componentsModule')
    .factory('infoEditor', infoEditor);

/* @ngInject */
function infoEditor($uibModal) {
    return {
        editSolubility: editSolubility,
        editResidualSolvents: editResidualSolvents,
        editExternalSupplier: editExternalSupplier,
        editMeltingPoint: editMeltingPoint,
        editPurity: editPurity,
        editHealthHazards: editHealthHazards,
        editHandlingPrecautions: editHandlingPrecautions,
        editStorageInstructions: editStorageInstructions
    };

    function editSolubility(solubility, callback) {
        return $uibModal.open({
            animation: true,
            size: 'lg',
            controller: 'EditSolubilityController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/edit-solubility/edit-solubility.html',
            resolve: {
                solubility: function() {
                    return solubility;
                }
            }
        }).result.then(function(result) {
            callback(result);

            return result;
        });
    }

    function editResidualSolvents(residualSolvents) {
        return $uibModal.open({
            animation: true,
            size: 'lg',
            controller: 'EditResidualSolventsController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/edit-residual-solvents/edit-residual-solvents.html',
            resolve: {
                solvents: function() {
                    return (residualSolvents && residualSolvents.data) || [];
                }
            }
        }).result;
    }

    function editExternalSupplier(data, callback) {
        $uibModal.open({
            animation: true,
            size: 'md',
            controller: 'EditExternalSupplierController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/edit-external-supplier/edit-external-supplier.html',
            resolve: {
                data: function() {
                    return data;
                }
            }
        }).result.then(function(result) {
            callback(result);
        });
    }

    function editMeltingPoint(data, callback) {
        $uibModal.open({
            animation: true,
            size: 'md',
            controller: 'EditMeltingPointController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/edit-melting-point/edit-melting-point.html',
            resolve: {
                data: function() {
                    return data;
                }
            }
        }).result.then(function(result) {
            callback(result);
        });
    }

    function editPurity(data, callback) {
        $uibModal.open({
            animation: true,
            size: 'lg',
            controller: 'EditPurityController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/edit-purity/edit-purity.html',
            resolve: {
                data: function() {
                    return data;
                },
                dictionary: function(dictionaryService) {
                    return dictionaryService.get({
                        id: 'purity'
                    }).$promise;
                }
            }
        }).result.then(function(result) {
            callback(result);
        });
    }

    function editHealthHazards(data, callback) {
        var dictionary = 'healthHazards';
        var title = 'Edit Health Hazards';
        selectFromDictionary(dictionary, data, title, callback);
    }

    function editHandlingPrecautions(data, callback) {
        var dictionary = 'handlingPrecautions';
        var title = 'Edit Handling Precautions';
        selectFromDictionary(dictionary, data, title, callback);
    }

    function editStorageInstructions(data, callback) {
        var dictionary = 'storageInstructions';
        var title = 'Edit Storage Instructions';
        selectFromDictionary(dictionary, data, title, callback);
    }

    function selectFromDictionary(dictionary, model, title, callback) {
        $uibModal.open({
            animation: true,
            size: 'sm',
            controller: 'SelectFromDictionaryController',
            controllerAs: 'vm',
            templateUrl: 'scripts/app/common/components/indigo-components/common/edit-info-popup/select-from-dictionary/select-from-dictionary.html',
            resolve: {
                data: function() {
                    return model;
                },
                dictionary: function(dictionaryService) {
                    return dictionaryService.get({
                        id: dictionary
                    }).$promise;
                },
                title: function() {
                    return title;
                }
            }
        }).result.then(function(result) {
            callback(result);
        });
    }
}
