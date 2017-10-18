angular
    .module('indigoeln')
    .factory('ProductBatchSummaryOperations', productBatchSummaryOperations);

/* @ngInject */
function productBatchSummaryOperations($q, ProductBatchSummaryCache, RegistrationUtil, StoichTableCache, AppValues,
                                       notifyService, $timeout, EntitiesBrowser, RegistrationService, sdImportService,
                                       sdExportService, AlertModal, $http, $stateParams, Notebook, CalculationService) {
    var curNbkOperation = $q.when();

    return {
        exportSDFile: exportSDFile,
        getSelectedNonEditableBatches: getSelectedNonEditableBatches,
        duplicateBatches: chainPromises(duplicateBatches),
        duplicateBatch: chainPromises(duplicateBatch),
        getIntendedNotInActual: getIntendedNotInActual,
        syncWithIntendedProducts: syncWithIntendedProducts,
        addNewBatch: chainPromises(addNewBatch),
        importSDFile: chainPromises(importSDFile),
        registerBatches: registerBatches,
        deleteBatches: deleteBatches
    };

    function exportSDFile(exportBatches) {
        var batches = exportBatches || ProductBatchSummaryCache.getProductBatchSummary();
        var selectedBatches = _.filter(batches, function(item) {
            return item.$$select;
        });

        sdExportService.exportItems(selectedBatches).then(function(data) {
            var file_path = 'api/sd/download?fileName=' + data.fileName;
            var a = document.createElement('A');
            a.href = file_path;
            a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    function getSelectedNonEditableBatches(batches) {
        return _
            .chain(batches)
            .filter(function(item) {
                return RegistrationUtil.isRegistered(item);
            })
            .map(function(item) {
                return item.fullNbkBatch;
            })
            .value();
    }

    function chainPromises(fn) {
        return function() {
            var args = arguments;
            curNbkOperation = curNbkOperation.then(function() {
                return fn.apply(this, args);
            }, function() {
                return fn.apply(this, args);
            });

            return curNbkOperation;
        };
    }

    function updateNbkBatches(batches) {
        var experiment = EntitiesBrowser.getCurrentEntity();

        return Notebook.get({
            projectId: $stateParams.projectId,
            notebookId: $stateParams.notebookId
        })
            .$promise
            .then(function(notebook) {
                var promise = $q.when();
                _.forEach(batches, function(batch) {
                    promise = promise
                        .then(function(beforeBatch) {
                            return requestNbkBatchNumber(beforeBatch).then(function(batchNumber) {
                                setNbkBatch(batch, batchNumber, notebook.name, experiment.name);

                                return batchNumber;
                            });
                        });
                });

                return promise;
            });
    }

    function duplicateBatches(batchesQueueToAdd, isSyncWithIntended) {
        var promises = _.map(batchesQueueToAdd, function(batch) {
            return createBatch(angular.copy(batch), isSyncWithIntended);
        });

        return $q
            .all(promises)
            .then(function(batches) {
                return updateNbkBatches(batches)
                    .then(function() {
                        return batches;
                    });
            });
    }

    function duplicateBatch(batch) {
        if (!batch) {
            return null;
        }

        return duplicateBatches([batch]).then(function(batches) {
            return _.first(batches);
        });
    }

    function getIntendedNotInActual() {
        var stoichTable = StoichTableCache.getStoicTable();
        if (stoichTable) {
            var intended = stoichTable.products;
            var intendedCandidateHashes = _.map(intended, '$$batchHash');
            var actual = ProductBatchSummaryCache.getProductBatchSummary();
            var actualHashes = _.compact(_.map(actual, '$$batchHash'));
            _.each(intendedCandidateHashes, function(intendedCandidateHash, i) {
                removeItemFromBothArrays(intendedCandidateHash, actualHashes, intendedCandidateHashes, i);
            });
            var hashesToAdd = _.compact(intendedCandidateHashes);

            return _.map(hashesToAdd, function(hash) {
                return _.find(intended, {
                    '$$batchHash': hash
                });
            });
        }
    }

    function removeItemFromBothArrays(item, array1, array2, i) {
        if (_.includes(array1, item)) {
            array2[i] = null;
            array1[_.indexOf(array1, item)] = null;
        }
    }

    function syncWithIntendedProducts() {
        var batchesQueueToAdd = getIntendedNotInActual();
        var stoichTable = StoichTableCache.getStoicTable();

        if (stoichTable && stoichTable.products && stoichTable.products.length) {
            if (!batchesQueueToAdd.length) {
                AlertModal.info('Product Batch Summary is synchronized', 'sm');
            } else {
                _.forEach(batchesQueueToAdd, function(batch) {
                    batch = _.extend(AppValues.getDefaultBatch(), batch);
                });

                return duplicateBatches(batchesQueueToAdd, true);
            }
        }

        return $q.resolve([]);
    }

    function addNewBatch() {
        return createBatch().then(function(batch) {
            return updateNbkBatches([batch]).then(function() {
                return batch;
            });
        });
    }

    function importSDFile() {
        return sdImportService.importFile().then(function(sdUnits) {
            var promises = _.map(sdUnits, function(unit) {
                return createBatch(unit);
            });

            return $q.all(promises).then(function(batches) {
                return updateNbkBatches(batches).then(function() {
                    notifyService.info(batches.length + ' batches successfully imported');

                    return batches;
                });
            });
        });
    }

    function registerBatches(batches) {
        var nonEditableBatches = getSelectedNonEditableBatches(batches);
        if (nonEditableBatches && nonEditableBatches.length > 0) {
            notifyService.warning('Batch(es) ' + _.uniq(nonEditableBatches).join(', ') + ' already have been registered.');

            return registerBatchesWith(batches, nonEditableBatches);
        }

        return registerBatchesWith(batches, []);
    }

    function requestNbkBatchNumber(lastNbkBatch) {
        var latest = lastNbkBatch || getLatestNbkBatch();
        var request = 'api/projects/' + $stateParams.projectId + '/notebooks/' + $stateParams.notebookId +
            '/experiments/' + $stateParams.experimentId + '/batch_number?latest=' + latest;

        return $http.get(request)
            .then(function(result) {
                return result.data.batchNumber;
            });
    }

    function setNbkBatch(batch, batchNumber, notebookName, experimentName) {
        batch.nbkBatch = batchNumber;
        batch.fullNbkBatch = notebookName + '-' + experimentName + '-' + batchNumber;
        batch.fullNbkImmutablePart = notebookName + '-' + experimentName + '-';

        return batch;
    }

    function createBatch(sdUnit, isSyncWithIntended) {
        var batch = AppValues.getDefaultBatch();
        var stoichTable = StoichTableCache.getStoicTable();
        if (stoichTable) {
            _.extend(batch, angular.copy(CalculationService.createBatch(stoichTable, true)));
        }

        _.extend(batch, sdUnit, {
            conversationalBatchNumber: undefined,
            registrationDate: undefined,
            registrationStatus: undefined
        });

        if (sdUnit) {
            if (isSyncWithIntended) {
                // to sync mapping of intended products with actual poducts
                batch.theoMoles = batch.mol;
                batch.theoWeight = batch.weight;
                // total moles can be calculated when total weight or total Volume are added, or manually
                batch.mol = null;
            }

            return $q
                .all([CalculationService.recalculateSalt(batch),
                    checkImage(batch.structure)
                ])
                .then(function() {
                    return saveMolecule(batch.structure.molfile).then(function(structureId) {
                        batch.structure.structureId = structureId;
                    }, function() {
                        notifyService.error('Cannot save the structure!');
                    });
                })
                .then(function() {
                    return batch;
                });
        }

        return $q.when(batch);
    }

    function checkImage(structure) {
        if (structure.molfile && !structure.image) {
            return CalculationService.getImageForStructure(structure.molfile, 'molecule').then(function(image) {
                structure.image = image;
            });
        }

        return $q.resolve();
    }

    function checkNonRemovableBatches(batches) {
        var nonEditableBatches = getSelectedNonEditableBatches(batches);
        if (nonEditableBatches && nonEditableBatches.length > 0) {
            notifyService.error('Following batches were registered or sent to registration and cannot be deleted: ' + _.uniq(nonEditableBatches)
                    .join(', '));
        }
    }

    function deleteBatches(batches, batchesForRemove) {
        if (!_.isEmpty(batches) && !_.isEmpty(batchesForRemove)) {
            checkNonRemovableBatches(batches);

            _.remove(batches, function(batch) {
                return !RegistrationUtil.isRegistered(batch) && _.includes(batchesForRemove, batch);
            });
        }
    }

    function getLatestNbkBatch() {
        var batches = ProductBatchSummaryCache.getProductBatchSummary();

        return isLatestBatchExist(batches) ? batches[batches.length - 1].nbkBatch : 0;
    }

    function isLatestBatchExist(batches) {
        return batches && batches.length > 0 && batches[batches.length - 1].nbkBatch;
    }

    function saveMolecule(mol) {
        if (mol) {
            return $http.post('api/bingodb/molecule/', mol).then(function(response) {
                return response.data;
            });
        }

        return $q.resolve();
    }

    function registerBatchesWith(batchesToRegister, excludes) {
        var batches = _.filter(batchesToRegister, function(row) {
            return !_.includes(excludes, row.fullNbkBatch);
        });
        var message = '';
        var notFullBatches = RegistrationUtil.getNotFullForRegistrationBatches(batches);
        if (notFullBatches.length) {
            _.each(notFullBatches, function(notFullBatch) {
                message = message + '<br><b>Batch ' + notFullBatch.nbkBatch + ':</b><br>' + notFullBatch.emptyFields.join('<br>');
            });
            AlertModal.error(message);
        } else {
            var batchNumbers = _.map(batches, function(batch) {
                return batch.fullNbkBatch;
            });
            if (batchNumbers.length) {
                return saveAndRegister(batchNumbers);
            }
            notifyService.warning('No Batches was selected for Registration');
        }
    }

    function saveAndRegister(batchNumbers) {
        return EntitiesBrowser.saveCurrentEntity()
            .then(function() {
                $timeout(function() {
                    RegistrationService.register({}, batchNumbers).$promise
                        .then(function() {
                            notifyService.success('Selected Batches successfully sent to Registration');
                        }, function() {
                            notifyService.error('ERROR! Selected Batches registration failed');
                        });
                }, 1000);
            });
    }
}
