import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class OfficeUseSalesTeamService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'salesteams', { headers: this.configuration.headers })
    }

    public GetAllfilteredData(data: any) {
        const toAdd = JSON.stringify(data);
        
        return this.httpClient.post(this.configuration.actionUrl + 'salesteams/filter', toAdd, { headers: this.configuration.headers })
    }

    public GetById(id: number) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'salesteams/' + id, { headers: this.configuration.headers })
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'salesteams', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'salesteams/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
        
        return this.httpClient
            .delete(this.configuration.actionUrl + 'salesteams/' + id, { headers: this.configuration.headers })
    }

}
