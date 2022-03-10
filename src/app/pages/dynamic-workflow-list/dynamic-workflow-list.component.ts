import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseComponemntInterface } from '../../shared/base-componemnt/base-componemnt.component';
import { FormComponemntComponent } from '../../shared/base-componemnt/form-componemnt/form-componemnt.component';

import { ButtonModel } from '../../core/models/dynamic-lists/button.model';

import { FormsModel } from '../../core/models/forms/forms.model';

import { CommonDataService } from './../../core/services/common/common-data.service';
import { ActivitylogsService } from '../../core/services/activitylogs/activity-logs.service';
import { MailalertsService } from '../../core/services/mailalerts/mailalerts.service';
import { FormlistService } from '../../core/services/formlist/formlist.service';

import { MyCurrencyPipe } from './../../shared/components/currency.pipe';

import { DatePipe } from '@angular/common';
import { FileSaverService } from 'ngx-filesaver';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-dynamic-workflow-list',
  templateUrl: './dynamic-workflow-list.component.html',
  styles: [
  ]
})
export class DynamicWorkflowListComponent extends FormComponemntComponent implements OnInit, BaseComponemntInterface  {

  totalPages = 0;
  totalCount = 0;
  isLoadingResults = true;
  pageSize = 10;
  currentPage: number = 1;

  dataRows: any [] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  displayedColumns: any [] = [];

    form: FormGroup;
    formA: string[] = [];

    _formsModel = new FormsModel();

    public dataTable: DataTable;

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
    formList: any = {};
    listFilterParams: any = {};
    listDisplayFieldList: any[] = [];

    headerRowtemp: any[] = [];
    headerRowtempPrint: any[] = [];
    dataRowstemp: any[] = [];
    headerRowtemplabelname: any[] = [];

    detailList: any[] = [];
    currentediInPopupList: any;
    apiUrl: any = '';
    apiUpdateUrl: any = '';
    gridactionList: any[] = [];

    editBtn: ButtonModel | null;
    approveBtn: ButtonModel | null;
    denyBtn: ButtonModel | null;
    customBtn: ButtonModel | null;
    popupBtn: ButtonModel | null;
    deleteBtn: ButtonModel | null;
    cancelBtn: ButtonModel | null;

    viewRedirect: any;

    showFilter: false;
    filterFieldList: any[] = [];
    listofLookupNeedtoBeLoaded: any[] = [];
    inBuildlookupLists: any[] = [];

    historydata: any[] = [];

    fieldLists: any[] = [];

    submitted: boolean;


    gDateFormat: any = 'dd/MM/yyyy';
    gDateTimeFormat: any = 'dd/MM/yyyy HH:mm a';

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
    filter = '';

    currentdataToupdate: any;
    currentpassword: string = '';
    changePassUsername: string = '';
    hidepasswd: boolean = true;
    validpasswd: boolean = true;


    isredirectwithid: any;

    formtype: any;
    isConvertloading = false;

    branchList : any[] = [];
    selectedBranchName: string = 'ALL Branch';
    selectedBranch: any;
    tempdetList : any[] = [];

    pagination: any;

    recordPerPageLists: any [] = [ 10, 20, 30, 50, 100, 1000 ]

    isButtonEnable:boolean = true;

    actionCounter = 0;


    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

