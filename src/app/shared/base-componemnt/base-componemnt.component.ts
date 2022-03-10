
import { Component, OnInit , OnDestroy } from "@angular/core";
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute } from "@angular/router";

import { AppInjector } from "../../app-injector.service";

import { LangresourceService } from "../../core/services/langresource/langresource.service";
import { AuthService } from "./../../core/services/common/auth.service";
import { FormsService } from "./../../core/services/forms/forms.service";

import { CompanySettingService } from "./../../core/services/admin/company-setting.service";
import { CommonService } from "../../core/services/common/common.service";
import { RoleService } from "../../core/services/role/role.service";
import { UrlService } from '../../core/services/common/url.service';

import { SafeHtml } from "@angular/platform-browser";
declare var $: any;
import swal from 'sweetalert2';
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-base-componemnt",
  templateUrl: "./base-componemnt.component.html"
})
export class BaseComponemntComponent implements OnInit, OnDestroy {

  private $destroy : Subject<boolean>  = new Subject<boolean>();

  protected _langresourceService: LangresourceService;
  protected _authService: AuthService;
  protected _router: Router;
  protected _formsService: FormsService;
  protected _companysettingService: CompanySettingService;
  protected _commonService: CommonService;
  protected _roleService: RoleService;
  protected urlService: UrlService;

  public pagename: any;
  public _formId: any;
  public _formName: any;
  public formlistname: any;

  public bindId: any;
  public langResource: any;
  public defaultLanguage: any;

  public currentlogin: any;
  public viewVisibility = false;
  public editVisibility: boolean = false;
  public isLoadPermission = true;

  public gDateFormat: any = "MM/dd/yyyy";
  public isLoadForms = false;
  public formObj: any;
  public subformObj: any;

  public _loginUser: any;
  protected _loginUserId: any;
  protected _loginUserRole: any;
  protected _loginUserRoleId: any;
  protected _loginUserMembershipId: any;
  protected _loginUserClassId: any;
  protected _loginUserBranchId: any;
  protected _loginUserBranch: any;
  protected _loginUserRoleName: any;

  protected globalBranch: any;
  protected globalBranchId: any;

  protected _loginUserBranchStartTime: any;
  protected _loginUserBranchEndTime: any;
  protected _loginUserBranchSolution: any;

  protected _organizationsetting: any;

  public isLoading: boolean = false;
  public isLoadTabs = true;

  public globalfunctionpermissions : string[] = [];

  protected functionPermissionLists: any[] = [];
  protected recordpermissionLists: any[] = [];

  protected editPermission = false;
  protected editPermissionCriteria: any;

  protected deletePermission = false;
  protected deletePermissionCriteria: any;

  public addPermission = false;
  protected addPermissionCriteria: any;

  protected viewPermission = false;
  protected viewPermissionCriteria: any;

  public addMyPermission = false;


  protected import = false;
  protected automation = false;
  protected announcement = false;

  protected ExceptionViewPermission = false;
  protected ExceptionEditPermission = false;
  protected ExceptionDeletePermission = false;
  protected ExceptionAddPermission = false;

  protected addBranchReadOnly: boolean = false;
  protected editBranchReadOnly: boolean = false;

  protected isdirty = false;

  public isAllBranchViewPermission: boolean = false;

  previousObservableUrl: Observable<string>;
  previousUrl: string;
  mode: string;

  constructor() {

    const injector = AppInjector.getInjector();
    this._langresourceService = injector.get(LangresourceService);
    this._authService = injector.get(AuthService);
    this._formsService = injector.get(FormsService);
    this._router = injector.get(Router);
    this._companysettingService = injector.get(CompanySettingService);
    this._commonService = injector.get(CommonService);
    this._roleService = injector.get(RoleService);
    this.urlService = injector.get(UrlService);

    this._authService.isLoggedIn();
    this.currentlogin = this._authService.currentUser.user;

    this.previousObservableUrl = this.urlService.previousUrl$;
  }  

