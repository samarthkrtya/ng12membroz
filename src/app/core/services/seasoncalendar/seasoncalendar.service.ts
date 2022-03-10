import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import { retry, catchError, tap } from 'rxjs/operators';
import { Configuration } from '../../../app.constants';

@Injectable({
    providedIn: 'root'
})

export class SeasoncalendarsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    
    }

    public GetAll () {
        return this.httpClient
            .get(this.configuration.actionUrl + 'seasoncalendars', { headers: this.configuration.headers })
    }

    public GetByfilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars/filter', toAdd, { headers: this.configuration.headers })
    }

    public AsyncGetByfilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetWeekListByYear (year: number) {        
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars/seasonweeks/' + year, { headers: this.configuration.headers })
          
     }

    public async GetByfilterAsync (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }
    

    public GetByfilterIntegration (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars/filterIntegration', toAdd, { headers: this.configuration.headers })
    }

    public GetById (id: number) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'seasoncalendars/' + id, { headers: this.configuration.headers })
    }

    public Add (data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'seasoncalendars', toAdd, { headers: this.configuration.headers })
    }

    public Update (id: any, data: any) {
        
        const toAdd = JSON.stringify(data);
        
        return this.httpClient.put(this.configuration.actionUrl + 'seasoncalendars/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: number) {
        
        return this.httpClient
            .delete(this.configuration.actionUrl + 'seasoncalendars/' + id, { headers: this.configuration.headers })
    }

}
