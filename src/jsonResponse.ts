import status from "./enums/jsonStatus";

export default class JSONResponse {
    status: status;
    message?: string;
    data?: Object | null;
    current_page?: number;
    total_pages?: number;
    count?: number;

    constructor(status: status, data?:Object|null, message?:string, additionalInfo?: {
        currentPage?: number
        totalPages?: number
        count?: number
    }) {
        this.status = status;
        this.data = data ? {...data} : null;
        if (message) this.message = message;
        
        if (additionalInfo) {
            this.current_page = additionalInfo.currentPage;
            this.total_pages = additionalInfo.totalPages;
            this.count = additionalInfo.count;
        }
    }
}