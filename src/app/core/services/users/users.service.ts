import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class UsersService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient.get(this.configuration.actionUrl + 'users', { headers: this.configuration.headers })
    }

    public async AsyncGetByfilter(data: any): Promise<any> {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetAllfilteredUserData(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByViewfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/view/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByShortFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetById(id: any): Promise<any> {
        return this.httpClient.get(this.configuration.actionUrl + 'users/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetById(id: number) {
        return this.httpClient.get(this.configuration.actionUrl + 'users/' + id, { headers: this.configuration.headers })
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/add', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: number, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'users/' + id, toAdd, { headers: this.configuration.headers })
    }

    public UpdateSalaryComponentAsync(id: string, data: any): Promise<any> {
        const toAdd = JSON.stringify(data);
        return this.httpClient.patch(this.configuration.actionUrl + 'users/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise()
    }

    public AsyncUpdate(id: number, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'users/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public Delete(id: number) {
        return this.httpClient.delete(this.configuration.actionUrl + 'users/' + id, { headers: this.configuration.headers })
    }

    public ViewCalendarFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/viewcalendar/filter/', toAdd, { headers: this.configuration.headers })
    }
}