import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class PurchaseInvoiceService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'purchaseinvoices/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetPINumber() {
        return this.http
            .get(this.configuration.actionUrl + 'purchaseinvoices/view/pinumber', { headers: this.configuration.headers })
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'purchaseinvoices', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'purchaseinvoices/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

}
