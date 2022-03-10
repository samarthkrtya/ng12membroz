import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable({
    providedIn: 'root'
})

export class ImportService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    
    }
    
    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'imports', { headers: this.configuration.headers })
    }

    public GetById(id: string) {
       return this.httpClient
           .get(this.configuration.actionUrl + 'imports/' + id, { headers: this.configuration.headers })
    }

    public GetImportsById(id: string) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'imports/' + id, { headers: this.configuration.headers })
     }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'uploads', toAdd, { headers: this.configuration.headers})
    }
    
    public AsyncgetAlldata(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'imports/get-alldata', toAdd, { headers: this.configuration.headers})
            .toPromise()
    }

    public getHeadings(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'imports/get-headings', toAdd, { headers: this.configuration.headers})
    }

    public checkExcel(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'imports/check-excel', toAdd, { headers: this.configuration.headers})
    }

    public importExcel(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'imports/import-excel', toAdd, { headers: this.configuration.headers})
    }

    public Uploads(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'uploads/upload_locally', toAdd, { headers: this.configuration.headers})
     }

    public Update(id: string, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'uploads/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: string) {
        return this.httpClient
           .delete(this.configuration.actionUrl + 'uploads/' + id, { headers: this.configuration.headers })
    }

}