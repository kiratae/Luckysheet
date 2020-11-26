import { getUUID, Log } from './utils';

const weDropdownCtrl = {
    log: new Log("weDropdownCtrl"),
    dropdownDatas: [],
    getList: function() {
        return this.dropdownDatas.slice();
    },
    getData: function(id) {
        return this.dropdownDatas.find(item => item.dropdownDataId === id);
    },
    saveData: function(data) {
        if (!data.dropdownDataId) {
            // insert
            data.dropdownDataId = getUUID();
            this.dropdownDatas.push(data);
            return data;
        } else {
            // update
            let index = this.dropdownDatas.findIndex(item => item.dropdownDataId === id);
            if (index >= 0) {
                this.dropdownDatas[index] = data;
                return data;
            }
        }
    },
    deteleData: function(id) {
        const func = 'deteleData';
        try {
            let index = this.dropdownDatas.findIndex(item => item.dropdownDataId === id);
            if (index >= 0) {
                delete this.dropdownDatas[index];
                return true;
            } else {
                return false;
            }
        } catch (error) {
            this.log.error(func, `with DropdownDataId "${id}"`);
        }
    }
}

export default weDropdownCtrl;