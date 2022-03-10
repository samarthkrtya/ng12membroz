import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

@Injectable({
    providedIn: 'root'
})

export class FieldsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }
    
    public GetAll(){
        return this.httpClient
            .get(this.configuration.actionUrl + 'formfields', { headers: this.configuration.headers })
    }

    public GetById (id: number) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'formfieldByID/' + id, { headers: this.configuration.headers })
    }

    public GetFormFieldByFormId (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'formfields/filter', toAdd, { headers: this.configuration.headers})
    }

    public AsyncGetByFilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'formfields/filter', toAdd, { headers: this.configuration.headers})
            .toPromise();
    }

     public Add (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'formfields', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: number, data: any){
        const toAdd = JSON.stringify(data);
       
        return this.httpClient.put(this.configuration.actionUrl + 'formfields/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: number) {
       
        return this.httpClient
            .delete(this.configuration.actionUrl + 'formfields/' + id, { headers: this.configuration.headers })
    }

}
