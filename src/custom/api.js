import luckysheetformula from '../global/formula';
import formula from '../global/formula';
import { setAccuracy, setcellvalue } from "../global/setdata";

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
    }
}

export default weAPI;