angular
    .module('indigoeln.Components')
    .controller('EntitiesToSaveController', EntitiesToSaveController);

function EntitiesToSaveController($uibModalInstance, data) {
    var vm = this;

    init();

    function init() {
        vm.entities = _.map(data, function(entity) {
            entity.$$saveEntity = true;

            return entity;
        });

        vm.save = save;
        vm.cancel = cancel;
        vm.isSelected = isSelected;
        vm.discardAll = discardAll;
    }

    function isSelected() {
        return _.some(vm.entities, function(entity) {
            return entity.$$saveEntity;
        });
    }

    function discardAll() {
        _.each(vm.entities, function(entity) {
            entity.$$saveEntity = false;
        });
        $uibModalInstance.close([]);
    }

    function save() {
        var entitiesToSave = _.filter(vm.entities, function(entity) {
            return entity.$$saveEntity;
        });
        $uibModalInstance.close(entitiesToSave);
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }
}
