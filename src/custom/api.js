
const weAPI = {
    setCellValue: function(curv, value){
        console.log('weAPI::setCellValue', curv, value);
        if(value.ro!=null){
            curv.ro = value.ro;
        }
        if(value.iv!=null){
            curv.iv = value.iv;
        }
        if(value.tp!=null){
            curv.tp = value.tp;
        }
        if(value.df!=null){
            curv.df = value.df;
        }
    },
    clearCell: function(cell){
        console.log('weAPI::clearCell', cell);
        delete cell["ro"];
        delete cell["iv"];
        delete cell["tp"];
        delete cell["df"];
    }
}

export default weAPI;