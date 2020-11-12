import Store from "../store";
import { getSheetIndex } from '../methods/get';
import weConfigsetting from "./configsetting";
import { luckysheetrefreshgrid } from '../global/refresh';
import luckysheetDropCell from "../controllers/dropCell";

const weDynamicRow = {
    dynamicRow: null,
    init: function() {
        const self = this;
        $("#luckysheetDynamicRowRightClickMenu").click(function(event) {
            console.log('weDynamicRow::luckysheetDynamicRowRightClickMenu::click', Store.luckysheet_select_save);
            $("#luckysheet-rightclick-menu").hide();

            let target = $(this).data('x-target');
            if (target == 'add') {
                self.setData({
                    row: Store.luckysheet_select_save[0].row[0],
                    start_col: Store.luckysheet_select_save[0].column[0],
                    end_col: Store.luckysheet_select_save[0].column[1]
                });

                $(this).data('x-target', 'remove');
                $(this).find('.luckysheet-cols-menuitem-content').text('นำแถวแบบ Dynamic ออก');
            } else if (target == 'remove') {
                self.removeData();

                $(this).data('x-target', 'add');
                $(this).find('.luckysheet-cols-menuitem-content').text('สร้างเป็นแถวแบบ Dynamic');
            }

            setTimeout(function() {
                luckysheetrefreshgrid();
            }, 1);
        });
    },
    createDOM: function() {
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
    addRow: function(row) {

    },
    rowTextRender: function(row, rowText) {
        if (weConfigsetting.formEditor && this.dynamicRow != null && this.dynamicRow.row != null && this.dynamicRow.row == row) {
            rowText = "DYN";
        }
        return rowText;
    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        // if (weConfigsetting.formEditor)
        //     return;

        // let dynamicRow = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicRow"];
        // // [TK] custom error message render or draw (draw a top left red triangle)
        // if (dynamicRow != null && cellError[r + '_' + c] != null) {

        // }
    },
    generateNextRow: function(curRow) {
        console.log('weDynamicRow::generateNextRow curRow => ', curRow);

        // TODO : Check is current row is dynamic row
        if (this.dynamicRow != null && this.dynamicRow.row) {
            if (curRow == this.dynamicRow.row) {
                // TODO : If current row is dynamic row
                // TODO : Copy all current dynamic row data to next row (current row plus one)
                luckysheetDropCell.copyRange = {
                    "row": [this.dynamicRow.row, this.dynamicRow.row],
                    "column": [this.dynamicRow.start_col, this.dynamicRow.end_col]
                };

                luckysheetDropCell.applyType = "1";

                this.dynamicRow.row++;

                luckysheetDropCell.applyRange = { "row": [this.dynamicRow.row, this.dynamicRow.row], "column": [this.dynamicRow.start_col, this.dynamicRow.end_col] };
                luckysheetDropCell.direction = "down";

                luckysheetDropCell.update(false);

                this.setData(this.dynamicRow);
            }
        }
    }
}


export default weDynamicRow;