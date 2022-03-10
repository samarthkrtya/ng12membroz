import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';

import { CommonDataService } from './../../../../core/services/common/common-data.service';

declare const $: any;

@Component({
  selector: 'app-search-filter-render',
  templateUrl: './search-filter-render.component.html'
})

export class SearchFilterRenderComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  listofLookupNeedtoBeLoaded: any[] = [];
  inBuildlookupLists: any[] = [];
  @Input('filterfieldListsi') filterfieldListsValue: any[] = [];
  @Input('filterModei') filterModeValue: string = "";
  @Input('searchfields') searchfieldlist: any = {
    search: []
  };
  @Input('langResource') langResourceValue: any;
  @Input('listFilterParamsi') listFilterParamsValue: any = {
    search: [], select: [], sort: ''
  };
  @Input('isDisaplayBtn') isDisaplayBtnValue: boolean;
  @Input('isDisaplayBtnTxt') isDisaplayBtnTxtValue: string;
  
  
  @Output() searchfilterSubmitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetfilterData: EventEmitter<any> = new EventEmitter<any>();

  resetControl = true;

  constructor(
    private _commonDataService: CommonDataService,
    private _commonService: CommonService,
  ) {

  }

  async ngOnInit() {


    if (!this.langResourceValue) {
      this.langResourceValue = {};
    }

    try {
      await this.loadLookupData();
    } catch (error) {
      console.error(error);
    } finally {

      if (this._commonDataService.isfilterData) {
        if (this._commonDataService.filterDataparams) {
          if (this._commonDataService.filterDataparams['search']) {
            this.listFilterParamsValue.search = this._commonDataService.filterDataparams['search'];
          }
        }
      }
    }
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {    
    if (dateRangeStart.value && dateRangeEnd.value) {
      if(!this.isDisaplayBtnValue) this.reloadList();
    }
  }

  onItemAdded(itemToBeAdded: any) {
    if(!this.isDisaplayBtnValue) this.reloadList();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async loadLookupData() {
    console.log(this.filterfieldListsValue);

    if (this.filterfieldListsValue.length > 0) {
      this.filterfieldListsValue.forEach(element => {
        if ((element.fieldtype == 'radio' || element.fieldtype == 'list') && element.lookupdata) {
          element.optionsList = [];
          element.lookupdata.forEach(elelookup => {
            let obj = {
              id: elelookup.key,
              name: elelookup.key
            }
            element.optionsList.push(obj);
          });
        } else if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange') {
          element.modelValue = {
            beginJsDate: null,
            endJsDate: null
          }
        } else if(element.fieldtype == 'form_multiselect' ){  
          
          let postData = {};
          postData["search"] = [];
          if(element.search && element.search.length > 0){
            postData["search"] = element.search;
          }
          element.formfieldfilterValue = [];
          element.modelValue  = [];
          let url = element["option"]["refschema"] + '/filter';
          let method = "POST";

          this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              if (data) {
                if (data.length !== 0) {
                  data.forEach((ele) => {
                    let val: any;
                    let displayvalue: any;
                    if (element["option"]["reffieldname"].indexOf(".") !== -1) {
                      let stringValue = element["option"]["reffieldname"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      val = ele[str1][str2];
                    } else {
                      displayvalue = element["option"]["reffieldname"];
                      val = ele[displayvalue];
                    }

                    let obj = { id: ele["_id"], itemName: val };
                    element.formfieldfilterValue.push(obj);

                  });
                }
              }
            }, (err) => {
              console.error("err", err);
            });
        }
      });
    }


    return;
  }

  reloadList() {
    if (this.filterModeValue != "advanceSearch") {

      var defaultsearch = [...this.searchfieldlist.search];
      //console.log("searchfieldlist 1", defaultsearch)
      this.listFilterParamsValue.search = [];
      //console.log("searchfieldlist 2", defaultsearch)
      if (this._commonDataService.isfilterData) {
        if (this._commonDataService.filterDataparams) {
          if (this._commonDataService.filterDataparams['search']) {
            this.listFilterParamsValue.search = this._commonDataService.filterDataparams['search'];
          }
        }
      }

      this.listFilterParamsValue.dispositionref = [];
      console.log("this.filterfieldListsValue",this.filterfieldListsValue);
      if (this.filterfieldListsValue.length > 0) {
        this.filterfieldListsValue.forEach(element => {

          if (element.modelValue != undefined && element.modelValue != null && element.modelValue != "") {
            if (element.schematype != undefined && element.schematype == 'disposition') {

              if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange') {
                if (element.modelValue.beginJsDate != undefined && element.modelValue.endJsDate != undefined) {
                  var enddate = new Date(element.modelValue.endJsDate);
                  enddate.setDate(enddate.getDate() + 1)
                  enddate.setSeconds(enddate.getSeconds() - 1);    
                  element.modelValue.endJsDate = enddate;
                  if (element.modelValue.endJsDate < element.modelValue.beginJsDate) {
                    this.showNotification('top', 'right', 'Start date must be less than end date!', 'danger');
                    return;
                  } else {
                    this.listFilterParamsValue.dispositionref.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": element.modelValue.beginJsDate, "$lte": element.modelValue.endJsDate }, "criteria": "eq", "datatype": "Date" });
                  }
                }
              } else if (element.fieldtype == "ObjectID" || element.fieldtype == "ObjectId" || element.fieldtype == "form" || element.fieldtype == "lookup") {

                if (Object.prototype.toString.call(element.modelValue) == '[object Object]') {
                  if (element.modelValue.autocomplete_id != undefined) {
                    this.listFilterParamsValue.dispositionref.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue.autocomplete_id, "criteria": "eq", "datatype": element.fieldtype == "lookup" ? "text" : "ObjectId" });
                  }
                } else {
                  this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "eq" });
                }

              } else {
                this.listFilterParamsValue.dispositionref.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue != undefined || null ? element.modelValue : '', "criteria": "eq" });
              }

            } else {

              if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange') {
                if (element.modelValue.beginJsDate != undefined && element.modelValue.endJsDate != undefined) {
                  var enddate = new Date(element.modelValue.endJsDate);
                  enddate.setDate(enddate.getDate() + 1)
                  enddate.setSeconds(enddate.getSeconds() - 1);    
                  element.modelValue.endJsDate = enddate;
                  if (element.modelValue.endJsDate < element.modelValue.beginJsDate) {
                    this.showNotification('top', 'right', 'Start date must be less than end date!', 'danger');
                    return;
                  } else {
                    this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": element.modelValue.beginJsDate, "$lte": element.modelValue.endJsDate }, "criteria": "eq", "datatype": "Date" });
                  }
                }
              } else if (element.fieldtype == "ObjectID" || element.fieldtype == "ObjectId" || element.fieldtype == "form" || element.fieldtype == "formdata") {

                var fieldname = element.fieldname.split(".");
                if (Object.prototype.toString.call(element.modelValue) == '[object Object]') {
                  if (element.modelValue.autocomplete_id != undefined) {
                    this.listFilterParamsValue.search.push({ "searchfield": fieldname[0], "searchvalue": element.modelValue.autocomplete_id, "criteria": "eq", "datatype": "ObjectId" });
                  }
                } else {
                  this.listFilterParamsValue.search.push({ "searchfield": fieldname[0], "searchvalue": element.modelValue, "criteria": "eq" });
                }
              } else if (element.fieldtype == "lookup") {
                this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue.autocomplete_id, "criteria": "eq", "datatype": "text" });
              } else if (element.fieldtype == "form_multiselect") {
                this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "in" ,"datatype": "ObjectId"});
              }
              else {
                this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "eq" });
              }
            }
          }
          if (element.display === false) {
            this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.fieldvalue, "criteria": element.criteria });
          }
        })
      }
    } else {
      this.filterModeValue = "";
    }

    defaultsearch.forEach((search)=>{

      var fieldname = search.searchfield;
      var mapping = this.listFilterParamsValue.search.find(element => {
        return element.searchfield == fieldname || element.fieldname == fieldname;
      });
      if (!mapping){
        this.listFilterParamsValue.search.push(search);
      }

    })


    this.searchfilterSubmitData.emit();
  }

  resetFilter() {

    this.resetControl = false;
    this.listFilterParamsValue.search = [];
    if (this.filterfieldListsValue.length > 0) {
      this.filterfieldListsValue.forEach(element => {
        if (element.modelValue != undefined && element.modelValue != null && element.modelValue != "") {
          if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange') {
            element.modelValue = {
              beginJsDate: null,
              endJsDate: null
            };
          } else {
            element.modelValue = null;
          }
        }
      })
    }

    setTimeout(() => { this.resetControl = true; });

    this.resetfilterData.emit();

  }

  showNotification(from: any, align: any, msg: any, type: any) {
    $.notify({
      icon: "notifications",
      message: msg
    }, {
      type: type,
      timer: 3000,
      placement: {
        from: from,
        align: align
      }
    });
  }

}
