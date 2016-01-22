'use strict';

angular
    .module('indigoeln')
    .factory('notebookService', function ($resource) {
        return $resource('api/notebooks/:id', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
    });
