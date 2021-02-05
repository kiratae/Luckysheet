import Store from '../store';
import weConfigsetting from './configsetting';
import luckysheetFreezen from '../controllers/freezen';
import { getSheetIndex, getRangetxt } from '../methods/get';
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
import { modelHTML, keycode } from '../controllers/constant';
import menuButton from '../controllers/menuButton';
import formula from '../global/formula';

const weHandler = {
    selectRange: [],
    selectStatus: false,
    selectKey: '',
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
    registerSelectSingleHightlightShow: function(r, c) {
        if (weConfigsetting.onSelectSingleHightlightShow != null && getObjType(weConfigsetting.onSelectSingleHightlightShow) == "function") {
            weConfigsetting.onSelectSingleHightlightShow(r, c);
        }
    },
    initCellRangeEvent: function() {
        let self = this;
        // cellRange
        $(document).on("click", "#luckysheet-cellRange-dialog-confirm", function(e) {
            // let dataSource = $(this).attr("data-source");
            let txt = $(this).parents("#luckysheet-cellRange-dialog").find("input").val();

            // emit hook onConfirmCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onConfirmCellRange(txt, self.selectKey);
            }

            $("#luckysheet-cellRange-dialog").hide();

            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click", "#luckysheet-cellRange-dialog-close", function(e) {
            $("#luckysheet-cellRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            self.selectKey = '';
            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click", "#luckysheet-cellRange-dialog .luckysheet-modal-dialog-title-close", function(e) {
            $("#luckysheet-cellRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            self.selectKey = '';
            let range = [];
            selectionCopyShow(range);
        });

        // cellSingleRange
        $(document).on("click", "#luckysheet-cellSingleRange-dialog-confirm", function(e) {
            // let dataSource = $(this).attr("data-source");
            let txt = $(this).parents("#luckysheet-cellSingleRange-dialog").find("input").val();

            // emit hook onConfirmCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onConfirmCellRange(txt, self.selectKey);
            }

            $("#luckysheet-cellSingleRange-dialog").hide();

            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click", "#luckysheet-cellSingleRange-dialog-close", function(e) {
            $("#luckysheet-cellSingleRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            self.selectKey = '';
            let range = [];
            selectionCopyShow(range);
        });
        $(document).on("click", "#luckysheet-cellSingleRange-dialog .luckysheet-modal-dialog-title-close", function(e) {
            $("#luckysheet-cellSingleRange-dialog").hide();

            // emit hook onCloseCellRange
            if (weConfigsetting.onConfirmCellRange && typeof weConfigsetting.onConfirmCellRange === 'function') {
                weConfigsetting.onCloseCellRange();
            }

            self.selectKey = '';
            let range = [];
            selectionCopyShow(range);
        });
    },
    openCellRange: function(cellRangeTxt, key, isSingle = false) {
        this.selectRange = [];
        this.selectKey = key;

        if (isSingle)
            this.singleRangeDialog(cellRangeTxt);
        else
            this.rangeDialog(cellRangeTxt);

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

                this.selectRange.push({
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

        selectionCopyShow(this.selectRange);
    },
    rangeDialog: function(txt) {
        // console.log('weHandler::rangeDialog');

        $("#luckysheet-cellRange-dialog").remove();

        const _locale = locale();
        const weText = _locale.weHandler;
        const buttonText = _locale.button;

        // emit hook onOpenCellRange
        if (weConfigsetting.onOpenCellRange && typeof weConfigsetting.onOpenCellRange === 'function') {
            weConfigsetting.onOpenCellRange(txt);
        }

        $("body").append(replaceHtml(modelHTML, {
            "id": "luckysheet-cellRange-dialog",
            "addclass": "luckysheet-cellRange-dialog",
            "title": weText.selectCellRange,
            "content": `<input readonly="readonly" class="form-control bg-white" placeholder="${weText.selectCellRange2}" value="${txt}"/>`,
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
    singleRangeDialog: function(txt) {
        // console.log('weHandler::rangeDialog');

        $("#luckysheet-cellSingleRange-dialog").remove();

        const _locale = locale();
        const weText = _locale.weHandler;
        const buttonText = _locale.button;

        // emit hook onOpenCellRange
        if (weConfigsetting.onOpenCellRange && typeof weConfigsetting.onOpenCellRange === 'function') {
            weConfigsetting.onOpenCellRange(txt);
        }

        $("body").append(replaceHtml(modelHTML, {
            "id": "luckysheet-cellSingleRange-dialog",
            "addclass": "luckysheet-cellSingleRange-dialog",
            "title": weText.selectCell,
            "content": `<input readonly="readonly" class="form-control bg-white" placeholder="${weText.selectCell2}" value="${txt}"/>`,
            "botton": `<button id="luckysheet-cellSingleRange-dialog-confirm" class="btn btn-primary">${buttonText.confirm}</button>
                        <button id="luckysheet-cellSingleRange-dialog-close" class="btn btn-default">${buttonText.close}</button>`,
            "style": "z-index:100003"
        }));
        let $t = $("#luckysheet-cellSingleRange-dialog")
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
        $("#luckysheet-cellSingleRange-dialog").css({
            "left": (winw - myw) / 2,
            "top": (winh + topOffset - myh) / 2
        }).show();
    },
    selectCellHandler: function(event, row, row_pre, row_index, row_index_ed, col, col_pre, col_index, col_index_ed) {

        if ($("#luckysheet-cellSingleRange-dialog").is(":visible")) {
            Store.luckysheet_select_status = false;

            selectionCopyShow([{ "row": [row_index, row_index], "column": [col_index, col_index] }]);

            let range = getRangetxt(
                Store.currentSheetIndex, { "row": [row_index, row_index], "column": [col_index, col_index] },
                Store.currentSheetIndex
            );
            $("#luckysheet-cellSingleRange-dialog input").val(range);

            return true;
            // Store.luckysheet_select_status = false;
            // formula.rangestart = false;

            // $("#luckysheet-formula-functionrange-select").css({
            //     "left": col_pre,
            //     "width": col - col_pre - 1,
            //     "top": row_pre,
            //     "height": row - row_pre - 1
            // }).show();
            // $("#luckysheet-formula-help-c").hide();

            // let range = getRangetxt(
            //     Store.currentSheetIndex, { "row": [row_index, row_index], "column": [col_index, col_index] },
            //     Store.currentSheetIndex
            // );
            // $("#luckysheet-cellSingleRange-dialog input").val(range);

            // return true;
        }

        if ($("#luckysheet-cellRange-dialog").is(":visible")) {
            this.selectStatus = true;
            Store.luckysheet_select_status = false;

            if (event.shiftKey) {
                let last = this.selectRange[this.selectRange.length - 1];

                let top = 0,
                    height = 0,
                    rowseleted = [];
                if (last.top > row_pre) {
                    top = row_pre;
                    height = last.top + last.height - row_pre;

                    if (last.row[1] > last.row_focus) {
                        last.row[1] = last.row_focus;
                    }

                    rowseleted = [row_index, last.row[1]];
                } else if (last.top == row_pre) {
                    top = row_pre;
                    height = last.top + last.height - row_pre;
                    rowseleted = [row_index, last.row[0]];
                } else {
                    top = last.top;
                    height = row - last.top - 1;

                    if (last.row[0] < last.row_focus) {
                        last.row[0] = last.row_focus;
                    }

                    rowseleted = [last.row[0], row_index];
                }

                let left = 0,
                    width = 0,
                    columnseleted = [];
                if (last.left > col_pre) {
                    left = col_pre;
                    width = last.left + last.width - col_pre;

                    if (last.column[1] > last.column_focus) {
                        last.column[1] = last.column_focus;
                    }

                    columnseleted = [col_index, last.column[1]];
                } else if (last.left == col_pre) {
                    left = col_pre;
                    width = last.left + last.width - col_pre;
                    columnseleted = [col_index, last.column[0]];
                } else {
                    left = last.left;
                    width = col - last.left - 1;

                    if (last.column[0] < last.column_focus) {
                        last.column[0] = last.column_focus;
                    }

                    columnseleted = [last.column[0], col_index];
                }

                let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, top, height, left, width);
                if (changeparam != null) {
                    columnseleted = changeparam[0];
                    rowseleted = changeparam[1];
                    top = changeparam[2];
                    height = changeparam[3];
                    left = changeparam[4];
                    width = changeparam[5];
                }

                last["row"] = rowseleted;
                last["column"] = columnseleted;

                last["left_move"] = left;
                last["width_move"] = width;
                last["top_move"] = top;
                last["height_move"] = height;

                this.selectRange[this.selectRange.length - 1] = last;
            } else {
                this.selectRange = [];
                this.selectRange.push({
                    "left": col_pre,
                    "width": col - col_pre - 1,
                    "top": row_pre,
                    "height": row - row_pre - 1,
                    "left_move": col_pre,
                    "width_move": col - col_pre - 1,
                    "top_move": row_pre,
                    "height_move": row - row_pre - 1,
                    "row": [row_index, row_index_ed],
                    "column": [col_index, col_index_ed],
                    "row_focus": row_index,
                    "column_focus": col_index
                });
            }

            selectionCopyShow(this.selectRange);

            let range = weAPI.getTxtByRange(this.selectRange);
            $("#luckysheet-cellRange-dialog input").val(range);

            return true;
        } else {
            this.selectStatus = false;
            this.selectRange = [];
        }
    },
    fuunctionInputControl: function(selector, event) {
        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;

        if (kcode == keycode.ENTER) {
            if ($("#luckysheet-formula-search-c").is(":visible") && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter($("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item-active"));
            } else {
                formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                Store.luckysheet_select_save = [{ "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]], "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]], "row_focus": Store.luckysheetCellUpdate[0], "column_focus": Store.luckysheetCellUpdate[1] }];
                luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");
            }
            event.preventDefault();
        } else if (kcode == keycode.ESC) {
            formula.dontupdate();
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            event.preventDefault();
        } else if (kcode == keycode.F4) {
            formula.setfreezonFuc(event);
            event.preventDefault();
        } else if (kcode == keycode.UP) {
            if ($("#luckysheet-formula-search-c").is(":visible")) {
                let $up = $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item-active").prev();
                if ($up.length == 0) {
                    $up = $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item").last();
                }
                $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item").removeClass("luckysheet-formula-search-item-active");
                $up.addClass("luckysheet-formula-search-item-active");
                event.preventDefault();
            }
        } else if (kcode == keycode.DOWN) {
            if ($("#luckysheet-formula-search-c").is(":visible")) {
                let $up = $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item-active").next();
                if ($up.length == 0) {
                    $up = $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item").first();
                }
                $("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item").removeClass("luckysheet-formula-search-item-active");
                $up.addClass("luckysheet-formula-search-item-active");
                event.preventDefault();
            }
        } else if (kcode == keycode.LEFT) {
            formula.rangeHightlightselected($(selector));
        } else if (kcode == keycode.RIGHT) {
            formula.rangeHightlightselected($(selector));
        } else if (!((kcode >= 112 && kcode <= 123) || kcode <= 46 || kcode == 144 || kcode == 108 || event.ctrlKey || event.altKey || (event.shiftKey && (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40))) || kcode == 8 || kcode == 32 || kcode == 46 || (event.ctrlKey && kcode == 86)) {
            this.functionInputHandler(selector, kcode);
        }
    },
    functionInputHandler: function(selector, kcode) {
        let _this = this;

        let $editer = $(selector);
        let value1 = $editer.html(),
            value1txt = $editer.text();

        setTimeout(function() {
            let value = $editer.text(),
                valuetxt = value;

            if (value.length > 0 && value.substr(0, 1) == "=" && (kcode != 229 || value.length == 1)) {
                value = formula.functionHTMLGenerate(value);
                value1 = formula.functionHTMLGenerate(value1txt);

                if (window.getSelection) { // all browsers, except IE before version 9
                    let currSelection = window.getSelection();
                    if ($(currSelection.anchorNode).is("div")) {
                        let editorlen = $(`${selector} span`).length;
                        formula.functionRangeIndex = [editorlen - 1, $(selector).find("span").eq(editorlen - 1).text().length];
                    } else {
                        formula.functionRangeIndex = [$(currSelection.anchorNode).parent().index(), currSelection.anchorOffset];
                    }
                } else { // Internet Explorer before version 9
                    let textRange = document.selection.createRange();
                    formula.functionRangeIndex = textRange;
                }

                $editer.html(value);
                formula.functionRange($editer, value, value1);
                formula.canceFunctionrangeSelected();

                if (kcode != 46) { //delete不执行此函数
                    formula.createRangeHightlight();
                }

                // $copy.html(value);
                formula.rangestart = false;
                formula.rangedrag_column_start = false;
                formula.rangedrag_row_start = false;

                formula.rangeHightlightselected($editer, kcode);

            }
        }, 1);

    }
}

export default weHandler;