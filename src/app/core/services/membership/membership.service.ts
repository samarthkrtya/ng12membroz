import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()
export class MembershipService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public async AsyncGetByfilter(data: any): Promise<any> {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'memberships/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }


    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'memberships/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'memberships/' + id, toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

}
