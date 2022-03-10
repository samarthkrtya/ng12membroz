import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class MemberSummaryService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }

    public GetAllMemberCountForMembership() {
        return this.httpClient.get(this.configuration.actionUrl + 'report/members/summary', { headers: this.configuration.headers })
    }

    public GetAllNewMemberCountForPayment(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'report/members/summary', toAdd, { headers: this.configuration.headers})
    }
    public GetAllPaymentCountForPaymentItem(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'report/payments/summary', toAdd , { headers: this.configuration.headers})
    }
}