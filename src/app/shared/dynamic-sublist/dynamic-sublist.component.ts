import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MyCurrencyPipe } from '../components/currency.pipe';
import { FormlistService } from '../../core/services/formlist/formlist.service';
import { CommonService } from '../../core/services/common/common.service';
import { FormComponemntComponent } from '../base-componemnt/form-componemnt/form-componemnt.component';
import { BaseComponemntInterface } from '../../shared/base-componemnt/base-componemnt.component';
import { ActivatedRoute } from '@angular/router';


declare var $: any;

declare interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'app-dynamic-sublist',
  templateUrl: './dynamic-sublist.component.html',
})
export class DynamicSubListComponent extends FormComponemntComponent implements OnInit, BaseComponemntInterface {

  isDisable: boolean = false;

  detailList: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() users: any;
  @Input() formname: string;
  @Input() form: any;
  @Input() text: string;
  
  @Output() submitData = new EventEmitter();

  totalPages = 0;
  totalCount = 0;
  isLoadingResults: boolean = false;
  pageSize = 10;
  currentPage: number = 1;
  recordPerPageLists: any[] = [10, 20, 30, 50, 100, 1000];
  formList: any = {};
  pagination: any;

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  filterFieldListLoad = false;
  formlistaddbuttonurl: string;
  gridactionList: any[] = [];

  apiUrl: any = '';
  apiUpdateUrl: any = '';

  dispalyformname: any;
  public dataTable: DataTable;
  listFilterParams: any = {};
  headerRowtemp: any[] = [];
  listDisplayFieldList: any[] = [];
  filterFieldList: any[] = [];
  headerRowtemplabelname: any[] = [];
  formlistTitle: any;

  dataRowstemp: any[] = [];
  
  displayedColumns: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  constructor(
    private _route: ActivatedRoute,
    public _commonService: CommonService,
    public _formlistService: FormlistService,
    private datePipe: DatePipe,
    private _myCurrencyPipe: MyCurrencyPipe,

  ) {
    super();
  }
  LoadData(): void {
    throw new Error('Method not implemented.');
  }
  Save(): void {
    throw new Error('Method not implemented.');
  }
  Update(): void {
    throw new Error('Method not implemented.');
  }
  Delete(): void {
    throw new Error('Method not implemented.');
  }
  ActionCall(): void {
    throw new Error('Method not implemented.');
  }

