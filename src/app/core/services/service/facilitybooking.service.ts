import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class FacilitybookingService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'facilitybookings/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'facilitybookings', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'facilitybookings/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'facilitybookings/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }


    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'facilitybookings/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncDelete(id: any) {
        return this.http.delete(this.configuration.actionUrl + 'facilitybookings/' + id, { headers: this.configuration.headers })
            .toPromise();
    }



}
