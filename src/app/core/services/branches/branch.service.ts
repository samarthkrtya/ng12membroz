import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class BranchesService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }
    
    public AsyncGetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'branches', { headers: this.configuration.headers })
            .toPromise();
    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'branches', { headers: this.configuration.headers })
    }

    public GetById(id: any) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'branches/' + id, { headers: this.configuration.headers })
    }

    public GetByIdAsync(id: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'branches/' + id, { headers: this.configuration.headers })
            .toPromise();
     }

    
    public paymentmode(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'branches/paymentmode', toAdd, { headers: this.configuration.headers })
    }

    public Add(data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'branches', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: number, data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.put(this.configuration.actionUrl + 'branches/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
        return this.httpClient
            .delete(this.configuration.actionUrl + 'branches/' + id, { headers: this.configuration.headers })
    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'branches/filter', toAdd, { headers: this.configuration.headers })
            
    }

    public Asyncgetbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'branches/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
            
    }

    public qrcode(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'branches/generateqrcode', toAdd, { headers: this.configuration.headers })
    }

    public webqrcode(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'branches/generatewebqrcode', toAdd, { headers: this.configuration.headers })
    }

}
