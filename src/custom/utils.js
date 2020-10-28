

function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Log {
    constructor(name) {
        this.name = name;
    }
    info(func, msg){
        console.log(`${this.name}::${func} ${msg}`);
    }
    error(func, msg){
        console.error(`${this.name}::${func} ${msg}`);
    }
}

export {
    getUUID,
    Log
}