import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

import { MembershipService } from '../../../../../core/services/membership/membership.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
@Component({
  selector: 'app-membership-services',
  templateUrl: './membership-services.component.html'
})
export class MembershipServiceComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() serviceList: any[];
  @Input() bindId: any;
  @Input() formName: any;
  
  @Output() submittedData = new EventEmitter();

  
  treePostData: any;
  displayedColumns1: string[] = ['item', 'category', 'discount', 'visits', 'period', 'action'];
  isServiceOpen: boolean = false;
  disableBtn: boolean = false;

  periodList: string[] = ['Package duration', 'Yearly', 'Half-Yearly', 'Quarterly', 'Monthly' ];

  constructor(
    private _membershipService: MembershipService,
  ) {
    super();
    this.pagename = "app-membership-services";
  }

  async ngOnInit() {
    super.ngOnInit()
  }

  onClickSrvc() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.isServiceOpen = !this.isServiceOpen;
  }
 
  onSelectTree(event: any[]) {
    if(event.length > 0){
    event.map(a => a.discount = 0);
    event.map(a => a.fromdb = false);
    event.map(a => a.visits = 0);
    event.map(a => a.period = 'Package duration');
    if (event.length >= this.serviceList.length) {
      event.forEach(prd => {
        var ind = this.serviceList.findIndex(a => a._id == prd._id);
        if (prd.level > 0 && ind == -1) {
          this.serviceList.push(prd);
        }
      });
    } else {
      this.serviceList.forEach((prd, i) => {
        var ind = event.findIndex(a => a._id == prd._id);
        if (prd.level > 0) {
          if (ind != -1) {
            prd = event[ind];
          } else {
            this.serviceList.splice(i, 1);
          }
        }
      });
      }
    }else{
      this.serviceList  = [];
    }
    let dataSource = this.serviceList;
    let cloned = dataSource.slice();
    this.serviceList = cloned;
    this.isServiceOpen = !this.isServiceOpen;
  }

  onSaveTree() {
    this.treechecklist.onSave();
    $("#close_" + this.treechecklist.for).click();
  }

  async onSaveService() {
    
    var model = {};
    model = this.dataContent;
    var invalid : boolean = false;
    model['services'] = this.dataContent['services'];
    if (model['services'] != []) {
      model['services'] = [];
    }
    let obj, str;
    this.serviceList.forEach(servc => {
      if(servc.discount > 100){
        invalid = true;
        str = "Enter valid discount !!";
      }else if (!servc.visits){
        invalid = true;
        str = "Enter valid visits !!";
      }else if (!servc.period){
        invalid = true;
        str = "Select period !!";
      }
      obj = {
        'serviceid': servc._id,
        'discount': servc.discount,
        'visits': servc.visits,
        'period': servc.period,
      };
      model['services'].push(obj);
    });
    if(invalid){
      super.showNotification("top", "right", `${str}`, "danger");
      return;
    }
    try {
      this.disableBtn = true;
      var res = await this._membershipService.AsyncUpdate(this.bindId, model);
      
      super.showNotification("top", "right", "Service updated successfully !!", "success");
      this.disableBtn = false;
      this.submittedData.emit('success');
    } catch (e) {
      this.disableBtn = false;
    }
  }

  async onDelete(item: any) {
    var model = {}, obj;
    model = this.dataContent;

    model['services'] = [];
    var ind = this.serviceList.findIndex(a => a._id == item._id);
    this.serviceList.splice(ind, 1);
    this.serviceList.forEach(servc => {
      obj = {
        'serviceid': servc._id,
        'discount': servc.discount,
        'visits': servc.visits,
        'period': servc.period,
      };
      model['services'].push(obj);
    });
    
    try {
      this.disableBtn = true;
      var res = await this._membershipService.AsyncUpdate(this.bindId, model);
      
      super.showNotification("top", "right", "Record deleted successfully !!", "success");
      this.disableBtn = false;
      this.submittedData.emit('success');
    } catch (e) {
      this.disableBtn = false;
    }
  }

}
