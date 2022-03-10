import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';
import { AsyncSubject, BehaviorSubject } from 'rxjs';

@Injectable()

export class BillService {

    constructor(
        private http: HttpClient,
        private configuration: Configuration
    ) {
    }

    public AsyncGetById(id: any) {
        return this.http
            .get(this.configuration.actionUrl + 'bills/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncGetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'bills/filter/', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetByfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http
            .post(this.configuration.actionUrl + 'bills/filter/', toAdd, { headers: this.configuration.headers })
    }

    public AsyncAdd(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bills', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public AsyncUpdate(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.put(this.configuration.actionUrl + 'bills/' + id, toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    
    public AsyncDelete(id: any) {
        return this.http
            .delete(this.configuration.actionUrl + 'bills/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

  public GetByIOU(id: any, billid: any) {
      if (billid){
        return this.http
            .get(this.configuration.actionUrl + 'bills/outstanding/' + id + "/" + billid, { headers: this.configuration.headers })
      }
      else {
        return this.http
          .get(this.configuration.actionUrl + 'bills/outstanding/' + id, { headers: this.configuration.headers })
      }
    }

    public BillDetail(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bills/billdetail/', toAdd, { headers: this.configuration.headers });
    }

    public AsyncBillDetail(data: any) {
        const toAdd = JSON.stringify(data);
        return this.http.post(this.configuration.actionUrl + 'bills/billdetail/', toAdd, { headers: this.configuration.headers }).toPromise();
    }

    AySubBilldetail = new BehaviorSubject(null);


}
