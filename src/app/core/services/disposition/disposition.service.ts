import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class DispositionService {

    constructor(
        private http: HttpClient, 
        private configuration: Configuration
    ) {
    }
    
    public GetAll (){
        return this.http
            .get(this.configuration.actionUrl + 'dispositions', { headers: this.configuration.headers })
    }

    public GetByfilter (data: any){
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'dispositions/filter', toAdd, { headers: this.configuration.headers})
    }

    public AsyncGetByfilter (data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'dispositions/filter', toAdd, { headers: this.configuration.headers})
            .toPromise();
    }
     
    public GetById (id: string){
       return this.http
           .get(this.configuration.actionUrl + 'dispositions/' + id, { headers: this.configuration.headers })
    }

    public Add (data: any){
       const toAdd = JSON.stringify(data);
       return this.http.post(this.configuration.actionUrl + 'dispositions', toAdd, { headers: this.configuration.headers})
    }

    public Update (id: string, data: any){
       const toAdd = JSON.stringify(data);
       
       return this.http.put(this.configuration.actionUrl + 'dispositions/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete (id: string){
       
       return this.http
           .delete(this.configuration.actionUrl + 'dispositions/' + id, { headers: this.configuration.headers })
    }

    public GetBySchemaByFormId (formid: any){
        return this.http
            .get(this.configuration.actionUrl + 'dispositionformfields/schemas/' + formid, { headers: this.configuration.headers })
    }

    public AsyncGetBySchemaByFormId (formid: any){
        return this.http
            .get(this.configuration.actionUrl + 'dispositionformfields/schemas/' + formid, { headers: this.configuration.headers })
            .toPromise();
    }

    public CheckToAllowDispose (data: any){
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'analyticsreports/conditions', toAdd, { headers: this.configuration.headers})
     }

}