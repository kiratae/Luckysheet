import Store from '../store';
import weConfigsetting from './configsetting';
import luckysheetFreezen from '../controllers/freezen';
import {
    rowLocation,
    colLocation,
    mouseposition
} from '../global/location';
import { getObjType } from '../utils/util';
import locale from '../locale/locale';
import { selectionCopyShow } from '../controllers/select';
import weAPI from './api';
import { replaceHtml } from '../utils/util';
import { modelHTML } from '../controllers/constant';

const weHandler = {
    registerMouseOverAndOut: function() {
        let tempRow = -1,
            tempCol = -1;
        $('#luckysheet-cell-main').mousemove(function(event) {
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
        }).mouseout(function() {
            if (weConfigsetting.onSheetMouseOut != null && getObjType(weConfigsetting.onSheetMouseOut) == "function") {
                weConfigsetting.onSheetMouseOut();
            }

            tempRow = -1;
            tempCol = -1;
        });
    },
    registerMouseDbClick: function(r, c) {
        if (Store.flowdata[r] != null && Store.flowdata[r][c] != null) {
            if (weConfigsetting.onCellMouseDbClick != null && getObjType(weConfigsetting.onCellMouseDbClick) == "function") {
                weConfigsetting.onCellMouseDbClick(r, c, Store.flowdata[r][c]);
            }
        }
    },
    registerCellClick: function(r1, c1, r2, c2) {
        if (r1 == r2 && c1 == c2) {
            if (Store.flowdata[r1][c1]) {
                if (weConfigsetting.onCellClick != null && getObjType(weConfigsetting.onCellClick) == "function") {
                    weConfigsetting.onCellClick(r1, c1, Store.flowdata[r1][c1]);
                }
            }
        }
    },
    registerSelectHightlightShow: function() {
        if (weConfigsetting.onSelectHightlightShow != null && getObjType(weConfigsetting.onSelectHightlightShow) == "function") {
            weConfigsetting.onSelectHightlightShow();
        }
    },
    initCellRangeEvent: function() {
        $(document).off("click.dvRangeConfirm").on("click.dvRangeConfirm", "#luckysheet-cellRange-dialog-confirm", function(e) {
            // let dataSource = $(this).attr("data-source");
            let txt = $(this).parents("#luckysheet-cellRange-dialog").find("input").val();

            // emit hook onConfirmCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onConfirmCellRange(txt);
            }

            $("#luckysheet-cellRange-dialog").hide();

            let range = [];
            selectionCopyShow(range);
        });
        $(document).off("click.dvRangeClose").on("click.dvRangeClose", "#luckysheet-cellRange-dialog-close", function(e) {
            $("#luckysheet-cellRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click", "#luckysheet-cellRange-dialog .luckysheet-modal-dialog-title-close", function(e) {
            $("#luckysheet-cellRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            let range = [];
            selectionCopyShow(range);
        });
    },
    openCellRange: function(cellRangeTxt) {
        let dataSource = "0";
        // let txt = $(this).siblings("input").val().trim();

        this.rangeDialog(cellRangeTxt);

        let selectRange = [];

        let range = weAPI.getRangeByTxt(cellRangeTxt);
        if (range.length > 0) {
            for (let s = 0; s < range.length; s++) {
                let r1 = range[s].row[0],
                    r2 = range[s].row[1];
                let c1 = range[s].column[0],
                    c2 = range[s].column[1];

                let row = Store.visibledatarow[r2],
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2],
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                selectRange.push({
                    "left": col_pre,
                    "width": col - col_pre - 1,
                    "top": row_pre,
                    "height": row - row_pre - 1,
                    "left_move": col_pre,
                    "width_move": col - col_pre - 1,
                    "top_move": row_pre,
                    "height_move": row - row_pre - 1,
                    "row": [r1, r2],
                    "column": [c1, c2],
                    "row_focus": r1,
                    "column_focus": c1
                });
            }
        }

        selectionCopyShow(selectRange);
    },
    rangeDialog: function(txt) {
        let _this = this;

        const _locale = locale();
        const dvText = _locale.dataVerification;
        const buttonText = _locale.button;

        // emit hook onOpenCellRange
        if (weConfigsetting.onOpenCellRange && typeof weConfigsetting.onOpenCellRange === 'function') {
            weConfigsetting.onOpenCellRange(txt);
        }

        $("body").append(replaceHtml(modelHTML, {
            "id": "luckysheet-cellRange-dialog",
            "addclass": "luckysheet-cellRange-dialog",
            "title": dvText.selectCellRange,
            "content": `<input readonly="readonly" class="form-control bg-white" placeholder="${dvText.selectCellRange2}" value="${txt}"/>`,
            "botton": `<button id="luckysheet-cellRange-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button id="luckysheet-cellRange-dialog-close" class="btn btn-default">${buttonText.close}</button>`,
            "style": "z-index:100003"
        }));
        let $t = $("#luckysheet-cellRange-dialog")
            .find(".luckysheet-modal-dialog-content")
            .css("min-width", 300)
            .end(),
            myh = $t.outerHeight(),
            myw = $t.outerWidth();
        let bodyH = $('body').height();
        let winw = $(weConfigsetting.bodyContainer).width(),
            winh = $(weConfigsetting.bodyContainer).height();
        let scrollLeft = $(document).scrollLeft(),
            scrollTop = $(document).scrollTop();
        let topOffset = $(weConfigsetting.bodyContainer).offset().top
        $("#luckysheet-cellRange-dialog").css({
            "left": (winw - myw) / 2,
            "top": (winh + topOffset - myh) / 2
        }).show();
    },
}

export default weHandler;