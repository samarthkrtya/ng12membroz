import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from '../../../app.constants';
@Injectable()
export class FormlistService {

    private actionUrl: string;
    private headers: Headers;

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
    
    }
    
    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'formlists', { headers: this.configuration.headers })
    }

    public GetById(id: number) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'formlists/' + id, { headers: this.configuration.headers })
    }

    public GetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'formlists/filter', toAdd, { headers: this.configuration.headers})
    }

    public AsyncGetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient
            .post(this.configuration.actionUrl + 'formlists/filter', toAdd, { headers: this.configuration.headers})
            .toPromise()
    }
    
    public GetFormListByFormListName(formlistname: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'formlists/' + formlistname, { headers: this.configuration.headers })
    }

    public AsyncGetFormListByFormListName(formlistname: any) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'formlists/' + formlistname, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetBySearch(schemaname: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl +  schemaname + '/search', toAdd, { headers: this.configuration.headers })
    }

    public GetBySearchPagination(schemaname: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl +  schemaname + '/search', toAdd, { observe: "response", headers: this.configuration.headers })
    }

    public AsyncGetBySearchPagination(schemaname: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl +  schemaname + '/search', toAdd, { observe: "response", headers: this.configuration.headers })
        .toPromise()
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'formlists/', toAdd, { headers: this.configuration.headers})
    }

    public Update(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'formlists/' + id, toAdd, { headers: this.configuration.headers })
    }

    public patch(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.patch(this.configuration.actionUrl + 'formlists/' + id, toAdd, { headers: this.configuration.headers })
    }

    public UpdateAll(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'formlists/updateall/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {
        return this.httpClient
            .delete(this.configuration.actionUrl + 'formlists/' + id, { headers: this.configuration.headers })
    }

}
