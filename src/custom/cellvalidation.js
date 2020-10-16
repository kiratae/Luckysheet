import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';

const weCellValidationCtrl = {
    renderCell: function (r, c, start_r, start_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if(!weConfigsetting.formEditor)
            return;

        let cellValidation = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellvalidation"];
        // [TK] custom validation render or draw (draw a top left red triangle)
        if (cellValidation != null && cellValidation[r + '_' + c] != null) {
            let dv_w = 5 * Store.zoomRatio, dv_h = 5 * Store.zoomRatio; //红色小三角宽高

            luckysheetTableContent.beginPath();
            luckysheetTableContent.moveTo(
                (start_c + offsetLeft),
                (start_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (start_c + offsetLeft + dv_w),
                (start_r + offsetTop)
            );
            luckysheetTableContent.lineTo(
                (start_c + offsetLeft),
                (start_r + offsetTop + dv_h)
            );
            luckysheetTableContent.fillStyle = "#FC6666";
            luckysheetTableContent.fill();
            luckysheetTableContent.closePath();
        }
    }
}

export default weCellValidationCtrl;