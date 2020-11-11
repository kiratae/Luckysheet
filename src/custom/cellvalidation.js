import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';
import menuButton from '../controllers/menuButton';
import formula from '../global/formula';
import editor from '../global/editor';
import { setcellvalue } from '../global/setdata';
import { getcellvalue } from '../global/getdata';
import { luckysheetrefreshgrid } from '../global/refresh';

const weCellValidationCtrl = {
    cellValidation: {},
    init: function() {
        console.log('weCellValidationCtrl::init');
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].cellValidation = this.cellValidation;
        const self = this;

        $(document).off("click.dropdownBtn").on("click.dropdownBtn", "#luckysheet-cellValidation-dropdown-btn", function(e) {
            self.dropdownListShow();
            e.stopPropagation();
        });
        $(document).off("click.dropdownListItem").on("click.dropdownListItem", "#luckysheet-cellValidation-dropdown-List .dropdown-List-item", function(e) {
            $("#luckysheet-cellValidation-dropdown-List").hide();

            let value = e.target.innerText;
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let rowIndex = last.row_focus;
            let colIndex = last.column_focus;

            $("#luckysheet-rich-text-editor").text(value);
            formula.updatecell(rowIndex, colIndex);

            e.stopPropagation();
        });
    },
    getDOM: function() {
        return `
            <div id="luckysheet-cellValidation-dropdown-btn"></div>
            <div id="luckysheet-cellValidation-dropdown-List" class="luckysheet-mousedown-cancel"></div>`;
    },
    renderCell: function(r, c, start_r, start_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (!weConfigsetting.formEditor)
            return;

        // [TK] custom validation render or draw (draw a top left red triangle)
        if (this.cellValidation != null && this.cellValidation[r + '_' + c] != null) {
            let dv_w = 5 * Store.zoomRatio,
                dv_h = 5 * Store.zoomRatio; //红色小三角宽高

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
    cellFocus: function(r, c, clickMode) {
        $("#luckysheet-cellValidation-dropdown-btn").hide();

        const self = this;

        if (self.cellValidation == null || self.cellValidation[r + '_' + c] == null) {
            $("#luckysheet-cellValidation-dropdown-List").hide();
            return;
        }

        let row = Store.visibledatarow[r],
            row_pre = r == 0 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
            col_pre = c == 0 ? 0 : Store.visibledatacolumn[c - 1];

        let mergeset = menuButton.mergeborer(Store.flowdata, r, c);
        if (!!mergeset) {
            row = mergeset.row[1];
            row_pre = mergeset.row[0];

            col = mergeset.column[1];
            col_pre = mergeset.column[0];
        }

        let item = self.cellValidation[r + '_' + c];

        // if(clickMode && item.type == 'checkbox'){
        //     _this.checkboxChange(r, c);
        //     return;
        // }

        if (item.ruleType == 'inSet') {
            $("#luckysheet-cellValidation-dropdown-btn").show().css({
                'max-width': col - col_pre,
                'max-height': row - row_pre,
                'left': col - 20,
                'top': row_pre + (row - row_pre - 20) / 2
            })

            if ($("#luckysheet-cellValidation-dropdown-List").is(":visible")) {
                let dataIndex = $("#luckysheet-cellValidation-dropdown-List").prop("data-index");

                if (dataIndex != (r + '_' + c)) {
                    $("#luckysheet-cellValidation-dropdown-List").hide();
                }
            }
        } else {
            $("#luckysheet-cellValidation-dropdown-List").hide();
        }
    },
    dropdownListShow: function() {
        $("#luckysheet-cellError-showErrorMsg").hide();

        console.log('weDropdown::dropdownListShow');

        const self = this;

        let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rowIndex = last.row_focus;
        let colIndex = last.column_focus;

        let row = Store.visibledatarow[rowIndex],
            row_pre = rowIndex == 0 ? 0 : Store.visibledatarow[rowIndex - 1];
        let col = Store.visibledatacolumn[colIndex],
            col_pre = colIndex == 0 ? 0 : Store.visibledatacolumn[colIndex - 1];

        let mergeset = menuButton.mergeborer(Store.flowdata, rowIndex, colIndex);
        if (!!mergeset) {
            row = mergeset.row[1];
            row_pre = mergeset.row[0];

            col = mergeset.column[1];
            col_pre = mergeset.column[0];
        }

        let item = self.cellValidation[rowIndex + '_' + colIndex];
        let list = self.getDropdownList(item);

        let optionHtml = '';
        list.forEach(i => {
            optionHtml += `<div class="dropdown-List-item luckysheet-mousedown-cancel">${i}</div>`;
        })

        $("#luckysheet-cellValidation-dropdown-List")
            .html(optionHtml)
            .prop("data-index", rowIndex + '_' + colIndex)
            .show()
            .css({
                'width': col - col_pre - 1,
                'left': col_pre,
                'top': row,
            });

    },
    getDropdownList: function(value) {
        let list = [];
        if (value.inSet != null) {
            let arr = value.inSet.split(",");

            for (let i = 0; i < arr.length; i++) {
                let v = arr[i];

                if (v.length == 0) {
                    continue;
                }

                if (!list.includes(v)) {
                    list.push(v);
                }
            }
        } else if (value.inSet != null) {

        }
        console.log('weCellValidationCtrl::getDropdownList', list);
        return list;
        // let ddl = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dropdown"];
    },
    setCellValidation: function(r, c, obj) {
        this.cellValidation[r + '_' + c] = Object.assign({}, obj);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].cellValidation = this.cellValidation;
    },
    setCellValidations: function(range, obj) {
        if (range.length == 0)
            return;

        let str = range[range.length - 1].row[0],
            edr = range[range.length - 1].row[1],
            stc = range[range.length - 1].column[0],
            edc = range[range.length - 1].column[1];
        let d = editor.deepCopyFlowData(Store.flowdata);

        if (str < 0) {
            str = 0;
        }

        if (edr > d.length - 1) {
            edr = d.length - 1;
        }

        if (stc < 0) {
            stc = 0;
        }

        if (edc > d[0].length - 1) {
            edc = d[0].length - 1;
        }

        let historyCellValidation = $.extend(true, {}, this.cellValidation);
        let currentCellValidation = $.extend(true, {}, this.cellValidation);

        for (let r = str; r <= edr; r++) {
            for (let c = stc; c <= edc; c++) {
                currentCellValidation[r + '_' + c] = obj;

                if (obj.isReadonly) {
                    setcellvalue(r, c, d, { ro: true });
                }
            }
        }

        if (obj.isReadonly) {
            this.refOfReadonly(historyCellValidation, currentCellValidation, Store.currentSheetIndex, d, range[range.length - 1]);
        } else {
            this.ref(historyCellValidation, currentCellValidation, Store.currentSheetIndex);
        }

    },
    getCellValidation: function(r, c) {
        return this.cellValidation[r + '_' + c] ? this.cellValidation[r + '_' + c] : null;
    },
    deleteCellValidation: function(r, c) {
        delete this.cellValidation[r + '_' + c];
    },
    deleteCellValidations: function(range) {
        if (range.length == 0)
            return;

        let historyCellValidation = $.extend(true, {}, this.cellValidation);
        let currentCellValidation = $.extend(true, {}, this.cellValidation);

        let str = range[range.length - 1].row[0],
            edr = range[range.length - 1].row[1],
            stc = range[range.length - 1].column[0],
            edc = range[range.length - 1].column[1];

        for (let r = str; r <= edr; r++) {
            for (let c = stc; c <= edc; c++) {
                if (currentCellValidation[r + '_' + c].isReadonly) {
                    delete d[r][c]['ro'];
                }

                delete currentCellValidation[r + '_' + c];
            }
        }

        this.ref(historyCellValidation, currentCellValidation, Store.currentSheetIndex);
    },
    ref: function(historyCellValidation, currentCellValidation, sheetIndex) {
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellValidation";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellValidation"] = historyCellValidation;
            redo["currentCellValidation"] = currentCellValidation;
            Store.jfredo.push(redo);
        }

        _this.cellValidation = currentCellValidation;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellValidation = currentCellValidation;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
    refOfReadonly: function(historyCellValidation, currentCellValidation, sheetIndex, d, range) {
        let _this = this;

        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateDataVerificationOfCheckbox";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellValidation"] = historyCellValidation;
            redo["currentCellValidation"] = currentCellValidation;
            redo["data"] = Store.flowdata;
            redo["curData"] = d;
            redo["range"] = range;
            Store.jfredo.push(redo);
        }

        _this.cellValidation = currentCellValidation;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellValidation = currentCellValidation;

        Store.flowdata = d;
        editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
        Store.luckysheetfile[getSheetIndex(sheetIndex)].data = Store.flowdata;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
}

export default weCellValidationCtrl;