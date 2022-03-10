import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable()

export class CouponService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'coupons/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'coupons/filter/', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'coupons', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public ApplyCoupon(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'coupons/applycoupon', toAdd, { headers: this.configuration.headers })
            .toPromise()
    }
}