  async ngOnInit() {
    try {

      this._route.params.forEach(async (params) => {
        this._formName = this.formname ? this.formname : 'user';
        this.pagename = this._formId;

        await super.ngOnInit();
        await this.initializeVariable();
        await this.getFormdetailextended();
        await this.searchsetting();
        await this.formDataOperation();

      });
    } catch (error) {
      console.error("error", error)
    } finally {
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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


 async getAllListData() {

    this.isLoadingResults = true;
    if (this.formlistObj.searchfield != undefined && this.formlistObj.searchfield.length > 0) {
      this.formlistObj.searchfield.forEach(ele => {
        if (ele.fieldname != undefined) {
          let tmpArrl: any[] = this.listFilterParams['search'];
          let tmpobjL: any[] = tmpArrl.filter(ele452 => ele452.searchfield == ele.fieldname);
          if (tmpobjL != undefined && tmpobjL.length > 1) {
            tmpArrl.splice(tmpArrl.indexOf(tmpobjL[1]), 1);
          }
        }
      });
    }

    if (this.formlistObj.selectfields != undefined) {
      this.formlistObj.selectfields.forEach(element => {
        if (element.virtualfield != undefined) {
          let tmp: any = this;
          Object.keys(element.virtualfield).forEach(function (key) {
            tmp.listFilterParams['select'].push({ "isDisplayOnList": false, "fieldname": key, "fieldtype": "string", "value": 1 });
          })
        }
      });
    }

    this.isLoadingResults = true;
    this.listFilterParams['search'].push({
      "searchfield": "status",
      "searchvalue": "active",
      "criteria": "eq"
    })
    this.listFilterParams['formname'] = this.formlistObj.formname;
    this.listFilterParams['schemaname'] = this.formSchemaName;
    this.listFilterParams["pageNo"] = this.currentPage;
    this.listFilterParams["size"] = this.pageSize;

    this.detailList = [];

    await this._commonService
      .commonServiceByUrlMethodDataPagination(this.apiUrl.url, this.apiUrl.method, this.listFilterParams)
      .then((data: any) => {
        this.detailList = data.body;
        this.totalPages = data.headers.get('totalPages');
        this.totalCount = data.headers.get('totalCount');
        this.isLoadingResults = false;
        this.mappingData();
      }, (error: any) => {
        console.error("error", error);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  createRange() {
    let items: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      items.push(i);
    }
    return items;
  }

  changePage(pageNumber: number): void {
    this.currentPage = Math.ceil(pageNumber);
    this.getAllListData();
  }

  onSelectValue(selectPageSize: number) {
    this.pageSize = selectPageSize;
    if (this.dataTable.dataRows.length != 0) {
      this.currentPage = 1;
      this.getAllListData();
    }
  }

  async initializeVariable() {
    this.isLoadingResults = true;
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

    this.formlistTitle = '';
    this.formlistaddbuttonurl = '';
    this.isLoadingResults = false;

    this.dataSource = new MatTableDataSource();
    this.ELEMENT_DATA = [];
    this.detailList = [];
    this.selection = new SelectionModel;
    this.isLoadingResults = false;
    return;
  }

  async formDataOperation() {
    this.isLoadingResults = true;
    if (this.formlistObj && this.formlistObj.selectfields) {
      this.listFilterParams['select'] = [];
      this.listDisplayFieldList = this.formlistObj.selectfields;
      this.listFilterParams.select = this.formlistObj.selectfields;
    }

    if (this.formlistObj && this.formlistObj.limit) {
      this.listFilterParams['limit'] = '';
      this.listFilterParams.limit = this.formlistObj.limit;
    }

    if (this.formlistObj && this.formlistObj.sortfields) {
      this.listFilterParams['sort'] = "";
      this.formlistObj.sortfields.forEach(element => {
        this.listFilterParams.sort = element;
      });
    }

    if (this.formlistObj && this.formlistObj.filterfields) {
      this.filterFieldList = this.formlistObj.filterfields;
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

        if (this.headerRowtemplabelname.find(ele25 => ele25.fieldname == element.fieldname) == undefined) {

          this.headerRowtemplabelname.push(element);


          if (element.fieldname.indexOf('.') != -1) {
            let prop = element.fieldname.split('.');
            if (prop.length > 0) {
              if (prop.length == 2) {
                let prop0: string = prop[0];
                let prop1: string = prop[1];
                let obj = { name: prop1, displayname: element.displayname, fieldname: element.fieldname }
                this.headerRowtemp.push(obj);

              }
              if (prop.length == 3) {
                let prop0: string = prop[0];
                let prop1: string = prop[1];
                let prop2: string = prop[2];
                let obj = { name: prop2, displayname: element.displayname, fieldname: element.fieldname }
                this.headerRowtemp.push(obj);
              }
            }

          } else {
            let obj = { name: element.fieldname, displayname: element.displayname, fieldname: element.fieldname }
            this.headerRowtemp.push(obj);
          }
        }
      }
    });
    // if (this.formObj && this.formObj.gridaction && this.formObj.gridaction.length > 0) {
    //   let obj = { name: "Action", displayname: "Action", fieldname: "Action" }
    //   this.headerRowtemp.push(obj);
    // }
    this.formlistTitle = this.formlistObj && this.formlistObj.langresources && this.formlistObj.langresources[this.defaultLanguage] ? this.formlistObj.langresources[this.defaultLanguage] : this.formlistObj && this.formlistObj.title ? this.formlistObj.title : this.formlistObj?.formlistname;
    this.isLoadingResults = false;
   await this.getAllListData();
    return;
  }

  redirect(item: any) {
    var detailpage = this.gridactionList.find(p => p.action == 'view');
    if (detailpage) {
      var url = detailpage.actionurl.replace(':_id', item['_id']);
      this._router.navigate([url]);
    }
  }

  Addredirect() {
    var detailpage = this.gridactionList.find(p => p.action == 'edit');
    if (detailpage) {
      var url = detailpage.actionurl.replace(':_id', '');
      this._router.navigate([url]);
    }
  }

  actionlistRecord(gridaction: any, id: any) {
    if (gridaction.action == 'edit') {
      var actionurl = gridaction.actionurl;
      var url = actionurl.replace(':_id', id);
      this._router.navigate([url]);
    }
  }

  globalSearch() {

    let search_term = $("#global_search_terms").val();

    if (search_term == '') {
      this.getAllListData();
    } else {
      let postData = {};
      postData['search'] = search_term;
      postData['select'] = this.formlistObj.selectfields;

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

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  advanceSearchFilter() {
    this.filterFieldListLoad = !this.filterFieldListLoad;
    if (!this.filterFieldListLoad) {
      this.reloadList();
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

  async searchsetting() {

    if (this.formList && this.formList.searchfield) {
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
    }

    if (this.formList && this.formList.searchreffield) {
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
          } else if (element.type === undefined) {
            this.listFilterParams['searchref'].push({ "searchfield": element.fieldname, "searchvalue": element.default, "criteria": ((element.criteria != undefined) ? element.criteria : "eq") });
          }
        }
      });
    }
    return;
  }

  async getFormdetailextended() {
    this.isLoadingResults = true;
    this._formId = this.formObj._id;
    this.formSchemaName = '';
    this.formSchemaName = this.formObj.schemaname;

    if (this.formObj.gridaction && this.formObj.gridaction.length > 0) {
      this.gridactionList = this.formObj.gridaction;
    }
    this.formlistaddbuttonurl = this.formObj.addbuttonurl;

    this.formlistname = this.formObj.formlistname;
    this.apiUrl = this.formObj.listurl;
    this.apiUpdateUrl = this.formObj.editurl

    this.formList = this.formlistObj;

    this.dispalyformname = this.formObj && this.formObj.langresources && this.formObj.langresources[this.defaultLanguage] ? this.formObj.langresources[this.defaultLanguage] : this.formObj.dispalyformname ? this.formObj.dispalyformname : this.formObj.formlistname;
    this.isLoadingResults = false;
    return;
  }

  resetgSearchText() {
    let search = <HTMLInputElement>document.getElementById('global_search_terms');
    if (search != undefined) {
      search.value = '';
      this.getAllListData();
    }
  }

  mappingData() {
    this.isLoadingResults = true;
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
                        tempdataObj[prop1] = tempObj[0][prop1];
                      } else {
                        tempdata.push('---');
                        tempdataObj[prop1] = "---";
                      }
                    } else {
                      tempdata.push('---');
                      tempdataObj[prop1] = "---";
                    }
                  } else if (tempObj[prop1] != undefined) {
                    if (this.listDisplayFieldList != undefined) {
                      let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
                      if (objToP != undefined) {
                        if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype.toLowerCase() == 'datepicker')) {
                          tempdata.push(new Date(tempObj[prop1]).toLocaleDateString(this._commonService.currentLocale()));
                          tempdataObj[prop1] = new Date(tempObj[prop1]).toLocaleDateString(this._commonService.currentLocale());
                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                          tempdata.push(new Date(tempObj[prop1]).toLocaleString(this._commonService.currentLocale()));
                          tempdataObj[element2.fieldname] = new Date(tempObj[prop1]).toLocaleString(this._commonService.currentLocale());
                        } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                          tempdata.push(this._myCurrencyPipe.transform(tempObj[prop1]));
                          tempdataObj[prop1] = this._myCurrencyPipe.transform(tempObj[prop1]);
                        } else {
                          tempdata.push(tempObj[prop1]);
                          tempdataObj[prop1] = tempObj[prop1];
                        }
                      } else {
                        tempdata.push(tempObj[prop1]);
                        tempdataObj[prop1] = tempObj[prop1];
                      }
                    } else {
                      tempdata.push(tempObj[prop1]);
                      tempdataObj[prop1] = tempObj[prop1];
                    }


                  } else {
                    tempdata.push('---');
                    tempdataObj[prop1] = "---";
                  }
                }
              } else {
                tempdata.push('---');
                tempdataObj[prop1] = "---";
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
                          if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype.toLowerCase() == 'datepicker')) {
                            tempdata.push(new Date(tempObj2[prop2]).toLocaleDateString(this._commonService.currentLocale()));
                            tempdataObj[prop2] = new Date(tempObj2[prop2]).toLocaleDateString(this._commonService.currentLocale());
                          } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                            tempdata.push(new Date(tempObj2[prop2]).toLocaleString(this._commonService.currentLocale()));
                            tempdataObj[prop2] = new Date(tempObj2[prop2]).toLocaleString(this._commonService.currentLocale());
                          } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                            tempdata.push(this._myCurrencyPipe.transform(tempObj2[prop2]));
                            tempdataObj[prop2] = this._myCurrencyPipe.transform(tempObj2[prop2]);
                          } else {
                            tempdata.push(tempObj2[prop2]);
                            tempdataObj[prop2] = tempObj2[prop2];
                          }
                        } else {
                          tempdata.push(tempObj2[prop2]);
                          tempdataObj[prop2] = tempObj2[prop2];
                        }
                      } else {
                        tempdata.push(tempObj2[prop2]);
                        tempdataObj[prop2] = tempObj2[prop2];
                      }

                    } else {
                      tempdata.push('---');
                      tempdataObj[prop2] = "---";

                    }
                  } else {
                    tempdata.push('---');
                    tempdataObj[prop2] = "---";

                  }
                }
              } else {
                tempdata.push('---');
                tempdataObj[prop2] = "---";

              }
            }
          }
        } else {
          if (element[element2.fieldname] != undefined) {
            if (this.listDisplayFieldList != undefined) {
              let objToP = this.listDisplayFieldList.find(eleF => eleF.fieldname == element2.fieldname);
              if (objToP != undefined) {
                if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'date' || objToP.fieldtype.toLowerCase() == 'datepicker')) {
                  tempdata.push(new Date(element[element2.fieldname]).toLocaleDateString(this._commonService.currentLocale()));
                  tempdataObj[element2.fieldname] = new Date(element[element2.fieldname]).toLocaleDateString(this._commonService.currentLocale());
                } else if (objToP.fieldtype != undefined && (objToP.fieldtype.toLowerCase() == 'datetime')) {
                  tempdata.push(this.datePipe.transform(new Date(element[element2.fieldname]).toLocaleString(this._commonService.currentLocale())));
                  tempdataObj[element2.fieldname] = this.datePipe.transform(new Date(element[element2.fieldname]).toLocaleString(this._commonService.currentLocale()))
                } else if (objToP.fieldtype != undefined && (objToP.fieldtype == 'Currency')) {
                  tempdata.push(this._myCurrencyPipe.transform(element[element2.fieldname]));
                  tempdataObj[element2.fieldname] = this._myCurrencyPipe.transform(element[element2.fieldname]);
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

      tempdata.push(element._id);
      tempdataObj["_id"] = element._id;
      if (tempdata.length > 0) {
        this.ELEMENT_DATA.push(tempdataObj);
      }
    });


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
    for (let i = 0; i < this.dataSource.data.length; i++) {
      for (let j = 0; j < this.users.length; j++) {
        if (this.dataSource.data[i]["_id"] == this.users[j]) {
          this.selection.toggle(this.dataSource.data[i]);
        }
      }
    }
    this.dataSource.sort = this.sort;
    this.pagination = this.createRange();
    this.isLoadingResults = false;
  }


  checkboxLabel(row?: DataTable): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row}`;
  }

  submit() {
    this.isDisable = true;
    var selection = [];
    this.selection.selected.forEach(element => {
      selection.push(element["_id"])
    });
    this.isDisable = false;

    this.submitData.emit(selection);

  }
}
