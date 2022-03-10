import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DragulaModule, DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';


import { MatSelectionListChange } from '@angular/material/list';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';



@Component({
  selector: 'app-report-filter-fields',
  templateUrl: './report-filter-fields.component.html',
})
export class ReportFilterFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  public dataObj: any = {};
  filterfieldLists: any[] = [];
  filterAllfieldLists: any[] = [];
  fieldLists: any[] = [];
  subs = new Subscription();
  isLoading: boolean = false;
  formName: string = "";
  btnDisable : boolean = false;

  @Input('bindId') bindId: any;
  @Input('dataContent') dataContent: any;
  @Input('schemafieldLists') schemafieldListsValue: any;
  @Output() selectfiledSubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private dragulaService: DragulaService,
    private _commonService: CommonService,
    
  ) {
    super();
    this.subs
      .add(this.dragulaService.dropModel("ITEMS")
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
          if (this.dataContent && this.dataContent.filterfields && targetModel && targetModel.length !== 0) {
            let cnt = 0;
            let innerCounter = 1;
            let len = targetModel.length;
            this.isLoading = true;
            targetModel.forEach(element => {
              element.sort = innerCounter;
              innerCounter++;
              cnt++;
              if (cnt == len) {
                this.dataContent.filterfields = [];
                this.dataContent.filterfields = targetModel;
                // this.updateValue()
              }
            });
          }
        })
      );
  }



  async ngOnInit() {
    try {
      super.ngOnInit();
      this.dataObj = this.dataContent;
      this.formName = this.dataContent.formid && this.dataContent.formid.formname ? this.dataContent.formid.formname : this.dataContent.formname ? this.dataContent.formname : '';
      await this.formDataOperation();
      await this.getSelectedFieldLists();
      this.getFilterFieldLists();
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  async formDataOperation() {
    
    if (this.schemafieldListsValue && this.schemafieldListsValue.length !== 0) {
      this.fieldLists = [];
      var fieldname;
      this.schemafieldListsValue.forEach(element => {
        fieldname = [];
        fieldname = element.fieldname.split('.');
        if (element.formname !== this.formName) {
          element.type = 'ref';
        }
        if (element.displayid != undefined && element.displayid.indexOf('.') != -1) {
          element.pfields = element.displayid.split('.');
          element.pfields.splice(element.pfields.length - 1, 1);
        }

        if (element.id != undefined) {
          element.fieldname = element.id;
        }
        if(fieldname.length == 1 || fieldname[0] == 'property'){
          this.fieldLists.push(element);
        }
      });
    }
    return;
  }


  async getSelectedFieldLists() {
    let Object: any;
    
    this.fieldLists.forEach(element => {
      Object = {
        displayname: element.displayname,
        fieldname: element.fieldname,
        fieldtype: element.fieldtype,
        formdisplaytext: element.formdisplaytext,
        option: element.option,
        lookupid: element.lookupid,
        fieldfilter: element.fieldfilter,
        apiurl: element.apiurl,
        method: element.method,
        fieldfiltervalue: element.fieldfiltervalue,
        displayvalue: element.displayvalue,
        formfield: element.formfield,
        parentname: element.parentname,
        lookupdata: element.lookupdata
      };

      if (element.type != undefined && element.type == 'ref') {
        Object.type = 'ref';
      }
      if (element.pfields != undefined) {
        Object.pfields = element.pfields;
      }
      this.filterAllfieldLists.push(Object);
    });
    return;
  }


  getFilterFieldLists() {
    this.filterfieldLists = [];
    this.filterAllfieldLists.forEach(element => {
      element.display = false;

      if (this.dataContent.filterfields) {
        if (this.dataContent.filterfields.length !== 0) {
          this.dataContent.filterfields.forEach(ele => {
            if (ele.fieldname == element.fieldname) {
              element.display = true;
            }
          });
        }
        this.filterfieldLists.push(element);
      } else {
        this.filterfieldLists.push(element);
      }
    });
  }

  checkUncheckEvent($event: MatSelectionListChange) {
    let fieldname = $event.option.value;
    this.filterfieldLists.forEach(element => {
      if (element.fieldname == fieldname) {
        if ($event.option.selected) {
          element.display = true;
        } else {
          element.display = false;
        }
      }
    });
  }


 async updateValue() {
    let model = {};
    model['filterfields']  = [];

    this.filterfieldLists.forEach(element => {
      if(element.display) {
        model['filterfields'].push(element);
      }
    });
 

    let method =  "PATCH";
    let url = this.dataContent.schemaname == 'bireports' || this.dataContent.schemaname == 'reports' ? this.dataContent.schemaname : "formlists";
    this.btnDisable = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.dataContent.id)
      .then(async (data) => {
        if (data) {
          super.showNotification("top", "right", "Filter fields updated successfully !!", "success");
          this.btnDisable = false;
          this.selectfiledSubmitData.emit("success");
        }
      }, (error) => {
        console.error(error);
        this.btnDisable = false;
      });
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}