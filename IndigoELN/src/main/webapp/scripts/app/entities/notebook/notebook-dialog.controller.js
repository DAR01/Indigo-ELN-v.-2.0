'use strict';

angular.module('indigoeln')
    .controller('NotebookDialogController',
        function ($scope, $rootScope, $stateParams, $state, Notebook, AlertService, PermissionManagement, notebook,
                  identity, isContentEditor, hasEditAuthority, hasCreateChildAuthority) {

            $scope.notebook = notebook;
            $scope.notebook.author = $scope.notebook.author || identity;
            $scope.notebook.accessList = $scope.notebook.accessList || PermissionManagement.getAuthorAccessList(identity);
            $scope.projectId = $stateParams.projectId;

            PermissionManagement.setEntity('Notebook');
            PermissionManagement.setAuthor($scope.notebook.author);
            PermissionManagement.setAccessList($scope.notebook.accessList);

            var onAccessListChangedEvent = $scope.$on('access-list-changed', function(event) {
                $scope.notebook.accessList = PermissionManagement.getAccessList();
            });
            $scope.$on('$destroy', function() {
                onAccessListChangedEvent();
            });

            // isEditAllowed
            PermissionManagement.hasPermission('UPDATE_ENTITY').then(function (hasEditPermission) {
                $scope.isEditAllowed = isContentEditor || hasEditAuthority && hasEditPermission;
            });
            // isCreateChildAllowed
            PermissionManagement.hasPermission('CREATE_SUB_ENTITY').then(function (hasCreateChildPermission) {
                $scope.isCreateChildAllowed = isContentEditor || hasCreateChildAuthority && hasCreateChildPermission;
            });

            $scope.show = function(form) {
                if ($scope.isEditAllowed) {
                    form.$show();
                }
            };

            var onSaveSuccess = function (result) {
                $scope.isSaving = false;
                AlertService.success('Notebook successfully saved');
                $rootScope.$broadcast('notebook-created', {id: result.id, projectId: $scope.projectId});
                $state.go('entities.notebook-detail', {projectId: $stateParams.projectId, notebookId: result.id});
            };

            var onSaveError = function (result) {
                $scope.isSaving = false;
                AlertService.error('Error saving notebook: ' + result);
            };

            $scope.save = function () {
                $scope.isSaving = true;
                $scope.notebook.accessList = PermissionManagement.expandPermission($scope.notebook.accessList);

                if ($scope.notebook.id) {
                    Notebook.update({
                        projectId: $stateParams.projectId
                    }, $scope.notebook, onSaveSuccess, onSaveError);
                } else {
                    Notebook.save({
                        projectId: $stateParams.projectId
                    }, $scope.notebook, onSaveSuccess, onSaveError);
                }
            };
        });