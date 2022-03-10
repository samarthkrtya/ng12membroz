import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()
export class TaxesService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {

    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'taxes/filter', toAdd, { headers: this.configuration.headers })
    }

    public getByAsyncFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'taxes/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

}
