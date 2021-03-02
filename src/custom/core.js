import weConfigsetting from './configsetting';
import luckysheetsizeauto from '../controllers/resize';
import Store from '../store';
import luckysheetformula from '../global/formula';
import weVariable from './variable';
import weAPI from './api';
import weCellValidationCtrl from './cellvalidation';
import weCellTagCtrl from './celltag';
import weDropdownCtrl from './dropdown';
import weHandler from './handler';
import weCellMetaCtrl from './cellmeta';

const weCore = {
    setConfig: function(config) {
        // config
        weConfigsetting.slientMode = config.slientMode;
        weConfigsetting.fillErrorInCell = config.fillErrorInCell;
        weConfigsetting.formApi = config.formApi;
        weConfigsetting.masterDataApi = config.masterDataApi;
        weConfigsetting.formReportSetId = config.formReportSetId;
        weConfigsetting.formEditor = config.formEditor;
        weConfigsetting.bodyContainer = config.bodyContainer;
        weConfigsetting.canDynamicRow = config.canDynamicRow;
        weConfigsetting.canSummaryRow = config.canSummaryRow;
        weConfigsetting.yearOffset = config.yearOffset;
        // hooks
        weConfigsetting.onCellClick = config.onCellClick;
        weConfigsetting.onCellMouseOver = config.onCellMouseOver;
        weConfigsetting.onCellMouseOut = config.onCellMouseOut;
        weConfigsetting.onSheetMouseOut = config.onSheetMouseOut;
        weConfigsetting.onSelectHightlightShow = config.onSelectHightlightShow;
        weConfigsetting.onSelectSingleHightlightShow = config.onSelectSingleHightlightShow;

        // cell range dialog
        weConfigsetting.onOpenCellRange = config.onOpenCellRange;
        weConfigsetting.onCloseCellRange = config.onCloseCellRange;
        weConfigsetting.onConfirmCellRange = config.onConfirmCellRange;

        weConfigsetting.isLog = config.isLog;

        // cell flag color
        weConfigsetting.cellFlagColor = config.cellFlagColor;

        // helper
        weConfigsetting.deserializeHelper = config.deserializeHelper;

        weVariable.init(config.variablePrefix);
    },
    setAPI: function(libCore) {
        libCore.resize = luckysheetsizeauto;

        libCore.setCellError = function(data) {
            Store.luckysheetfile.cellerror = data;
        }

        libCore.getSelectedCell = weAPI.getSelectedCell;
        libCore.getRangeByTxt = weAPI.getRangeByTxt;

        libCore.openCellRange = weAPI.openCellRange;

        libCore.insertUpdateVariable = weAPI.insertUpdateVariable;

        libCore.execFunctionGroupForce = weAPI.execFunctionGroupForce;

        libCore.weCellValidationCtrl = weCellValidationCtrl;
        libCore.weCellTagCtrl = weCellTagCtrl;
        libCore.weDropdownCtrl = weDropdownCtrl;
        libCore.weCellMetaCtrl = weCellMetaCtrl;
        libCore.weVariable = weVariable;

        libCore.execFormula = function(txt) {
            // console.log('execFormula', txt);
            if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
                return luckysheetformula.execfunction(txt, undefined, undefined, undefined, true);
            }
        }

        libCore.functionInputControl = function(selector) {
            return weHandler.functionInputControl(selector);
        }

        libCore.functionHTMLGenerate = function(txt) {
            return luckysheetformula.functionHTMLGenerate(txt);
        }
    }
}

export default weCore;