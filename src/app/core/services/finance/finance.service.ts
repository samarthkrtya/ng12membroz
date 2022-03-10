import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';
@Injectable()
export class FinanceService {


    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetBalanceSheet(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'accountheads/financereport/balancesheet', toAdd, { headers: this.configuration.headers })
            .toPromise();

    }

    public GetProfitandloss(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'accountheads/financereport/incomestatement', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetCashFlowStatement(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'accountheads/financereport/cashflowstatement', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public GetAccountHeadByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'accountheads/filter', toAdd, { headers: this.configuration.headers })

    }

    public AsyncGetAccountHeadByFilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'accountheads/filter', toAdd, { headers: this.configuration.headers })
        .toPromise();
    } 

}
