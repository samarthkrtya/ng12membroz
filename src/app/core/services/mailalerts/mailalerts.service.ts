import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()

export class MailalertsService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }
    
    public GetAll(){
        return this.httpClient
            .get(this.configuration.actionUrl + 'mailalerts', { headers: this.configuration.headers })
    }

    public GetById(id: any){
        return this.httpClient
           .get(this.configuration.actionUrl + 'mailalerts/' + id, { headers: this.configuration.headers })
    }

    
    public Add(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts', toAdd, { headers: this.configuration.headers })
    }

    
    public Update(id: number, data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'mailalerts/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number){
       
        return this.httpClient
            .delete(this.configuration.actionUrl + 'mailalerts/' + id, { headers: this.configuration.headers })
    }

    public getbyfilter(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts/filter', toAdd, { headers: this.configuration.headers })
     }

     public sendschedule(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts/sendschedule', toAdd, { headers: this.configuration.headers })
     }

     public notifications(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts/notifications', toAdd, { headers: this.configuration.headers })
     }

     public rendsendnotifications(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts/rendsendnotifications', toAdd, { headers: this.configuration.headers })
     }

     public sendcommunication(data: any){
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'mailalerts/sendcommunication', toAdd, { headers: this.configuration.headers })
     }


}
