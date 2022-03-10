import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

import { UserModel } from './../../models/auth/user.model';
import { FormsService } from './../../services/forms/forms.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  updData: any;
  uptData: any;
  auth_email: string;
  auth_token: string;
  auth_role: string;
  auth_roletype: string;
  auth_id: string;
  auth_user: any;
  auth_currency: any;
  organizationsetting: any;
  auth_language: any;
  auth_cloudinary: any;

  auth_rtl: boolean;

  redirectUrl: string;
  currentUser: UserModel;

  ipAddress = '';

  constructor(
    private httpClient: HttpClient,
    private configuration: Configuration,
    private FormsService: FormsService
  ) {
    this.createdta();
    this.getIPAddress();
  }

  public saleschannelteamByloginId(id: number) {
    return this.httpClient.get(this.configuration.actionUrl + 'auth/saleschannelteam/' + id)
  }

  public AsyncsaleschannelteamByloginId(id: number) {
    return this.httpClient.get(this.configuration.actionUrl + 'auth/saleschannelteam/' + id)
      .toPromise()
  }

  login(user: any) {
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('globalbranch', JSON.stringify(user?.user?.branchid));

      this.auth_email = user.username;
      this.auth_token = user.token;
      this.auth_role = user.role;
      this.auth_roletype = user.roletype;
      this.auth_id = user._id;
      this.auth_user = user.user;
      this.auth_currency = user.currency;
      this.organizationsetting = user.organizationsetting;
      this.auth_language = user.language;
      this.auth_cloudinary = user && user.organizationsetting && user.organizationsetting.property && user.organizationsetting.property.cloudinary && user.organizationsetting.property.cloudinary ? user.organizationsetting.property.cloudinary : undefined;
      this.auth_rtl = user.rtl;
  
      this.configuration.headers.delete('authtoken');
      this.configuration.headers.delete('authkey');
      this.configuration.headers.delete('timezone');
      this.configuration.headers.delete('ipaddress ');
  
      var date = new Date();
      var timezone = date.getTimezoneOffset();
  
      this.configuration.headers = this.configuration.headers.set('authtoken', user.token);
      this.configuration.headers = this.configuration.headers.set('authkey', user._id);
      this.configuration.headers = this.configuration.headers.set('timezone', timezone.toString());
      this.configuration.headers = this.configuration.headers.set('ipaddress', this.ipAddress);

      this.setBranch();
      
  
      console.log("this.configuration.headers", this.configuration.headers);
  
      let postData = {};
      postData["search"] = [];
      postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
      postData["search"].push({"searchfield": "formtype", "searchvalue": false, "criteria": "exists"});
  
      this.FormsService
        .GetByfilter(postData)
        .subscribe((data: any) => {
          if (data && data[0]) {
            localStorage.removeItem('forms');
            localStorage.setItem('forms', JSON.stringify(data));
          }
        })
  }

  setBranch(){
    const branch = JSON.parse(localStorage.getItem('globalbranch'))
    this.configuration.headers.delete('branchid');
    this.configuration.headers = this.configuration.headers.set('branchid', branch?._id);
  }

  isLoggedIn() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      return true;
    } else {
      return false;
    }
  }

  getLoginUser() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.auth_email = this.currentUser.username;
    this.auth_token = this.currentUser.token;
    this.auth_role = this.currentUser.role;
    this.auth_roletype = this.currentUser.roletype;
    this.auth_currency = this.currentUser.currency;
    this.organizationsetting = this.currentUser.organizationsetting;
    this.auth_language = this.currentUser.language;
    this.auth_cloudinary = this.currentUser && this.currentUser.organizationsetting && this.currentUser.organizationsetting.property && this.currentUser.organizationsetting.property.cloudinary && this.currentUser.organizationsetting.property.cloudinary ? this.currentUser.organizationsetting.property.cloudinary : undefined;
    this.auth_rtl = this.currentUser.rtl;

    this.auth_id = this.currentUser._id;
    this.auth_user = this.currentUser.user;

    if (!this.configuration.headers.has('authtoken')) {
      this.configuration.headers.delete('authtoken');
      this.configuration.headers = this.configuration.headers.set('authtoken', this.currentUser.token);
    }

    if (!this.configuration.headers.has('authkey')) {
      this.configuration.headers.delete('authkey');
      this.configuration.headers = this.configuration.headers.set('authkey', this.currentUser._id);
    }

    if (!this.configuration.headers.has('timezone')) {
      this.configuration.headers.delete('timezone');
      var date = new Date();
      var timezone = date.getTimezoneOffset();
      this.configuration.headers = this.configuration.headers.set('timezone', timezone.toString());
    }

    if (!this.configuration.headers.has('ipaddress')) {
      this.configuration.headers.delete('ipaddress');
      this.configuration.headers = this.configuration.headers.set('ipaddress', this.ipAddress);
    }
    return this.currentUser;
  }

  logout(): void {

    this.httpClient.post(this.configuration.actionUrl + 'auth/logout', this.currentUser, { headers: this.configuration.headers })
                  .toPromise()

    localStorage.clear();
    this.auth_email = '';
    this.auth_token = '';
    this.auth_role = '';
    this.auth_id = '';
    this.auth_user = '';
    this.auth_currency = '';
    this.auth_language = '';
    this.auth_cloudinary = '';
    this.auth_rtl = false;
  }




  public updtedta(tmpd: any) {

    if (tmpd == 'tsk') this.uptData.emit('tsk');
    if (tmpd == 'alrt') this.uptData.emit('alrt');
  }

  public ResetPassword(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'auth/member/resetpassword', toAdd, { headers: this.configuration.headers })
  }

  public ResetUserPassword(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'auth/user/resetpassword', toAdd, { headers: this.configuration.headers })
  }

  public AsyncGetByPermission(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'dispositionpermissions/permission', toAdd, { headers: this.configuration.headers })
      .toPromise();
  }

  public async GetByPermissionAsync(data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient.post(this.configuration.actionUrl + 'dispositionpermissions/permission', toAdd, { headers: this.configuration.headers })
      .toPromise();
  }

  public createdta() { this.updData = new EventEmitter(); this.uptData = new EventEmitter(); }

  getIPAddress()
  {
    this.httpClient.get("https://api.ipify.org/?format=json").subscribe((res:any)=>{
      this.ipAddress = res.ip;
    });
  }

}
