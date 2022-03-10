import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from "@angular/platform-browser";
import { FileSaverService } from 'ngx-filesaver';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from '@angular/cdk/collections';

import { BaseComponemntInterface } from '../../shared/base-componemnt/base-componemnt.component';
import { FormComponemntComponent } from '../../shared/base-componemnt/form-componemnt/form-componemnt.component';
import { ButtonModel } from '../../core/models/dynamic-lists/button.model';
import { FormsModel } from '../../core/models/forms/forms.model';
import { CommonDataService } from './../../core/services/common/common-data.service';
import { ActivitylogsService } from '../../core/services/activitylogs/activity-logs.service';
import { FormlistService } from '../../core/services/formlist/formlist.service';
import { MyCurrencyPipe } from './../../shared/components/currency.pipe';
import {Sort} from '@angular/material/sort';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-dynamic-list',
  templateUrl: './dynamic-list.component.html',
})
export class DynamicListComponent extends FormComponemntComponent implements OnInit, BaseComponemntInterface {

  totalPages = 0;
  totalCount = 0;
  isLoadingResults = true;
  pageSize = 10;
  currentPage: number = 1;

  destroy$: Subject<boolean> = new Subject<boolean>();

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  displayedColumns: any[] = [];

  formA: string[] = [];

  _formsModel = new FormsModel();

  courseid: any;
  classid: any;

  dispalyformname: any;
  formlistTitle: any;
  allFormsList: any[] = [];
  _defaultTabName: any;
  bindId: any;
  formStatus: string;
  _formTitle: string;

  _visibility: boolean = false;
  ishideaddbutton: boolean = false;
  isaddbuttononPopup: boolean = false;
  isaddbuttononPopupsubject: boolean = false;
  isaddbuttononStaticPopup: boolean = false;
  ishidemorebutton = false;

  isLoading = false;
  isLoadingpopup: Boolean = false;

  formlistaddbuttonurl: string;
  querystring: string;
  formList: any = {};
  listFilterParams: any = {};
  listDisplayFieldList: any[] = [];

  headerRowtemp: any[] = [];
  headerRowtempPrint: any[] = [];
  headerRowtemplabelname: any[] = [];

  detailList: any[] = [];
  currentediInPopupList: any;
  apiUrl: any = '';
  apiUpdateUrl: any = '';
  gridactionList: any[] = [];

  editBtn: ButtonModel | null;
  customBtn: ButtonModel | null;
  popupBtn: ButtonModel | null;
  deleteBtn: ButtonModel | null;
  cancelBtn: ButtonModel | null;

  filterFieldList: any[] = [];
  historydata: any[] = [];

  filterMode: any = '';
  filterFieldListLoad = false;
  _allformDetailsBasedId: any[] = [];
  _allformDetailsBasedschemas: any[] = [];

  isFilterListing: boolean = false;
  subformDetails: any[] = [];

  quickfromstyle: any;
  quickformschemaname: any;
  quickformEnable = false;
  popupaddbtnstatus = false;

  quickstaticformEnable = false;
  starteditpopupstatic: any;
  staticaddstatus = false;

  quickedithistoryEnable = false;
  mailalertsendenable = false;

  grantedRoleLists: any[] = [];

  exportPDF = false;
  exportExcel = false;
  exportCSV = false;


  currentdataToupdate: any;
  currentpassword: string = '';
  changePassUsername: string = '';
  hidepasswd: boolean = true;
  validpasswd: boolean = true;
  automaticgn: boolean = false;


  isredirectwithid: any;

  formtype: any;
  isConvertloading = false;

  branchList: any[] = [];
  selectedBranchName: string = 'ALL Branch';
  selectedBranch: any;

  pagination: any;
  recordPerPageLists: any[] = [10, 20, 30, 50, 100, 1000]
  isButtonEnable: boolean = true;
  actionCounter = 0;
  displayContent: string;

  formlistupdate: boolean = false;
  updatedFormListObj: any = {};

