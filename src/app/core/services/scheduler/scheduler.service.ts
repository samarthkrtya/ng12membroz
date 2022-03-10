import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()

export class SchedulerService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }

    public GetAll() {
        return this.httpClient.get(this.configuration.actionUrl + 'schedulers', { headers: this.configuration.headers })
    }

    public GetById(id: any) {
       return this.httpClient.get(this.configuration.actionUrl + 'schedulers/' + id, { headers: this.configuration.headers })
    }

    public Add(data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'schedulers', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: number, data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.put(this.configuration.actionUrl + 'schedulers/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
        return this.httpClient.delete(this.configuration.actionUrl + 'schedulers/' + id, { headers: this.configuration.headers })
    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'schedulers/filter', toAdd, { headers: this.configuration.headers })
    }

}
