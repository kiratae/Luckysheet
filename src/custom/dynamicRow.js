import Store from "../store";
import { getSheetIndex } from '../methods/get';
import weConfigsetting from "./configsetting";
import { luckysheetrefreshgrid } from '../global/refresh';
import luckysheetDropCell from "../controllers/dropCell";
import { insertRow } from '../global/api';

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
        if (!weConfigsetting.canDynamicRow) {
            return;
        }

        if (this.dynamicRow == null) {
            $("#luckysheet-dynamic-row").find('.luckysheet-cols-menuitem-content').text('สร้างเป็นแถวแบบ Dynamic');
            $("#luckysheet-dynamic-row").show();
        } else {
            $("#luckysheet-dynamic-row").find('.luckysheet-cols-menuitem-content').text('นำแถวแบบ Dynamic ออก');
            if (this.dynamicRow.row == Store.luckysheet_select_save[0].row[0]) {
                $("#luckysheet-dynamic-row").show();
            } else {
                $("#luckysheet-dynamic-row").hide();
            }
        }
    },
    createDOM: function() {
        if (!weConfigsetting.canDynamicRow) {
            return;
        }

        let html = `<div id="luckysheet-dynamic-row">
            <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
            <div id="luckysheetDynamicRowRightClickMenu" data-x-target="add" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">สร้างเป็นแถวแบบ Dynamic</div>
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

                luckysheetDropCell.applyType = "1";

                this.dynamicRow.row++;
                insertRow(this.dynamicRow.row);

                luckysheetDropCell.applyRange = { "row": [this.dynamicRow.row, this.dynamicRow.row], "column": [this.dynamicRow.start_col, this.dynamicRow.end_col] };
                luckysheetDropCell.direction = "down";

                luckysheetDropCell.update(false);

                this.setData(this.dynamicRow);
            }
        }
    }
}


export default weDynamicRow;