import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class EventService {
    
    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public GetByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'events/filter/', toAdd, { headers: this.configuration.headers })
    }

}
