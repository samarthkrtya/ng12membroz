import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class ReportViewService {

    constructor(
        private http: HttpClient, 
        private configuration: Configuration) {
    }
    
    public GetAllReportDataForMembers(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'report/members/',  toAdd, { headers: this.configuration.headers } )
    }

    public GetAllReportDataForPayments(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'report/payments/',  toAdd, { headers: this.configuration.headers } )
    }   

}
