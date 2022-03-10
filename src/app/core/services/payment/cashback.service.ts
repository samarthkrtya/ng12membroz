import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()
export class CashbackService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {

    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'cashbackterms/filter', toAdd, { headers: this.configuration.headers })
    }

    public getByAsyncFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'cashbackterms/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'cashbackterms', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'cashbackterms/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Delete(id: any) {
        return this.http.delete(this.configuration.actionUrl + 'cashbackterms/' + id, { headers: this.configuration.headers })
            .toPromise();
    }



}
