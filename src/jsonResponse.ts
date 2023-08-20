import status from "./enums/jsonStatus";

class JSONData {
    public status: status;
    public data?: any;
    public optionalObject?: any;

    constructor(status: status, data?: Object, optionalObject?: any) {
        this.status = status;
        this.data = data;
    }

    public get value() : Object {
        
        let data = this.data;

        for (const key in data) {
            if (data[key] === undefined || data[key] === null) {
                delete data[key];
            }
            else if (Array.isArray(data[key]) && data[key].length === 0) {
                delete data[key];
            }
            else if (typeof data[key] === 'object' && Object.keys(data[key]).length === 0) {
                delete data[key];
            }
        }

        const returnObject = {
            status: this.status,
            data: this.data,
            ...this.optionalObject,
        }        

        return returnObject;
    }
}

export default (status: status, data: any, optionalData?:any) => new JSONData(status, data, optionalData).value; 