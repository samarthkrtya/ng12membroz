import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class MemberDashboardService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }
    
    public GetMemberDetailById(id: number) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'members/' + id, { headers: this.configuration.headers })
    }

    public GetMemberPaymentDetailById(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient
            .post(this.configuration.actionUrl + 'payments/filter' , toAdd, { headers: this.configuration.headers})
     }

}
