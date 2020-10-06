import { getSheetIndex } from '../methods/get';
import Store from '../store';

const cellErrorCtrl = {
    cellError: Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"];
    renderCell: function(r, c, start_r, start_c, offsetLeft, offsetTop, luckysheetTableContent){
        let _this = this;
        // [TK] custom error message render or draw (draw a top left red triangle)
        if (_this.cellError != null && _this.cellError[r + '_' + c] != null) {
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
    renderMessage: function(r, c, top, left){
        let _this = this;
        if (_this.cellError != null && _this.cellError[r + '_' + c] != null) {
            let item = _this.cellError[r + '_' + c];
            let hintText;

            hintText = '<span style="color:#FC6666;">ข้อความแจ้งเตือน</span>';

            if(typeof item === 'string'){
                hintText += item;
            }else if(typeof item === 'object' && item.length > 0){
                hintText += '<ul>';
                for(let i = 0; i < item.length; i++){
                    hintText += `<li>${item[i]}</li>`;
                }
                hintText += '</ul>';
            }

            $("#luckysheet-dataVerification-showHintBox").html(hintText).show().css({
                'left': left,
                'top': top
            });

            return true;
        }else{
            return false;
        }
    }
}

export default cellErrorCtrl;