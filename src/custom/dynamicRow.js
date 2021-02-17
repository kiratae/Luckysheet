import Store from "../store";
import { getSheetIndex } from '../methods/get';
import weConfigsetting from "./configsetting";
import { luckysheetrefreshgrid } from '../global/refresh';
import luckysheetDropCell from "../controllers/dropCell";
import { insertRow } from '../global/api';
import locale from "../locale/locale";
import { $$ } from '../utils/util';

const weDynamicRow = {
    dynamicRow: null,
    init: function() {
        if (!weConfigsetting.canDynamicRow) {
            return;
        }
        const self = this;
        $("#luckysheetDynamicRowRightClickMenu").click(function(event) {
            $("#luckysheet-rightclick-menu").hide();

            if (self.dynamicRow == null) {
                self.setData({
                    og_row: Store.luckysheet_select_save[0].row[0],
                    row: Store.luckysheet_select_save[0].row[0],
                    start_col: Store.luckysheet_select_save[0].column[0],
                    end_col: Store.luckysheet_select_save[0].column[1]
                });
            } else {
                self.removeData();
            }

            setTimeout(function() {
                luckysheetrefreshgrid();
            }, 1);
        });
    },
    openMenu: function() {
        if (!weConfigsetting.canDynamicRow || !weConfigsetting.formEditor) {
            return;
        }

        const _locale = locale();

        if (this.dynamicRow == null) {
            $("#luckysheet-dynamic-row").find('.luckysheet-cols-menuitem-content').text(_locale.rightclick.addDynamicRow);
            $("#luckysheet-dynamic-row").show();
        } else {
            $("#luckysheet-dynamic-row").find('.luckysheet-cols-menuitem-content').text(_locale.rightclick.removeDynamicRow);
            if (this.dynamicRow.row == Store.luckysheet_select_save[0].row[0]) {
                $("#luckysheet-dynamic-row").show();
            } else {
                $("#luckysheet-dynamic-row").hide();
            }
        }
    },
    isCurrentDynamicRow: function() {
        if (this.dynamicRow && this.dynamicRow.row == Store.luckysheet_select_save[0].row[0]) {
            return true;
        }
        return false;
    },
    deleteRow: function() {
        if (!this.dynamicRow) return;

        let st_index = Store.luckysheet_select_save[0].row[0],
            ed_index = Store.luckysheet_select_save[0].row[1];
        if (this.dynamicRow.og_row <= st_index && ed_index < this.dynamicRow.row) {
            $$('#luckysheet-del-selected').style.display = 'block';
        }
    },
    doDeleteRow: function(st_index, ed_index) {
        if (!this.dynamicRow) return;

        if (this.dynamicRow.og_row <= st_index && ed_index < this.dynamicRow.row) {
            this.dynamicRow.row--;
            this.setData(this.dynamicRow);
        }
    },
    createDOM: function() {
        if (!weConfigsetting.canDynamicRow || !weConfigsetting.formEditor) {
            return;
        }

        const _locale = locale();

        let html = `<div id="luckysheet-dynamic-row">
            <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
            <div id="luckysheetDynamicRowRightClickMenu" data-x-target="add" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${_locale.rightclick.addDynamicRow}</div>
            </div>
        </div>`;
        return $('#luckysheet-rightclick-menu').append(html);
    },
    setData: function(dynamicRow) {
        this.dynamicRow = Object.assign({}, dynamicRow);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].dynamicRow = this.dynamicRow;
    },
    removeData: function() {
        this.dynamicRow = null;
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].dynamicRow = this.dynamicRow;
    },
    rowTextRender: function(row, rowText) {
        if (this.dynamicRow != null && this.dynamicRow.row != null && this.dynamicRow.row == row) {
            rowText = weConfigsetting.formEditor ? "DYN" : "Auto";
        }
        return rowText;
    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (!weConfigsetting.canDynamicRow) {
            return;
        }

        if (this.dynamicRow != null && this.dynamicRow.row && r == this.dynamicRow.row) {
            luckysheetTableContent.beginPath();
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
            luckysheetTableContent.fillStyle = "#E5C9EE";
            luckysheetTableContent.fill();
            luckysheetTableContent.closePath();
        }
    },
    generateNextRow: function(curRow) {
        if (weConfigsetting.formEditor || !weConfigsetting.canDynamicRow) {
            return;
        }

        if (this.dynamicRow != null && this.dynamicRow.row) {
            if (curRow == this.dynamicRow.row) {
                luckysheetDropCell.copyRange = {
                    "row": [this.dynamicRow.row, this.dynamicRow.row],
                    "column": [this.dynamicRow.start_col, this.dynamicRow.end_col]
                };

                insertRow(this.dynamicRow.row + 1);

                luckysheetDropCell.applyRange = {
                    "row": [this.dynamicRow.row + 1, this.dynamicRow.row + 1],
                    "column": [this.dynamicRow.start_col, this.dynamicRow.end_col]
                };
                luckysheetDropCell.applyType = "0";
                luckysheetDropCell.direction = "down";
                Store.luckysheet_select_save = [{
                    "row": [this.dynamicRow.row, this.dynamicRow.row + 1],
                    "column": [this.dynamicRow.start_col, this.dynamicRow.end_col]
                }];

                luckysheetDropCell.isDynamicCreation = true;

                luckysheetDropCell.update(false);

                this.dynamicRow.row++;
                this.setData(this.dynamicRow);
            }
        }
    }
}


export default weDynamicRow;