    constructor(
      private _route: ActivatedRoute,
      private _formlistService: FormlistService,
      private _commonDataService: CommonDataService,
      private datePipe: DatePipe,
      private _activitylogsService: ActivitylogsService,
      private _myCurrencyPipe: MyCurrencyPipe,
      private _mailalertsService: MailalertsService,
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

    async ngOnInit(){

      this._route.params.forEach(async (params) => {
        try {
          this._formName = params["formname"];
          await super.ngOnInit();
          await this.initializeVariable();
          await this.clearActionBtn()
          await this.getFormdetail();
          await this.getFormList();
          await this.formDataOperation();
        } catch (error) {
          console.error({ error });
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
      this.dataSource.sort = this.sort;

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

      this.dataTable = {
        headerRow: [],
        footerRow: [],
        dataRows: []
      }

      this.dataTable.headerRow = [];
      this.dataTable.footerRow = [];
      this.dataTable.dataRows = [];

      this.currentdataToupdate = {};

      this.exportPDF = true;
      this.exportExcel = true;
      this.exportCSV = true;


      this.ishideaddbutton = false;
      this.ishidemorebutton = false;
      this.formlistTitle = '';
      this.formlistaddbuttonurl = '';


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

    async clearActionBtn() {
      this.editBtn= {} as any;
      this.approveBtn= {} as any;
      this.denyBtn= {} as any;
      return;
    }

  async getFormdetail() {


    if (!this.isFilterListing) {
      this.isLoadForms = true;
    }
    this.formSchemaName = '';

    await this.clearActionBtn()

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

      this._formId = eleform._id; //form _id

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
        }
      });
      this.approveBtn.isShow = true;
      this.approveBtn.title = "Approve";
      this.denyBtn.isShow = true;
      this.denyBtn.title = "Decline";
    }

    async getFormList() {
      this.isLoading = true;
      this.filterFieldListLoad = false;
      this.formList = this.formlistObj; //formlist table


      if (this.formList.addbuttonurl) {
        var url = this.formList.addbuttonurl.replace(':_formid',this._formId);
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

      this.formList.selectfields = this.formList.selectfields.filter(function (el) {
        return el.fieldname != "status"
      });

      if (this.formList.selectfields) {
        this.listFilterParams['select'] = [];
        this.listDisplayFieldList = this.formList.selectfields;
        this.listFilterParams.select = this.formList.selectfields;
        this.listFilterParams.select.push({ "isDisplayOnList": true, value: 1, "fieldname": "wfstatus", "displayname": "Status"  });
        this.listFilterParams.select.push({ "isDisplayOnList": true, value: 1, "fieldname": "updatedAt", "displayname": "Requested On", "fieldtype": "Datetime" });
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

      this.searchsetting()
      this.formList.filterfields.unshift({
        "displayname": "Requested Date",
        "fieldname": "updatedAt",
        "fieldtype": "Daterange",
        "display": true
      })
      if (this.formList.filterfields) {
        this.filterFieldList = this.formList.filterfields;
      }


      this.headerRowtemplabelname = [];
      this.headerRowtemp = [];

      this.listDisplayFieldList.forEach(element => {
        if (element.isDisplayOnList == true) {
          let fielddisplaytextvalue = '';
          if (this.defaultLanguage && element.langresources && element.langresources[this.defaultLanguage]) {
            fielddisplaytextvalue = element.langresources[this.defaultLanguage];
          } else {
            fielddisplaytextvalue = element.displayname;
          }

          this.headerRowtempPrint.push(fielddisplaytextvalue);

          if (this.headerRowtemplabelname.find(ele25 => ele25.fieldname == element.fieldname) == undefined) {

            this.headerRowtemplabelname.push(element);
            let obj = { name: element.fieldname, displayname: element.displayname, fieldname: element.fieldname }
            this.headerRowtemp.push(obj);

          }
        }
      });


      this.formlistTitle = this.formList && this.formList.langresources && this.formList.langresources[this.defaultLanguage] ? this.formList.langresources[this.defaultLanguage] : this.formList.title ? this.formList.title : this.formList.formlistname;

      return;
    }

    Save() {}
    Update() {}
    Delete() {}
    ActionCall() {}

    changePage(pageNumber: number): void {
      this.currentPage = Math.ceil(pageNumber);
      this.getAllListData();
    }

    createRange() {
      let items: number[] = [];
      for(let i = 1; i <= this.totalPages; i++){
        items.push(i);
      }
      return items;
    }

    searchsetting()
    {

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
              this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined)?element.criteria:"eq"), "datatype": element.type });
            } else if (element.type === undefined) {
              this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined)?element.criteria:"eq")});
            }
          }
        });
      }

    }

    convertToCSVExpo() {

      this.isConvertloading = true;
      let id = "";
      if (this.filterMode !== 'advanceSearch') {
        this.listFilterParams.search = [];
        this.listFilterParams.searchref = [];
        if (this._commonDataService.isfilterData) {
          if (this._commonDataService.filterDataparams) {
            if (this._commonDataService.filterDataparams['search']) {
              this.listFilterParams.search = this._commonDataService.filterDataparams['search'];
            }
          }
        }
        if (this.filterFieldList.length > 0) {
          this.filterFieldList.forEach(element => {
            if (element.modelValue != undefined && element.modelValue != null && element.modelValue != "") {
              if (element.type != undefined && element.type == 'ref') {
                if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker') {
                  if (element.modelValue.beginJsDate != undefined && element.modelValue.endJsDate != undefined) {
                    if (element.modelValue.endJsDate < element.modelValue.beginJsDate) {
                      this.showNotification('top', 'right', 'Start date must be less than end date!', 'danger');
                      return;
                    } else {
                      this.listFilterParams.searchref.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": element.modelValue.beginJsDate, "$lte": element.modelValue.endJsDate }, "criteria": "eq", "datatype": "Date" });
                    }
                  }
                } else {
                  this.listFilterParams.searchref.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue != undefined || null ? element.modelValue : '', "criteria": "eq", "datatype": "Date" });
                }
              } else {
                if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker') {
                  if (element.modelValue.beginJsDate != undefined && element.modelValue.endJsDate != undefined) {
                    if (element.modelValue.endJsDate < element.modelValue.beginJsDate) {
                      this.showNotification('top', 'right', 'Start date must be less than end date!', 'danger');
                      return;
                    } else {
                      this.listFilterParams.search.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": element.modelValue.beginJsDate, "$lte": element.modelValue.endJsDate }, "criteria": "eq", "datatype": "Date" });
                    }
                  }
                } else {
                  this.listFilterParams.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "eq", "datatype": element.fieldtype });
                }
              }
            }
          })
          this.listFilterParams.schemaname = this.formSchemaName;
          this.listFilterParams.template = "list";
        }
      }

      if (this._formName === 'formfieldoption' || this._formName == 'dispositionrule') {
        if (this._commonDataService.filterfieldoptionsaparams['search'].length !== 0) {
          this.listFilterParams['search'].push(this._commonDataService.filterfieldoptionsaparams['search'][0]);
        }
      }

      if (this._formName === 'attendance') {
        if (this._commonDataService.filterstaffattandancesaparams['search'].length !== 0) {
          this.listFilterParams['search'].push(this._commonDataService.filterstaffattandancesaparams['search'][0]);
        }
      }

      if (this._commonDataService.summaryfilterDataIds != undefined) {
        this.listFilterParams.search = [];
        this.listFilterParams.webpartid = this._commonDataService.summaryfilterDataIds;
      } else if (this.formList.searchfield != undefined && this.formList.searchfield.length > 0) {
        this.formList.searchfield.forEach(ele => {
          if (ele.fieldname != undefined) {
            let tmpArrl: any[] = this.listFilterParams['search'];
            let tmpobjL: any[] = tmpArrl.filter(ele452 => ele452.searchfield == ele.fieldname);
            if (tmpobjL != undefined && tmpobjL.length > 1) {
              tmpArrl.splice(tmpArrl.indexOf(tmpobjL[1]), 1);
            }
          }
        });
      }
      //this.listFilterParams['export'] = true;

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
      this.listFilterParams['report']= {} as any;
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

    toDate(dateStr: any) {
      var parts = dateStr.split("/");
      return new Date(parts[2], parts[1] - 1, parts[0]);
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

    reloadFilterList(){
      this.getAllListData();
    }

    reloadList(filter = '') {
      if (filter) this.filter = filter;
      else this.filter = '';
      this.approveBtn.isShow = true
      this.denyBtn.isShow = true
      if (filter == "Approved"){
        this.approveBtn.isShow = false
      }
      if (filter == "Declined"){
        this.denyBtn.isShow = false
      }
      this.searchsetting();
      this.getAllListData();
      this.filterFieldListLoad = false;
    }

    onSelectValue(selectPageSize: number) {
      this.pageSize = selectPageSize;
      if (this.dataTable.dataRows.length != 0) {
        this.currentPage = 1;
        this.getAllListData();
      }
    }

    clearFListItemForm() {
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
          }
        });
      }
      if (this.selectedBranch != undefined) {
        this.listFilterParams.search.push({ "searchfield": "branchid", "searchvalue": this.selectedBranch._id, "criteria": "in", "fieldtype": "ObjectId" });
      }
      if(this.formList.selectfields != undefined){
        this.formList.selectfields.forEach(element => {
          if(element.virtualfield != undefined){
            let tmp: any = this;
            Object.keys(element.virtualfield).forEach( function(key) {
              tmp.listFilterParams['select'].push({"isDisplayOnList": false,"fieldname": key, "fieldtype": "string","value": 1});
            })
          }
      });
      }

      if (this._formId && this.formSchemaName == "formdatas"){
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

        this.listFilterParams['search'].push({
            "searchfield": "wfstatus",
            "searchvalue": true,
            "datatype": "Boolean",
            "criteria": "exists",
            "cond": "and"
          });

        var searchvalue: any;
        var criteria;
        if (this.filter) {
          searchvalue = this.filter;
          criteria = 'eq'
        }
        else {
          this.listFilterParams['search'].push({
            "searchfield": "wfapprovers.userid",
            "searchvalue": this._loginUserId,
            "datatype": "ObjectId",
            "criteria": "eq",
            "cond": "or"
          });

          this.listFilterParams['search'].push({
            "searchfield": "wfapprovers.roleid",
            "searchvalue": this._loginUserRole._id,
            "datatype": "ObjectId",
            "criteria": "eq",
            "cond": "or"
          })

          searchvalue = ["Approved", "Declined"]
          criteria = 'nin'
        }

        this.listFilterParams['search'].push({
          "searchfield": "wfstatus",
          "searchvalue": searchvalue,
          "datatype": "text",
          "criteria": criteria,
          "cond": "and"
        })



        //console.log("this.listFilterParams['search']", this.listFilterParams['search'])
        this.listFilterParams['viewname'] = this.formObj.viewname;
        this.listFilterParams['formname'] = this._formName;
        this.listFilterParams['schemaname'] = this.formSchemaName;
        this.listFilterParams["pageNo"] = this.currentPage;
        this.listFilterParams["size"] = this.pageSize;
        return this._commonService
          .commonServiceByUrlMethodDataPagination(this.apiUrl.url, this.apiUrl.method, this.listFilterParams)
          .then((data: any) => {
            console.log("data", data)
            this.detailList = [];
            this.detailList = data.body;

            this.totalPages = data.headers.get('totalPages');
            this.totalCount = data.headers.get('totalCount');
            this.mappingData();

          },(error: any) => {
            console.error("error", error);
          });
      } else {
        this.isLoadingResults = false;
      }
    }

    globalSearch() {


      let search_term = $("#global_search_terms").val();

      if (search_term == '') {
        this.getAllListData();
      } else {
        this.isLoading = true;
        let postData = {};
        postData['search'] = search_term;
        postData['select'] = this.formList.selectfields;

        this._formlistService
          .GetBySearchPagination(this.formSchemaName, postData)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data: any) => {

            this.detailList = [];
            this.detailList = data.body;
            this.totalPages = data.headers.get('totalPages');
            this.totalCount = data.headers.get('totalCount');

            this.mappingData();

          }, (error: any) => {
            console.error("error", error);
          });
      }

  }

  protected onClickbutton(status: any, element: any, rowobj: any) {

    let obj = {
       'schemaname': this.formObj.schemaname,
       'objectId': element._id,
       'wfstatus': status,
    };
    swal.fire({
      title: 'Are you sure?',
      //text: 'You will not be able to revert this document !!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        this._commonService
          .updatewfstatus(obj)
          .then(data => {
            this.reloadList();
          });

      }
    })
  }

    mappingData() {

      this._commonDataService.filterDataparams['search'] = [];
      this.dataRowstemp = [];
      this.ELEMENT_DATA = [];

      this.detailList.forEach(element => {

        const tempdata: any[] = [];
        const tempdataObj: any = {};
        this.headerRowtemplabelname.forEach(element2 => {

          if (element2.fieldname.indexOf('.') != -1) {
            let prop = element2.fieldname.split('.');

            if (prop.length > 0) {
              if (prop.length == 2) {
                let prop0: string = prop[0];
                let prop1: string = prop[1];

                if (element[prop0]) {
                  let tempObj: any = element[prop0];
                  if (tempObj != undefined) {
                    if (Object.prototype.toString.call(tempObj) == '[object Array]') {
                      if (tempObj.length > 0) {
                        if (tempObj[0][prop1] != undefined) {
                          tempdata.push(tempObj[0][prop1]);
                          tempdataObj[element2.fieldname] = tempObj[0][prop1];
                        } else {
                          tempdata.push('---');
                          tempdataObj[element2.fieldname] = "---";
                        }
                      } else {
                        tempdata.push('---');
                        tempdataObj[element2.fieldname] = "---";
                      }
                    } else if (tempObj[prop1] != undefined) {
                      if (this.listDisplayFieldList != undefined) {
                        let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
                        if (objToP != undefined) {
                          if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Date' || objToP.fieldtype == 'datepicker')) {
                            tempdata.push(this.datePipe.transform(tempObj[prop1], this.gDateFormat));
                            tempdataObj[element2.fieldname] = this.datePipe.transform(tempObj[prop1], this.gDateFormat);
                          } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Datetime')) {
                            tempdata.push(this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat));
                            tempdataObj[element2.fieldname] = this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat);
                          } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'time')) {
                            tempdata.push(this.prettyDate2(tempObj[prop1]));
                            tempdataObj[element2.fieldname] = this.prettyDate2(tempObj[prop1]);
                          } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                            tempdata.push(this._myCurrencyPipe.transform(tempObj[prop1]));
                            tempdataObj[element2.fieldname] = this._myCurrencyPipe.transform(tempObj[prop1]);
                          } else {
                            tempdata.push(tempObj[prop1]);
                            tempdataObj[element2.fieldname] = tempObj[prop1];
                          }
                        } else {
                          tempdata.push(tempObj[prop1]);
                          tempdataObj[element2.fieldname] = tempObj[prop1];
                        }
                      } else {
                        tempdata.push(tempObj[prop1]);
                        tempdataObj[element2.fieldname] = tempObj[prop1];
                      }


                    } else {
                      tempdata.push('---');
                      tempdataObj[element2.fieldname] = "---";
                    }
                  }
                } else {
                  tempdata.push('---');
                  tempdataObj[element2.fieldname] = "---";
                }
              }
              if (prop.length == 3) {
                let prop0: string = prop[0];
                let prop1: string = prop[1];
                let prop2: string = prop[2];
                if (element[prop0]) {
                  let tempObj: any = element[prop0];
                  if (tempObj != undefined) {
                    if (tempObj[prop1] != undefined) {
                      let tempObj2: any = tempObj[prop1];
                      if (tempObj2[prop2] != undefined) {
                        if (this.listDisplayFieldList != undefined) {
                          let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
                          if (objToP != undefined) {
                            if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Date' || objToP.fieldtype == 'datepicker')) {
                              tempdata.push(this.datePipe.transform(tempObj2[prop2], this.gDateFormat));
                              tempdataObj[element2.fieldname] = this.datePipe.transform(tempObj2[prop2], this.gDateFormat);
                            } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Datetime')) {
                              tempdata.push(this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat));
                              tempdataObj[element2.fieldname] = this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat);
                            } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'time')) {
                              tempdata.push(this.prettyDate2(tempObj2[prop2]));
                              tempdataObj[element2.fieldname] = this.prettyDate2(tempObj2[prop2]);
                            } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                              tempdata.push(this._myCurrencyPipe.transform(tempObj2[prop2]));
                              tempdataObj[element2.fieldname] = this._myCurrencyPipe.transform(tempObj2[prop2]);
                            } else {
                              tempdata.push(tempObj2[prop2]);
                              tempdataObj[element2.fieldname] = tempObj2[prop2];
                            }
                          } else {
                            tempdata.push(tempObj2[prop2]);
                            tempdataObj[element2.fieldname] = tempObj2[prop2];
                          }
                        } else {
                          tempdata.push(tempObj2[prop2]);
                          tempdataObj[element2.fieldname] = tempObj2[prop2];
                        }

                      } else {
                        tempdata.push('---');
                        tempdataObj[element2.fieldname] = "---";

                      }
                    } else {
                      tempdata.push('---');
                      tempdataObj[element2.fieldname] = "---";

                    }
                  }
                } else {
                  tempdata.push('---');
                  tempdataObj[element2.fieldname] = "---";

                }
              }
            }
          } else {
            if (element[element2.fieldname] != undefined) {
              if (this.listDisplayFieldList != undefined) {
                //console.log("this.listDisplayFieldList", this.listDisplayFieldList)
                let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
                if (objToP != undefined) {
                  if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Date' || objToP.fieldtype == 'datepicker')) {
                    tempdata.push(this.datePipe.transform(element[element2.fieldname], this.gDateFormat));
                    tempdataObj[element2.fieldname] = this.datePipe.transform(element[element2.fieldname], this.gDateFormat);
                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Datetime')) {
                    tempdata.push(this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat));
                    tempdataObj[element2.fieldname] = this.datePipe.transform(element[element2.fieldname], this.gDateTimeFormat);
                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'time')) {
                    tempdata.push(this.prettyDate2(element[element2.fieldname]));
                    tempdataObj[element2.fieldname] = this.prettyDate2(element[element2.fieldname]);
                  } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                    tempdata.push(this._myCurrencyPipe.transform(element[element2.fieldname]));
                    tempdataObj[element2.fieldname] = this._myCurrencyPipe.transform(element[element2.fieldname]);
                  } else if (objToP.fieldname == 'wfstatus' && element[element2.fieldname] == "Pending") {
                    tempdataObj[element2.fieldname] = "Pending";
                  } else {
                    tempdata.push(element[element2.fieldname]);
                    tempdataObj[element2.fieldname] = element[element2.fieldname];
                  }
                } else {
                  tempdata.push(element[element2.fieldname]);
                  tempdataObj[element2.fieldname] = element[element2.fieldname];
                }
              } else {
                tempdata.push(element[element2.fieldname]);
                tempdataObj[element2.fieldname] = element[element2.fieldname];
              }

            } else {
              tempdata.push('---');
              tempdataObj[element2.fieldname] = "---";
            }
          }
        });

        if(this.editBtn.isShow && this.checkEditPermission(element._id)) {
          this.actionCounter++;
        }
        if(this.approveBtn.isShow && this.checkwfstatus(element.wfstatus, "approver")) {
          this.actionCounter++;
        }
        if(this.denyBtn.isShow && this.checkwfstatus(element.wfstatus, "reviewer")) {
          this.actionCounter++;
        }

        tempdata.push(element._id);
        tempdataObj["_id"]= element._id;

        if (tempdata.length > 0) {
          this.ELEMENT_DATA.push(tempdataObj);
          this.dataRowstemp.push(tempdata);
        }
      });


      if(this.actionCounter > 0) {
        var headerRowtempObj = this.headerRowtemp.find(p=>p.name == "Action");
        if(!headerRowtempObj) {
          let obj = { name: "Action", displayname: "Action", fieldname: "Action" }
          this.headerRowtemp.push(obj);
        }
      }

      this.dataTable.headerRow = [];
      this.dataTable.dataRows = [];
      this.dataTable.footerRow = [];

      this.dataTable.headerRow = this.headerRowtemp;
      this.dataTable.dataRows = this.dataRowstemp;
      this.dataTable.footerRow = this.headerRowtemp;

      this.displayedColumns = [];
      this.displayedColumns = this.headerRowtemp.map(col => col.name);
      this.displayedColumns.unshift("select");

      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.selection = new SelectionModel(true, []);
      this.dataSource.sort = this.sort;

      this.isButtonEnable = true;

      this.selection.changed.subscribe(item=>{
        this.isButtonEnable = this.selection.selected.length == 0;
      })



      this.tempdetList = JSON.parse(JSON.stringify(this.dataTable.dataRows));
      this.pagination = this.createRange();
      this.isLoadingResults = false;
    }

    prettyDate2(time: Date) {
      var date = new Date((time));
      return date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute:'2-digit'
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

    advanceSearchFilter() {
      this.filterFieldListLoad = !this.filterFieldListLoad;
      if(!this.filterFieldListLoad) {
        this.reloadList();
      }
    }

    logSelection(item: any) {


      if(item.action.fieldvalue == "deleted") {
        const varTemp = this;

        swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this action!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it',
          customClass:{
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
              customClass:{
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
      if(this.selection.selected.length !== 0) {

        this.selection.selected.forEach(element  => {
          if(element ['_id']) {
            selected.push(element ['_id']);
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
          .subscribe(data=>{
            if(data) {
              this.reloadList();
              this.showNotification('top', 'right', 'Mass operation has been done successfully!!!', 'success');
            }
          }, (err) =>{

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
                } else if(obj.branchid == this._loginUserBranchId){
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
                } else if(obj.branchid == this._loginUserBranchId){
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

    checkwfstatus(objstatus: any, status) {

        if (objstatus == status) return false;
        if (objstatus == 'decline') return false;
        return true;
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
                } else if(obj.branchid == this._loginUserBranchId){
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
                } else if(obj.branchid == this._loginUserBranchId){
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
                                      tempdata.push(this.datePipe.transform(data1[element.fieldname], this.gDateFormat));
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
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            var url = listO.actionurl;
            if (url.indexOf(":formname") > 0) {
              url = url.replace(":formname", obj.formname);
              this._router.navigate([url]);
            }
            else if (this._formName == 'dispositionrule') {
              this._router.navigate([listO.actionurl + '/' + this.isredirectwithid + '/' + id]);
            } else {
              this._router.navigate([listO.actionurl + '/' + id]);
            }
          } else if (listO.type != undefined && listO.type == 'customwithformid') {
            this._router.navigate([listO.actionurl + '/' + this._formId + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'popup') {
          } else if (listO.type != undefined && listO.type == 'redirectsurvey') {
            this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
          } else {
            this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
          }

        } else if (listO.action == 'cancel') {
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl + id]);
          }
        } else if (listO.action == 'isredirect') {
          this._commonDataService.filterfieldoptionsaparams['search'] = [];
          for (var key in this._allformDetailsBasedId) {
            if (key == id) {
              this._commonDataService.filterfieldoptionsaparams['search'].push({ "searchfield": 'formname', "searchvalue": this._allformDetailsBasedId[key].formname, "criteria": "eq" });
            }
          }
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            this._router.navigate([listO.actionurl + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'receivable') {
            this.detailList.forEach(element => {
              if (element._id == id) {
                let tempmemberid = element.memberid._id;
                this._router.navigate([listO.actionurl + '/' + tempmemberid + '/' + id]);
              }
            });
          }
          else if (listO.type != undefined && listO.type == 'download') {
            this.detailList.forEach(elemdownload => {
              if (elemdownload._id == id) {
                this.downloadlink(elemdownload.property['file'][0]);
              }
            });
          }
        } else if (listO.action == 'isredirectwithuserid') {
          this._commonDataService.filterstaffattandancesaparams['search'] = [];
          this._commonDataService.filterstaffattandancesaparams['search'].push({ "searchfield": 'userid', "searchvalue": id, "criteria": "eq" });
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl]);
          }


        } else if (listO.action == 'isredirectwithfilter') {
          this._commonDataService.filterfieldoptionsaparams['search'] = [];
          this._commonDataService.filterfieldoptionsaparams['search'].push({ "searchfield": 'formid', "searchvalue": id, "criteria": "eq" });

          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            this._router.navigate([listO.actionurl + '/' + id]);
          }
        } else if (listO.action == 'isredirectAnother') {
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl + '/' + this._formId]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            this._router.navigate([listO.actionurl + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'customwithcourseid') {

            this.detailList.forEach(element => {
              if (element._id == id && element.courseid && element.courseid._id) {
                this._router.navigate([listO.actionurl + '/' + element.courseid._id + '/' + id]);
              }
            });

          } else if (listO.type != undefined && listO.type == 'customwithformid') {
            if (this._formName == 'followup') {
              this.detailList.forEach(elemfollow => {
                if (elemfollow._id == id) {

                  let objctidfollowup;
                  let formidfollowup = elemfollow['formid']['_id'];

                  if (elemfollow['promotionid']) {
                    objctidfollowup = elemfollow['promotionid']['_id'];
                  }

                  if (listO.redirectBack && listO.redirectBack !== '' && formidfollowup !== '' && objctidfollowup !== '') {
                    this._router.navigate([listO.actionurl + '/' + formidfollowup + '/' + objctidfollowup + '/' + listO.redirectBack]);
                  } else if (formidfollowup !== '' && objctidfollowup !== '') {
                    this._router.navigate([listO.actionurl + '/' + formidfollowup + '/' + objctidfollowup]);
                  } else {
                    this._router.navigate([listO.actionurl + '/' + this._formId + '/' + id]);
                  }
                }
              });

            } else if (this._formName == "import") {
              if (this.isFilterListing) {
                if (this._commonDataService.filterDataForDynamicPagesparams['search']) {
                  if (this._commonDataService.filterDataForDynamicPagesparams['search'][0]) {
                    if (this._commonDataService.filterDataForDynamicPagesparams['search'][0]['searchvalue']) {
                      this._router.navigate([listO.actionurl + '/' + id + '/' + this._commonDataService.filterDataForDynamicPagesparams['search'][0]['searchvalue']]);
                    }
                  }
                }
              }
            } else {
              this._router.navigate([listO.actionurl + '/' + this._formId + '/' + id]);
            }

          } else if (listO.type != undefined && listO.type == 'customwithformname') {

            this.detailList.forEach(element => {
              if (element._id == id && element['formname']) {
                this._router.navigate([listO.actionurl + '/' + element['formname']]);
              }
            });

          } else if (listO.type != undefined && listO.type == 'customwithformnameformlist') {
            this.detailList.forEach(element => {
              if (element._id == id && element['formname'] && element['formlistname']) {
                this._router.navigate([listO.actionurl + '/' + element['formname'] + '/' + element['formlistname']]);
              }
            });

          }

        } else if (listO.action == 'isredirectAnotherOne') {
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl + '/' + id]);
          }
        } else if (listO.action == 'payment') {
          this.detailList.forEach(element => {
            if (element._id == id) {
              if (listO.type == "receipt") {
                let param1 = element[listO.param1];
                let param2 = element[listO.param2];
                this._router.navigate([listO.actionurl + '/' + param1 + '-' + param2]);
              }
              if (listO.type == "invoice") {
                let invparam1 = element.items[0].invoicenumberprefix;
                let invparam2 = element.items[0].invoicenumber;
                this._router.navigate([listO.actionurl + '/' + invparam1 + '-' + invparam2]);
              }
            }
          });

        } else if (listO.action == 'clone') {
          const varTemp = this;

          swal.fire({
            title: 'Are you sure?',
            //text: 'You will not be able to revert this!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Clone it!',
            cancelButtonText: 'No, keep it',
            customClass:{
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

            // swal.fire({
            //     title: 'Deleted!',
            //     text: 'Your imaginary file has been deleted.',
            //     icon: 'success',
            //     customClass:{
            //       confirmButton: "btn btn-success",
            //     },
            //     buttonsStyling: false
            // });
          } else {
            swal.fire({
                title: 'Cancelled',
                text: 'Your imaginary file is safe :)',
                icon: 'error',
                customClass:{
                  confirmButton: "btn btn-info",
                },
                buttonsStyling: false
            });
          }
        })

        } else if (listO.action == 'isredirectwithaddpermisson') {
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl + '/' + this._formId]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            this._router.navigate([listO.actionurl + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'customwithformid') {
            this._router.navigate([listO.actionurl + '/' + this._formId + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'customwithformname') {
            this.detailList.forEach(element => {
              if (element._id == id && element['formname']) {
                this._router.navigate([listO.actionurl + '/' + element['formname']]);
              }
            });
          } else if (listO.type != undefined && listO.type == 'customwithformnameformlist') {
           this.detailList.forEach(element => {
             if (element._id == id && element['formname'] && element['formlistname']) {
               this._router.navigate([listO.actionurl + '/' + element['formname'] + '/' + element['formlistname']]);
             }
           });

         }

        } else if (listO.action == 'isredirectwitheditpermisson') {
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate([listO.actionurl + '/' + this._formId]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            this._router.navigate([listO.actionurl + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'customwithformid') {
            this._router.navigate([listO.actionurl + '/' + this._formId + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'customwithformname') {
            this.detailList.forEach(element => {
              if (element._id == id && element['formname']) {
                this._router.navigate([listO.actionurl + '/' + element['formname']]);
              }
            });
          } else if (listO.type != undefined && listO.type == 'customwithformnameformlist') {
           this.detailList.forEach(element => {
             if (element._id == id && element['formname'] && element['formlistname']) {
               this._router.navigate([listO.actionurl + '/' + element['formname'] + '/' + element['formlistname']]);
             }
           });

         }

        } else if (listO.action == 'view') {
          if (this.isFilterListing) {
            this._commonDataService.isfilterDataForDynamicPages = true;
          } else {
            this._commonDataService.isfilterDataForDynamicPages = false;
          }
          if (listO.type != undefined && listO.type == 'redirect') {
            this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
          } else if (listO.type != undefined && listO.type == 'custom') {
            if (this._formName == 'dispositionrule') {
              this._router.navigate([listO.actionurl + '/' + this.isredirectwithid + '/' + id]);
            } else {
              this._router.navigate([listO.actionurl + '/' + id]);
            }
          } else if (listO.type != undefined && listO.type == 'popup') {
          } else if (listO.type != undefined && listO.type == 'redirectsurvey') {
            this._router.navigate(['/pages/dynamic-survey-forms/form/' + this._formId + '/' + id]);
          } else {
            this._router.navigate(['/pages/dynamic-forms/form/' + this._formId + '/' + id]);
          }

        } else {
          const varTemp = this;

          swal.fire({
            title: listO.actionmessage,
            //text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
            customClass:{
              confirmButton: "btn btn-success",
              cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
          if (result.value) {

            if (listO.type != undefined && listO.type == 'redirect') {
              varTemp._router.navigate([listO.actionurl + id]);
            } else {
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
                      customClass:{
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
                customClass:{
                  confirmButton: "btn btn-info",
                },
                buttonsStyling: false
            });
          }
        })



        }
      }
    }

    updatePassword() {
      if (this.currentpassword && this.currentpassword != '' && this.validpasswd) {
          var url =''
          var username = '';
          if(this._formName == 'member'){
            username  = this.currentdataToupdate.membernumber;
            url =`members/${this.currentdataToupdate._id}`;
          }else{
            username  = this.currentdataToupdate.username;
            url =`users/${this.currentdataToupdate._id}`;
          }
          var newobject = {
              newpassword:  this.currentpassword,
              forcelogin: true
            }

            this._commonService
              .commonServiceByUrlMethodData(url, "PATCH", newobject)
              .pipe(takeUntil(this.destroy$))
              .subscribe((data: any) => {
                if (data) {
                  this.showNotification('top', 'right', 'Password updated successfully !!', 'success');
                  $("#resetpwdclose").click();
                }
              },(e)=>{
                this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
                $("#resetpwdclose").click();
              });
      } else {
        this.showNotification('top', 'right', 'Enter valid password !!', 'danger');
      }

    }

    sendlinkResetPassword(){
      if (this.apiUpdateUrl.url != undefined && this.apiUpdateUrl.method != undefined) {
          var newobject = { firsttimelogin: true }
          var url = this.apiUpdateUrl.url.replace(':_id','');
          var method =  this.apiUpdateUrl.method;
          this._commonService
            .commonServiceByUrlMethodData(url, "PATCH", newobject, this.currentdataToupdate._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'User will receive link shortly!!', 'success');
              $("#resetpwdclose").click();
            }
          });

      }
    }

    validatePasswd(){
      if(this.currentpassword){
        var regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        var valid = regex.test(this.currentpassword);
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

    getPassword(checked : boolean) {
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

    isEmpty(obj: any) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key))
          return false;
      }
      return true;
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

    ValidURL(str: any) {
      var pattern = new RegExp("(https?:\/\/[^\s]+)");
      if (pattern.test(str)) {
        return true;
      }
    }

    sendrowRecord(event: any) {
      let msg = "";
      if (event.property.message) {
        msg = event.property.message;
      } else {
        msg = event.property.html;
      }

      let sendObj = {
        message: msg,
        recipient: event.property.to,
        mailalertid: event.mailalert._id
      }

      this._mailalertsService
        .rendsendnotifications(sendObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
          }
        });
    }

    redirect(item: any) {
      console.log("this.gridactionList",this.gridactionList);
      console.log("item",item);
      var detailpage = this.gridactionList.find(p=>p.action == 'view');

      if(detailpage) {
        var url = detailpage.actionurl.replace(':_id', item['_id']);
        var formurl = url.replace(':_formid',this._formId);
        this._router.navigate([formurl]);
      }
    }
}

