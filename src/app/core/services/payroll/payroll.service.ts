import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';
@Injectable({
    providedIn: 'root'
})
export class PayrollService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'payrolls', { headers: this.configuration.headers })
    }

    public AsyncGetEmployeeSalary(id: string) {
        console.log("this.configuration.actionUrl + 'payrolls/employee/' + id", this.configuration.actionUrl + 'payrolls/employee/' + id);
        return this.httpClient
            .get(this.configuration.actionUrl + 'payrolls/employee/' + id, { headers: this.configuration.headers })
    }

    public GetById(id: string) {

        return this.httpClient
            .get(this.configuration.actionUrl + 'payrolls/' + id, { headers: this.configuration.headers })
    }

    public async AsyncGetById(id: any): Promise<any> {
        return this.httpClient
            .get(this.configuration.actionUrl + 'payrolls/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByfilterLookupName(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'payrolls/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByfilterLookupName(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'payrolls/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public async GetByfilterLookupNameAsync(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'payrolls/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'payrolls', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: string, data: any) {
        const toAdd = JSON.stringify(data);

        return this.httpClient.put(this.configuration.actionUrl + 'payrolls/' + id, toAdd, { headers: this.configuration.headers })
    }

    public AysncUpdate(id: string, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'payrolls/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Delete(id: string) {

        return this.httpClient
            .delete(this.configuration.actionUrl + 'payrolls/' + id, { headers: this.configuration.headers })
    }

    public Process(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'payrolls/process', toAdd, { headers: this.configuration.headers })
    }
}