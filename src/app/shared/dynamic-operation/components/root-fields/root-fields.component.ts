import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { DragulaModule, DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';


import { MatSelectionListChange } from '@angular/material/list';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-root-fields',
  templateUrl: './root-fields.component.html',
})

export class RootFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  public dataObj: any = {};
  rootfieldLists: any[] = [];
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
          if (this.dataContent && this.dataContent.rootfields && targetModel && targetModel.length !== 0) {
            let cnt = 0;
            let innerCounter = 1;
            let len = targetModel.length;
            targetModel.forEach(element => {
              element.sort = innerCounter;
              innerCounter++;
              cnt++;
              if (cnt == len) {
                this.dataContent.rootfields = [];
                this.dataContent.rootfields = targetModel;
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
      var fieldname ;
      this.schemafieldListsValue.forEach(element => {
        fieldname = [];
        fieldname = element.fieldname.split('.');
        if (element.id != undefined) {
          element.fieldname = element.id;
        }
        // console.log("fieldname",fieldname);
        if(fieldname.length == 1){
          this.allfieldLists.push(element);
        }
      });
    }
    return;
  }


  getSelectedFieldLists() {
    this.rootfieldLists = [];

    this.allfieldLists.forEach(element => {
      element.display = false;
      if (this.dataContent.rootfields) {
        if (this.dataContent.rootfields.length !== 0) {
          this.dataContent.rootfields.forEach(ele => {
            if (ele.fieldname == element.fieldname) {
              element.indx = this.dataContent.rootfields.indexOf(ele) + 1;
            }
            if (ele.fieldname == element.fieldname) {
              element.display = true;
            }
          });
        }
        this.rootfieldLists.push(element);
      }
    });
    // console.log("this.rootfieldLists",this.rootfieldLists);

    this.rootfieldLists.forEach(ele => {
      if (ele.indx == undefined) {
        ele.indx = 1000;
      }
    })
    this.rootfieldLists.sort((n1, n2) => { if (n1.indx > n2.indx) { return 1; } if (n1.indx < n2.indx) { return -1; } return 0; })
    
  }

  checkUncheckEvent($event: MatSelectionListChange) {
    var selectObj = this.rootfieldLists.find(p => p.fieldname == $event.option.value)
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
    model['rootfields']  = [];

    let sortcnt = 0;
    let obj: any;
    this.rootfieldLists.forEach(element => {
      if (element.display) {
        sortcnt++;
        obj = {
          fieldname: element.fieldname,
          formname: element.formname,
          formfield: "_id",
          displayname: element.displayname,
          required: true,
          formorder: sortcnt,
        };
        obj.fieldtype = element.fieldtype.toLowerCase() == "objectid" ? "form" : element.fieldtype;
        if(element.option && element.option.ref){
          obj["form"] = {};
          obj["form"]['formfield']= "_id";
          obj["form"]['displayvalue']= element.option.reffieldname;
          obj["form"]['fieldfilter']= "status";
          obj["form"]['fieldfiltervalue']= "active";
          obj["form"]['apiurl']= `/${element.option.refschema}/filter` ;
          obj["form"]['method']= "POST";
        }
        model['rootfields'].push(obj);
      }
    });

    console.log("model",model);
    console.log("this.dataContent",this.dataContent);

    let method =  "PATCH";
    let url = this.dataContent.schemaname == 'bireports' || this.dataContent.schemaname == 'reports' ? this.dataContent.schemaname : "forms";
    this.btnDisable = true;
    console.log("url",url);

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then(async (data) => {
        if (data) {
          super.showNotification("top", "right", "Display Fields updated successfully !!", "success");
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