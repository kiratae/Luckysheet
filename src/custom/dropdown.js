import Store from '../store';
import weConfigsetting from './configsetting';
import { getUUID, Log } from './utils';
import { getSheetIndex, getRangetxt } from '../methods/get';

const weDropdownCtrl = {
    log: new Log("weDropdownCtrl", weConfigsetting.isLog),
    dropdownDatas: [],
    init: function() {
        const func = 'init';
        this.log.info(func, 'has been called.');
    },
    getList: function() {
        return this.dropdownDatas.slice();
    },
    getData: function(id) {
        return this.dropdownDatas.find(item => item.dropdownDataId == id);
    },
    saveData: function(data) {
        if (!data.dropdownDataId) {
            // insert
            data.dropdownDataId = getUUID();
            this.dropdownDatas.push(data);
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdownDatas"] = this.dropdownDatas;
            return data;
        } else {
            // update
            let index = this.dropdownDatas.findIndex(item => item.dropdownDataId === data.dropdownDataId);
            if (index >= 0) {
                this.dropdownDatas[index] = data;
                Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdownDatas"] = this.dropdownDatas;
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
                Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdownDatas"] = this.dropdownDatas;
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