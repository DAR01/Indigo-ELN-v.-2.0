angular.module('indigoeln')
    .config(function($stateProvider, PermissionManagementConfig, PermissionViewManagementConfig, userPermissions) {
        var permissions = [
            userPermissions.VIEWER,
            userPermissions.USER,
            userPermissions.OWNER
        ];

        var data = {
            authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR']
        };

        $stateProvider
            .state('notebook', {
                abstract: true,
                parent: 'entity'
            })
            .state('entities.notebook-new', {
                url: '/project/{parentId}/notebook/new',
                views: {
                    tabContent: {
                        templateUrl: 'scripts/app/entities/notebook/notebook-dialog.html',
                        controller: 'NotebookDialogController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    isNewEntity: true
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_CREATOR'],
                    pageTitle: 'indigoeln',
                    tab: {
                        name: 'New Notebook',
                        service: 'Notebook',
                        kind: 'notebook',
                        type: 'entity',
                        state: 'entities.notebook-new'
                    },
                    isNew: true
                },
                resolve: {
                    pageInfo: function($q, $stateParams, Principal) {
                        return $q.all([
                            Principal.identity(),
                            Principal.hasAuthorityIdentitySafe('CONTENT_EDITOR'),
                            Principal.hasAuthorityIdentitySafe('NOTEBOOK_CREATOR'),
                            Principal.hasAuthorityIdentitySafe('EXPERIMENT_CREATOR')
                        ]).then(function(results) {
                            return {
                                notebook: {
                                    description: '',
                                    name: ''
                                },
                                identity: results[0],
                                isContentEditor: results[1],
                                hasEditAuthority: results[2],
                                hasCreateChildAuthority: results[3],
                                experiments: {},
                                projectId: $stateParams.parentId
                            };
                        });
                    }
                }
            })
            .state('entities.notebook-detail', {
                url: '/project/{projectId}/notebook/{notebookId}',
                views: {
                    tabContent: {
                        templateUrl: 'scripts/app/entities/notebook/notebook-dialog.html',
                        controller: 'NotebookDialogController',
                        controllerAs: 'vm'
                    }
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'NOTEBOOK_READER', 'NOTEBOOK_CREATOR'],
                    pageTitle: 'indigoeln',
                    tab: {
                        name: 'Notebook',
                        service: 'Notebook',
                        kind: 'notebook',
                        type: 'entity',
                        state: 'entities.notebook-detail'
                    }
                },
                resolve: {
                    pageInfo: function($q, $stateParams, Principal, Notebook) {
                        return $q
                            .all([
                                Notebook.get($stateParams).$promise,
                                Principal.identity(),
                                Principal.hasAuthorityIdentitySafe('CONTENT_EDITOR'),
                                Principal.hasAuthorityIdentitySafe('NOTEBOOK_CREATOR'),
                                Principal.hasAuthorityIdentitySafe('EXPERIMENT_CREATOR')
                            ])
                            .then(function(results) {
                                return {
                                    notebook: results[0],
                                    identity: results[1],
                                    isContentEditor: results[2],
                                    hasEditAuthority: results[3],
                                    hasCreateChildAuthority: results[4],
                                    projectId: $stateParams.projectId
                                };
                            });
                    }
                }
            })
            .state('entities.notebook-detail.print', {
                parent: 'entities.notebook-detail',
                url: '/print',
                onEnter: function(printModal, $stateParams) {
                    printModal.showPopup($stateParams, 'Notebook');
                },
                data: {
                    authorities: ['CONTENT_EDITOR', 'EXPERIMENT_READER', 'EXPERIMENT_CREATOR']
                }
            })
            .state('entities.notebook-new.permissions', _.extend({}, PermissionManagementConfig, {
                parent: 'entities.notebook-new',
                data: data,
                permissions: permissions
            }))
            .state('entities.notebook-new.permissions-view', _.extend({}, PermissionViewManagementConfig, {
                parent: 'entities.notebook-new',
                data: data,
                permissions: permissions
            }))
            .state('entities.notebook-detail.permissions', _.extend({}, PermissionManagementConfig, {
                parent: 'entities.notebook-detail',
                data: data,
                permissions: permissions
            }))
            .state('entities.notebook-detail.permissions-view', _.extend({}, PermissionViewManagementConfig, {
                parent: 'entities.notebook-detail',
                data: data,
                permissions: permissions
            }));
    });
