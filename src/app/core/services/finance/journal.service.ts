import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Configuration } from '../../../app.constants';

@Injectable()

export class JournalService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'journal/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'journal', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'journal/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncDelete(id: any) {
        return this.httpClient.delete(this.configuration.actionUrl + 'journal/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetAllOB() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'journals/openingbalance', { headers: this.configuration.headers })
    }

    public AsyncAddOB(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'journals/openingbalance', toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

    public AsyncUpdateOB(id: string, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'journals/openingbalance'+ id, toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

}
