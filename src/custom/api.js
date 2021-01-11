import luckysheetformula from '../global/formula';
import formula from '../global/formula';
import Store from '../store';
import { setAccuracy, setcellvalue } from "../global/setdata";
import { getSheetIndex, getRangetxt } from '../methods/get';
import weHandler from './handler';
import { Log } from './utils';

let weAPILogger = new Log("weAPI");

const weAPI = {
    setCellValue: function(row, column, data, value) {
        const func = 'setCellValue';
        weAPILogger.info(func, `at row ${row}, column ${column}, value ${value.toString()}`);

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

        if (value.sv != null) {
            curv.sv = value.sv;
        }

        if (value.df != null && value.v == null) {
            curv.df = value.df;
            if (value.ct != null) {
                curv.ct = value.ct;
            }
            data = luckysheetformula.updatecell(row, column, curv, false).data; //update formula value
        } else {
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
            setcellvalue(row, column, data, curv); //update text value
        }

        return data;
    },
    clearCell: function(cell) {
        const func = 'clearCell';
        weAPILogger.info(func, `at cell ${cell.toString()}`);
        delete cell["ro"];
        delete cell["iv"];
        delete cell["tp"];
        delete cell["df"];
        delete cell["sv"];
    },
    getSelectedCell: function() {
        // [ range, txt, isMerge ]
        let range = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rf = range["row_focus"],
            cf = range["column_focus"];
        if (Store.config["merge"] != null && (rf + "_" + cf) in Store.config["merge"]) {
            return [
                range,
                getRangetxt(Store.currentSheetIndex, {
                    column: [cf, cf],
                    row: [rf, rf],
                }),
                true
            ];
        } else {
            return [range, getRangetxt(Store.currentSheetIndex, range), false]
        }
    },
    getTxtByRange: function(range) {
        if (range.length > 0) {
            let txt = [];

            for (let s = 0; s < range.length; s++) {
                let r1 = range[s].row[0],
                    r2 = range[s].row[1];
                let c1 = range[s].column[0],
                    c2 = range[s].column[1];

                txt.push(getRangetxt(Store.currentSheetIndex, { "row": [r1, r2], "column": [c1, c2] }, Store.currentSheetIndex));
            }

            return txt.join(",");
        }
    },
    getRangeByTxt: function(txt) {
        let range = [];

        if (txt.indexOf(",") != -1) {
            let arr = txt.split(",");
            for (let i = 0; i < arr.length; i++) {
                if (formula.iscelldata(arr[i])) {
                    range.push(formula.getcellrange(arr[i]));
                } else {
                    range = [];
                    break;
                }
            }
        } else {
            if (formula.iscelldata(txt)) {
                range.push(formula.getcellrange(txt));
            }
        }

        return range;
    },
    openCellRange: function(cellRangeTxt, key, isSingle = false) {
        weHandler.openCellRange(cellRangeTxt, key, isSingle);
    },
    insertUpdateVariable: function(r, c, index) {
        luckysheetformula.insertUpdateFunctionGroup(r, c, index);
    }
}

export default weAPI;