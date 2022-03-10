import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class SchemasService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }
    
    public GetById(collectionName: any) {
       return this.httpClient
           .get(this.configuration.actionUrl + '/' + collectionName + '/schemas', { headers: this.configuration.headers })
    }

    public GetFormSchemaByFormName(collectionName: any, formName: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + collectionName +'/schemas/' + formName, { headers: this.configuration.headers })
    }

    public AsyncGetFormSchemaByFormName(collectionName: any, formName: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + collectionName +'/schemas/' + formName, { headers: this.configuration.headers })
            .toPromise()
    }

}
