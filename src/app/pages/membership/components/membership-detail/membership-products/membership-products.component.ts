import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

import { MembershipService } from '../../../../../core/services/membership/membership.service';
import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
@Component({
  selector: 'app-membership-products',
  templateUrl: './membership-products.component.html'
})
export class MembershipProductComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() productList: any[];
  @Input() bindId: any;
  @Input() formName: any;
  @Output() submittedData = new EventEmitter();

  treePostData: any;
  displayedColumns3: string[] = ['item', 'category', 'discount', 'qty', 'period', 'action'];
  isProductOpen: boolean = false;
  disableBtn: boolean = false;

  periodList: string[] = ['Package duration', 'Yearly', 'Half-Yearly', 'Quarterly', 'Monthly' ];

  constructor(
    private _membershipService: MembershipService,
  ) {
    super();
    this.pagename = "app-membership-products";
  }

  async ngOnInit() {
    super.ngOnInit()
  }

  onClickPrdt() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.isProductOpen = !this.isProductOpen;
  }

  onSelectTree(event: any[]) {
    if(event.length > 0){
      event.map(a => a.discount = 0);
      event.map(a => a.fromdb = false);
      event.map(a => a.qty = 0);
      event.map(a => a.period = 'Package duration');
      if (event.length >= this.productList.length) {
        event.forEach(prd => {
          var ind = this.productList.findIndex(a => a._id == prd._id);
          if (prd.level > 0 && ind == -1) {
            this.productList.push(prd);
          }
        });
      } else {
        this.productList.forEach((prd, i) => {
          var ind = event.findIndex(a => a._id == prd._id);
          if (prd.level > 0) {
            if (ind != -1) {
              prd = event[ind];
            } else {
              this.productList.splice(i, 1);
            }
          }
        });
      }
    }else{
      this.productList = [];
    }
    let dataSource = this.productList;
    let cloned = dataSource.slice();
    this.productList = cloned;
    this.isProductOpen = !this.isProductOpen;
  }

  onSaveTree() {
    this.treechecklist.onSave();
    $("#close_" + this.treechecklist.for).click();
  }

  async onSaveProduct() {

    var model = {};
    model = this.dataContent;
    model['items'] = this.dataContent['items'];
    if (model['items'] != []) {
      model['items'] = [];
    }
    let obj, str;
    var invalid : boolean = false;
    this.productList.forEach(item => {
      if(item.discount > 100){
        invalid = true;
        str = "Enter valid discount !!";
      }else if (!item.qty){
        invalid = true;
        str = "Enter quantity !!";
      }else if (!item.period){
        invalid = true;
        str = "Select period !!";
      }
      obj = {
        'item': item._id,
        'discount': item.discount,
        'quantity': item.qty,
        'period': item.period,
      };
      model['items'].push(obj);
      
    });
    model['services'].map(a => a.serviceid = a.serviceid._id);
    if(invalid){
      super.showNotification("top", "right", `${str}`, "danger");
      return;
    }
    try {
      this.disableBtn = true;
      var res = await this._membershipService.AsyncUpdate(this.bindId, model);

      super.showNotification("top", "right", "Product updated successfully !!", "success");
      this.disableBtn = false;
      this.submittedData.emit('success');
    } catch (e) {
      this.disableBtn = false;
    }
  }

  async onDelete(item: any) {
    var model = {}, obj;
    model = this.dataContent;

    model['items'] = [];
    var ind = this.productList.findIndex(a => a._id == item._id);
    this.productList.splice(ind, 1);
    this.productList.forEach(item => {
      obj = {
        'item': item._id,
        'discount': item.discount,
        'quantity': item.qty,
        'period': item.period,
      };
      model['items'].push(obj);
    });
    model['services'].map(a => a.serviceid = a.serviceid._id);

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