  selectedSaleschannelTeamIds: any [] = [];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  // @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  importPermission:Boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _formlistService: FormlistService,
    private _commonDataService: CommonDataService,
    private datePipe: DatePipe,
    private _activitylogsService: ActivitylogsService,
    private _myCurrencyPipe: MyCurrencyPipe,
    private sanitizer: DomSanitizer,
    private _FileSaverService: FileSaverService,
  ) {
    super()
    this.pagename = "dynamic-list";
    this._route.params.forEach((params) => {
      this._formName = params["formname"];
      this.classid = params["classid"];
      this.courseid = params["courseid"];
      this.formlistname = params["formlisting"];
    })
  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      try {
        this._formName = params["formname"];
        await super.ngOnInit();
        await this.initializeVariable();
        await this.clearActionBtn()
        await this.getFormdetail();
        await this.getFormList();
        await this.formDataOperation();
        await this.getAllBranch();
        if(this._loginUserRole?.functionpermissions.includes("Allow exporting Appointments, Customer & Order Lists")){
          this.exportCSV = true;
        }
        if(this._loginUserRole?.functionpermissions.includes("Allow importing Appointments, Customer & Order Lists")){
          this.importPermission = true;
        }
      } catch (error) {
        console.log(error);
      } finally {
        await this.getAllListData();
      }
    })
  }

  ngOnDestroy() {

    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();

    if (this._commonDataService.summaryfilterDataIds != undefined) {
      this._commonDataService.summaryfilterDataIds = undefined;
    }

  }

  ngAfterViewInit() {
    //this.dataSource.sort = this.sort;

  }

  async LoadData() {
  }

  async initializeVariable() {

    this.formtype = '';
    this.grantedRoleLists = [];
    this.grantedRoleLists.push("Admin");
    this.grantedRoleLists.push("member");

    this.isLoading = false;
    this.listFilterParams.search = [];
    this.listFilterParams.searchref = [];
    this.listFilterParams.select = [];
    this.listFilterParams.sort = "";
    this.pageSize = 10;

    this.currentdataToupdate = {};

    this.exportPDF = true;
    this.exportExcel = true;
    // this.exportCSV = true;

    this.ishideaddbutton = false;
    this.ishidemorebutton = false;
    this.formlistTitle = '';
    this.formlistaddbuttonurl = '';
    this.querystring = null;
    

    if (this._commonDataService.filterfieldoptionsaparams.search != undefined) {
      let tmpArr: any[] = this._commonDataService.filterfieldoptionsaparams['search'];
      if (tmpArr.length > 0) {
        tmpArr.forEach(ele => {
          if (ele.searchfield != undefined && ele.searchfield == 'formid') {
            if (ele.searchvalue != undefined) {
              this.isredirectwithid = ele.searchvalue;
            }
          }
        });
      }
    }

    if (this._commonDataService.filterstaffattandancesaparams.search != undefined) {
      let tmpArr: any[] = this._commonDataService.filterstaffattandancesaparams['search'];
      if (tmpArr.length > 0) {
        tmpArr.forEach(ele => {
          if (ele.searchfield != undefined && ele.searchfield == 'userid') {
            if (ele.searchvalue != undefined) {
              this.isredirectwithid = ele.searchvalue;
            }
          }
        });
      }
    }

    this.isFilterListing = false;
    if (this._commonDataService.isfilterDataForDynamicPages) {
      if (this._commonDataService.filterDataForDynamicPagesparams) {
        this.isFilterListing = true;
        this._commonDataService.isfilterDataForDynamicPages = false;
      }
    }

    const fname = this._formName;
    this.formA.push(fname);
    if (this.formA.length > 1) {
      if (this._commonDataService.summaryfilterDataIds != undefined) {
        this._commonDataService.summaryfilterDataIds = undefined;
      }
    }
    this.actionCounter = 0;
    return;
  }

  async getAllBranch() {


    var url = "branches/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if(data && data[0]) {
          this.branchList = [];
          this.branchList = data;
          return;
        }
        return;
      });
  }

  async clearActionBtn() {
    this.editBtn = {} as any;
    this.customBtn = {} as any;
    this.popupBtn = {} as any;
    this.deleteBtn = {} as any;
    this.cancelBtn = {} as any;
    return;
  }

  async getFormdetail() {

    if (!this.isFilterListing) {
      this.isLoadForms = true;
    }
    this.formSchemaName = '';
    await this.clearActionBtn();
    let eleform = this.formObj;
    if (!this._allformDetailsBasedId[eleform._id]) {
      this._allformDetailsBasedId[eleform._id] = {};
    }
    if (!this._allformDetailsBasedschemas[eleform.schemaname]) {
      this._allformDetailsBasedschemas[eleform.schemaname] = {};
    }

    this._allformDetailsBasedschemas[eleform.schemaname] = eleform;
    this._allformDetailsBasedId[eleform._id] = eleform;

    if (eleform.formname == this._formName) {
      this._formsModel = eleform;
      if (!this.isFilterListing) {
        this.viewVisibility = true;
      }
      this.isLoadPermission = false;
      this.formSchemaName = eleform.schemaname;
      this._formId = eleform._id;
      if (eleform.gridaction != undefined) {
        this.gridactionList = eleform.gridaction;
        this.gridActionLists();
      }

      if (!this.formlistname) {
        if (eleform.formlistname != undefined) {
          if (this.isFilterListing) {
            this.formlistname = this.subformDetails['formlistname'];
          } else {
            this.formlistname = eleform.formlistname;
          }
        }
        this.apiUrl = eleform.listurl;
        this.apiUpdateUrl = eleform.editurl;
      } else {
        this.apiUrl = eleform.listurl;
        this.apiUpdateUrl = eleform.editurl;
      }

      if (eleform.addbuttonurl) {
        var url = eleform.addbuttonurl.replace(':_formid', this._formId);
        this.formlistaddbuttonurl = url;
      } else {
        this.formlistaddbuttonurl = "/pages/dynamic-forms/form/" + this._formId;
      }
      if (eleform.querystring) {
        this.querystring = eleform.querystring;
      }
      

      if (eleform.ishideaddbutton != undefined) {
        this.ishideaddbutton = eleform.ishideaddbutton;
      }

      this.isaddbuttononPopup = false;
      this.isaddbuttononPopupsubject = false;

      if (eleform.formtype) {
        this.formtype = eleform.formtype;
      }

      if (eleform.isaddbuttononPopup != undefined) {
        this.isaddbuttononPopup = eleform.isaddbuttononPopup;
      }

      if (eleform.isaddbuttononPopupsubject) {
        this.isaddbuttononPopupsubject = eleform.isaddbuttononPopupsubject;
      }

      if (eleform.ishidemorebutton != undefined) {
        this.ishidemorebutton = eleform.ishidemorebutton;
      }

      this.dispalyformname = eleform && eleform.langresources && eleform.langresources[this.defaultLanguage] ? eleform.langresources[this.defaultLanguage] : eleform.dispalyformname ? eleform.dispalyformname : eleform.formlistname;

      this.isaddbuttononStaticPopup = false;
      if (eleform.isaddbuttononStaticPopup != undefined) {
        this.isaddbuttononStaticPopup = eleform.isaddbuttononStaticPopup;
      }
      //this._router.navigate(['pages/dynamic-list/list/' + this._formName]);
    }
    return;
  }

  gridActionLists() {
    this.gridactionList.forEach(ele => {
      if (ele.action == 'edit') {
        this.editBtn.isShow = true;
        this.editBtn.url = ele.url;
        this.editBtn.actionurl = ele.actionurl;
        this.editBtn.propertObj = ele;
        this.editBtn.action = ele.action;
        this.editBtn.color = ele.color;
        this.editBtn.title = ele.title;
      } else if (ele.action == 'popup') {
        if (ele.type == 'resetpwdpopup') {
          if (this.addPermission == true) {
            this.popupBtn.isShow = true;
          } else {
            this.popupBtn.isShow = false;
          }
        } else {
          this.popupBtn.isShow = true;
        }
        this.popupBtn.url = ele.url;
        this.popupBtn.propertObj = ele;
        this.popupBtn.action = ele.action;
        this.popupBtn.actionurl = ele.actionurl;
        this.popupBtn.color = ele.color;
        this.popupBtn.title = ele.title;
        this.popupBtn.quickfromstyle = ele.quickfromstyle;
        this.popupBtn.quickformschemaname = ele.quickformschemaname;
      } else if (ele.action == 'delete') {
        this.deleteBtn.isShow = true;
        this.deleteBtn.url = ele.url;
        this.deleteBtn.actionurl = ele.actionurl;
        this.deleteBtn.propertObj = ele;
        this.deleteBtn.action = ele.action;
        this.deleteBtn.title = ele.title;
        this.deleteBtn.color = ele.color;
      } else if (ele.action == 'cancel') {
        this.cancelBtn.isShow = true;
        this.cancelBtn.url = ele.url;
        this.cancelBtn.actionurl = ele.actionurl;
        this.cancelBtn.propertObj = ele;
        this.cancelBtn.action = ele.action;
        this.cancelBtn.color = ele.color;
        this.cancelBtn.title = ele.title;
      } else if (ele.action == 'edit2') {
        this.customBtn.isShow = true;
        this.customBtn.url = ele.url;
        this.customBtn.actionurl = ele.actionurl;
        this.customBtn.propertObj = ele;
        this.customBtn.action = ele.action;
        this.customBtn.color = ele.color;
        this.customBtn.title = ele.title;
      }
    });
    if (this.cancelBtn.isShow) {
      this.deleteBtn.isShow = false;
    }
  }

  async getFormList() {

    this.isLoading = true;
    this.filterFieldListLoad = false;

    if(this.formlistupdate == true) {

      this.formList = this.updatedFormListObj;

      setTimeout(() => {
        this.updatedFormListObj = {}
        this.formlistupdate = false;
      });

    } else {
      this.formList = this.formlistObj;
    }




    if (this.formList.addbuttonurl) {
      var url = this.formList.addbuttonurl.replace(':_formid', this._formId);
      this.formlistaddbuttonurl = url;
    }
    if (this.formList && this.formList['gridaction'] && this.formList['gridaction'].length !== 0) {
      this.gridactionList = [];
      this.clearActionBtn();
      this.gridactionList = this.formList.gridaction;
      this.gridActionLists()
    }
    this.isLoading = false;
  }

  async formDataOperation() {

    if (this.formList.selectfields) {
      this.listFilterParams['select'] = [];
      this.listDisplayFieldList = this.formList.selectfields;
      this.listFilterParams.select = this.formList.selectfields;
    }
    if (this.formList.limit) {
      this.listFilterParams['limit'] = '';
      this.listFilterParams.limit = this.formList.limit;
    }
    if (this.formList.sortfields) {
      this.listFilterParams['sort'] = "";
      this.formList.sortfields.forEach(element => {
        this.listFilterParams.sort = element;
      });
    }
    this.searchsetting();
    if (this.formList.filterfields) {
      this.filterFieldList = this.formList.filterfields;
    }
    this.headerRowtemplabelname = [];
    this.headerRowtemp = [];
    this.listDisplayFieldList.forEach(element => {
      // if (element.isDisplayOnList == true) {
        let fielddisplaytextvalue = '';
        if (this.defaultLanguage && element.langresources && element.langresources[this.defaultLanguage]) {
          fielddisplaytextvalue = element.langresources[this.defaultLanguage];
        } else {
          fielddisplaytextvalue = element.displayname;
        }
        this.headerRowtempPrint.push(fielddisplaytextvalue);
        if (this.headerRowtemplabelname.find(ele25 => ele25.fieldname == element.fieldname) == undefined) {
          this.headerRowtemplabelname.push(element);
          let obj = { name: element.fieldname, displayname: element.displayname, fieldname: element.fieldname, fieldtype: element.fieldtype, isDisplayOnList : element.isDisplayOnList}
          this.headerRowtemp.push(obj);
        }
      // }
    });
    this.formlistTitle = this.formList && this.formList.langresources && this.formList.langresources[this.defaultLanguage] ? this.formList.langresources[this.defaultLanguage] : this.formList.title ? this.formList.title : this.formList.formlistname;
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  changePage(pageNumber: number): void {
    console.log("pageNumber", pageNumber);
    this.currentPage = Math.ceil(pageNumber);
    let search_term = $("#global_search_terms").val();
    if(search_term){
      this.globalSearch();
    }else{
      this.getAllListData();
    }
  }

  createRange() {
    let items: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      items.push(i);
    }
    return items;
  }

  searchsetting() {

    if (this.formList.searchfield) {
      this.listFilterParams['search'] = [];
      this.formList.searchfield.forEach(element => {
        if (element.isfilter != undefined && element.isfilter == true && !element.cond) {
          if (element.type == 'lookup') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'loginId') {
                if (element.isdynamicCriteria != undefined) {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": [this._loginUserId], "criteria": element.isdynamicCriteria });
                } else {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "criteria": "eq" });
                }

              } else if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'dynamic') {
                if (element.isdynamicFilterCriteria != undefined && element.isdynamicFilterCriteria == 'global') {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "cond": element.cond, "datatype": element.datatype });
                } else {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria });
                }

              } else {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq" });
              }
            } else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq" });
            }
          } else if (element.type === 'boolean') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "datatype": element.type });
          } else if (element.type === 'objectid') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "datatype": element.type });
          } else if (element.type === 'string') {
            if (element.isdynamicFilter && element.isdynamicFilterValue == 'loginId') {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "criteria": "eq", "datatype": element.datatype });
            } else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria ? element.criteria : "eq", "datatype": element.type });
            }

          } else if (element.type === 'array') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "in" });
          } else if (element.type === 'Date') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'todaydate') {
                if (element.iscondition && element.iscondition == "EXACTTODAY") {
                  var date = new Date();
                  date.setUTCHours(23);
                  date.setUTCMinutes(59);
                } else {
                  var date = new Date();
                  date.setDate(date.getDate() + 1);
                }
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": date, "criteria": element.isdynamicFilterCriteria, "datatype": "Date" });
              } else {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
              }
            } else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
            }
          } else if (element.type === 'surveyform') {
            if (element.default == "this._loginUserId") {
              if (this._loginUserId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserMembershipId") {
              if (this._loginUserMembershipId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserMembershipId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserClassId") {
              if (this._loginUserClassId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserClassId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "datatype": "ObjectId", "criteria": "eq" });
            }
          } else if (element.type === 'readonly') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined) ? element.criteria : "eq"), "datatype": element.type });
          } else if (element.type === undefined) {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined) ? element.criteria : "eq") });
          }
        }
        else if (element.isfilter != undefined && element.isfilter == true && element.cond) {
          if (element.type === 'boolean') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "datatype": element.type, "cond": element.cond });
          }
        }
      });
      if (this._commonDataService.filterDataForDynamicPagesparams['search']) {
        if (this._commonDataService.filterDataForDynamicPagesparams['search'][0] && this.isFilterListing) {
          if (this._commonDataService.filterDataForDynamicPagesparams['searchtype']) {
            if (this._commonDataService.filterDataForDynamicPagesparams['searchtype'] == 'searchref') {
              if (!this.listFilterParams['searchref']) {
                this.listFilterParams['searchref'] = [];
              }
              this.listFilterParams['searchref'].push(this._commonDataService.filterDataForDynamicPagesparams['search'][0]);
            } else {
              this.listFilterParams['search'].push(this._commonDataService.filterDataForDynamicPagesparams['search'][0]);
            }
          }
        }
      }
      if (this._commonDataService.filterDataForGlobalSearchparams['search'][0] && this._commonDataService.isfilterDataForGlobalSearch) {
        this.listFilterParams['search'].push(this._commonDataService.filterDataForGlobalSearchparams['search'][0]);
        this._commonDataService.isfilterDataForGlobalSearch = false;
      }
    }
    if (this.formList.searchreffield) {
      this.listFilterParams['searchref'] = [];
      this.formList.searchreffield.forEach(element => {
        if (element.isfilter != undefined && element.isfilter == true) {
          if (element.type == 'lookup') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'loginId') {
                if (element.isdynamicCriteria != undefined) {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": [this._loginUserId], "criteria": element.isdynamicCriteria });
                } else {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "criteria": "eq" });
                }
              } else if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'dynamic') {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria });
              } else {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq" });
              }
            } else {
              this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq" });
            }
          } else if (element.type === 'array') {
            this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "in" });
          } else if (element.type === 'Date') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'todaydate') {
                if (element.iscondition && element.iscondition == "EXACTTODAY") {
                  var date = new Date();
                  date.setUTCHours(23);
                  date.setUTCMinutes(59);
                } else {
                  var date = new Date();
                  date.setDate(date.getDate() + 1);
                }
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": date, "criteria": element.isdynamicFilterCriteria, "datatype": "Date" });
              } else {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
              }
            } else {
              this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
            }
          } else if (element.type === 'surveyform') {
            if (element.default == "this._loginUserId") {
              if (this._loginUserId) {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserMembershipId") {
              if (this._loginUserMembershipId) {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserMembershipId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserClassId") {
              if (this._loginUserClassId) {
                this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserClassId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else {
              this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "datatype": "ObjectId", "criteria": "eq" });
            }
          } else if (element.type === 'readonly') {
            this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined) ? element.criteria : "eq"), "datatype": element.type });
          } 
          else if (element.type === 'boolean') {
            this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "datatype": element.type, "cond": element.cond });
          }
          else if (element.type === undefined) {
            this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined) ? element.criteria : "eq") });
          }
        }
      });
    }
  }

  convertToCSVExpo() {
    var listFilterParams: any = this.listFilterParams;
    listFilterParams['export'] = true;
    delete listFilterParams.pageNo;
    delete listFilterParams.size;
    if (this.apiUrl.url != undefined && this.apiUrl.method != undefined) {
      this._commonService
        .commonServiceByUrlMethodDataExpo(this.apiUrl.url, this.apiUrl.method, listFilterParams)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.isConvertloading = false;
            this._FileSaverService.save(data, `${this.formlistTitle}.csv`)
          } else {
            this.isConvertloading = false;
          }
        }, data => {
          this.isConvertloading = false;
        });
    } else {
      this.isConvertloading = false;
    }
    this.listFilterParams['report'] = {} as any;
  }

  addFunction(link: any) {
    if (link !== '') {
      this._commonDataService.isfilterDataForDynamicPages = true;
      this._router.navigate([link]);
    }
  }

  quickAddFunction(formname: any) {
    this.quickformEnable = true;
    this.quickformschemaname = formname;
    this.popupaddbtnstatus = false;
    this.quickfromstyle = "single";
  }

  quickAddstaticFunction() {
    this.quickstaticformEnable = true;
    this.staticaddstatus = true;
  }

  resetgSearchText() {
    let search = <HTMLInputElement>document.getElementById('global_search_terms');
    if (search != undefined) {
      search.value = '';
      this.getAllListData();
    }
  }


  checkRolePermission(fieldname: any) {
    let obj: any;
    obj = this.grantedRoleLists.find(p => p == fieldname);
    if (obj == undefined) {
      return true;
    } else {
      return false;
    }
  }

  reloadFilterList() {
    this.getAllListData();
  }

  reloadList() {
    this.searchsetting();
    this.getAllListData();
    this.filterFieldListLoad = false;
  }

  onSelectValue(selectPageSize: number) {
    this.pageSize = selectPageSize;
    if (this.ELEMENT_DATA.length != 0) {
      this.currentPage = 1;
      this.getAllListData();
    }
  }

  async getAllListData() {
    this.isLoadingResults = true;
    if (this._commonDataService.summaryfilterDataIds != undefined) {
      this.listFilterParams.search = [];
      this.listFilterParams.webpartid = this._commonDataService.summaryfilterDataIds;
    }
    else if (this.formList.searchfield != undefined && this.formList.searchfield.length > 0) {
      this.formList.searchfield.forEach(ele => {
        if (ele.fieldname != undefined) {
          let tmpArrl: any[] = this.listFilterParams['search'];
          let tmpobjL: any[] = tmpArrl.filter(ele452 => ele452.searchfield == ele.fieldname);
          if (tmpobjL != undefined && tmpobjL.length > 1) {
            tmpArrl.splice(tmpArrl.indexOf(tmpobjL[1]), 1);
          }
          this.listFilterParams['search'].push({
            "searchfield": ele.fieldname,
            "searchvalue": ele.default,
            "datatype": ele.type,
            "criteria": ele.criteria
          })
        }
      });
    }

    if (this.selectedBranch != undefined) {
      this.listFilterParams.search.push({ "searchfield": "branchid", "searchvalue": this.selectedBranch._id, "criteria": "in", "fieldtype": "ObjectId" });
    }


    
    if (this.formList.selectfields != undefined) {
      this.formList.selectfields.forEach(element => {
        if (element.virtualfield != undefined) {
          let tmp: any = this;
          Object.keys(element.virtualfield).forEach(function (key) {
            tmp.listFilterParams['select'].push({ "isDisplayOnList": false, "fieldname": key, "fieldtype": "string", "value": 1 });
          })
        }
      });
    }

    if (this._formId && this.formSchemaName == "formdatas") {
      this.listFilterParams['search'].push({
        "searchfield": "formid",
        "searchvalue": this._formId,
        "datatype": "ObjectId",
        "criteria": "eq"
      })
    }

    if (this.apiUrl.url != undefined && this.apiUrl.method != undefined) {
      this.isLoading = true;
      this.isLoadingResults = true;
      
      this.listFilterParams['viewname'] = this.formObj.viewname;
      this.listFilterParams['formname'] = this._formName;
      this.listFilterParams['schemaname'] = this.formSchemaName;
      this.listFilterParams["pageNo"] = this.currentPage;
      this.listFilterParams["size"] = this.pageSize;

      console.log("this.listFilterParams",this.listFilterParams);

      return this._commonService
        .commonServiceByUrlMethodDataPagination(this.apiUrl.url, this.apiUrl.method, this.listFilterParams)
        .then((data: any) => {

          console.log("data", data);
          
          this.detailList = [];
          this.detailList = data.body;
          // console.log("this.detailList", this.detailList);
          this.totalPages = data.headers.get('totalPages');
          this.totalCount = data.headers.get('totalCount');
          this.mappingData();
        }, (error: any) => {
          console.error("error", error);
        });
    } else {
      this.isLoadingResults = false; 
    }
  }
 
  globalSearch() {
    
    this.isLoadingResults = true;
    let search_term = $("#global_search_terms").val();
    if (search_term == '') {
      this.getAllListData();
      this.isLoadingResults = false;
    } else {
      this.isLoading = true;
      let postData = {};
      postData['search'] = this.listFilterParams['search'];
      postData['searchtext'] = search_term;
      postData['select'] = this.formList.selectfields;
      postData['formname'] = this._formName;
      postData['schemaname'] = this.formSchemaName;
      postData["pageNo"] = this.currentPage;
      postData["size"] = this.pageSize;

      // console.log("search_term", search_term);
      // console.log("this.listFilterParams['search']", this.listFilterParams['search'])
      this._formlistService
        .GetBySearchPagination(this.formSchemaName, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.detailList = [];
          this.detailList = data.body;
          this.totalPages = data.headers.get('totalPages');
          this.totalCount = data.headers.get('totalCount');
          this.mappingData();
          this.isLoadingResults = false;
        }, (error: any) => {
          console.error("error", error);
        });
    }
  }

  mappingData() {
    this._commonDataService.filterDataparams['search'] = [];
    this.ELEMENT_DATA = [];
    this.detailList.forEach(element => {
      const tempdataObj: any = {};
      this.headerRowtemplabelname.forEach(element2 => {
        if (element2.fieldname.indexOf('.') != -1) {
          let prop = element2.fieldname.split('.');
          if (prop.length > 0) {
            if (prop.length == 2) {    // ex : memberid.fullname
              let prop0: string = prop[0];
              let prop1: string = prop[1];

              if (element[prop0]) {
                let tempObj: any = element[prop0];
                if (tempObj) {
                  if (Object.prototype.toString.call(tempObj) == '[object Array]') {
                    if (tempObj.length > 0) {
                      if (tempObj[0][prop1]) {
                        tempdataObj[element2.fieldname] = tempObj[0][prop1];
                      } else {
                        tempdataObj[element2.fieldname] = tempObj[0][prop1] == "0" ? 0 : "---";
                      }
                    } else {
                      tempdataObj[element2.fieldname] = "---";
                    }
                  } else if (tempObj[prop1]) {
                    var obj = this.displayValRender(tempObj[prop1], element2);
                    tempdataObj[Object.keys(obj).toString()] = Object.values(obj);
                  } else {
                    tempdataObj[element2.fieldname] = "---";
                  }
                }
              } else {
                tempdataObj[element2.fieldname] = element[prop0] == "0" ? 0 : "---";
              }
            }
            if (prop.length == 3) {    // ex : memberid.membershipid.membershipname
              let prop0: string = prop[0];
              let prop1: string = prop[1];
              let prop2: string = prop[2];
              if (element[prop0]) {
                let tempObj: any = element[prop0];
                if (tempObj && tempObj[prop1]) {
                  let tempObj2: any = tempObj[prop1];
                  if (tempObj2 && tempObj2[prop2]) {
                    var obj = this.displayValRender(tempObj2[prop2], element2);
                    tempdataObj[Object.keys(obj).toString()] = Object.values(obj);
                  } else {
                    tempdataObj[element2.fieldname] = tempObj2 && tempObj2[prop2] == "0" ? 0 : "---";
                  }
                }
              } else {
                tempdataObj[element2.fieldname] = element[prop0] == "0" ? 0 : "---";
              }
            }
          }
        } else {                        // ex : fullname
          if (element[element2.fieldname]) {
            var obj = this.displayValRender(element[element2.fieldname], element2);
            tempdataObj[Object.keys(obj).toString()] = Object.values(obj);
          } else {
            tempdataObj[element2.fieldname] = element[element2.fieldname] == "0" ? 0 : "---";
          }
        }
      });

      if (this.editBtn.isShow && this.checkEditPermission(element._id)) {
        this.actionCounter++;
      }
      if (this.deleteBtn.isShow && this.checkDeletePermission(element._id)) {
        this.actionCounter++;
      }
      if (this.cancelBtn.isShow && this.checkDeletePermission(element._id)) {
        this.actionCounter++;
      }
      if (this.popupBtn.isShow) {
        this.actionCounter++;
      }
      tempdataObj["_id"] = element._id;
      if (Object.keys(tempdataObj).length > 0) {
        this.ELEMENT_DATA.push(tempdataObj);
      }
    });
    if (this.actionCounter > 0) {
      var headerRowtempObj = this.headerRowtemp.find(p => p.name == "Action");
      if (!headerRowtempObj) {
        let obj = { name: "Action", displayname: "Action", fieldname: "Action", fieldtype: "Redirect" , isDisplayOnList : true}
        this.headerRowtemp.push(obj);
      }
    }

    this.displayedColumns = [];
    this.displayedColumns = this.headerRowtemp.map(col => col.name);
    this.displayedColumns.unshift("select");

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.selection = new SelectionModel(true, []);
    // this.dataSource.sort = this.sort;
    this.isButtonEnable = true;
    this.selection.changed.subscribe(item => {
      this.isButtonEnable = this.selection.selected.length == 0;
    });
    this.pagination = this.createRange();
    this.isLoadingResults = false;
  }

  displayValRender(element: any, element2: any) {
    const tempdataObj: any = {};
    let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
    if (objToP) {
      if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Date' || objToP.fieldtype == 'datepicker')) {
        tempdataObj[element2.fieldname] = new Date(element).toLocaleDateString(this._commonService.currentLocale());
      } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Datetime')) {
        tempdataObj[element2.fieldname] = new Date(element).toLocaleString(this._commonService.currentLocale());
      } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'time')) {
        tempdataObj[element2.fieldname] = this.prettyDate2(element);
      } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
        tempdataObj[element2.fieldname] = this._myCurrencyPipe.transform(element);
      } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'html')) {
        // tempdataObj[element2.fieldname] = this.sanitizer.bypassSecurityTrustHtml(element);
        tempdataObj[element2.fieldname] = element;
      } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'textarea')) {
        if (element.length > 10) {
          element = element.substring(0, 10)+'...';
        }
        tempdataObj[element2.fieldname] = element;
      } else if (objToP.fieldname == 'wfstatus' && (element['wfstatus'] == "approver")) {
        tempdataObj[objToP.fieldname] = "Pending";
      } else {
        tempdataObj[element2.fieldname] = element;
      }
    } else {
      tempdataObj[element2.fieldname] = element;
    }
    return tempdataObj;
  }

  prettyDate2(time: Date) {
    var date = new Date((time));
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  sortData(sort: Sort) {
    
    let value = 1;
    let name = sort.active;
    if(sort.direction == "desc") {
      value = -1;
    } 
    let obj = { [name]: value }
    this.listFilterParams["sort"] = obj;
    this.getAllListData();
  }

  advanceSearchFilter() {
    this.filterFieldListLoad = !this.filterFieldListLoad;
    if (!this.filterFieldListLoad) {
      this.reloadList();
    }
  }

  logSelection(item: any) {
    if (item.action.fieldvalue == "deleted") {
      const varTemp = this;

      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this action!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          varTemp.action(item);
        } else {
          swal.fire({
            title: 'Cancelled',
            text: 'Your record is safe :)',
            icon: 'error',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })
    } else {
      this.action(item);
    }
  }

  action(item: any) {
    var selected = [];
    if (this.selection.selected.length !== 0) {

      this.selection.selected.forEach(element => {
        if (element['_id']) {
          selected.push(element['_id']);
        }
      });

      let postData = {};
      let url = "common/massupdate";
      let method = "POST";

      postData["schemaname"] = this.formSchemaName;
      postData["ids"] = selected;
      postData["fieldname"] = item.action.fieldname;
      postData["fieldvalue"] = item.action.fieldvalue;
      postData["datatype"] = item.action.datatype;

      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {
            this.reloadList();
            this.showNotification('top', 'right', 'Mass operation has been done successfully!!!', 'success');
          }
        }, (err) => {
        })
    }
  }

  goToEditView(id: any) {
    this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
  }

  getVal(val: any) {
    if (this._formsModel.gridactionposition && this._formsModel.gridactionposition == "left") {
      return 0;
    } else {
      return val;
    }
  }

  checkViewPermission(id: any) {
    if (this.viewPermissionCriteria !== '') {
      switch (this.viewPermissionCriteria) {
        case "All":
          return true;
        case "My Branch":
          let obj = this.detailList.find(ele => ele._id == id);
          if (obj != undefined) {
            if (obj.branchid) {
              if (obj.branchid._id != undefined && obj.branchid._id == this._loginUserBranchId) {
                return true;
              } else if (obj.branchid == this._loginUserBranchId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        case "My":
          let Myobj = this.detailList.find(ele => ele._id == id);
          if (Myobj != undefined) {
            if (Myobj.addedby) {
              if (Myobj.addedby._id == this._loginUserId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
      }
    } else {
      return false;
    }
  }

  checkDeletePermission(id: any) {
    if (this.deletePermissionCriteria !== '') {
      switch (this.deletePermissionCriteria) {
        case "All":
          return true;
        case "My Branch":
          let obj = this.detailList.find(ele => ele._id == id);
          if (obj != undefined) {
            if (obj.branchid) {
              if (obj.branchid._id != undefined && obj.branchid._id == this._loginUserBranchId) {
                return true;
              } else if (obj.branchid == this._loginUserBranchId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        case "My":
          let Myobj = this.detailList.find(ele => ele._id == id);
          if (Myobj != undefined) {
            if (Myobj.addedby) {
              if (Myobj.addedby._id == this._loginUserId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
      }
    } else {
      return false;
    }
  }

  checkEditPermission(id: any) {

    if (this.editPermissionCriteria !== '') {
      switch (this.editPermissionCriteria) {
        case "All":
          return true;
        case "My Branch":
          let obj = this.detailList.find(ele => ele._id == id);
          if (obj != undefined) {
            if (obj.branchid) {
              if (obj.branchid._id != undefined && obj.branchid._id == this._loginUserBranchId) {
                return true;
              } else if (obj.branchid == this._loginUserBranchId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        case "My":
          let Myobj = this.detailList.find(ele => ele._id == id);
          if (Myobj != undefined) {
            if (Myobj.addedby) {
              if (Myobj.addedby._id == this._loginUserId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
      }
    } else {
      return false;
    }
  }

  checkAddPermission(id: any) {
    if (this.addPermissionCriteria !== '') {
      switch (this.addPermissionCriteria) {
        case "All":
          return true;
        case "My Branch":
          let obj = this.detailList.find(ele => ele._id == id);
          if (obj != undefined) {
            if (obj.branchid) {
              if (obj.branchid._id != undefined && obj.branchid._id == this._loginUserBranchId) {
                return true;
              } else if (obj.branchid == this._loginUserBranchId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
        case "My":
          let Myobj = this.detailList.find(ele => ele._id == id);
          if (Myobj != undefined) {
            if (Myobj.addedby) {
              if (Myobj.addedby._id == this._loginUserId) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return true;
          }
      }
    } else {
      return false;
    }
  }

  actionlistRecord(listO: any, id: any, obj: any) {
    this.quickformEnable = false;
    this.quickstaticformEnable = false;
    this.quickedithistoryEnable = false;
    this.staticaddstatus = false;
    if (listO.action != undefined) {

      if (listO.action == 'popup') {
        if (listO.type != undefined && listO.type == 'resetpwdpopup') {
          this.currentpassword = '';
          this.changePassUsername = '';

          if (this.apiUrl.url != undefined && this.apiUrl.method != undefined) {

            let postData = {};
            postData['search'] = [];
            postData['search'].push({ "searchfield": '_id', "searchvalue": id, "criteria": "eq" });
            this._commonService.commonServiceByUrlMethodData(this.apiUrl.url, this.apiUrl.method, postData)
              .pipe(takeUntil(this.destroy$))
              .subscribe((data: any) => {
                if (data && data.length > 0) {

                  this.currentdataToupdate = data[0];
                  if (data[0].fullname != undefined) {
                    this.changePassUsername = data[0].fullname;
                  }
                }

              });
          }
        } else {
          this.quickfromstyle = listO.quickfromstyle;
          this.quickformschemaname = listO.quickformschemaname;
          this.starteditpopupstatic = listO.starteditpopupstatic;

          if (this.starteditpopupstatic != undefined) {
            setTimeout(() => {
              this.quickstaticformEnable = true;
              this.staticaddstatus = false;
            }, 400);
          } else if (listO.edithistorypopup == "edithistorypopup") {
            this.historydata = [];
            this.isLoadingpopup = true;
            this.detailList.forEach(element => {
              if (element._id === id) {
                this.currentediInPopupList = element;
                this.currentediInPopupList['formname'] = this._allformDetailsBasedschemas[this.currentediInPopupList['schemaname']].formname;
              }
            });
            this.quickedithistoryEnable = true;
            if (this.currentediInPopupList['formname']) {
              this._commonService
                .Getschemasbyschemasformane(this.currentediInPopupList['formname'], this.currentediInPopupList['schemaname'])
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                  if (data) {
                    let fielddata: any[] = [];
                    data.forEach(sele => {
                      if (sele.formname == this.currentediInPopupList['formname']) {
                        fielddata.push(sele)
                      }
                    });
                    let postData = {};
                    postData['search'] = [];
                    postData['search'].push({ "searchfield": "_id", "searchvalue": this.currentediInPopupList['_id'], "criteria": "eq" })

                    this._activitylogsService
                      .GetById(this.currentediInPopupList['_id'], data)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe((data1: any) => {
                        if (data1) {
                          let postData2 = {};
                          postData2['search'] = [];
                          postData2['search'].push({ "searchfield": '_id', "searchvalue": data1._id, "criteria": "eq" });
                          this._commonService.commonServiceByUrlMethodData(this.currentediInPopupList['schemaname'] + '/filter/', "POST", postData2)
                            .pipe(takeUntil(this.destroy$))
                            .subscribe((schemadata: any) => {
                              if (fielddata.length != 0) {
                                fielddata.forEach(element => {
                                  let obj = {};
                                  if (element.fieldtype == "ObjectID" && data1[element.fieldname] && schemadata[0][element.fieldname] != null) {    // formfieldoption
                                    let val = "";
                                    val = schemadata[0][element.fieldname][element.option.reffieldname] ? schemadata[0][element.fieldname][element.option.reffieldname] : schemadata[0][element.fieldname][element.option.refschema];
                                    obj = { 'key': element.displayname, 'value': val };
                                    this.historydata.push(obj)
                                  } else if (data1[element.fieldname] && element.fieldtype == "String" || element.fieldtype == "lookup") { // formfieldoption
                                    obj = { 'key': element.displayname, 'value': data1[element.fieldname] };
                                    this.historydata.push(obj)
                                  } else if (element.fieldtype == "text" || element.fieldtype == "mobile" || element.fieldtype == "email") {  // formfield
                                    let a = element.fieldname.split('.');
                                    if (data1[a[0]] && data1[a[0]][a[1]] && !Array.isArray(data1[a[0]][a[1]])) {
                                      obj = { 'key': element.displayname, 'value': data1[a[0]][a[1]] };
                                      this.historydata.push(obj);
                                    }
                                  } else if (data1[element.fieldname] && element.fieldtype == "Date" || element.fieldtype == "datepicker") { // formfieldoption
                                    let tempdata = [];
                                    tempdata.push(new Date(data1[element.fieldname]).toLocaleDateString(this._commonService.currentLocale()));
                                    obj = { 'key': element.displayname, 'value': tempdata };
                                    this.historydata.push(obj);
                                  }
                                  this.isLoadingpopup = false;
                                });
                              } else {
                                this.isLoadingpopup = false;
                              }
                            }, error => {
                              this.isLoadingpopup = false;
                            });
                        }
                      });
                  }
                });
            } else {
              this.isLoadingpopup = false;
            }
          } else if (listO.resendalert === true) {
            this.mailalertsendenable = true;
          } else {
            this.quickformEnable = true;
            this.popupaddbtnstatus = true;
          }

          this.detailList.forEach(element => {
            if (element._id === id) {
              this.currentediInPopupList = element;
              if (this._allformDetailsBasedschemas[this.currentediInPopupList['schemaname']]) {
                this.currentediInPopupList['formname'] = this._allformDetailsBasedschemas[this.currentediInPopupList['schemaname']].formname;
              }
            }
          });
        }

      } else if (listO.action == 'edit') {
        if (this.isFilterListing) {
          this._commonDataService.isfilterDataForDynamicPages = true;
        } else {
          this._commonDataService.isfilterDataForDynamicPages = false;
        }
        if (listO.type != undefined && listO.type == 'redirect') { // Dynamic Form
          this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
        } else if (listO.type != undefined && listO.type == 'staticpage') { // Static Form
          this._router.navigate([listO.actionurl + '/' + id]);
        } else if (listO.type != undefined && listO.type == 'custom') {
          var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
          listO.actionurl.replace(shortcode_regex, function (match, code) {
            var replace_str = match.replace('[{', '');
            replace_str = replace_str.replace('}]', '');
            listO.actionurl = listO.actionurl.replace("$[{" + replace_str + "}]", obj[replace_str]);
          });
          this._router.navigate([listO.actionurl]);
        }
      } else if (listO.action == 'edit2') {
        if (this.isFilterListing) {
          this._commonDataService.isfilterDataForDynamicPages = true;
        } else {
          this._commonDataService.isfilterDataForDynamicPages = false;
        }
        if (listO.type != undefined && listO.type == 'redirect') { // Dynamic Form
          this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
        } else if (listO.type != undefined && listO.type == 'staticpage') { // Static Form
          this._router.navigate([listO.actionurl + '/' + id]);
        } else if (listO.type != undefined && listO.type == 'custom') {
          var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
          listO.actionurl.replace(shortcode_regex, function (match, code) {
            var replace_str = match.replace('[{', '');
            replace_str = replace_str.replace('}]', '');
            listO.actionurl = listO.actionurl.replace("$[{" + replace_str + "}]", obj[replace_str]);
          });
          this._router.navigate([listO.actionurl]);
        } else if (listO.type != undefined && listO.type == 'querystring') {

          var actionUrl = listO.actionurl.split("?");
          var querystring = actionUrl[1].split("&");
          var querystringObj = {}

          if(querystring && querystring.length > 0) {
            for (var i = 0; i < querystring.length; i++) {
              var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
              querystring[i].replace(shortcode_regex, function (match, code) {
                var replace_str = match.replace('[{', '');
                replace_str = replace_str.replace('}]', '');
                querystring[i] = querystring[i].replace("$[{" + replace_str + "}]", obj[replace_str]);
              });
            }
            for (var i = 0; i < querystring.length; i++) {
              var objkeyvalue = querystring[i].split("=");
              querystringObj[objkeyvalue[0]] = objkeyvalue[1];
            }
            this._router.navigate([`${actionUrl[0]}`], { queryParams: querystringObj});
          }
          
          return;
        }
      }else if (listO.action == 'clone') {
        const varTemp = this;

        swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to revert this!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Clone it!',
          cancelButtonText: 'No, keep it',
          customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.value) {


            var postData = { "id": id, "schemaname": varTemp.formSchemaName };
            varTemp._commonService
              .GetByCollectionClone(postData)
              .pipe(takeUntil(this.destroy$))
              .subscribe((data: any) => {
                if (data) {
                  varTemp.showNotification('top', 'right', 'Record has been clone successfully!!!', 'success');
                  varTemp._router.navigate(['/pages/dynamic-forms/form/' + varTemp._formId + '/' + data._id]);
                }
              })

          } else {
            swal.fire({
              title: 'Cancelled',
              text: 'Your imaginary file is safe :)',
              icon: 'error',
              customClass: {
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
            });
          }
        })

      } else {
        var status = ["confirmed", "checkout", "deleted" ];
        if(obj.status && obj.status.length > 0 && status.includes(obj.status[0])){
          swal.fire({
            title: 'Warning',
            text: "You can't delete "+ obj.status[0] + " records",
            icon: 'warning',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
          return;
        }else if(obj['branchid._id'] == '---'){
          swal.fire({
            title: 'Warning',
            text: "You can't delete system records",
            icon: 'warning',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
          return;
        }

        const varTemp = this;

        swal.fire({
          title: listO.actionmessage,
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.value) {

            if (listO.type != undefined && listO.type == 'redirect') {
              varTemp._router.navigate([listO.actionurl + id]);
            } else {

              // console.log("listO.actionurl", listO.actionurl);
              // console.log("listO.method", listO.method);
              // console.log("id", id);
              // console.log("listO.formname", listO.formname);

              varTemp._commonService.commonServiceByUrlMethodIdOrData(listO.actionurl, listO.method, id, { 'formname': listO.formname })
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                  if (data) {
                    let successmessage1 = '';
                    let actionmessage1 = '';
                    if (data.message != 'DELETED') {
                      actionmessage1 = listO.actionmessage;
                    }

                    if (data.message == 'DELETED') {
                      successmessage1 = listO.successmessage;
                    }
                    if (data.message == undefined) {
                      actionmessage1 = listO.successmessage;
                    }


                    swal.fire({
                      title: actionmessage1,
                      text: successmessage1,
                      icon: 'success',
                      customClass: {
                        confirmButton: "btn btn-success",
                      },
                      buttonsStyling: false
                    });

                    varTemp.getAllListData();
                  }
                }, data => {
                  if (data.status == 500) {
                    varTemp.showNotification('top', 'right', 'Server Error in Application', 'danger');
                  }
                });
            }


          } else {
            swal.fire({
              title: 'Cancelled',
              text: 'Your imaginary file is safe :)',
              icon: 'error',
              customClass: {
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
            });
          }
        })



      }
    }
  }

  renderText(content : any){
    this.displayContent = null;
    if(content && content[0])
    this.displayContent = content[0];
  }

  close(){
    this.validpasswd = true;
    this.currentpassword = null;
    this.automaticgn = false;
  }

  updatePassword() {
    if (this.currentpassword && this.currentpassword != '' && this.validpasswd) {
      var url = ''
      var username = '';
      if (this.formObj.schemaname == 'members') {
        username = this.currentdataToupdate.membernumber;
        url = `members/${this.currentdataToupdate._id}`;
      } else {
        username = this.currentdataToupdate.username;
        url = `users/${this.currentdataToupdate._id}`;
      }
      var newobject = {
        newpassword: this.currentpassword,
        forcelogin: true
      }

      this._commonService
        .commonServiceByUrlMethodData(url, "PATCH", newobject)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Password updated successfully !!', 'success');
            $("#resetpwdclose").click();
            this.automaticgn = false;
          }
        }, (e) => {
          this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          $("#resetpwdclose").click();
          this.automaticgn = false;
        });
    } else {
      this.showNotification('top', 'right', 'Enter valid password !!', 'danger');
      this.automaticgn = false;
    }

  }

  sendlinkResetPassword() {
    if (this.apiUpdateUrl.url != undefined && this.apiUpdateUrl.method != undefined) {
      var newobject = { firsttimelogin: true }
      var url = this.apiUpdateUrl.url.replace(':_id', '');
      var method = this.apiUpdateUrl.method;
      this._commonService
        .commonServiceByUrlMethodData(url, "PATCH", newobject, this.currentdataToupdate._id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'User will receive link shortly!!', 'success');
            $("#resetpwdclose").click();
            this.automaticgn = false;
          }
        });

    }
  }

  validatePasswd() {
    if (this.currentpassword) {
      // var regex = /^(?=.*[A-Za-z])(?=.*\d){8,}$/;
      // var valid = regex.test(this.currentpassword);
      var valid = false;
      if (this.currentpassword.length >= 8) valid = true
      this.validpasswd = valid;
    }
  }

  showPassword() {
    this.hidepasswd = !this.hidepasswd;
    var input = <HTMLInputElement>document.getElementById('newpasswd');
    if (input.getAttribute('type') == "password") {
      input.setAttribute('type', 'text');
    } else {
      input.setAttribute('type', 'password');
    }
  }

  getPassword(checked: boolean) {
    if (checked == true) {
      this.currentpassword = this.ranString();
      this.validatePasswd();
    } else {
      this.currentpassword = '';
    }
  }

  selectfiledSubmitData(data: any) {
    $("#closeAddFields").click();
    this.showNotification('top', 'right', ' Select fields has been updated successfully!!', 'success');
    //this.getFormdetail();
    this.formlistupdate = true;
    this.updatedFormListObj = data;
    this.ngOnInit();
  }

  searchfilterSubmitData(data: any) {
    $("#closeFilterFields").click();
    this.showNotification('top', 'right', 'Search filter has been updated successfully!!', 'success');
    this.getFormdetail();
  }

  ranString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }

  getSubmittedData(submit_data: any) {
    $("#closeQuickform").click();
    this.quickformEnable = false;
    this.mailalertsendenable = false;
    this.quickformschemaname = '';
    this.currentediInPopupList = {};
    this.quickfromstyle = '';
    this.reloadList();
  }

  disabledataInPopup() {
    this.quickformEnable = false;
    this.mailalertsendenable = false;
    this.quickformschemaname = '';
    this.quickfromstyle = '';
    this.currentediInPopupList = {};
  }

  disablePopup() {
    this.quickformEnable = false;
    this.mailalertsendenable = false;
    this.quickformschemaname = '';
    this.quickfromstyle = '';
    this.currentediInPopupList = {};
    this.reloadList();
  }

  disablestaticPopup() {
    this.quickstaticformEnable = false;
    this.staticaddstatus = false;
    this.reloadList();
  }

  getSubmittedStaticData(data: any) {

    $("#closestaticform").click();
    this.quickstaticformEnable = false;
    this.staticaddstatus = false;
    this.reloadList();

  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  redirect(item: any) {
    var tempthis = this;
    var detailpage = this.gridactionList.find(p => p.action == 'view');
    if (detailpage.type == 'replace') {
      var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
      detailpage.actionurl.replace(shortcode_regex, function (match, code) {
        var replace_str = match.replace('[{', '');
        replace_str = replace_str.replace('}]', '');

        detailpage.actionurl = detailpage.actionurl.replace("$[{" + replace_str + "}]", item[replace_str]);
      });
      this._router.navigate([detailpage.actionurl]);
    } else {
      var url = detailpage.actionurl.replace(':_id', item['_id']);
      var formurl = url.replace(':_formid', this._formId);
      this._router.navigate([formurl]);
    }
  }

  istrue(val): any {
    if(val == '---') {
      return "close";
    } else if (val.length > 0) {
      if(val[0] == true) {
        return "done"
      } else {
        return "close";
      }
    } else {
      return "close"
    }
  }

  onSelectBranch(branch:any){
    //this.dataTable.dataRows = this.tempdetList;
    if(branch != 'ALL Branch'){
      this.selectedBranch = branch;
      if(this.selectedBranch != undefined){
        this.getAllListData();
        if(this.selectedBranch.branchname != undefined){
          this.selectedBranchName = this.selectedBranch.branchname;
        }
      }
    } else {
      this.selectedBranchName = 'ALL Branch';
      this.selectedBranch = undefined;
      this.resetFilter();
    }
  }

  resetFilter() {

    if (this.formList.searchfield) {
      this.listFilterParams['search'] = [];

      this.formList.searchfield.forEach(element => {

        if (element.isfilter != undefined && element.isfilter == true) {
          if (element.type == 'lookup') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'loginId') {
                if (element.isdynamicCriteria != undefined) {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": [this._loginUserId], "criteria": element.isdynamicCriteria });
                } else {
                  this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "criteria": "eq" });
                }

              } else if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'saleschannelteamIds') {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this.selectedSaleschannelTeamIds, "criteria": "in" });
              } else {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria ? element.criteria : "eq" });
              }
            } else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria ? element.criteria : "eq" });
            }

          } else if (element.type === 'boolean') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": element.criteria, "datatype": element.type });
          } else if (element.type === 'array') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "in" });
          } else if (element.type === 'Date') {
            if (element.isdynamicFilter != undefined && element.isdynamicFilter == true) {
              if (element.isdynamicFilterValue != undefined && element.isdynamicFilterValue == 'todaydate') {
                if (element.iscondition && element.iscondition == "EXACTTODAY") {
                  var date = new Date();
                  date.setUTCHours(23);
                  date.setUTCMinutes(59);
                } else {
                  var date = new Date();
                  date.setDate(date.getDate() + 1);
                }

                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": date, "criteria": element.isdynamicFilterCriteria, "datatype": "Date" });
              } else {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
              }
            } else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": "eq", "datatype": "Date" });
            }
          } else if (element.type === 'surveyform') {
            if (element.default == "this._loginUserId") {
              if (this._loginUserId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserMembershipId") {
              if (this._loginUserMembershipId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserMembershipId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else if (element.default == "this._loginUserClassId") {
              if (this._loginUserClassId) {
                this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": this._loginUserClassId, "datatype": "ObjectId", "criteria": "in", "cond": "or" });
              }
            }
            else {
              this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "datatype": "ObjectId", "criteria": "eq" });
            }

          } else if (element.type === 'readonly') {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined)?element.criteria:"eq"), "datatype": element.type });
          } else if (element.type === undefined) {
            this.listFilterParams['search'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined)?element.criteria:"eq") });
          }
        }
      });


    }
    this.getAllListData();

  }

  trackByIndex(i) { return i; }
}
