import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';


@Injectable({
    providedIn: 'root'
  })

  
export class CompanyProfileService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }

    public GetAll (){
        return this.httpClient
            .get(this.configuration.actionUrl + 'organizations', { headers: this.configuration.headers })
    }

    public GetById (id: string){
       return this.httpClient
           .get(this.configuration.actionUrl + 'organizations/' + id, { headers: this.configuration.headers })
    }

    public Add (data: any){
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'organizations', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: string, data: any){
       const toAdd = JSON.stringify(data);
       return this.httpClient.put(this.configuration.actionUrl + 'organizations/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: string){
       return this.httpClient
           .delete(this.configuration.actionUrl + 'organizations/' + id, { headers: this.configuration.headers })
    }

}