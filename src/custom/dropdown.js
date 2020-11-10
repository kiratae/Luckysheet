import { getUUID, Log } from './utils';

const weDropdownCtrl = {
    log: new Log("weDropdownCtrl"),
    dropdownStorage: [],
    getList: function() {
        return this.dropdownStorage.slice();
    },
    getData: function(id) {
        return this.dropdownStorage.find(item => item.dropdownId === id);
    },
    saveData: function(data) {
        if (!data.dropdownId) {
            // insert
            data.dropdownId = getUUID();
            this.dropdownStorage.push(data);
            return data;
        } else {
            // update
            let index = this.dropdownStorage.findIndex(item => item.dropdownId === id);
            if (index >= 0) {
                this.dropdownStorage[index] = data;
                return data;
            }
        }
    },
    deteleData: function(id) {
        const func = 'deteleData';
        try {
            let index = this.dropdownStorage.findIndex(item => item.dropdownId === id);
            if (index >= 0) {
                delete this.dropdownStorage[index];
                return true;
            } else {
                return false;
            }
        } catch (error) {
            this.log.error(func, `with id "${id}"`);
        }
    }
}

export default weDropdownCtrl;