import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';

const weCellErrorCtrl = {
    renderCell: function (r, c, start_r, start_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if(weConfigsetting.formEditor)
            return;

        let cellError = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"];
        // [TK] custom error message render or draw (draw a top left red triangle)
        if (cellError != null && cellError[r + '_' + c] != null) {
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
    },
    renderMessage: function (r, c, top, left) {
        if(weConfigsetting.formEditor)
            return;
            
        let cellError = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"];
        if (cellError != null && cellError[r + '_' + c] != null) {
            let item = cellError[r + '_' + c];
            let hintText;

            hintText = '<span style="color:#FC6666;">ข้อความแจ้งเตือน</span>';

            if (typeof item === 'string') {
                hintText += item;
            } else if (typeof item === 'object' && item.length > 0) {
                hintText += '<ul>';
                for (let i = 0; i < item.length; i++) {
                    hintText += `<li>${item[i]}</li>`;
                }
                hintText += '</ul>';
            }

            $("#luckysheet-dataVerification-showHintBox").html(hintText).show().css({
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