function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Log {
    constructor(name, isHidden = false) {
        this.name = name;
        this.isHidden = isHidden;
    }
    debug(func, msg) {
        if (!this.isHidden)
            console.log(`%cDEBUG::%c${this.name}::%c${func} ${msg}`, 'color: green', 'color: grey', 'color: white');
    }
    info(func, msg) {
        if (!this.isHidden)
            console.log(`%cINFO::%c${this.name}::%c${func} ${msg}`, 'color: cyan', 'color: grey', 'color: white');
    }
    warn(func, msg) {
        if (!this.isHidden)
            console.log(`%cWARN::%c${this.name}::%c${func} ${msg}`, 'color: yellow', 'color: grey', 'color: white');
    }
    error(func, msg) {
        if (!this.isHidden)
            console.log(`%cERROR::%c${this.name}::%c${func} ${msg}`, 'color: red', 'color: grey', 'color: white');
    }
}

export {
    getUUID,
    Log
}