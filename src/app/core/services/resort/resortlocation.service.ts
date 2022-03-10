import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';
@Injectable({
    providedIn: 'root'
})

export class ResortLocationService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    
    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'resortlocations', { headers: this.configuration.headers })
    }

    public GetById(id: any) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'resortlocations/' + id, { headers: this.configuration.headers })
    }
    public AsyncGetById(id: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'resortlocations/' + id, { headers: this.configuration.headers })
            .toPromise();
     }

    

    public Add(data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'resortlocations', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: any, data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.put(this.configuration.actionUrl + 'resortlocations/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
       
       return this.httpClient
           .delete(this.configuration.actionUrl + 'resortlocations/' + id, { headers: this.configuration.headers })
    }
    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'resortlocations/filter', toAdd, { headers: this.configuration.headers })
     }

     public Asyncgetbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'resortlocations/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
     }

}
