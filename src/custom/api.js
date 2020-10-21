import luckysheetformula from '../global/formula';
import formula from '../global/formula';
import Store from '../store';
import { setAccuracy, setcellvalue } from "../global/setdata";
import { getSheetIndex, getRangetxt } from '../methods/get';

const weAPI = {
    setCellValue: function (row, column, data, value) {
        console.log('weAPI::setCellValue', value);
        let curv = {};

        if (value.ro != null) {
            curv.ro = value.ro;
        }
        if (value.iv != null) {
            curv.iv = value.iv;
        }
        if (value.tp != null) {
            curv.tp = value.tp;
        }

        if (value.df != null && value.v == null) {
            curv.df = value.df;
            if (value.ct != null) {
                curv.ct = value.ct;
            }
            data = luckysheetformula.updatecell(row, column, curv, false).data;//update formula value
        }
        else {
            if (value.ct != null) {
                curv.ct = value.ct;
            }
            if (value.df != null) {
                curv.df = value.df;
            }
            if (value.v != null) {
                curv.v = value.v;
            }
            if (value.m != null) {
                curv.m = value.m;
            }
            formula.delFunctionGroup(row, column);
            setcellvalue(row, column, data, curv);//update text value
        }
        return data;
    },
    clearCell: function (cell) {
        console.log('weAPI::clearCell', cell);
        delete cell["ro"];
        delete cell["iv"];
        delete cell["tp"];
        delete cell["df"];
    },
    getSelectedCell: function () {
        // [ range, txt, isMerge ]
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rf = range["row_focus"], cf = range["column_focus"];
        if (Store.config["merge"] != null && (rf + "_" + cf) in Store.config["merge"]) {
            return [
                range, 
                getRangetxt(Store.currentSheetIndex, {
                    column: [cf, cf],
                    row: [rf, rf],
                }),
                true
            ];
        }
        else {
            return [ range , getRangetxt(Store.currentSheetIndex, range), false ]
        }
    },
    getRangeByTxt: function(txt){
        let range = [];

        if(txt.indexOf(",") != -1){
            let arr = txt.split(",");
            for(let i = 0; i < arr.length; i++){
                if(formula.iscelldata(arr[i])){
                    range.push(formula.getcellrange(arr[i]));
                }
                else{
                    range = [];
                    break;    
                }
            }
        }
        else{
            if(formula.iscelldata(txt)){
                range.push(formula.getcellrange(txt));
            }
        }

        return range;
    }
}

export default weAPI;