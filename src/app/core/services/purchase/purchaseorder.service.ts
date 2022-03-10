import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class PurchaseOrderService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'purchaseorders/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetPONumber() {
        return this.http
            .get(this.configuration.actionUrl + 'purchaseorders/view/ponumber', { headers: this.configuration.headers })
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'purchaseorders', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'purchaseorders/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

}
