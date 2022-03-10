import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class BIReportsService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public GetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bireports/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bireports/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByViewFilter(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bireports/view/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByChartViewFilter(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bireports/chartreport/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'bireports/' + id, { headers: this.configuration.headers })
    }
    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'bireports/' + id, { headers: this.configuration.headers })
            .toPromise();
    }


}
