import status from "./enums/jsonStatus";

class JSONData {
    public status: status;
    public data?: any;
    public optionalObject?: any;

    constructor(status: status, data?: Object, optionalObject?: any) {
        this.status = status;
        this.data = data;
        this.optionalObject = optionalObject;
    }

    public get value() : Object {
        
        let data = this.data;
        let optionalObject = this.optionalObject;

        removeEmptyKeys(data);
        removeEmptyKeys(optionalObject);

        console.debug('JSONData.value: ', this.status, data, optionalObject);

        const returnObject = {
            status: this.status,
            data,
            ...optionalObject,
        }        

        return returnObject;
    }
}

const removeEmptyKeys = (obj: any) => {
    for (const key in obj) {
        if (obj[key] === undefined || obj[key] === null) {
            delete obj[key];
        }
        else if (Array.isArray(obj[key]) && obj[key].length === 0) {
            delete obj[key];
        }
        else if (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0) {
            delete obj[key];
        }
    }
}

export default (status: status, data: any, optionalData?:any) => new JSONData(status, data, optionalData).value; 