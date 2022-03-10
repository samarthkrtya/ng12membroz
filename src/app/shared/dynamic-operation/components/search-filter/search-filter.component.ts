import { Component, OnInit, EventEmitter, Input, Output} from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FormlistService } from '../../../../core/services/formlist/formlist.service';

declare const $: any;

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html'
})

export class SearchFilterComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  public formList: any = {};
  fieldLists: any [] = [];
  
  filterAllfieldLists: any [] = [];
  filterfieldLists: any [] = [];
   
  formName:string = "";
 

  constructor(
    private _formlistService: FormlistService,
  ) { 
  }

  @Input('tablename') tablenameValue: string;
  @Input('schemaname') schemanameValue: string;
  @Input('formlistname') formlistnameValue: string;
  @Input('langResource') langResourceValue: any;
  @Input('schemafieldLists') schemafieldListsValue: any;
  @Input('formList') formListValue: any;
  @Output() searchfilterSubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
 

    if(!this.langResourceValue) {
      this.langResourceValue = {};
    }

    try {
      await this.getFormDetailsById();
      await this.formDataOperation();
      await this.getSelectedFieldLists();
      await this.getFilterFieldLists();
    } catch (error) {
      console.error(error);
    } finally {
    }

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async getFormDetailsById() {
    this.formList = this.formListValue;
    this.formName = this.formList.formname;
    return;
  }

  async formDataOperation() {

    if(this.schemafieldListsValue && this.schemafieldListsValue.length !== 0) {
      this.fieldLists = [];
      this.schemafieldListsValue.forEach(element => {

        if(element.formname !== this.formName) {
          element.type = 'ref';
        }

        if(element.displayid != undefined && element.displayid.indexOf('.') != -1){
          element.pfields = element.displayid.split('.');
          element.pfields.splice(element.pfields.length-1, 1);
        }

        if(element.id != undefined){
          element.fieldname = element.id;
        }

        this.fieldLists.push(element);
        
      });
    }
    return;
  }

  async getSelectedFieldLists() {
    
    this.fieldLists.forEach(element => {
      let Object = {
        displayname: element.displayname,
        fieldname: element.fieldname,
        fieldtype: element.fieldtype,
        option: element.option,
        lookupid: element.lookupid,
        fieldfilter: element.fieldfilter,
        apiurl: element.apiurl,
        method: element.method,
        fieldfiltervalue: element.fieldfiltervalue,
        displayvalue: element.displayvalue,
        formfield: element.formfield,
        parentname: element.parentname,
        lookupdata: element.lookupdata,
        type: element.type && element.type == 'ref' ? 'ref': undefined,
        pfields: element.pfields ?  element.pfields : undefined
      };
      this.filterAllfieldLists.push(Object);
    });
    return;
  }

  async getFilterFieldLists() {
    this.filterfieldLists = [];
    this.filterAllfieldLists.forEach(element => {
      element.display = false;
      if(this.formList.filterfields && this.formList.filterfields.length !== 0) {
        this.formList.filterfields.forEach(ele => {
          if(ele.fieldname == element.fieldname) {
            element.display = true;
          }
        });
        this.filterfieldLists.push(element);
      } else {
        this.filterfieldLists.push(element);
      }
    });
    $("#filter_btn").show();
    return;
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  checkUncheckFilterEvent(e: any, parent: any) {
    let fieldname = e.target.value;
    this.filterfieldLists.forEach(element => {
      if(element.fieldname == fieldname) {
        if(e.target.checked){
          element.display = true;
        } else {
          element.display = false;
        }
      }
    });
  }

  saveSearchFilterValue () {
    this._formlistService
      .GetFormListByFormListName(this.formlistnameValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.formList = data;
          this.formList.formname = data.formname._id;
          this.updateValues();
        }
    });
  }

  updateValues() {
    this.formList.filterfields = [];
    this.filterfieldLists.forEach(element => {
      if(element.display) {
        this.formList.filterfields.push(element);
      }
    });
    this._formlistService
      .Update(this.formlistnameValue, this.formList)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data._id) {
          this.searchfilterSubmitData.emit("success");
        }
    });
  }

  isEmpty(obj: any) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

}
