import { getSheetIndex } from '../methods/get';
import weConfigsetting from './configsetting';
import { luckysheetrefreshgrid } from '../global/refresh';
import Store from '../store';

const weCellTagCtrl = {
    cellTag: {},
    init: function() {
        console.log('weCellTagCtrl::init');
    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (!weConfigsetting.formEditor)
            return;

        // [TK] custom validation render or draw (draw a top left red triangle)
        if (this.cellTag != null && this.cellTag[r + '_' + c] != null) {
            let dv_w = 5 * Store.zoomRatio,
                dv_h = 5 * Store.zoomRatio; //Red small triangle width and height

            offsetLeft -= 2;
            offsetTop += 1;

            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(
                (end_c + offsetLeft),
                (start_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (end_c + offsetLeft - dv_w),
                (start_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (end_c + offsetLeft),
                (start_r + offsetTop + dv_h)
            );
            luckysheetTableContent.fillStyle = "#1ea67d";
            luckysheetTableContent.fill();
            luckysheetTableContent.closePath();
        }
    },
    setCellTag: function(r, c, obj) {
        this.cellTag[r + '_' + c] = Object.assign({}, obj);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].cellTag = this.cellTag;
    },
    getCellTag: function(r, c) {
        return this.cellTag[r + '_' + c] ? this.cellTag[r + '_' + c] : null;
    },
    deleteCellTag: function(r, c) {
        delete this.cellTag[r + '_' + c];
    },
    ref: function(historyCellTag, currentCellTag, sheetIndex) {
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellTag";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellTag"] = historyCellTag;
            redo["currentCellTag"] = currentCellTag;
            Store.jfredo.push(redo);
        }

        _this.cellTag = currentCellTag;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellTag = currentCellTag;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
}

export default weCellTagCtrl;