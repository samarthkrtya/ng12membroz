import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FormlistService } from '../../../../core/services/formlist/formlist.service';

declare const $: any;

@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.component.html'
})
export class SortingComponent implements OnInit {

    destroy$: Subject<boolean> = new Subject<boolean>();
    public formList: any = {};

  /* Search variable define Start */
    fieldLists: any [] = [];
  /* Search variable define end */

  /* Select Listing variable define start */
    selectedfieldLists: any [] = [];
    allfieldLists: any [] = [];
    selectedFalsefieldLists: any [] = [];
  /* Select Listing variable define end */

  /* Sort variable define start */
    sortAllfieldLists: any [] = [];
    sortfieldLists: any [] = [];
  /* Sort variable define end */

  /* Filter start variable define start */
    filterAllfieldLists: any [] = [];
    filterfieldLists: any [] = [];
  /* Filter start variable define start */

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
  @Output() sortSubmitData: EventEmitter<any> = new EventEmitter<any>();
  

  async ngOnInit() {
 
    if(!this.langResourceValue) {
      this.langResourceValue = {};
    }

    try {
      await this.getFormDetailsById();
      await this.formDataOperation();
      await this.getSelectedFieldLists();
      await this.getSortFieldLists();
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

  /* basic config coding start */

  async getFormDetailsById() {
    this.formList = this.formListValue;
    this.formName = this.formList.formname;
    return;
  }

  async formDataOperation() {

    if(this.schemafieldListsValue && this.schemafieldListsValue.length !== 0) {

      this.fieldLists = [];
      this.allfieldLists = [];
      this.sortAllfieldLists = [];

      this.schemafieldListsValue.forEach(element => {
        if( !element.displayid && element.fieldtype != "ObjectID") {
          if(element.id != undefined){
            element.fieldname = element.id;
          }
          this.fieldLists.push(element);
          this.allfieldLists.push(element);
        }
      });

    }
    return;
  }

  async getSelectedFieldLists() {

    this.sortAllfieldLists = [];
    this.selectedFalsefieldLists = [];
    this.selectedfieldLists = [];

    this.allfieldLists.forEach(element => {
      let sortObject = {
        displayname: element.displayname,
        fieldname: element.fieldname,
        fieldtype: element.fieldtype,
        pfields: element.pfields,
      };
      this.sortAllfieldLists.push(sortObject);

      if(element.fieldtype == "ObjectID") {
        let obj = {
          isDisplayOnList: false,
          value: 1,
          fieldname: element.fieldname,
          fieldtype: element.fieldtype
        }
        this.selectedFalsefieldLists.push(obj);
      } else {
        element.display = false;
        if(this.formList.selectfields) {
          if(this.formList.selectfields.length !== 0) {
            this.formList.selectfields.forEach(ele => {
              if(ele.fieldname == element.fieldname && ele.isDisplayOnList) {
                element.display = true;
              }
            });
          }
          this.selectedfieldLists.push(element);
        }
      }
    });
    $("#select_field_btn").show();
    return;
  }

  async getSortFieldLists() {

    this.sortfieldLists = [];
    this.filterAllfieldLists = [];
    this.sortAllfieldLists.forEach(element => {
      let filterObject = {
        displayname: element.displayname,
        fieldname: element.fieldname,
        fieldtype: element.fieldtype
      };
      this.filterAllfieldLists.push(filterObject);
      element.display = false;
      if(this.formList.sortfields) {
        if(this.formList.sortfields.length !== 0) {
          this.formList.sortfields.forEach(ele => {
            if(ele) {
              let sortArray = Object.keys(ele); 
              sortArray.forEach(e => {
                if(e == element.fieldname) {
                  element.display = true;
                  element.sort = -1;
                }  
              });
            }
            
          });
        }
        this.sortfieldLists.push(element);
      }
    });
    $("#sort_btn").show();
    return;

  }

  async getFilterFieldLists() {

    this.filterfieldLists = [];
    this.filterAllfieldLists.forEach(element => {
      element.display = false;
      if(this.formList.filterfields) {
        if(this.formList.filterfields.length !== 0) {
          this.formList.filterfields.forEach(ele => {
            if(ele.fieldname == element.fieldname) {
              element.display = true; 
            }
          });
        }
        this.filterfieldLists.push(element);
      }
    });
    $("#filter_btn").show();
    return;
  }

  

/* basic config coding end */


/* Sort coding start */

  checkUncheckSortEvent(e: any) {
    let fieldname = e.target.value;
    this.sortfieldLists.forEach(element => {
      if(element.fieldname == fieldname) {
        if(e.target.checked){
          element.display = true;
          element.sort = -1;
        } else {
          element.display = false;
        }
      }
    });
  }

  orderChange(value: any, fieldname: any) {
    this.sortAllfieldLists.forEach(element => {
      if(element.fieldname == fieldname) {
        element.sort = value;
      }
    });
    if(this.tablenameValue == "reports") {
      this.sortfieldLists.forEach(element => {
        if(element.fieldname == fieldname) {
          element.sort = value;
        }
      });
    }
  }

  saveSortedValue() {
    this._formlistService
      .GetFormListByFormListName(this.formlistnameValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any)=>{
        if (data) {
          this.formList = data;
          this.formList.formname = data.formname._id;
          this.updateValue();
        }
    });
  }

  updateValue() {
    this.formList.sortfields[0] = {};
    this.sortfieldLists.forEach(element => {
      if(element.display) {
        this.formList.sortfields[0][element.fieldname] = element.sort;
      }
    });

    this._formlistService
      .Update(this.formlistnameValue, this.formList)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any)=>{
        if(data._id) {
          this.sortSubmitData.emit("success");
        }
    });
  }

/* Sort coding End */

  isEmpty(obj: any) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
      }
      return true;
  }

}
