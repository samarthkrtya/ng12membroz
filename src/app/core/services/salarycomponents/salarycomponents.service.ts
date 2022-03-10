import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';


@Injectable({
    providedIn: 'root'
})

export class salarycomponentService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'salarycomponents', { headers: this.configuration.headers })
    }

    public GetById(id: string) {

        return this.httpClient
            .get(this.configuration.actionUrl + 'salarycomponents/' + id, { headers: this.configuration.headers })
    }

    public async AsyncGetById(id: any): Promise<any> {
        return this.httpClient
            .get(this.configuration.actionUrl + 'salarycomponents/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByfilterLookupName(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salarycomponents/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByfilterLookupName(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salarycomponents/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public async GetByfilterLookupNameAsync(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salarycomponents/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salarycomponents', toAdd, { headers: this.configuration.headers })
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salarycomponents', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Update(id: string, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'salarycomponents/' + id, toAdd, { headers: this.configuration.headers })
    }

    public AsyncUpdate(id: string, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'salarycomponents/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Delete(id: string) {

        return this.httpClient
            .delete(this.configuration.actionUrl + 'salarycomponents/' + id, { headers: this.configuration.headers })
    }
}