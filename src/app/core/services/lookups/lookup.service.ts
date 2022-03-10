import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';


@Injectable({
    providedIn: 'root'
})

export class LookupsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    
    }

    public GetAll () {
        return this.httpClient
            .get(this.configuration.actionUrl + 'lookups', { headers: this.configuration.headers })
    }

    public GetById (id: string) {

        return this.httpClient
            .get(this.configuration.actionUrl + 'lookups/' + id, { headers: this.configuration.headers })
    }

    public GetByfilterLookupName (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'lookups/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByfilterLookupName (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'lookups/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public async GetByfilterLookupNameAsync(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'lookups/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Add (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'lookups', toAdd, { headers: this.configuration.headers })
    }

    public Update (id: string, data: any) {
        const toAdd = JSON.stringify(data);

        return this.httpClient.put(this.configuration.actionUrl + 'lookups/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: string) {

        return this.httpClient
            .delete(this.configuration.actionUrl + 'lookups/' + id, { headers: this.configuration.headers })
    }

}