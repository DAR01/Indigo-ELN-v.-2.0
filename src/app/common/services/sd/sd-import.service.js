var template = require('../../components/file-uploader/single-file-uploader/single-file-uploader-modal.html');

/* @ngInject */
function sdImportService($uibModal, dictionaryService, sdConstants, alertModal, apiUrl, sdImportHelperService, $q) {
    return {
        importFile: importFile
    };

    function importValues(sdUnitToImport, property, index, dicts, itemToImport) {
        var propCode = getPropertyCode(property, index);
        var value = sdUnitToImport.properties[propCode];
        if (value) {
            var formattedProperty = sdImportHelperService.formatProperty(property, value, dicts, index);
            if (itemToImport[property.name]) {
                _.defaultsDeep(itemToImport[property.name], formattedProperty);
            } else {
                itemToImport[property.name] = formattedProperty;
            }
        }
    }

    function getFilledProperties(sdUnitToImport, dicts) {
        if (sdUnitToImport.properties) {
            var itemToImport = {};
            _.forEach(sdConstants, function(property) {
                if (property.childrenLength) {
                    for (var i = 0; i < property.childrenLength; i++) {
                        importValues(sdUnitToImport, property, i, dicts, itemToImport);
                    }
                }
                importValues(sdUnitToImport, property, null, dicts, itemToImport);
            });

            return itemToImport;
        }

        return null;
    }

    function getPropertyCode(property, index) {
        if (_.isNull(index)) {
            return property.code;
        }

        return property.code + '_' + index;
    }

    function importItems(sdUnitsToImport, dicts) {
        var batches = _.map(sdUnitsToImport, function(unit) {
            var filled = getFilledProperties(unit, dicts);
            filled.structure = {molfile: unit.mol};

            return filled;
        });

        return batches;
    }

    function importFile() {
        return $uibModal.open({
            animation: true,
            size: 'lg',
            template: template,
            controller: 'SingleFileUploaderController',
            controllerAs: 'vm',
            resolve: {
                url: function() {
                    return apiUrl + 'sd/import';
                }
            }
        }).result.then(function(result) {
            if (!result) {
                return $q.reject();
            }

            return dictionaryService.all({})
                .$promise
                .then(function(dicts) {
                    return importItems(result, dicts);
                });
        }, function() {
            alertModal.error('This file cannot be imported. Error occurred.');
        });
    }
}

module.exports = sdImportService;
