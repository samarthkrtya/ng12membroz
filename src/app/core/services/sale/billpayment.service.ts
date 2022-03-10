import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class BillPaymentService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'billpayments/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'billpayments/filter/', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'billpayments', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }
}
