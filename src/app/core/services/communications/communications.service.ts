import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class CommunicationService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient.get(this.configuration.actionUrl + 'communications', { headers: this.configuration.headers })
    }

    public async AsyncGetByfilter(data: any): Promise<any> {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'communications/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetAllfilteredUserData(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'communications/filter', toAdd, { headers: this.configuration.headers })
    }

    public GetByShortFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'communications/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetById(id: any): Promise<any> {
        return this.httpClient.get(this.configuration.actionUrl + 'communications/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetById(id: number) {
        return this.httpClient.get(this.configuration.actionUrl + 'communications/' + id, { headers: this.configuration.headers })
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'communications/add', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: number, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'communications/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
        return this.httpClient.delete(this.configuration.actionUrl + 'communications/' + id, { headers: this.configuration.headers })
    }

   
}