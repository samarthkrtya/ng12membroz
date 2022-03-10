import { Injectable } from '@angular/core';
import { HttpClient} from "@angular/common/http";

import { Configuration } from './../../../app.constants';

@Injectable()
export class MemberService {

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration
    ) {

    }

    public GetAll() {
        return this.httpClient
            .get(this.configuration.actionUrl + 'members', { headers: this.configuration.headers })
    }

    public async AsyncGetByfilter(data: any): Promise<any> {
        const toAdd = JSON.stringify(data);

        return this.httpClient.post(this.configuration.actionUrl + 'members/filter', toAdd, { headers: this.configuration.headers })
            .toPromise();
    }

    public getbyfilterview(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/filter/view', toAdd, { headers: this.configuration.headers })
    }

    public async Asyncgetbyfilterview(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/filter/view', toAdd, { headers: this.configuration.headers })
        .toPromise();
    }

    public getbyfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/filter', toAdd, { headers: this.configuration.headers })
    }


    public getbyshortfilter(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/shortfilter', toAdd, { headers: this.configuration.headers })
    }

    public GetById(id: number) {
        return this.httpClient
            .get(this.configuration.actionUrl + 'members/' + id, { headers: this.configuration.headers })
    }

    public async AsyncGetById(id: number): Promise<any> {
        return this.httpClient.get(this.configuration.actionUrl + 'members/' + id, { headers: this.configuration.headers })
            .toPromise();
    }

    public Add(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members', toAdd, { headers: this.configuration.headers })
    }

    public Update(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'members/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Updatestatus(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'members/updatestatus/' + id, toAdd, { headers: this.configuration.headers })
    }

    public Delete(id: number) {

        return this.httpClient
            .delete(this.configuration.actionUrl + 'members/' + id, { headers: this.configuration.headers })
    }

    public ResetPassword(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/resetpassword', toAdd, { headers: this.configuration.headers })
    }

    public sendotp(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/sendotp', toAdd, { headers: this.configuration.headers })
    }

    public checkemailexists(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/checkemailexists', toAdd, { headers: this.configuration.headers })
    }

    public checkmember(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/checkmember', toAdd, { headers: this.configuration.headers })
    }

    public ResetPasswordByToken(data: any, token: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/resetpassword/' + token, toAdd, { headers: this.configuration.headers })
    }

    public ChangePassword(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/changepassword', toAdd, { headers: this.configuration.headers })
    }

    public ConvertToMember(id: any, data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'members/converttomember/' + id, toAdd, { headers: this.configuration.headers })
    }

    public GetMembershipsDetail(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/membershipsdetail', toAdd, { headers: this.configuration.headers })
    }

    public Updateprofilepic(id: any, data: any) {
        const toAdd = JSON.stringify({ profilepic: data });
        return this.httpClient.put(this.configuration.actionUrl + 'members/updateprofilepic/' + id, toAdd, { headers: this.configuration.headers })
    }

    public promoteStudents( data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.put(this.configuration.actionUrl + 'members/promotestudents' , toAdd, { headers: this.configuration.headers })
    }

    public GetMembrozMemberData(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/membrozclientdetail', toAdd, { headers: this.configuration.headers })
    }

    public GetMemberWallet(data: any) {
        const toAdd = JSON.stringify(data);
        return this.httpClient.post(this.configuration.actionUrl + 'members/filter/wallet/view', toAdd, { headers: this.configuration.headers })
    }

    public ViewCalendarFilter(data: any) {
      const toAdd = JSON.stringify(data);
      return this.httpClient.post(this.configuration.actionUrl + 'members/viewcalendar/filter/', toAdd, { headers: this.configuration.headers })
  }



}
