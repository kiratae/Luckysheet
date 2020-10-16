import weConfigsetting from './configsetting';
import luckysheetsizeauto from '../controllers/resize';
import Store from '../store';
import luckysheetformula from '../global/formula';

const weCore = {
    setConfig: function (config) {
        // config
        weConfigsetting.toolbars = config.toolbars;
        weConfigsetting.contextMenus = config.contextMenus;
        weConfigsetting.formEditor = config.formEditor;
        weConfigsetting.bodyContainer = config.bodyContainer;
        // hooks
        weConfigsetting.onCellClick = config.onCellClick;
        weConfigsetting.onCellMouseDown = config.onCellMouseDown;
        weConfigsetting.onCellMouseOver = config.onCellMouseOver;
        weConfigsetting.onCellMouseOut = config.onCellMouseOut;
        weConfigsetting.onSheetMouseOut = config.onSheetMouseOut;
    },
    setAPI: function (libCore) {
        libCore.resize = luckysheetsizeauto;

        libCore.setCellError = function (data) {
            Store.luckysheetfile.cellerror = data;
        }

        libCore.execFormula = function (txt) {
            console.log('execFormula', txt);
            if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
                return luckysheetformula.execfunction(txt, undefined, undefined, undefined, true);
            }
        }
    }
}

export default weCore;