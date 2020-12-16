import weCellValidationCtrl from './cellvalidation';
import weCellTagCtrl from './celltag';
import weDynamicRow from './dynamicRow';
import weHandler from './handler';
import weDropdownCtrl from './dropdown';

const weSheetManage = {
    setSheetParam: function(file) {
        weCellValidationCtrl.cellValidation = file.cellValidation || {};
        weCellValidationCtrl.init();

        weCellTagCtrl.cellTag = file.cellTag || {};
        weCellTagCtrl.init();

        weDynamicRow.dynamicRow = file.dynamicRow;
        weDynamicRow.init();

        weHandler.initCellRangeEvent();

        weDropdownCtrl.dropdownDatas = file.dropdownDatas || [];
        weDropdownCtrl.init();
    }
}

export default weSheetManage;