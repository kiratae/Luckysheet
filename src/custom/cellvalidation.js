import { getSheetIndex } from '../methods/get';
import Store from '../store';
import weConfigsetting from './configsetting';
import menuButton from '../controllers/menuButton';
import formula from '../global/formula';
import editor from '../global/editor';
import { setcellvalue } from '../global/setdata';
import { getcellvalue } from '../global/getdata';
import { luckysheetrefreshgrid } from '../global/refresh';
import luckysheetConfigsetting from '../controllers/luckysheetConfigsetting';
import { luckysheetlodingHTML } from '../controllers/constant';
import weAPI from './api';
import weDropdownCtrl from './dropdown';
import { setCellValue } from '../global/api';
import { Log } from './utils';

let weCellValidationCtrlLogger = new Log("weCellValidationCtrl");

const weCellValidationCtrl = {
    cellValidation: null,
    cache: {},
    error: {
        ce: "#CLIENT!",
        se: "#SERVER!",
    },
    init: function() {
        let func = 'init';
        weCellValidationCtrlLogger.info(func, 'has been called.');
        const self = this;

        $(document).off("click.dropdownBtn").on("click.dropdownBtn", "#luckysheet-cellValidation-dropdown-btn", function(e) {
            self.dropdownListShow();
            e.stopPropagation();
        });
        $(document).off("click.dropdownListItem").on("click.dropdownListItem", "#luckysheet-cellValidation-dropdown-List .dropdown-List-item", function(e) {
            $("#luckysheet-cellValidation-dropdown-List").hide();

            let text = e.target.innerText;
            let mdValue = e.target.dataset.mdValue;
            let value = e.target.dataset.value;
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let rowIndex = last.row_focus;
            let colIndex = last.column_focus;

            $("#luckysheet-rich-text-editor").text(value);
            // formula.updatecell(rowIndex, colIndex);
            setCellValue(rowIndex, colIndex, { m: text, v: text, sv: { v: value, md_v: mdValue } });

            e.stopPropagation();
        });
    },
    getDOM: function() {
        return `<div id="luckysheet-cellValidation-dropdown-btn"></div>
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

        if (clickMode && item.cellType && item.cellType == 'checkbox') {
            this.checkboxChange(r, c);
            return;
        }

        if (item.cellType && item.cellType == 'dropdown') {
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
        let func = 'dropdownListShow';
        weCellValidationCtrlLogger.info(func, 'has been called.');

        $("#luckysheet-cellError-showErrorMsg").hide();

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
        let mdValue = '';

        if (item.inSet != null)
            mdValue = item.inSet;
        else if (item.inSetSystem != null)
            mdValue = item.inSetSystem;
        else if (item.inSetCustom != null)
            mdValue = item.inSetCustom.split('|')[0];

        let optionHtml = '';
        list.forEach(item => {
            optionHtml += `<div class="dropdown-List-item luckysheet-mousedown-cancel" data-value="${item.value}" data-md-value="${mdValue}">${item.text}</div>`;
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
                    list.push({ value: v, text: v });
                }
            }
        } else if (value.inSetSystem != null) {
            list = this.getSetSystem(value.inSetSystem);
        } else if (value.inSetCustom != null) {
            // inSetCustom = inSetCustom (value1) | inSetCustomLevel (value2) | inSetCustomTarget (ddlTarget)
            let inSetCustom = value.inSetCustom.split('|');
            list = this.getSetCustom(inSetCustom[0], inSetCustom[1], inSetCustom[2]);
        }
        return list;
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

        let isHasReadonly = false;
        for (let r = str; r <= edr; r++) {
            for (let c = stc; c <= edc; c++) {
                if (obj.cellType == 'checkbox' && obj.inSet) {
                    obj.checked = false;
                    setcellvalue(r, c, d, obj.inSet.split(',')[1]);
                }

                currentCellValidation[r + '_' + c] = obj;

                if (obj.isReadonly != null) {
                    if (d[r][c] != null && typeof d[r][c] == 'object') {
                        if (obj.isReadonly) {
                            d[r][c].ro = true;
                            isHasReadonly = true;
                        } else if (typeof d[r][c]['ro'] !== 'undefined') {
                            delete d[r][c]['ro'];
                        }
                    } else if (typeof d[r][c] == null) {
                        d[r][c] = { ro: true };
                        isHasReadonly = true;
                    }
                }
            }
        }

        if (isHasReadonly) {
            this.refOfReadonly(historyCellValidation, currentCellValidation, Store.currentSheetIndex, d, range[range.length - 1]);
        } else if (obj.cellType == 'checkbox' && obj.inSet) {
            this.refOfCheckbox(historyCellValidation, currentCellValidation, Store.currentSheetIndex, d, range[range.length - 1]);
        } else {
            this.ref(historyCellValidation, currentCellValidation, Store.currentSheetIndex);
        }

    },
    getCellValidation: function(r, c) {
        return this.cellValidation[r + '_' + c] || null;
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
        let d = Store.flowdata;

        let isHasReadonly = false;
        for (let r = str; r <= edr; r++) {
            for (let c = stc; c <= edc; c++) {
                if (currentCellValidation[r + '_' + c]) {
                    if (currentCellValidation[r + '_' + c].isReadOnly != null && d[r][c]['ro']) {
                        delete d[r][c]['ro'];
                        isHasReadonly = true;
                    }

                    delete currentCellValidation[r + '_' + c];
                }
            }
        }

        if (isHasReadonly) {
            this.refOfReadonly(historyCellValidation, currentCellValidation, Store.currentSheetIndex, d, range[range.length - 1]);
        } else {
            this.ref(historyCellValidation, currentCellValidation, Store.currentSheetIndex);
        }
    },
    checkboxChange: function(r, c) {
        let historyCellValidation = $.extend(true, {}, this.cellValidation);
        let currentCellValidation = $.extend(true, {}, this.cellValidation);

        let d = editor.deepCopyFlowData(Store.flowdata);

        let item = currentCellValidation[r + '_' + c];
        item.checked = !item.checked;

        let val = item.inSet.split(',');
        let value = val[1]; // false value
        if (d[r][c] && typeof d[r][c].v != 'undefined') {
            d[r][c].v = !d[r][c].v;
        }

        if (d[r][c].v) {
            value = val[0]; // true value
        }

        // let d = editor.deepCopyFlowData(Store.flowdata);
        setcellvalue(r, c, d, value);

        this.refOfCheckbox(
            historyCellValidation,
            currentCellValidation,
            Store.currentSheetIndex,
            d, { "row": [r, r], "column": [c, c] }
        );
    },
    ref: function(historyCellValidation, currentCellValidation, sheetIndex) {
        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellValidation";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellValidation"] = historyCellValidation;
            redo["currentCellValidation"] = currentCellValidation;
            Store.jfredo.push(redo);
        }

        this.cellValidation = currentCellValidation;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellValidation = currentCellValidation;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
    refOfReadonly: function(historyCellValidation, currentCellValidation, sheetIndex, d, range) {
        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellValidationOfReadonly";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellValidation"] = historyCellValidation;
            redo["currentCellValidation"] = currentCellValidation;
            redo["data"] = Store.flowdata;
            redo["curData"] = d;
            redo["range"] = range;
            Store.jfredo.push(redo);
        }

        this.cellValidation = currentCellValidation;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellValidation = currentCellValidation;

        Store.flowdata = d;
        // editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
        Store.luckysheetfile[getSheetIndex(sheetIndex)].data = Store.flowdata;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
    refOfCheckbox: function(historyCellValidation, currentCellValidation, sheetIndex, d, range) {
        if (Store.clearjfundo) {
            Store.jfundo = [];

            let redo = {};
            redo["type"] = "updateCellValidationOfCheckbox";
            redo["sheetIndex"] = sheetIndex;
            redo["historyCellValidation"] = historyCellValidation;
            redo["currentCellValidation"] = currentCellValidation;
            redo["data"] = Store.flowdata;
            redo["curData"] = d;
            redo["range"] = range;
            Store.jfredo.push(redo);
        }

        this.cellValidation = currentCellValidation;
        Store.luckysheetfile[getSheetIndex(sheetIndex)].cellValidation = currentCellValidation;

        Store.flowdata = d;
        editor.webWorkerFlowDataCache(Store.flowdata); //worker存数据
        Store.luckysheetfile[getSheetIndex(sheetIndex)].data = Store.flowdata;

        setTimeout(function() {
            luckysheetrefreshgrid();
        }, 1);
    },
    getSetSystem: function(id) {
        const func = 'getSetSystem';
        let list = [];
        let removeLoading = function(ex) {
            setTimeout(function() {
                $("#luckysheetloadingdata").fadeOut().remove();
            }, 500);
            if (ex)
                throw ex;
        };
        // caching
        let cacheList = this.cache['setSystem_' + id]
        if (cacheList) {
            list = JSON.parse(cacheList);
        } else {
            // new request
            const self = this;
            $.ajax({
                url: weConfigsetting.masterDataApi,
                type: 'post',
                dataType: 'json',
                data: { id: id },
                beforeSend: function() {
                    self.log.info(func, `calling: "${weConfigsetting.masterDataApi}" with id "${id}".`);
                    $("#" + luckysheetConfigsetting.container).append(luckysheetlodingHTML(false));
                },
                success: function(res, textStatus, jqXHR) {
                    if (res.statusCode == "0" && res.data) {
                        list = res.data.slice();
                        self.cache['setSystem_' + id] = JSON.stringify(res.data);
                        removeLoading();
                    } else {
                        removeLoading(self.error.se);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    self.log.error(func, 'error', textStatus);
                    removeLoading(self.error.ce);
                }
            });
        }
        return list;
    },
    getSetCustom: function(id, lvl, target = null) {
        let mdGroup = weDropdownCtrl.getData(id);
        let list = this.getSetCustomByLevel(mdGroup.formMDs, lvl);
        list = list.map(x => { return { value: x.formMDId, text: x.name } });
        if (target != null && target != '') {
            let range = weAPI.getRangeByTxt(target);
            let cell = Store.flowdata[range[0].row[0]][range[0].column[0]];
            if (cell && cell.sv) {
                mdGroup = weDropdownCtrl.getData(id);
                let formMD = this.getSetCustomById(mdGroup.formMDs, cell.sv.v);
                list = formMD.childrens.map(x => { return { value: x.formMDId, text: x.name } });
            }
        }
        return list;
    },
    getSetCustomByLevel: function(data, level, list = []) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].level == level) {
                list.push(data[i]);
            }
            if (data[i].childrens && data[i].childrens.length && typeof data[i].childrens === 'object') {
                this.getSetCustomByLevel(data[i].childrens, level, list);
            }
        }
        return list;
    },
    getSetCustomById: function(data, id) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].formMDId == id) {
                return data[i];
            }
            if (data[i].childrens && data[i].childrens.length && typeof data[i].childrens === 'object') {
                let res = this.getSetCustomById(data[i].childrens, id);
                if (res)
                    return data[i];
            }
        }
    },
    dropCellHandler: function(cellVld, r, c) {
        // inSetCustom = inSetCustom (value1) | inSetCustomLevel (value2) | inSetCustomTarget (ddlTarget)
        let obj = Object.assign({}, cellVld);
        if (cellVld.inSetCustom && typeof cellVld.inSetCustom === 'string') {
            let inSetCustom = cellVld.inSetCustom.split('|');
            if (inSetCustom[1] > 1 && inSetCustom[2]) {
                let range = weAPI.getRangeByTxt(inSetCustom[2]);
                for (let s = 0; s < range.length; s++) {
                    range[s].row[0] = r;
                    range[s].row[1] = r;
                }
                obj.inSetCustom = `${inSetCustom[0]}|${inSetCustom[1]}|${weAPI.getTxtByRange(range)}`;
            }
        }
        return obj;
    }
}

export default weCellValidationCtrl;