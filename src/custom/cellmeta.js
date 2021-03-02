import { getSheetIndex } from '../methods/get';
import weConfigsetting from './configsetting';
import { luckysheetrefreshgrid } from '../global/refresh';
import Store from '../store';
import { Log } from './utils';

let weCellMetaCtrlLogger = new Log("weCellMetaCtrl");

const weCellMetaCtrl = {
    cellMeta: null,
    init: function() {
        const func = 'init';
        weCellMetaCtrlLogger.info(func, `has been called.`);
    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (!weConfigsetting.formEditor)
            return;

        // [TK] custom validation render or draw (draw a top left red triangle)
        if (this.cellMeta != null && this.cellMeta[r + '_' + c] != null) {
            let dv_w = 5 * Store.zoomRatio,
                dv_h = 5 * Store.zoomRatio; //Red small triangle width and height

            // offsetLeft += 2;
            offsetTop -= 3;

            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(
                (start_c + offsetLeft),
                (end_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (start_c + offsetLeft + dv_w),
                (end_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (start_c + offsetLeft),
                (end_r + offsetTop - dv_h)
            );
            luckysheetTableContent.fillStyle = weConfigsetting.cellFlagColor.cellMeta;
            luckysheetTableContent.fill();
            luckysheetTableContent.closePath();
        }
    },
    setCellMeta: function(r, c, obj) {
        if (this.cellMeta == null)
            this.cellMeta = {};
        this.cellMeta[r + '_' + c] = Object.assign({}, obj);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].cellMeta = this.cellMeta;
    },
    getCellMeta: function(r, c) {
        return this.cellMeta[r + '_' + c] ? this.cellMeta[r + '_' + c] : null;
    },
    deleteCellMeta: function(r, c) {
        delete this.cellMeta[r + '_' + c];
    },
    ref: function(historyCellMeta, currentCellMeta, sheetIndex) {
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellMeta";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellMeta"] = historyCellMeta;
            redo["currentCellMeta"] = currentCellMeta;
            Store.jfredo.push(redo);
        }

        _this.cellMeta = currentCellMeta;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellMeta = currentCellMeta;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    }
}

export default weCellMetaCtrl;