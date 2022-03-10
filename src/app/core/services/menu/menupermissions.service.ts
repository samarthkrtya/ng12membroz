import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';


@Injectable({
    providedIn: 'root'
})

export class MenupermissionsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration,
    ) {
    }

    public GetAll () {
        return this.httpClient
            .get(this.configuration.actionUrl + 'menupermissions', { headers: this.configuration.headers })
    }

    public GetById (id: number) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'menupermissions/' + id, { headers: this.configuration.headers })
    }

    public GetAllByFilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'menupermissions/filter', toAdd, { headers: this.configuration.headers})
    }

    public GetAllByFilterAsync (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'menupermissions/filter', toAdd, { headers: this.configuration.headers})
        .toPromise()
    }

    public Add (data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'menupermissions', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: number, data: any) {
       const toAdd = JSON.stringify(data);
       
       return this.httpClient.put(this.configuration.actionUrl + 'menupermissions/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: number) {
       
       return this.httpClient
           .delete(this.configuration.actionUrl + 'menupermissions/' + id, { headers: this.configuration.headers })
    }

   

}
