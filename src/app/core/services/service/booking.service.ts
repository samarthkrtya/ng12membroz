import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class BookingService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'bookings/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bookings', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdatePT(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.patch(this.configuration.actionUrl + 'bookings/' + id , toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'bookings/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    

}
