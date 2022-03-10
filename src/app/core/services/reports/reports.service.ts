import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class ReportsService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration) {
    }

    public GetAll() {
        return this.http
            .get(this.configuration.actionUrl + 'reports', { headers: this.configuration.headers })
    }

    public GetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'reports/' + id, { headers: this.configuration.headers })
    }

    public AsyncGetByViewFilter(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'reports/view/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'reports/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'reports/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'reports/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetPermissionBasedOnRoleAndForm(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'reports/rolepermission', toAdd, { headers: this.configuration.headers })
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'reports', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'reports/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {

        return this.http
            .delete(this.configuration.actionUrl + 'reports/' + id, { headers: this.configuration.headers })
    }

}
