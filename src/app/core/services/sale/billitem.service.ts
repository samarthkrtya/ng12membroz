import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class BillItemService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'billitems/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'billitems/filter/', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }
    
    public AsyncGetByFilterView(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'billitems/filter/view', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByFilterView(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'billitems/filter/view', toAdd, { headers: this.configuration.headers });
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'billitems', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'billitems/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

}
