import weConfigsetting from './configsetting';
import luckysheetsizeauto from '../controllers/resize';
import Store from '../store';
import luckysheetformula from '../global/formula';
import weVariable from './variable';
import weAPI from './api';

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
        weConfigsetting.onSelectHightlightShow = config.onSelectHightlightShow;
    },
    setAPI: function (libCore) {
        libCore.resize = luckysheetsizeauto;

        libCore.setCellError = function (data) {
            Store.luckysheetfile.cellerror = data;
        }
        
        libCore.getSelectedCell = weAPI.getSelectedCell;
        libCore.getRangeByTxt = weAPI.getRangeByTxt;

        libCore.execFormula = function (txt) {
            console.log('execFormula', txt);
            if (typeof txt == "string" && txt.slice(0, 1) == "=" && txt.length > 1) {
                return weVariable.execFormula(txt);
                // return luckysheetformula.execfunction(txt, undefined, undefined, undefined, true);
            }
        }
    }
}

export default weCore;