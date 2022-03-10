import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class UserSummaryService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {
        
    }
    
    public GetAllUsers() {
        return this.httpClient.get(this.configuration.actionUrl + 'users', { headers: this.configuration.headers })
    }

    public GetAllfilteredUserData(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'users/filter', toAdd, { headers: this.configuration.headers})
    }

    public GetAllUserCountForRole() {
        return this.httpClient.get(this.configuration.actionUrl + 'report/users/summary', { headers: this.configuration.headers })
    }

    public GetAllMemberCountForRole(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'report/users/summary', toAdd, { headers: this.configuration.headers})
    }
}