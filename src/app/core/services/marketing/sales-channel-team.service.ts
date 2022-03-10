import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class SalesChannelTeamService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'saleschannelteams', { headers: this.configuration.headers })
    }

    public GetById(id: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'saleschannelteams/' + id, { headers: this.configuration.headers })
    }
    public AsyncGetById(id: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'saleschannelteams/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'saleschannelteams/filter', toAdd, { headers: this.configuration.headers })
    }

    public Asyncgetbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'saleschannelteams/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'saleschannelteams/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Update(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'saleschannelteams/' + id, toAdd, { headers: this.configuration.headers })
    }
    

}
