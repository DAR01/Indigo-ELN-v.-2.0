/* @ngInject */
function templateManagementConfig($stateProvider) {
    $stateProvider
        .state('entities.template', {
            parent: 'entities',
            url: '/templates',
            data: {
                authorities: ['TEMPLATE_EDITOR'],
                pageTitle: 'Templates',
                tab: {
                    name: 'Templates',
                    kind: 'management',
                    state: 'entities.template',
                    type: 'entity'
                }
            },
            views: {
                tabContent: {
                    template: require('./templates.html'),
                    controller: 'TemplateController',
                    controllerAs: 'vm'
                }
            },
            resolve: {}
        })
        .state('entities.template-new', {
            parent: 'entities',
            url: '/template/new',
            data: {
                authorities: ['TEMPLATE_EDITOR'],
                tab: {
                    name: 'New Template',
                    kind: 'management',
                    state: 'entities.template-new',
                    type: 'entity'
                }
            },
            views: {
                tabContent: {
                    template: require('./modal/template-modal.html'),
                    controller: 'TemplateModalController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                pageInfo: function() {
                    return {
                        name: null,
                        id: null
                    };
                }
            }
        })
        .state('entities.template-detail', {
            parent: 'entities',
            url: '/template/{id}',
            data: {
                authorities: ['TEMPLATE_EDITOR'],
                pageTitle: 'Template',
                tab: {
                    name: 'Templates',
                    kind: 'management',
                    state: 'template.detail',
                    type: '',
                    id: null,
                    cache: true,
                    service: 'templateService',
                    params: null,
                    resource: null
                }
            },
            views: {
                tabContent: {
                    template: require('./detail/template-detail.html'),
                    controller: 'TemplateDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                pageInfo: pageInfo
            }
        })
        .state('entities.template-edit', {
            parent: 'entities',
            url: '/template/{id}/edit',
            data: {
                authorities: ['TEMPLATE_EDITOR'],
                tab: {
                    name: 'Edit Template',
                    kind: 'management',
                    type: 'entity',
                    state: 'entities.template-edit'
                }
            },
            views: {
                tabContent: {
                    template: require('./modal/template-modal.html'),
                    controller: 'TemplateModalController',
                    controllerAs: 'vm'

                }
            },
            resolve: {
                pageInfo: pageInfo
            }
        })
        .state('entities.template.delete', {
            parent: 'entities.template',
            url: '/{id}/delete',
            data: {
                authorities: ['TEMPLATE_EDITOR'],
                tab: {
                    type: ''
                }
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    template: require('./delete-dialog/template-delete-dialog.html'),
                    controller: 'TemplateDeleteController',
                    controllerAs: 'vm',
                    size: 'md'
                }).result.then(function() {
                    $state.go('entities.template', null, {
                        reload: true
                    });
                }, function() {
                    $state.go('^');
                });
            }]
        });

    function pageInfo($stateParams, templateService) {
        return templateService
            .get({id: $stateParams.id})
            .$promise
            .then(function(template) {
                return {
                    entity: template
                };
            });
    }
}

module.exports = templateManagementConfig;
