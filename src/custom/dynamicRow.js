import Store from "../store";
import weConfigsetting from "./configsetting";
import { luckysheetrefreshgrid } from '../global/refresh';
import luckysheetDropCell from "../controllers/dropCell";
import { insertRow, deleteRow } from '../global/api';
import locale from "../locale/locale";
import formula from '../global/formula';
import { setAccuracy, setcellvalue } from "../global/setdata";
import { getSheetIndex, getRangetxt } from '../methods/get';
import { $$ } from '../utils/util';
import { jfrefreshgrid } from '../global/refresh';

const weDynamicRow = {
    dynamicRow: null,
    init: function() {
        if (!Store.allowEdit) {
            if (this.dynamicRow && this.dynamicRow.row) {
                deleteRow(this.dynamicRow.row, this.dynamicRow.row);
            }
            return;
        }
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

        if (!weConfigsetting.canSummaryRow) {
            return;
        }
        $("#luckysheetDynamicRowWithSummaryRightClickMenu").click(function(event) {
            $("#luckysheet-rightclick-menu").hide();

            if (self.dynamicRow == null) {
                self.setData({
                    og_row: Store.luckysheet_select_save[0].row[0],
                    row: Store.luckysheet_select_save[0].row[0],
                    start_col: Store.luckysheet_select_save[0].column[0],
                    end_col: Store.luckysheet_select_save[0].column[1],
                    sum_row: Store.luckysheet_select_save[0].row[0] + 1,
                    og_sum_row: Store.luckysheet_select_save[0].row[0] + 1,
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
            $("#luckysheet-dynamic-row").find('#luckysheetDynamicRowRightClickMenu .luckysheet-cols-menuitem-content').text(_locale.rightclick.addDynamicRow);
            $("#luckysheet-dynamic-row").find('#luckysheetDynamicRowWithSummaryRightClickMenu .luckysheet-cols-menuitem-content').text(_locale.rightclick.addDynamicRowWithSummary);
            $("#luckysheet-dynamic-row").find('#luckysheetDynamicRowWithSummaryRightClickMenu').show();
            $("#luckysheet-dynamic-row").show();
        } else {
            $("#luckysheet-dynamic-row").find('#luckysheetDynamicRowRightClickMenu .luckysheet-cols-menuitem-content').text(_locale.rightclick.removeDynamicRow);
            $("#luckysheet-dynamic-row").find('#luckysheetDynamicRowWithSummaryRightClickMenu').hide();
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
        } else if (this.dynamicRow && this.dynamicRow.sum_row == Store.luckysheet_select_save[0].row[0]) {
            return true;
        }
        return false;
    },
    deleteRow: function() {
        if (weConfigsetting.formEditor) return;
        if (!this.dynamicRow) return;

        let st_index = Store.luckysheet_select_save[0].row[0],
            ed_index = Store.luckysheet_select_save[0].row[1];
        if (this.dynamicRow.og_row <= st_index && ed_index < this.dynamicRow.row) {
            $$('#luckysheet-del-selected').style.display = 'block';
        } else {
            $$('#luckysheet-del-selected').style.display = 'none';
            $$('#luckysheet-cols-rows-add .luckysheet-menuseparator').style.display = 'none';
        }
    },
    doDeleteRow: function(st_index, ed_index) {
        if (!this.dynamicRow) return;

        if (this.dynamicRow.og_row <= st_index && ed_index < this.dynamicRow.row) {
            this.dynamicRow.row--;
            if (this.dynamicRow.sum_row)
                this.dynamicRow.sum_row = this.dynamicRow.row + 1;
            this.setData(this.dynamicRow);
        }

        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"] = null;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
    createDOM: function() {
        if (!weConfigsetting.canDynamicRow || !weConfigsetting.formEditor) {
            return;
        }

        const _locale = locale();

        let html = `<div id="luckysheet-dynamic-row">
            <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>
            <div id="luckysheetDynamicRowRightClickMenu" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${_locale.rightclick.addDynamicRow}</div>
            </div>`;
        if (weConfigsetting.canSummaryRow) {
            html += `<div id="luckysheetDynamicRowWithSummaryRightClickMenu" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${_locale.rightclick.addDynamicRowWithSummary}</div>
            </div>`;
        }
        html += `</div>`;
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
        if (!Store.allowEdit) {
            return rowText;
        }
        if (this.dynamicRow != null && this.dynamicRow.row && this.dynamicRow.row == row) {
            rowText = weConfigsetting.formEditor ? "DYN" : "Auto";
        }
        if (this.dynamicRow != null && this.dynamicRow.sum_row && this.dynamicRow.sum_row == row) {
            rowText = "SUM";
        }
        return rowText;
    },
    renderCell: function(r, c, start_r, start_c, end_r, end_c, offsetLeft, offsetTop, luckysheetTableContent) {
        if (!Store.allowEdit) {
            return;
        }
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

        if (this.dynamicRow != null && this.dynamicRow.sum_row && r == this.dynamicRow.sum_row) {
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
            luckysheetTableContent.fillStyle = "#FFD394";
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
                Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["cellerror"] = null;

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

                if (weConfigsetting.canSummaryRow && this.dynamicRow.sum_row) {
                    let d = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].data;

                    let r = this.dynamicRow.sum_row + 1;
                    for (var c = this.dynamicRow.start_col; c <= this.dynamicRow.end_col; c++) {
                        let cell = d[r][c];

                        if (cell != null && cell.df != null) {
                            let txt = getRangetxt(Store.currentSheetIndex, { "row": [this.dynamicRow.og_row, this.dynamicRow.row], "column": [c, c] }, Store.currentSheetIndex)
                            let f = cell.df.replace(/(([A-Za-z\$]+[0-9\$]+\:[A-Za-z\$]+[0-9\$]+)|([A-Za-z\$]+[0-9\$]+))/g, txt);
                            d[r][c].df = f;
                            d[r][c].f = f;
                        }

                        if (d[r][c]) {
                            d[r][c].rf = this.dynamicRow.og_sum_row;
                        } else {
                            d[r][c] = {
                                rf: this.dynamicRow.og_sum_row
                            }
                        }
                    }

                    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].data = d;
                }

                this.dynamicRow.row++;
                if (weConfigsetting.canSummaryRow && this.dynamicRow.sum_row) {
                    this.dynamicRow.sum_row = this.dynamicRow.row + 1;
                }

                this.setData(this.dynamicRow);
            }
        }
    }
}


export default weDynamicRow;