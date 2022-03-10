import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class ActivitylogsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }

    public getbyfilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'history/filter', toAdd, { headers: this.configuration.headers })
    }

    public GetById (id: any,data:any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient
            .put(this.configuration.actionUrl + 'history/' + id, toAdd, { headers: this.configuration.headers })
    } 

}
