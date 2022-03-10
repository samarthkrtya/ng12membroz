import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()
export class PaymentTermsService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {

    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'paymentterms/filter', toAdd, { headers: this.configuration.headers })
    }
    public getbyAsyncFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'paymentterms/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'paymentterms', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'paymentterms/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncDelete(id: number) {
        return this.http
            .delete(this.configuration.actionUrl + 'paymentterms/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

}
