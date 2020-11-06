const luckysheetConfigsetting = {
    autoFormatw: false,
    accuracy: undefined,
    total: 0,

    allowCopy: true,
    showtoolbar: true,
    showformulabar: true,
    showinfobar: true,
    showsheetbar: true,
    showstatisticBar: true,
    pointEdit: false,
    pointEditUpdate: null,
    pointEditZoom: 1,

    userInfo: null,
    userMenuItem: [],
    myFolderUrl: null,
    functionButton: null,

    showConfigWindowResize: true,
    enableAddRow: true,
    enableAddBackTop: true,
    enablePage: true,
    pageInfo: null,
    
    
    editMode: false,
    beforeCreateDom: null,
    workbookCreateBefore: null,
    workbookCreateAfter: null,
    fireMousedown: null,
    plugins:[],
    forceCalculation:false, // Forced to refresh the formula, more formulas will cause performance problems, use with caution



    defaultColWidth:73,
    defaultRowHeight:19,
}

export default luckysheetConfigsetting;