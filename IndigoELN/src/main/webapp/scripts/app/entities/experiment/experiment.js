angular.module('indigoeln')
    .config(function($stateProvider, PermissionManagementConfig, PermissionViewManagementConfig, userPermissions) {
        var permissions = [
            userPermissions.VIEWER,
            userPermissions.OWNER
        ];

        $stateProvider
            .state('experiment', {
                parent: 'entity',
                url: '/',
                data: {
                    authorities: [],
                    pageTitle: 'Experiments'
                },
                views: {
                    'content@app_page': {
                        templateUrl: 'scripts/app/entities/experiment/experiments.html',
                        controller: 'ExperimentController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {}
            })
            .state('entities.experiment-detail', {
                url: '/project/{projectId}/notebook/{notebookId}/experiment/{experimentId}',
                data: {
                    authorities: ['EXPERIMENT_READER', 'EXPERIMENT_CREATOR', 'CONTENT_EDITOR'],
                    pageTitle: 'Experiment',
                    tab: {
                        name: 'Experiment',
                        service: 'Experiment',
                        kind: 'experiment',
                        type: 'entity',
                        state: 'entities.experiment-detail'
                    }
                },
                views: {
                    tabContent: {
                        template: '<experiment-detail></experiment-detail>'
                    }
                }
            })
            .state('experiment.delete', {
                parent: 'experiment',
                url: '/delete',
                data: {
                    authorities: ['EXPERIMENT_REMOVER', 'CONTENT_EDITOR']
                },
                onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'scripts/app/entities/experiment/delete-dialog/experiment-delete-dialog.html',
                        controller: 'ExperimentDeleteController',
                        controllerAs: 'vm',
                        size: 'md',
                        resolve: {
                            entity: ['Experiment', function(Experiment) {
                                return Experiment.get({
                                    experimentId: $stateParams.id,
                                    notebookId: $stateParams.notebookId
                                }).$promise;
                            }]
                        }
                    }).result.then(function() {
                        $state.go('experiment', null, {
                            reload: true
                        });
                    }, function() {
                        $state.go('^');
                    });
                }]
            })
            .state('entities.experiment-detail.permissions', _.extend({}, PermissionManagementConfig, {
                parent: 'entities.experiment-detail',
                data: {
                    authorities: ['CONTENT_EDITOR', 'EXPERIMENT_CREATOR']
                },
                permissions: permissions
            }))
            .state('entities.experiment-detail.permissions-view', _.extend({}, PermissionViewManagementConfig, {
                parent: 'entities.experiment-detail',
                data: {
                    authorities: ['CONTENT_EDITOR', 'EXPERIMENT_CREATOR']
                },
                permissions: permissions
            }))
            .state('entities.experiment-detail.print', {
                parent: 'entities.experiment-detail',
                url: '/print',
                onEnter: function(printModal, $stateParams) {
                    printModal.showPopup($stateParams, 'Experiment');
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'EXPERIMENT_READER', 'EXPERIMENT_CREATOR']
                }
            })
            .state('experiment-preview-submit', {
                parent: 'entity',
                url: '/project/{projectId}/notebook/{notebookId}/experiment/{experimentId}/preview-submit',
                data: {
                    authorities: ['CONTENT_EDITOR', 'EXPERIMENT_READER', 'EXPERIMENT_CREATOR'],
                    pageTitle: 'indigoeln',
                    isFullPrint: true
                },
                views: {
                    'content@app_page': {
                        templateUrl: 'scripts/app/entities/experiment/preview/experiment-preview.html',
                        controller: 'ExperimentPreviewController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    pageInfo: function($q, $stateParams, Experiment, Notebook, Project) {
                        return $q.all([
                            Experiment.get($stateParams).$promise,
                            Notebook.get($stateParams).$promise,
                            Project.get($stateParams).$promise
                        ]).then(function(results) {
                            return {
                                experiment: results[0],
                                notebook: results[1],
                                project: results[2]
                            };
                        });
                    }
                }
            });
    });
