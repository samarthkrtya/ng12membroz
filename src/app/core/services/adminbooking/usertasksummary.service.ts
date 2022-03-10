
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Configuration } from './../../../app.constants';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { retry, catchError, tap } from 'rxjs/operators';

@Injectable()
export class UsertaskSummaryService {

    constructor(
        private httpClient: HttpClient, 
        private configuration: Configuration
    ) {
    }
    
    public GetUsertaskCount = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'report/users/tasksummary', toAdd, { headers: this.configuration.headers})
            // .map(res => <any>res.json());
    }
    public GetUsertaskDetailSummary = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
        // const toAdd = { 
        //     "formids" : [ "599673a925f548d7dbbd7c86", "5a153630fd320b20b856fc8d" ],
        //     "dispositionids" : [ "5bc1f415860fb0075b061c09", "5baf5f4cc6ef55470b43cfd8", "5bc1f3f8860fb0075b061c05" ],    
        //     "fromdate": "2017-12-12",
        //     "todate": "2019-12-12"
        // };
        return this.httpClient.post(this.configuration.actionUrl + 'report/users/tasksummarybyuser', toAdd, { headers: this.configuration.headers})
            // .map(res => <any>res.json());
    }
}