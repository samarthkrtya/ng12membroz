import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()
export class PaymentItemService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public getByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'paymentitems/filter', toAdd, { headers: this.configuration.headers })
    }

    public getByAsyncfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'paymentitems/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

}
