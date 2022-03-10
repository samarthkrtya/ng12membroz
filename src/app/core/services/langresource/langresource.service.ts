import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';

import { Configuration } from './../../../app.constants';

@Injectable({
    providedIn: 'root'
})

export class LangresourceService {

    supportedLanguages: any [] = [];

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        var currentuser = JSON.parse(localStorage.getItem("currentUser"));

        if(currentuser && currentuser.organizationsetting && currentuser.organizationsetting.supportedlanguage) {
            this.supportedLanguages = []
            this.supportedLanguages = currentuser.organizationsetting.supportedlanguage;
        }
        
    }

    public GetAll () {
        return this.httpClient
            .get(this.configuration.actionUrl + 'langresources', { headers: this.configuration.headers })
    }

    public GetById (id: number) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'langresources/' + id, { headers: this.configuration.headers })
    }

    public GetByFilter (data: any) {
        
        if(this.supportedLanguages && this.supportedLanguages.length > 0) {
            const toAdd = JSON.stringify(data);
                return this.httpClient.post(this.configuration.actionUrl + 'langresources/filter', toAdd, { headers: this.configuration.headers})
        } else {
            return Observable.of(this.supportedLanguages).map((o) => o);
        }
        
    }

    public AsyncGetByFilter (data: any) {
        
        if(this.supportedLanguages && this.supportedLanguages.length > 0) {
            const toAdd = JSON.stringify(data);
            return this.httpClient.post(this.configuration.actionUrl + 'langresources/filter', toAdd, { headers: this.configuration.headers})
                .toPromise()
        } else {
            return Promise.resolve(this.supportedLanguages)
        }
        
    }

    public Add (data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.post(this.configuration.actionUrl + 'langresources', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: number, data: any) {
       const toAdd = JSON.stringify(data);
       return this.httpClient.put(this.configuration.actionUrl + 'langresources/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: number) {
       return this.httpClient
           .delete(this.configuration.actionUrl + 'langresources/' + id, { headers: this.configuration.headers })
    }

   

}
