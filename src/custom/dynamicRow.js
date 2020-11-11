import Store from "../store";

const weDynamicRow = {
    columns: [],
    setData: function(columns) {
        this.columns = columns.slice();
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].dynamicRow = this.columns;
    },
    addRow: function(row) {

    }

}


export default weDynamicRow;