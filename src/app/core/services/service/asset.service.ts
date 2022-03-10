import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class AssetService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'assets/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'assets', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'assets/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'assets/filter', toAdd, { headers: this.configuration.headers })
            
    }

    
    public GetByAsyncFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'assets/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
            
    }

    

}
