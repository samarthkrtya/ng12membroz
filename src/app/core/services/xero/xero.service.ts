import { Injectable } from '@angular/core';
import { HttpClient,HttpParams,HttpHeaders } from "@angular/common/http";

import { Configuration } from './../../../app.constants';
import { AuthService } from '../common/auth.service';


@Injectable({
  providedIn: 'root'
})
export class XeroService {

  public headers = new HttpHeaders();

  constructor(
        private httpClient: HttpClient,
        private configuration: Configuration,
        private authService: AuthService,
    ) {
      var user = JSON.parse(localStorage.getItem("currentUser"));
      this.headers = this.headers.set('Accept', 'application/json');
      this.headers = this.headers.set('Access-Control-Allow-Origin', '*');
    }

    public ConnectToXero() {
      return this.httpClient.get(this.configuration.actionUrl + 'xero/connect/url', { headers: this.configuration.headers })
    }

    public DisconnectToXero(params: any) {
      return this.httpClient.get(this.configuration.actionUrl + 'xero/disconnect', { params: params })

    }


    
     public XeroCallBack(params: any,orgId) {
         let paramsObj = {};
         paramsObj = {...params};
         paramsObj['orgId'] = orgId;
         return this.httpClient.get(this.configuration.actionUrl + 'xero/xerocallback', { params: paramsObj })
      }

    public CreateEmployeeXero(params: any) {
      console.log(params);
    }
    
    public CreateTimesheetXero(params: any) {
      let paramsObj = {};
      paramsObj = {...params};
      const timesheet = JSON.stringify(paramsObj);
      return this.httpClient.post(this.configuration.actionUrl + 'xero/create/timesheet', timesheet, { headers: this.configuration.headers });
    }

    public CreatePayrollCalendarXero(params: any) {
      let paramsObj = {};
      paramsObj = {...params};
      const calendar = JSON.stringify(paramsObj);
      return this.httpClient.post(this.configuration.actionUrl + 'xero/create/payrollcalendar', calendar, { headers: this.configuration.headers });
    }
}
