import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';
import menuButton from '../controllers/menuButton';
import formula from '../global/formula';

const weCellValidationCtrl = {
    cellValidation: {},
    init: function() {
        console.log('weCellValidationCtrl::init');
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].cellValidation = this.cellValidation;
        const self = this;

        $(document).off("click.dropdownBtn").on("click.dropdownBtn", "#luckysheet-dataVerification-dropdown-btn", function(e) {
            self.dropdownListShow();
            e.stopPropagation();
        });
        $(document).off("click.dropdownListItem").on("click.dropdownListItem", "#luckysheet-dataVerification-dropdown-List .dropdown-List-item", function(e) {
            $("#luckysheet-dataVerification-dropdown-List").hide();

            let value = e.target.innerText;
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let rowIndex = last.row_focus;
            let colIndex = last.column_focus;

            $("#luckysheet-rich-text-editor").text(value);
            formula.updatecell(rowIndex, colIndex);

            e.stopPropagation();
        });
    },
    createdom: function() {
        $('#luckysheet-cell-main').append('<div id="luckysheet-cellValidation-dropdown-btn"></div>');
        $('#luckysheet-cell-main').append('<div id="luckysheet-cellValidation-dropdown-List" class="luckysheet-mousedown-cancel"></div>');
        $('#luckysheet-cell-main').append('<div id="luckysheet-cellValidation-showHintBox" class="luckysheet-mousedown-cancel"></div>');
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
        $("#luckysheet-dataVerification-dropdown-btn").hide();
        $("#luckysheet-dataVerification-showHintBox").hide();

        const self = this;

        if (self.cellValidation == null || self.cellValidation[r + '_' + c] == null) {
            $("#luckysheet-dataVerification-dropdown-List").hide();
            return;
        }

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

        let item = self.cellValidation[r + '_' + c];

        // if(clickMode && item.type == 'checkbox'){
        //     _this.checkboxChange(r, c);
        //     return;
        // }

        if (item.ruleTypeId == '10115') {
            $("#luckysheet-dataVerification-dropdown-btn").show().css({
                'max-width': col - col_pre,
                'max-height': row - row_pre,
                'left': col - 20,
                'top': row_pre + (row - row_pre - 20) / 2
            })

            if ($("#luckysheet-dataVerification-dropdown-List").is(":visible")) {
                let dataIndex = $("#luckysheet-dataVerification-dropdown-List").prop("data-index");

                if (dataIndex != (r + '_' + c)) {
                    $("#luckysheet-dataVerification-dropdown-List").hide();
                }
            }
        } else {
            $("#luckysheet-dataVerification-dropdown-List").hide();
        }
    },
    dropdownListShow: function() {
        $("#luckysheet-dataVerification-showHintBox").hide();

        // console.log('weDropdown::dropdownListShow');

        const self = this;

        let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
        let rowIndex = last.row_focus;
        let colIndex = last.column_focus;

        let row = Store.visibledatarow[rowIndex],
            row_pre = rowIndex == 0 ? 0 : Store.visibledatarow[rowIndex - 1];
        let col = Store.visibledatacolumn[colIndex],
            col_pre = colIndex == 0 ? 0 : Store.visibledatacolumn[colIndex - 1];

        let margeset = menuButton.mergeborer(Store.flowdata, rowIndex, colIndex);
        if (!!margeset) {
            row = margeset.row[1];
            row_pre = margeset.row[0];

            col = margeset.column[1];
            col_pre = margeset.column[0];
        }

        let item = self.cellValidation[rowIndex + '_' + colIndex];
        let list = self.getDropdownList(item);

        let optionHtml = '';
        list.forEach(i => {
            optionHtml += `<div class="dropdown-List-item luckysheet-mousedown-cancel">${i}</div>`;
        })

        $("#luckysheet-dataVerification-dropdown-List")
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
    getCellValidation: function(r, c) {
        return this.cellValidation[r + '_' + c] ? this.cellValidation[r + '_' + c] : null;
    },
    deleteCellValidation: function(r, c) {
        delete this.cellValidation[r + '_' + c];
    }
}

export default weCellValidationCtrl;