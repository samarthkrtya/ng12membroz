import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { Configuration } from '../../../app.constants';

@Injectable({
  providedIn: 'root'
})

export class PublicService {

  constructor(
    private httpClient: HttpClient,
    private configuration: Configuration
  ) {

  }


  public GetUserById(id: number) {
    return this.httpClient
      .get(this.configuration.actionUrl + 'public/user/' + id, { headers: this.configuration.headers })
  }

  public GetMemberById(id: number) {
    return this.httpClient
      .get(this.configuration.actionUrl + 'public/member/' + id, { headers: this.configuration.headers })
  }

  public resetUserPwd(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'public/user/resetpassword', toAdd, { headers: this.configuration.headers })
  }

  public resetMemberPwd(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'public/member/resetpassword', toAdd, { headers: this.configuration.headers })
  }

  public sms(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'public/sms', toAdd, { headers: this.configuration.headers })
  }
}
