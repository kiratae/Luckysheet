import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';
import menuButton from '../controllers/menuButton';

const weCellErrorCtrl = {
    cellFocus: function(r, c, clickMode) {
        if (weConfigsetting.formEditor)
            return;

        $("#luckysheet-cellError-showErrorMsg").hide();

        let row = Store.visibledatarow[r],
            row_pre = r == 0 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
            col_pre = c == 0 ? 0 : Store.visibledatacolumn[c - 1];

        let margeset = menuButton.mergeborer(Store.flowdata, r, c);
        if (!!margeset) {
            row = margeset.row[1];
            row_pre = margeset.row[0];

            col = margeset.column[1];
            col_pre = margeset.column[0];
        }

        // TK custom display error message
        if (this.renderMessage(r, c, row, col_pre))
            return;

    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (weConfigsetting.formEditor)
            return;

        let cellError = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"];
        // [TK] custom error message render or draw (draw a top left red triangle)
        if (cellError != null && cellError[r + '_' + c] != null) {
            let dv_w = 5 * Store.zoomRatio,
                dv_h = 5 * Store.zoomRatio; //红色小三角宽高

            luckysheetTableContent.beginPath();
            if (weConfigsetting.fillErrorInCell) {
                luckysheetTableContent.moveTo(
                    (start_c + offsetLeft),
                    (start_r + offsetTop)
                );
                luckysheetTableContent.lineTo(
                    (end_c + offsetLeft),
                    (start_r + offsetTop)
                );
                luckysheetTableContent.lineTo(
                    (end_c + offsetLeft),
                    (end_r + offsetTop)
                );
                luckysheetTableContent.lineTo(
                    (start_c + offsetLeft),
                    (end_r + offsetTop)
                );
                luckysheetTableContent.fillStyle = "#FF6961";
            } else {
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
            }
            luckysheetTableContent.fill();
            luckysheetTableContent.closePath();
        }
    },
    renderMessage: function(r, c, top, left) {
        if (weConfigsetting.formEditor)
            return false;

        let cellError = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"];
        // console.log('cellError', cellError, cellError[r + '_' + c]);
        if (cellError != null && cellError[r + '_' + c] != null) {
            let item = cellError[r + '_' + c];
            let errorMsg;

            errorMsg = '<span style="color:#FC6666;">';

            if (typeof item === 'string') {
                errorMsg += item;
            } else if (typeof item === 'object' && item.length > 0) {
                errorMsg += '<ul>';
                for (let i = 0; i < item.length; i++) {
                    errorMsg += `<li>${item[i]}</li>`;
                }
                errorMsg += '</ul>';
            }

            errorMsg += '</span>';

            // console.log('hintText', hintText);

            $("#luckysheet-cellError-showErrorMsg").html(errorMsg).show().css({
                'left': left,
                'top': top
            });

            return true;
        } else {
            return false;
        }
    }
}

export default weCellErrorCtrl;