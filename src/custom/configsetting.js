const weConfigsetting = {
    slientMode: false, // if is true luckysheet will not show any DOM element, false show sheet like normal.
    fillErrorInCell: false, // if is true fill cell with red color when cell has error, false will show error at top corner of cell.
    formApi: null, // api to call to get form with params (rptFormCode, [formReportSetId (optional will send in formReport mode)]).
    masterDataApi: null, // api to call to get master data with params (id). used with rule InSetSystem.
    formReportSetId: null, // formReportSetId used to send when call api.
    bodyContainer: null, // container of luckysheet or parent of luckysheet.
    formEditor: true, // form mode if is true is template create mode, false is answer mode.
    canDynamicRow: true, // if is true will hasve option to setting one row to be dynamic row and can dynamic. it's depend on "formEditor" setting.
    onCellClick: null, // hooker function fire when click cell.
    onCellMouseOver: null, // hooker function fire when cursor move in over cell.
    onCellMouseOut: null, // hooker function fire when cursor move out from cell.
    onSheetMouseOut: null, // hooker function fire when cursor move out from sheet area.
    onSelectHightlightShow: null, // hooker function fire when click on highlight cell.
    onOpenCellRange: null, // hooker function fire when dialog select cell range is open.
    onCloseCellRange: null, // hooker function fire when dialog select cell range is close.
    onConfirmCellRange: null, // hooker function fire when click cofirm buuton in dialog select cell range.
    isLog: false, // is show console log with Log util.
    deserializeHelper: null, // helper from outer to deserialize form or sheet data from api response.
}

export default weConfigsetting;