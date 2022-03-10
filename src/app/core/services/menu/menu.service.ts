import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

@Injectable({
    providedIn: 'root'
})

export class MenuService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration,
    ) {
    }

    public GetAll () {
        return this.httpClient
            .get(this.configuration.actionUrl + 'menus', { headers: this.configuration.headers })
    }

    public GetById (id: number) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'menus/' + id, { headers: this.configuration.headers })
    }

    public GetAllByFilter (data: any) {
        
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'menus/filter', toAdd, { headers: this.configuration.headers})
    }
    
    public GetAllUserMenuByFilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'menus/usermenu/filter', toAdd, { headers: this.configuration.headers})
    }

    public AsyncGetAllUserMenuByFilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'menus/usermenu/filter', toAdd, { headers: this.configuration.headers})
            .toPromise();
    }


    public Add (data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'menus', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: number, data: any) {
       const toAdd = JSON.stringify(data);
       
       return this.httpClient.put(this.configuration.actionUrl + 'menus/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: number) {
       
       return this.httpClient
           .delete(this.configuration.actionUrl + 'menus/' + id, { headers: this.configuration.headers })
    }

   

}
