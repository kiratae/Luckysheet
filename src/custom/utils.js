function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Log {
    constructor(name) {
        this.name = name;
    }
    debug(func, msg) {
        console.log(`%cDEBUG::%c${this.name}::%c${func} ${msg}`, 'color: green', 'color: grey', 'color: white');
    }
    info(func, msg) {
        console.log(`%cINFO::%c${this.name}::%c${func} ${msg}`, 'color: cyan', 'color: grey', 'color: white');
    }
    warn(func, msg) {
        console.log(`%cWARN::%c${this.name}::%c${func} ${msg}`, 'color: yellow', 'color: grey', 'color: white');
    }
    error(func, msg) {
        console.log(`%cERROR::%c${this.name}::%c${func} ${msg}`, 'color: red', 'color: grey', 'color: white');
    }
}

export {
    getUUID,
    Log
}