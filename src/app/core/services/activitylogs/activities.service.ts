import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable({
    providedIn: 'root'
})
export class ActivitiesService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetByViewFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'activities/view/filter/' , toAdd, { headers: this.configuration.headers })
    }



}