  async ngOnInit() {

    this.defaultLanguage = "ENG";
    this.defaultLanguage = this._authService.auth_language;
    this.langResource = {};

    this.initialize(); // LOGIN VARIABLES
    this.getFunctionPermissionByRole(); // CHECK FORM FUNCTION PERMISSION
    this.getOrganizationsetting();

    try {
      if (this._formName) await this.getFormDetails(null);
      else await this.getFormDetails(this._formId);
      if (this.formlistname) {
        var formname = this.formlistname.split("-")[0];
        this.getsubFormDetails(formname);
      }
      await this.getFormPermission();
      await this.redirectToNoPerm();
    } catch (error) {
      console.log( error );
    } finally {
      await this.loadLangResource(this.pagename); // INITIALIZE LANG VARIABLE
      this.urlService.previousUrl$.subscribe((previousUrl: string) => {
        this.previousUrl = previousUrl;
      });
    }

  }
  ngOnDestroy() {
      
  }

  async loadLangResource(pageName: any) {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "componentname", searchvalue: pageName == 'dynamic-list' && this.formObj && this.formObj._id ? this.formObj._id : pageName, datatype: "text", criteria: "eq" });
    postData["search"].push({ searchfield: "key", searchvalue: true, datatype: "Boolean", criteria: "exists" });
    
    await this._langresourceService
      .AsyncGetByFilter(postData)
      .then((data: any) => {
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

  onLoadData(event: any) {
    if (event.viewVisibility != undefined) {
      this.viewVisibility = event.viewVisibility;
    }
    if (event.isLoadPermission != undefined) {
      this.isLoadPermission = event.isLoadPermission;
    }
  }

  // LOGIN VARIABLES
  initialize() {
    if (this._authService.currentUser) {
      this._loginUserId = this._authService.currentUser._id;
      this._loginUser = this._authService.currentUser.user;
      this._loginUserRole = this._authService.auth_role;
      this._organizationsetting = this._authService.organizationsetting;
      this._loginUserRoleId = this._authService.auth_role['_id'];
      this._loginUserRoleName = this._authService.currentUser.user.role.rolename;

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
        this._loginUserBranchStartTime = this._authService.auth_user.branchid.workinghours.starttime;
        this._loginUserBranchEndTime = this._authService.auth_user.branchid.workinghours.endtime;
        this._loginUserBranchSolution = this._authService.auth_user.branchid.solutiontype;
      }

      const branch = JSON.parse(localStorage.getItem('globalbranch'));
      this.globalBranch = branch ? branch : this._loginUserBranch;
      this.globalBranchId = branch && branch['_id'] ? branch['_id'] : this._loginUserBranchId;


      if(this._loginUserRole.functionpermissions && this._loginUserRole.functionpermissions.length > 0){
        this.globalfunctionpermissions = this._loginUserRole.functionpermissions;
      }




    }
  }

  getOrganizationsetting() {
    this.gDateFormat = this._organizationsetting && this._organizationsetting.dateformat ? this._organizationsetting.dateformat : undefined;
  }

  getFunctionPermissionByRole() {

    this.isLoading = true;
    if (
      this._loginUserRole && this._loginUserRole.permissions &&
      this._loginUserRole.permissions.length !== 0
    ) {
      this._loginUserRole.permissions.forEach((element) => {
        if (
          element.formname != undefined &&
          element.formname == this._formName
        ) {
          if (element.recordpermission != undefined) {
            if (element.recordpermission.length !== 0) {
              this.recordpermissionLists = [];
              this.recordpermissionLists = element.recordpermission;
              if (
                this.recordpermissionLists &&
                this.recordpermissionLists.length !== 0
              ) {
                this.recordpermissionLists.forEach((eleA) => {
                  if (eleA.type == "add") {
                    this.import = true;
                  }
                });
              }
            }
          }
        }

        if (element.formname != undefined && element.formname == "automation") {
          if (element.recordpermission != undefined) {
            if (element.recordpermission.length !== 0) {
              this.recordpermissionLists = [];
              this.recordpermissionLists = element.recordpermission;
              if (
                this.recordpermissionLists &&
                this.recordpermissionLists.length !== 0
              ) {
                this.recordpermissionLists.forEach((eleAutomation) => {
                  if (eleAutomation.type == "add") {
                    this.automation = true;
                  }
                });
              }
            }
          }
        }

        if (
          element.formname != undefined &&
          element.formname == "announcement"
        ) {
          if (element.recordpermission != undefined) {
            if (element.recordpermission.length !== 0) {
              this.recordpermissionLists = [];
              this.recordpermissionLists = element.recordpermission;
              if (
                this.recordpermissionLists &&
                this.recordpermissionLists.length !== 0
              ) {
                this.recordpermissionLists.forEach((eleAnnouncement) => {
                  if (eleAnnouncement.type == "add") {
                    this.announcement = true;
                  }
                });
              }
            }
          }
        }
      });
    }
  }

  async getFormDetails(id: any) {

    this.isLoadForms = true;
    this.isLoading = true;

    if (!id) {

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ searchfield: "formname", searchvalue: this._formName, criteria: "eq", });

      return this._formsService
        .GetByfilterAsync(postData)
        .then((data) => {

          if (data && data.length != 0) {
            this.isLoadForms = false;
            this.isLoading = false;
            this.formObj = data[0];
            this._formName = this.formObj.formname;
            this.ExceptionDeletePermission = true;
            this.ExceptionEditPermission = true;
            this.ExceptionViewPermission = true;
            this.ExceptionAddPermission = true;

            return;
          }
        });
    } else {

      this.isLoadForms = true;

      return this._formsService
        .GetByIdAsync(id)
        .then((data) => {

          if (data) {

            this.formObj = data;
            this._formName = this.formObj.formname;


            if (!this.bindId) {
              this.viewVisibility = true;
              this.isLoadPermission = false;
            }

            this.isLoadForms = false;

            if (this.formObj["rootfields"]) {
              this.sortOn(this.formObj["rootfields"], "formorder");
            }

            this.ExceptionDeletePermission = true;
            this.ExceptionEditPermission = true;
            this.ExceptionViewPermission = true;
            this.ExceptionAddPermission = true;
            return;

          }
        });
    }
  }

  getsubFormDetails(formlist: String) {

    this.isLoadForms = true;
    this.isLoading = true;
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "formname", searchvalue: formlist, criteria: "eq" });

    this._formsService
      .GetByfilter(postData)
      .subscribe((data) => {
        if (data && data.length != 0) {
          this.subformObj = data[0];
          this.isLoadForms = false;
          this.isLoading = false;
        }
      });
  }

  async getFormPermission() {

    if (this.formObj && this.formObj.formtype && this.formObj.formtype !== "inspection") {
      this.viewPermission = true;
      this.editPermission = true;
      return;
    }
    

    if (this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == this._formName);
      if (permissionObj && permissionObj.recordpermission && permissionObj.recordpermission.length !== 0) {
        for (var i = 0; i < permissionObj.recordpermission.length; i++) {
          if (permissionObj.recordpermission[i].type == "edit") {
            this.editPermission = true;
            this.editPermissionCriteria = permissionObj.recordpermission[i].datapermission;
          } else if (permissionObj.recordpermission[i].type == "delete") {
            this.deletePermissionCriteria = permissionObj.recordpermission[i].datapermission;
          } else if (permissionObj.recordpermission[i].type == "add") {
            this.addPermission = true;
            this.addPermissionCriteria = permissionObj.recordpermission[i].datapermission;
          } else if (permissionObj.recordpermission[i].type == "view") {

            this.viewPermission = true;
            this.viewPermissionCriteria = permissionObj.recordpermission[i].datapermission;

            if (permissionObj.recordpermission[i].datapermission == 'All') {
              this.isAllBranchViewPermission = true;
            } else {
              this.isAllBranchViewPermission = false;
            }
          }

          if (permissionObj.recordpermission[i].type == "add" && permissionObj.recordpermission[i].datapermission == "All") {
            this.addBranchReadOnly = false;
          } else if (permissionObj.recordpermission[i].type == "add" && permissionObj.recordpermission[i].datapermission == "My Branch") {
            this.addBranchReadOnly = true;
          } else if (permissionObj.recordpermission[i].type == "add" && permissionObj.recordpermission[i].datapermission == "My") {
            this.addBranchReadOnly = true;
          }

          if (permissionObj.recordpermission[i].type == "add" && permissionObj.recordpermission[i].datapermission == "My") {
            this.addMyPermission = true;
          }

          if (permissionObj.recordpermission[i].type == "edit" && permissionObj.recordpermission[i].datapermission == "All") {
            this.editBranchReadOnly = false;
          } else if (permissionObj.recordpermission[i].type == "edit" && permissionObj.recordpermission[i].datapermission == "My Branch") {
            this.editBranchReadOnly = true;
          } else if (permissionObj.recordpermission[i].type == "edit" && permissionObj.recordpermission[i].datapermission == "My") {
            this.editBranchReadOnly = true;
          }
          if (!this.ExceptionEditPermission && permissionObj.recordpermission[i].type == "edit") {
            this.editPermission = false;
          }

          if (this.ExceptionDeletePermission && permissionObj.recordpermission[i].type == "delete") {
            this.deletePermission = true;
          }

          if (this.ExceptionViewPermission && permissionObj.recordpermission[i].type == "view") {
            this.viewPermission = true;
          }

          if (this.ExceptionAddPermission && permissionObj.recordpermission[i].type == "add") {
            this.addPermission = true;
          }
        }
      }
    }
    return;
  }


  async redirectToNoPerm() {
    if ((this.mode == 'view' && !this.viewPermission)) {
      this._router.navigate([`/pages/test`]);
    } else if (this.mode == 'add' && !this.addPermission) {
      this._router.navigate([`/pages/test`]);
    } else if (this.mode == 'edit' && !this.editPermission) {
      this._router.navigate([`/pages/test`]);
    }
    return;
  }

  async checkExceptionRecordPermission() {

    let postData = {
      contextid: this.bindId,
      userid: this._loginUserId,
      roleid: this._loginUserRoleId
    };
    this.ExceptionEditPermission = true;
    this.ExceptionDeletePermission = true;
    this.ExceptionViewPermission = true;
    this.ExceptionAddPermission = true;
    return this._authService
      .GetByPermissionAsync(postData)
      .then((data: any) => {
        if (data) {

          if (data.permissions) {
            if (data.permissions.length !== 0) {

              data.permissions.forEach(element => {

                if (element.formname == this._formName) {

                  if (element.recordpermission && element.recordpermission.length !== 0) {

                    element.recordpermission.forEach(ele => {

                      if (ele.type == "edit" && ele.datapermission == "none") {
                        this.ExceptionEditPermission = false;
                      } else if (ele.type == "delete") {
                        this.ExceptionDeletePermission = true;
                      } else if (ele.type == "view") {
                        this.ExceptionViewPermission = true;
                      } else if (ele.type == "add") {
                        this.ExceptionAddPermission = true;
                      }
                    })
                  }
                }

              });
            }
          }
          return;
        } else {
          return;
        }

      })

  }

  sortOn(arr: any, prop: any) {
    arr.sort(function (a: any, b: any) {
      if (a[prop] > b[prop]) {
        return -1;
      } else if (a[prop] < b[prop]) {
        return 1;
      } else {
        return 0;
      }
    });
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

  recordexistshowNotification(from: any, align: any, msg: any, type: any) {
    $.notify(
      {
        icon: "glyphicon glyphicon-duplicate",
        message: msg,
      },
      {
        type: type,
        timer: 3000,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.name}  </span>`;
    return html;
  };

  noeditpermissionMsg(mode: any) {
    swal.fire({
      title: "No Permission",
      text: "You have no " + mode + " permission for this form.",
      timer: 2000,
      showConfirmButton: false
    });

  }

  checkcustomeralerts(action: string, customerid: string) {
    
    // API Call formdatas
    // if Data NOT NULL
    // POPUP - data display
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": "61ea9a643418dc2b6f463b62", "criteria": "eq" , "datatype" : "ObjectId" });
    if(customerid){
      postData["search"].push({ "searchfield": "contextid", "searchvalue": customerid, "criteria": "eq" , "datatype" : "ObjectId" });
    }

    const url = "formdatas/filter";
    const method = "POST"; 
    
    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.$destroy))
      .subscribe(async (data: any) => {
        if (data && data.length > 0) {
          let displayalertin , alerts =  data[0].property.alerts as any[];
          displayalertin = alerts.findIndex(a =>a.alertcode.toLowerCase() == action.toLowerCase());
          if(displayalertin != -1 && alerts[displayalertin].alertvalue){
            swal.fire({
              title: 'Alert',
              text: alerts[displayalertin].alertvalue,
              icon: 'warning',
              customClass: {
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
            });
          }
        }
      });
  }
}

export declare interface BaseComponemntInterface {
  /**
   * A callback method that is invoked immediately after the
   * default change detector has checked the directive's
   * data-bound properties for the first time,
   * and before any of the view or content children have been checked.
   * It is invoked only once when the directive is instantiated.
   */
  LoadData(): void;
  Save(): void;
  Update(): void;
  Delete(): void;
  ActionCall(): void;
}
