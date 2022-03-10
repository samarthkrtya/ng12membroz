import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import { Configuration } from './../../../app.constants';

import { CommonDataService } from './../common/common-data.service';
import { AuthService } from '../common/auth.service';


@Injectable({
    providedIn: 'root'
})

export class UserloginService {

    private actionUrl: string;
    private headers: HttpHeaders = new HttpHeaders();

    constructor(
        private httpClient: HttpClient,
        private configuration: Configuration,
        private _authService: AuthService,
        private _commonDataService: CommonDataService,
    ) {
        this.actionUrl = configuration.Server + 'api/';

        this.headers = new HttpHeaders();
        this.headers = this.headers.set('Content-Type', 'application/json');
        this.headers = this.headers.set('Accept', 'application/json');

    }

    public login (data: any) {
        let toAdd = JSON.stringify(data);
        return this.httpClient.post(this.actionUrl + 'auth/login', toAdd, { headers: this.headers })
    }
    public loginMember (data: any) {
       let toAdd = JSON.stringify(data);
       return this.httpClient.post(this.actionUrl + 'auth/memberlogin', toAdd, { headers: this.headers })
    }
    public loginNonMember (data: any) {
        let toAdd = JSON.stringify(data);
        
        return this.httpClient.post(this.actionUrl + 'auth/nonmemberlogin', toAdd, { headers: this.headers })
     }
    public logout () {
           this._authService.logout();
           return true;
    }
     public GetLoginDetailById (id: any) {
        const roleType = this._authService.auth_roletype;
        if(roleType !== 'M'&& roleType !== 'P') {
            return this.httpClient
                .get(this.actionUrl + 'users/' + id, { headers: this.configuration.headers })
        } else if (roleType === 'M') {
            return this.httpClient
                .get(this.actionUrl + 'members/' + id, { headers: this.configuration.headers })
         } else if (roleType === 'P') {
            return this.httpClient
                .get(this.actionUrl + 'promotions/' + id, { headers: this.configuration.headers })
         }
      
    }
   

}
