
import { Component, OnInit } from "@angular/core";
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from "@angular/router";

import { AppInjector } from "../../../app-injector.service";

import { LangresourceService } from './../../../core/services/langresource/langresource.service';
import { AuthService } from "./../../../core/services/common/auth.service";
import { UrlService } from '../../../core/services/common/url.service';
import { SafeHtml } from '@angular/platform-browser';

import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';

declare var $: any;

@Component({
  selector: 'app-base-lite-componemnt',
  templateUrl: './base-lite-componemnt.component.html'
})
export class BaseLiteComponemntComponent implements OnInit {

  protected _authService: AuthService;

  public _loginUser: any;
  protected _loginUserId: any;
  protected _loginUserRole: any;
  protected _loginUserRoleId: any;
  protected _loginUserMembershipId: any;
  protected _loginUserClassId: any;
  protected _loginUserBranchId: any;
  protected _loginUserBranch: any;
  protected _loginUserRoleName: any;
  protected _loginroletype: any;
  protected workingDetails: {};

  protected globalBranch: any;
  protected globalBranchId: any;
  

  protected _organizationsetting: any;

  protected _langresourceService: LangresourceService;
  protected urlService: UrlService;
  protected _router: Router;
  protected snackBar: MatSnackBar;

  public langResource: any;
  public defaultLanguage: any;
  public pagename: any;

  public isMemberLogin: boolean = false;
  
  public gDateFormat: any = "MM/dd/yyyy";
  public gDateTimeFormat: any = 'dd/MM/yyyy HH:mm a';
  public gTimeFormat: any = 'HH:mm a';

  previousObservableUrl: Observable<string>;
  previousUrl: string;

  public globalfunctionpermissions : string[] = [];

  constructor(
  ) {
    const injector = AppInjector.getInjector();
    this._authService = injector.get(AuthService);
    this._langresourceService = injector.get(LangresourceService);
    this._router = injector.get(Router);
    this.urlService = injector.get(UrlService);
    this.previousObservableUrl = this.urlService.previousUrl$;
  }

  async ngOnInit() {

    this.defaultLanguage = "ENG";
    this.defaultLanguage = this._authService.auth_language;
    this.langResource = {};

    this.initialize(); // LOGIN VARIABLES

    try {
      if (this.pagename) {
        await this.loadLangResource(this.pagename); // INITIALIZE LANG VARIABLE
      }
    } catch (error) {
      console.error({ error });
    } finally {
      
      this.urlService.previousUrl$.subscribe((previousUrl: string) => {
        this.previousUrl = previousUrl;
      });

    }

  }


  // LOGIN VARIABLES
  initialize() {
    
    if (this._authService.currentUser) {

      this._loginUserId = this._authService.currentUser._id;
      this._loginUser = this._authService.currentUser.user;
      this._loginUserRole = this._authService.auth_role;
      this._loginUserRoleId = this._authService.auth_role['_id'];
      this._loginUserRoleName = this._authService.currentUser.user.role.rolename;
      this._organizationsetting = this._authService.organizationsetting;
      this._loginroletype = this._authService.auth_role["roletype"];
      
      this.workingDetails = this._authService.currentUser.user.branchid.workinghours;

      if (this._authService.auth_user) {
        if (this._authService.auth_role["roletype"] == "M") {
          if (this._authService.auth_user.membershipid) {
            this._loginUserMembershipId = this._authService.auth_user.membershipid[
              "_id"
            ];
          }
          if (this._authService.auth_user.classid) {
            this._loginUserClassId = this._authService.auth_user.classid;
          }
          this.isMemberLogin = true;
        }
      }

      if (
        this._authService &&
        this._authService.auth_user &&
        this._authService.auth_user.branchid &&
        this._authService.auth_user.branchid._id
      ) {
        this._loginUserBranchId = this._authService.auth_user.branchid._id;
        this._loginUserBranch = this._authService.auth_user.branchid;
      }

      const branch = JSON.parse(localStorage.getItem('globalbranch'));
      this.globalBranch = branch ? branch : this._loginUserBranch;
      this.globalBranchId = branch && branch['_id'] ? branch['_id'] : this._loginUserBranchId;

      if(this._loginUserRole.functionpermissions && this._loginUserRole.functionpermissions.length > 0){
        this.globalfunctionpermissions = this._loginUserRole.functionpermissions;
      }

    }
  }

  async loadLangResource(pageName: any) {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "componentname", searchvalue: pageName, datatype: "text", criteria: "eq" });
    postData["search"].push({ searchfield: "key", searchvalue: true, datatype: "Boolean", criteria: "exists" });

    await this._langresourceService
      .AsyncGetByFilter(postData)
      .then((data) => {
        if (data && Array.isArray(data) && data.length !== 0) {
          this.langResource = {};
          data.forEach((element) => {
            if (element.key && element.value) {
              this.langResource[element.key] = [];
              this.langResource[element.key] = element["value"][this.defaultLanguage] ? element["value"][this.defaultLanguage] : element.key;
            }
          });
        }
      });
  }

  public getLang(key: string, value: string) {
    return this.langResource && this.langResource[key] ? this.langResource[key] : value;
  }


  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.name}  </span>`;
    return html;
  }


  showNotification(from: any, align: any, msg: any, type: any) {
    $.notify(
      {
        icon: "notifications",
        message: msg,
      },
      {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align,
        },
        z_index: 1070
      }
    );
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackBar.open(message, action, {
      duration: 1000,
      panelClass: [className]
    });
  }


}
