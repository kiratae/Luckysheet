import Store from '../store';
import weConfigsetting from './configsetting';
import luckysheetFreezen from '../controllers/freezen';
import {
    rowLocation,
    colLocation,
    mouseposition
} from '../global/location';
import { getObjType } from '../utils/util';

const weHandler = {
    registerMouseOverAndOut: function () {
        let tempRow = -1,
            tempCol = -1;
        $('#luckysheet-cell-main').mousemove(function (event) {
            let mouse = mouseposition(event.pageX, event.pageY);
            if (mouse[0] >= Store.cellmainWidth - Store.cellMainSrollBarSize || mouse[1] >= Store.cellmainHeight - Store.cellMainSrollBarSize) {
                return;
            }

            let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
            let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

            if (luckysheetFreezen.freezenverticaldata != null && mouse[0] < (luckysheetFreezen.freezenverticaldata[0] - luckysheetFreezen.freezenverticaldata[2])) {
                x = mouse[0] + luckysheetFreezen.freezenverticaldata[2];
            }

            if (luckysheetFreezen.freezenhorizontaldata != null && mouse[1] < (luckysheetFreezen.freezenhorizontaldata[0] - luckysheetFreezen.freezenhorizontaldata[2])) {
                y = mouse[1] + luckysheetFreezen.freezenhorizontaldata[2];
            }

            let row_index = rowLocation(y)[2];
            let col_index = colLocation(x)[2];

            // console.log('mouse over');
            if (tempRow != row_index || tempCol != col_index) {
                if (tempRow != -1 && tempCol != -1) {
                    if (weConfigsetting.onCellMouseOut != null && getObjType(weConfigsetting.onCellMouseOut) == "function") {
                        weConfigsetting.onCellMouseOut(tempRow, tempCol, Store.flowdata[tempRow][tempCol]);
                    }
                }
                tempRow = row_index;
                tempCol = col_index;
                if (weConfigsetting.onCellMouseOver != null && getObjType(weConfigsetting.onCellMouseOver) == "function") {
                    weConfigsetting.onCellMouseOver(row_index, col_index, Store.flowdata[row_index][col_index]);
                }
            } else if (tempRow == row_index && tempCol == col_index) {
                return false;
            }
        }).mouseout(function () {
            if (weConfigsetting.onSheetMouseOut != null && getObjType(weConfigsetting.onSheetMouseOut) == "function") {
                weConfigsetting.onSheetMouseOut();
            }

            tempRow = -1;
            tempCol = -1;
        });
    },
    registerMouseDbClick: function (r, c) {
        if (Store.flowdata[r] != null && Store.flowdata[r][c] != null) {
            if (weConfigsetting.onCellMouseDbClick != null && getObjType(weConfigsetting.onCellMouseDbClick) == "function") {
                weConfigsetting.onCellMouseDbClick(r, c, Store.flowdata[r][c]);
            }
        }
    },
    registerCellClick: function (r1, c1, r2, c2) {
        if (r1 == r2 && c1 == c2) {
            if (Store.flowdata[r1][c1]) {
                if (weConfigsetting.onCellClick != null && getObjType(weConfigsetting.onCellClick) == "function") {
                    weConfigsetting.onCellClick(r1, c1, Store.flowdata[r1][c1]);
                }
            }
        }
    },
    registerSelectHightlightShow: function () {
        if (weConfigsetting.onSelectHightlightShow != null && getObjType(weConfigsetting.onSelectHightlightShow) == "function") {
            weConfigsetting.onSelectHightlightShow();
        }
    },
}

export default weHandler;