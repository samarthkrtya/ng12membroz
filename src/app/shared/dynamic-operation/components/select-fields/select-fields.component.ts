import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DragulaModule, DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';

import { FormlistService } from '../../../../core/services/formlist/formlist.service';
import { MatSelectionListChange } from '@angular/material/list';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-select-fields',
  templateUrl: './select-fields.component.html'
})
export class SelectFieldsComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  public formList: any = {};
  selectedfieldLists: any [] = [];
  formName:string = ""; 
  subs = new Subscription();
  isLoading: boolean = false;

  constructor(
    private dragulaService: DragulaService,
    private _formlistService: FormlistService,
  ) {  


    this.subs
      .add(this.dragulaService.dropModel("ITEMS")
      .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {

        if(this.formList && this.formList.selectfields && targetModel && targetModel.length !== 0) {
          let cnt = 0;
          let innerCounter = 1;
          let len = targetModel.length;
          this.isLoading = true;
          targetModel.forEach(element => {
            element.sort = innerCounter;
            innerCounter++;
            cnt++;
              if (cnt == len) {
                this.formList.selectfields = [];
                this.formList.selectfields = targetModel;
                this.updateValue()
              }
          });
        }

      })
    );
    
    
  }

  @Input('formList') formListValue: string;
  @Input('langResource') langResourceValue: any;
  @Output() selectfiledSubmitData: EventEmitter<any> = new EventEmitter<any>();
            
  async ngOnInit() {
 

    if(!this.langResourceValue) {
      this.langResourceValue = {};
    }

    try {
      await this.getFormDetailsById();
      await this.formDataOperation();
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  /* basic config coding start */

  async getFormDetailsById() {
    this.formList = this.formListValue;
    this.formName = this.formList.formname;
    
    return;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }
  
  async formDataOperation() {
    
    if(this.formList && this.formList.selectfields && this.formList.selectfields.length !== 0) {
      
      this.formList.selectfields.forEach(element => {
        if(element.fieldtype !== "ObjectId") {
          if(element.displayid != undefined && element.displayid.indexOf('.') != -1){
            element.pfields = element.displayid.split('.');
            element.pfields.splice(element.pfields.length-1, 1);
          }
          if(element.id != undefined){
            element.fieldname = element.id;
          }
          element.display = false;
          if(element.isDisplayOnList) {
            element.display = true;
          }
          this.selectedfieldLists.push(element);
        }
        
      });

      $("#select_field_btn").show();
    
      this.selectedfieldLists.sort((n1,n2) => {if (n1.sort > n2.sort){return 1;}if (n1.sort < n2.sort){return -1;}return 0;})
    }
    return;
  }

  
/* basic config coding end */

/* Select Listing coding start */


  updateValue() {

    let postData = {};
    postData['selectfields'] = this.formList.selectfields;

    this._formlistService
      .patch(this.formList._id, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any)=>{
        if(data._id) {
          //this.ngOnInit();
          this.selectfiledSubmitData.emit(data)
        }
    });
      
  }

  checkUncheckEvent($event: MatSelectionListChange) {

    const result = this.selectedfieldLists.filter(obj => obj.display == true);
    if(result && result.length == 1 && $event.option.selected == false) {
      this.showNotification("top", "right", "At least one field is required", "danger");
      $event.option.selected = true;
      return;

    } else {
      var selectObj = this.selectedfieldLists.find(p=>p.fieldname == $event.option.value)
      if(selectObj) {
        if ($event.option.selected) {
          selectObj.display = true;
          selectObj.isDisplayOnList = true;
        } else {
          selectObj.display = false;
          selectObj.isDisplayOnList = false;
        }
        this.updateValue();
      }
    }

    
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
  
}
