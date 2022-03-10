
import { Injectable } from '@angular/core';
//import { Http, Response, Headers } from '@angular/http';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { Configuration } from './../../../app.constants';


@Injectable()
export class AdminDashboardService {

    selectMonthYearArray: any[] = [];
    defaultLabelArr: string[] = [];
    defaultseriesArr: number[] = [];

    constructor(
        //private http: Http, 
        private http: HttpClient,
        private configuration: Configuration) {         
        this.loadMonthArray();
    }

    public Getsetupchk = (data:any): Observable<any> => {
        const toAdd = JSON.stringify({ id: "5e41586a367a77d7b6c83b6e" });        
        return this.http
            .post(this.configuration.actionUrl + 'common/checksetup', toAdd, { headers: this.configuration.headers })
            //.map(res => <any>res.json());
    }

    public Getgettingstarted = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'gettingstarted/filter', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
    }
    
    public GetTotalMember = (): Observable<any> => {
       return this.http
           .get(this.configuration.actionUrl + 'dashboards/member/total', { headers: this.configuration.headers })
           //.map(res => <any>res.json());
    }
    public GetNewMemberCount = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/member/recent', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }

     public GetRecentPaymentAmount = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/payment/recent', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }

     public GetRecentBookingCount = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/booking/recent', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }

     public GetReceivedPaymentList = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/payment/received', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }
     public GetReceivedPaymentListFilter = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'payments/filter', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }
     public GetDuePaymentList = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/payment/due', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }
     public GetDuePaymentListFilter = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'paymentschedules/filter', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }
     public GetMemberCountMonthwise = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/member/monthwise', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }
     public GetPaymentAmountMonthwise = (data: any): Observable<any> => {
        const toAdd = JSON.stringify(data);
            return this.http.post(this.configuration.actionUrl + 'dashboards/payment/monthwise', toAdd, { headers: this.configuration.headers})
            //.map(res => <any>res.json());
     }

     public loadMonthArray(currentYear: number = 0, currentMonth: number = 0) {
        let theMonths = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May','Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        let today = new Date();
        let aMonth = today.getMonth();
        let aYear = today.getFullYear();
        if (currentYear !== 0) {
            if (currentMonth !== 0) {
                aYear = currentYear;
                aMonth = currentMonth;
            }
        }
        let i;
        for (i = 0; i < 12; i++) {
            this.selectMonthYearArray.push({ year: aYear, month: theMonths[aMonth], monthNo: aMonth + 1 });
            if (aMonth === 0) {
                aMonth = 12;
                aYear = aYear - 1;
            }
            aMonth--;
        }
        this.selectMonthYearArray = this.selectMonthYearArray.reverse();
        if (this.selectMonthYearArray !== [])  {
            this.selectMonthYearArray.forEach(ele => {
                this.defaultLabelArr.push(ele.month);
                this.defaultseriesArr.push(0);
            });
        }

    }


}
