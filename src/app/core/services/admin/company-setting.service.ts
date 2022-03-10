import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";

import { retry, catchError, tap } from 'rxjs/operators';

import {Observable} from 'rxjs';
import 'rxjs/add/observable/of';

import { Configuration } from './../../../app.constants';

@Injectable({
  providedIn: 'root'
})

export class CompanySettingService {

  organization: any;

  constructor(
    private httpClient: HttpClient,
    private configuration: Configuration
  ) {
    var user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && user.organizationsetting) this.organization = user.organizationsetting;
  }

  public GetAll () {
    if (!this.organization) {
      return this.httpClient
        .get(this.configuration.actionUrl + "organizationsettings", {
          headers: this.configuration.headers,
        })
    } else {
      return Observable.of([this.organization]).map((o) => o);
    }
  };

  public GetById (id: string) {
    return this.httpClient
      .get(this.configuration.actionUrl + "organizationsettings/" + id, {
        headers: this.configuration.headers,
      })
  };

  public Add (data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .post(this.configuration.actionUrl + "organizationsettings", toAdd, {
        headers: this.configuration.headers,
      })
  };

  public Update (id: string, data: any) {
    const toAdd = JSON.stringify(data);
    return this.httpClient
      .put(this.configuration.actionUrl + "organizationsettings/" + id, toAdd, {
        headers: this.configuration.headers,
      })
  };

  public Delete (id: string) {
    return this.httpClient
      .delete(this.configuration.actionUrl + "organizationsettings/" + id, {
        headers: this.configuration.headers,
      })
  };
}