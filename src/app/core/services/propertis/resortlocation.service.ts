
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Configuration } from './../../../app.constants';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable()
export class ResortLocationService {

    constructor(
        private httpClient: HttpClient, 
        private configuration: Configuration
    ) {
    }
    
    public GetAll = (): Observable<any> => {
        return this.httpClient
            .get(this.configuration.actionUrl + 'resortlocations', { headers: this.configuration.headers })
            // .map(res => <any>res.json());
    }

    public GetByfilter = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'resortlocations/filter', toAdd, { headers: this.configuration.headers})
            // .map(res => <any>res.json());
     }

    public GetById = (id: string): Observable<any> => {
       return this.httpClient
           .get(this.configuration.actionUrl + 'resortlocations/' + id, { headers: this.configuration.headers })
        //    .map(res => <any>res.json());
    }

    public Add = (data: any): Observable<any> => {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'resortlocations', toAdd, { headers: this.configuration.headers})
        //    .map(res => <any>res.json());
    }

    public Update = (id: string, data: any): Observable<any> => {
       const toAdd = JSON.stringify(data);
       
       return this.httpClient.put(this.configuration.actionUrl + 'resortlocations/' + id, toAdd, { headers: this.configuration.headers })
        //    .map(res => <any>res.json());
    }

    public Delete = (id: string): Observable<any> => {
       
       return this.httpClient
           .delete(this.configuration.actionUrl + 'resortlocations/' + id, { headers: this.configuration.headers })
        //    .map(res => <any>res.json());
    }

}