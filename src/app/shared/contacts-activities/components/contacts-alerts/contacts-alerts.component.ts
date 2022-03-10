import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

declare var $: any;

@Component({
  selector: 'app-contacts-alerts',
  templateUrl: './contacts-alerts.component.html',  
})
export class ContactsAlertsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  trigercategories: any[] = [];
  alertsList: any[] = [];
  viewMoreVisible: boolean = false;

  disableBtn : boolean = false;


  constructor(
    private _commonService: CommonService, 

  ) {
    super()
    this.pagename = "app-alerts";
  }

  @Input() dataContent: any;
  @Input() schema: string;
  @Input() onModal: string;

  @Output() onAttachmentData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.getCategories() 
      await this.LoadData();
    } catch (error) {
      console.error("error", error);
    } finally {

    }
  }

  ngOnDestroy() {

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    var alerts = this.dataContent.alerts && this.dataContent.alerts.length > 0 ?  this.dataContent.alerts[0].property.alerts : [];
    this.viewMoreVisible = false;
    this.trigercategories.forEach(element => {
       let alert = alerts.find(a=>a?.alertcode == element.code);
       this.alertsList.push({ 'alertcode' : element.code, 'alertname' : element.name , 'alertvalue' :  alert?.alertvalue  });
       this.viewMoreVisible = true;
    });
    // console.log("this.alertsList",this.alertsList);
    return;
  }

  async getCategories() {

    var method = "POST";
    var url = "lookups/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "alerttriger", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.trigercategories = [];
          if (data[0] && data[0]["data"]) {
            this.trigercategories = data[0]["data"];
          }
        }
      }, (error) => {
        console.error(error);
      });
  }

  addAlert() {
    $("#addAlert").click();
  }
   
  advcQtyClose() {
    $("#alertclose").click();
    setTimeout(() => {
      this.onAttachmentData.emit();
    }, 500);
  }

  submit() {

    let modal = {};
    modal['formid'] = "61ea9a643418dc2b6f463b62";
    modal['onModal'] = this.onModal;
    modal['contextid'] = this.dataContent._id;
    modal['property'] = {};
    modal['property']['alerts'] = [];
    modal['property']['alerts'] = this.alertsList;
    
    const url = this.schema;
    let id = this.dataContent.alerts && this.dataContent.alerts.length > 0 ? this.dataContent.alerts[0]._id : null; 
    let method = id ? "PATCH" : "POST";
    // console.log("modal",modal);
    this.disableBtn = true;
    this._commonService
        .commonServiceByUrlMethodData(url, method, modal ,id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data) {
            this.disableBtn = false;
            $("#alertclose").click();
            this.showNotification('top', 'right', 'Alerts has been updated successfully!!!', 'success');
            setTimeout(() => { 
              this.onAttachmentData.emit();
            }, 500);
          }
        }, (error) => {
          console.error(error);
        });
  }

}


