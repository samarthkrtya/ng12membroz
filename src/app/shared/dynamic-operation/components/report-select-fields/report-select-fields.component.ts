import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DragulaModule, DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';


import { MatSelectionListChange } from '@angular/material/list';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-report-select-fields',
  templateUrl: './report-select-fields.component.html',
})

export class ReportSelectFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  public dataObj: any = {};
  selectedfieldLists: any[] = [];
  allfieldLists: any[] = [];
  subs = new Subscription();
  isLoading: boolean = false;
  btnDisable : boolean = false;

  @Input('bindId') bindId: any;
  @Input('type') type: string;
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
          if (this.dataContent && this.dataContent.selectfields && targetModel && targetModel.length !== 0) {
            let cnt = 0;
            let innerCounter = 1;
            let len = targetModel.length;
            targetModel.forEach(element => {
              element.sort = innerCounter;
              innerCounter++;
              cnt++;
              if (cnt == len) {
                this.dataContent.selectfields = [];
                this.dataContent.selectfields = targetModel;
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
      this.getSelectedFieldLists();
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  /* basic config coding start */



  async formDataOperation() {
    if (this.schemafieldListsValue && this.schemafieldListsValue.length !== 0) {
      this.allfieldLists = [];
      this.schemafieldListsValue.forEach(element => {
        if (element.displayid != undefined && element.displayid.indexOf('.') != -1) {
          element.pfields = element.displayid.split('.');
          element.pfields.splice(element.pfields.length - 1, 1);
        }

        if (element.id != undefined) {
          element.fieldname = element.id;
        }
        this.allfieldLists.push(element);
      });
    }
    return;
  }


  getSelectedFieldLists() {
    this.selectedfieldLists = [];

    this.allfieldLists.forEach(element => {
      element.display = false;
      if (this.dataContent.selectfields) {
        if (this.dataContent.selectfields.length !== 0) {
          this.dataContent.selectfields.forEach(ele => {
            if (ele.fieldname == element.fieldname) {
              element.indx = this.dataContent.selectfields.indexOf(ele) + 1;
            }
            if (ele.fieldname == element.fieldname && ele.isDisplayOnList) {
              element.display = true;
            }
          });
        }
        this.selectedfieldLists.push(element);
      }
    });

    this.selectedfieldLists.forEach(ele => {
      if (ele.indx == undefined) {
        ele.indx = 1000;
      }
    })
    this.selectedfieldLists.sort((n1, n2) => { if (n1.indx > n2.indx) { return 1; } if (n1.indx < n2.indx) { return -1; } return 0; })
    
  }

  checkUncheckEvent($event: MatSelectionListChange) {
    var selectObj = this.selectedfieldLists.find(p => p.fieldname == $event.option.value)
    if (selectObj) {
      if ($event.option.selected) {
        selectObj.display = true;
        selectObj.isDisplayOnList = true;
      } else {
        selectObj.display = false;
        selectObj.isDisplayOnList = false;
      }
    }
  }


  async updateValue() {
    let model = {};
    model['selectfields']  = [];

    let sortcnt = 0;
    let obj: any;
    this.selectedfieldLists.forEach(element => {
      if (element.display) {
        sortcnt++;
        obj = {
          isDisplayOnList: true,
          value: 1,
          fieldtype: element.fieldtype,
          fieldname: element.fieldname,
          displayname: element.displayname,
          sort: sortcnt,
        };

        if (element.isref) {
          obj.isref = 1;
        }
        if (element.virtualfield) {
          obj.virtualfield = element.virtualfield;
        }
        model['selectfields'].push(obj);
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
          super.showNotification("top", "right", "Display Fields updated successfully !!", "success");
          this.btnDisable = false;
          this.selectfiledSubmitData.emit("success");
        }
      }, (error) => {
        console.error(error);
        this.btnDisable = false;
      })


  }


  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}