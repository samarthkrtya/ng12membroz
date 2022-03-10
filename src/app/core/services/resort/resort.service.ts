import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class ResortService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public async AsyncGetByfilter(data: any): Promise<any> {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'resorts/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'resorts/filter', toAdd, { headers: this.configuration.headers })
    }

}
