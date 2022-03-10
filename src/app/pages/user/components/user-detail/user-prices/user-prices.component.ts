import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../core/services/common/common.service';

declare var $: any;
@Component({
  selector: 'app-user-prices',
  templateUrl: './user-prices.component.html'
})
export class UserPricesComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();

  btnDisable: boolean = false;

  displayedColumns: string[] = ["checked", "title", "charges", "method", "commission"];
  servicecharges: any[] = [];

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-user-prices";
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getService()
    await this.setData();
  }

  async getService() {
    let url = "services/filter";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });


    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data.length > 0) {
          let obj;
          this.servicecharges = [];
          data.forEach(element => {
            obj = { 'serviceid': element._id, 'title': element.title, 'charges': element.charges, 'commission': 0, 'chargesmethod': 'Percentage', 'checked': false };
            this.servicecharges.push(obj);
          });
        }
      });
  }

  async setData() {
    if (this.dataContent && this.dataContent.servicecharges && this.dataContent.servicecharges.length > 0) {
      this.dataContent.servicecharges.forEach(charges => {
        var foundServc = this.servicecharges.find(a => a.serviceid == charges.serviceid._id);
        if (foundServc) {
          foundServc.serviceid = charges.serviceid._id;
          foundServc.title = charges.serviceid.title;
          foundServc.charges = charges.charges;
          foundServc.commission = charges.commission;
          foundServc.chargesmethod = charges.chargesmethod;
          foundServc.checked = true;
        }
      });
    }
    return;
  }

  onCheckCommission(val: any) {
    this.btnDisable = false;
    if (val.chargesmethod == "Fixed") {
      if (val.commission > val.charges) {
        super.showNotification("top", "right", "Enter valid commission !!", "danger");
        this.btnDisable = true;
      }
    } else if (val.chargesmethod == "Percentage") {
      if (val.commission > 100) {
        super.showNotification("top", "right", "Enter valid commission !!", "danger");
        this.btnDisable = true;
      }
    }
  }


  async onSaveCharges() {
    var servicelist = this.servicecharges.filter(a => a.checked == true);
    var model = {};
    model['servicecharges'] = [];
    model['servicecharges'] = servicelist;

    let url = "users";
    let method = "PATCH";

    try {
      this.btnDisable = true;
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
        .then((data: any) => {
          
          this.btnDisable = false;
          super.showNotification("top", "right", "Record updated !!", "success");
          // this.updateRecord.emit(res);
        });
    } catch (e) {
      this.btnDisable = false;
      super.showNotification("top", "right", "Something went wrong !!", "danger");
    }


  }


  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

}
