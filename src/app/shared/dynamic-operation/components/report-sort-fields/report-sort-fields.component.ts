import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { Subject ,Subscription } from 'rxjs';
import { DragulaModule, DragulaService } from 'ng2-dragula';


import { MatSelectionListChange } from '@angular/material/list';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-report-sort-fields',
  templateUrl: './report-sort-fields.component.html',
})
export class ReportSortFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  subs = new Subscription();

  public dataObj: any = {};
  selectedfieldLists: any[] = [];
  sortAllfieldLists: any[] = [];
  sortfieldLists: any[] = [];
  allfieldLists: any[] = [];

  isLoading: boolean = false;
  btnDisable: boolean = false;


  @Input('bindId') bindId: any;
  @Input('dataContent') dataContent: any;
  @Input('schemafieldLists') schemafieldListsValue: any;
  @Output() selectfiledSubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _commonService: CommonService,
    private dragulaService: DragulaService,
  ) {
    super();


    this.subs
    .add(this.dragulaService.dropModel("ITEMS")
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
        if (this.dataContent && this.dataContent.sortfields && targetModel && targetModel.length !== 0) {
          let cnt = 0;
          let innerCounter = 1;
          let len = targetModel.length;
          targetModel.forEach(element => {
            element.sort = innerCounter;
            innerCounter++;
            cnt++;
            if (cnt == len) {
              this.dataContent.sortfields = [];
              this.dataContent.sortfields = targetModel;
              // this.updateValue();
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
      await this.formDataOperation();
      await this.getSelectedFieldLists();
      await this.getSortFieldLists();

    } catch (error) {
      console.error(error);

    } finally {
    }
  }

  async formDataOperation() {
    if (this.schemafieldListsValue && this.schemafieldListsValue.length !== 0) {
      this.allfieldLists = [];
      this.schemafieldListsValue.forEach(element => {
        if (!element.displayid && element.fieldtype != "ObjectID") {
          if (element.id != undefined) {
            element.fieldname = element.id;
          }
          this.allfieldLists.push(element);
        }
      });
    }
    return;
  }


  async getSelectedFieldLists() {
    this.sortAllfieldLists = [];
    this.selectedfieldLists = [];

    this.allfieldLists.forEach(element => {
      let sortObject = {
        displayname: element.displayname,
        formdisplaytext: element.formdisplaytext,
        fieldname: element.fieldname,
        fieldtype: element.fieldtype,
        pfields: element.pfields,
      };
      this.sortAllfieldLists.push(sortObject);

      element.display = false;
      if (this.dataContent.selectfields) {
        if (this.dataContent.selectfields.length !== 0) {
          this.dataContent.selectfields.forEach(ele => {
            if (ele.fieldname == element.fieldname && ele.isDisplayOnList) {
              element.display = true;
            }
          });
        }
        this.selectedfieldLists.push(element);
      }
    });
    return;
  }

  async getSortFieldLists() {

    this.sortfieldLists = [];
    
    this.sortAllfieldLists.forEach(element => {
      element.display = false;
      if (this.dataContent.sortfields) {
        if (this.dataContent.sortfields.length !== 0) {
          this.dataContent.sortfields.forEach(ele => {
            if (ele) {
              for (const key in ele) {
                if (key == element.fieldname) {
                  element.display = true;
                  element.sort = ele[key];
                }
              }
            }
          });
        }
      }
      this.sortfieldLists.push(element);
    });
    
    return;
  }

  checkUncheckEvent($event: MatSelectionListChange) {

    let fieldname = $event.option.value;
    this.sortfieldLists.forEach(element => {
      if (element.fieldname == fieldname) {
        if ($event.option.selected) {
          element.display = true;
          element.sort = -1;
        } else {
          element.display = false;
        }
      }
    });

  }

  orderChange(event: any, fieldname: any) {
    
    this.sortfieldLists.forEach(element => {
      if (element.fieldname == fieldname) {
        element.sort = +event.value;
      }
    });
    
  }


  async updateValue() {
    
      let model = {};
      model['sortfields']  = [];
      model['sortfields'][0] = {};
      model['sortfields'][0]
  
      this.sortfieldLists.forEach(element => {
        if (element.display) {
          model['sortfields'][0][element.fieldname] = element.sort;
        }
      });
   
  
      console.log("model",model);
      console.log("this.dataContent",this.dataContent);
  
      let method =  "PATCH";
      let url = this.dataContent.schemaname == 'bireports' || this.dataContent.schemaname == 'reports' ? this.dataContent.schemaname : "formlists";
      this.btnDisable = true;
      console.log("url",url);
  
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.dataContent.id)
        .then(async (data) => {
          if (data) {
            super.showNotification("top", "right", "Sort fields updated successfully !!", "success");
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