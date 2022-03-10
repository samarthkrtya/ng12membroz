import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';

import { CommonDataService } from '../../../../core/services/common/common-data.service';
import * as moment from 'moment';

declare const $: any;

@Component({
  selector: 'app-search-report-filter-render',
  templateUrl: './search-report-filter-render.component.html'
})

export class SearchReportFilterRenderComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();


  @Input('filterfieldListsi') filterfieldListsValue: any[] = [];
  @Input('searchfields') searchfieldlist: any = {
    search: []
  };
  @Input('langResource') langResourceValue: any;
  @Input('listFilterParamsi') listFilterParamsValue: any = {
    search: [], select: [], sort: ''
  };

  @Output() searchfilterSubmitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetfilterData: EventEmitter<any> = new EventEmitter<any>();

  resetControl = true;

  alwaysShowCalendars: boolean;
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }

  disableDates =  {
    future : (m: moment.Moment) =>  {
      return m.isAfter(moment());
    },
    past : (m: moment.Moment) =>  {
      return m.isBefore(moment());
    },
    none : (m: moment.Moment) => false
  }
  
  constructor(
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
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async loadLookupData() {
    if (this.filterfieldListsValue.length > 0) {
      this.filterfieldListsValue.forEach((element , i) => {
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
        } else if (element.fieldtype == 'ngxdaterange') {
          element.modelValue = {
            startDate: null,
            endDate: null
          }
        } else if (element.fieldtype == 'lookup') {
          let year = new Date().getFullYear() , month = new Date().getMonth();
          var monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          if(element.fieldname == "year"){
            element.dbvalue  = year;
            element.modelValue  = {name: year, code: year, autocomplete_id: year, autocomplete_displayname: year};
          }
         else if(element.fieldname == "month"){
            element.dbvalue  = monthsList[month];
            element.modelValue  = {name: monthsList[month], code: month+1, autocomplete_id: month+1, autocomplete_displayname: monthsList[month]};
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
    let cnt = 0
      var defaultsearch = [...this.searchfieldlist.search];
      this.listFilterParamsValue.search = [];
      this.listFilterParamsValue.dispositionref = [];
      if (this.filterfieldListsValue.length > 0) {
        this.filterfieldListsValue.forEach(element => {
             if (element.fieldtype == 'Date' || element.fieldtype == 'datepicker' || element.fieldtype == 'Datetime' || element.fieldtype == 'Daterange') {
              var enddate = new Date(element.modelValue.endJsDate);
              enddate.setDate(enddate.getDate() + 1)
              enddate.setSeconds(enddate.getSeconds() - 1);    
              element.modelValue.endJsDate = enddate;
                if (element.modelValue && element.modelValue.beginJsDate  && element.modelValue.endJsDate ) {
                  if (element.modelValue.endJsDate < element.modelValue.beginJsDate) {
                    this.showNotification('top', 'right', 'Start date must be less than end date!', 'danger');
                    return;
                  } else {
                    var sd =  element.modelValue.beginJsDate._d ? element.modelValue.beginJsDate._d  : element.modelValue.beginJsDate;
                    var ed =  element.modelValue.endJsDate._d ? element.modelValue.endJsDate._d  : element.modelValue.endJsDate;
                    this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": sd, "$lte": ed }, "criteria": "eq", "datatype": "Date" });
                  }
                }else{
                  if(element.isrequired && (!element.modelValue.beginJsDate || !element.modelValue.endJsDate)){
                    cnt++;
                  }
                }
                // else{
                //   this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": new Date(1970,0,1), "$lte": new Date() }, "criteria": "eq", "datatype": "Date" });
                // }
              }else if(element.fieldtype == 'ngxdaterange'){
                if (element.modelValue && element.modelValue.startDate  && element.modelValue.endDate ) {
                var sd = element.modelValue.startDate && element.modelValue.startDate._d ? element.modelValue.startDate._d  : element.modelValue.startDate;
                var ed = element.modelValue.endDate && element.modelValue.endDate._d ? element.modelValue.endDate._d  : element.modelValue.endDate;
                this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": { "$gte": sd, "$lte": ed }, "criteria": "eq", "datatype": "Date" });
                }else {
                  if(element.isrequired && (!element.modelValue.startDate || !element.modelValue.endDate)){
                    cnt++;
                  }
                }
              } else if (element.fieldtype == "ObjectID" || element.fieldtype == "ObjectId" || element.fieldtype == "form" || element.fieldtype == "formdata") {
                if(element.modelValue){
                  var fieldname = element.fieldname.split(".");
                  if (Object.prototype.toString.call(element.modelValue) == '[object Object]') {
                    if (element.modelValue.autocomplete_id != undefined) {
                      this.listFilterParamsValue.search.push({ "searchfield": fieldname[0], "searchvalue": element.modelValue.autocomplete_id, "criteria": "eq", "datatype": "ObjectId" });
                    }
                  } else {
                    this.listFilterParamsValue.search.push({ "searchfield": fieldname[0], "searchvalue": element.modelValue, "criteria": "eq" });
                  }
                }else{
                  if(element.isrequired && !element.modelValue){
                    cnt++;
                  }
                }
              } else if (element.fieldtype == "lookup") {
                if(element.modelValue){
                 this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue.autocomplete_id, "criteria": "eq", "datatype": "Number" });
                }else{
                  if(element.isrequired && !element.modelValue){
                    cnt++;
                  }
                }
              } else if (element.fieldtype == "form_multiselect") {
                if(element.modelValue && element.modelValue.length > 0){
                  this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "in" ,"datatype": "ObjectId"  });
                }else{
                  this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue":  element.formfieldfilterValue.map(a=>a.id), "criteria": "in" ,"datatype": "ObjectId"  });
                }
              }
              else {
                if(element.modelValue){
                this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.modelValue, "criteria": "eq" });
                }
              }
           if (element.display === false) {
            this.listFilterParamsValue.search.push({ "searchfield": element.fieldname, "searchvalue": element.fieldvalue, "criteria": element.criteria });
          }
        });
    }
    

    defaultsearch.forEach((search)=>{
      var fieldname = search.searchfield;
      var mapping = this.listFilterParamsValue.search.find(element => {
        return element.searchfield == fieldname || element.fieldname == fieldname;
      });
      if (!mapping){
        this.listFilterParamsValue.search.push(search);
      }
    });
    if(cnt == 0){
      this.searchfilterSubmitData.emit();
    }else{
      this.showNotification("top", "right", "Select required fields !!", "danger");
      return;
    }
    
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
      });
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
