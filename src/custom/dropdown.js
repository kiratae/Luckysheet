import Store from '../store';
import { getUUID, Log } from './utils';
import { getSheetIndex, getRangetxt } from '../methods/get';

let weDropdownCtrlLogger = new Log("weDropdownCtrl");

const weDropdownCtrl = {
    dropdownDatas: [],
    init: function() {
        const func = 'init';
        weDropdownCtrlLogger.info(func, 'has been called.');
    },
    getList: function() {
        if (this.dropdownDatas) {
            return this.dropdownDatas.slice();
        } else {
            return [];
        }
    },
    getDataById: function(id) {
        return this.dropdownDatas.find(item => item.formMDGroupId == id);
    },
    getDataByCode: function(code) {
        return this.dropdownDatas.find(item => item.code == code);
    },
    saveData: function(data) {
        if (!data.formMDGroupId) {
            // insert
            data.formMDGroupId = getUUID();
            this.dropdownDatas.push(data);
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdownDatas"] = this.dropdownDatas;
            return data;
        } else {
            // update
            let index = this.dropdownDatas.findIndex(item => item.formMDGroupId === data.formMDGroupId);
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
            let index = this.dropdownDatas.findIndex(item => item.formMDGroupId === id);
            if (index >= 0) {
                this.dropdownDatas.splice(index, 1);
                Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdownDatas"] = this.dropdownDatas;
                return true;
            } else {
                return false;
            }
        } catch (error) {
            weDropdownCtrlLogger.error(func, `with FormMDGroupId "${id}"`);
        }
    }
}

export default weDropdownCtrl;