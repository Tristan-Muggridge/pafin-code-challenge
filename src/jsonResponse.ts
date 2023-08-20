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
        
        const returnObject = {
            status: this.status,
            data: this.data,
            ...this.optionalObject,
        }

        // remove any undefined, null, empty arrays, empty objects from data
        return JSON.parse(JSON.stringify(returnObject));
        
    }
}

export default (status: status, data: any, optionalData?:any) => new JSONData(status, data, optionalData); 