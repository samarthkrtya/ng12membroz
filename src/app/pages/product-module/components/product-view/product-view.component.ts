import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html'
})
export class ProductViewComponent extends BaseComponemntComponent implements OnInit {

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  dataContent: any = {};

  displayedColumns1: string[];
  displayedRow1: object[];

  displayedRow2: object[];
  displayedColumns2: string[];

  displayedRow3: object[];
  displayedColumns3: string[];

  displayedRow4: object[];
  displayedColumns4: string[];

  dataSource1: any[];
  dataSource2: any[];
  dataSource3: any[];
  dataSource4: any[];

  constructor(
    private _route: ActivatedRoute,
    private _billItemService: BillItemService,

  ) {

    super();
    this.pagename = "app-product-view";
    this._route.params.forEach((params) => {
      this.bindId = params['id'];
      this._formId = params["formid"] ? params["formid"] : "5fe063328f01661252f6c628";
      this.contentVisibility = false;
      this.itemVisbility = false;
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    
    this._route.params.forEach(async (params) => {    
      try {
        await this.initializeData();
        await this.LoadData();
      } catch (err) {
        console.error(err);
      } finally {
      }
    })
  }

  async initializeData() {
    this.displayedRow1 = [
      { code: 'prefix', subcode: 'ponumber', value: 'Doc Number', type: 'document' }, { code: 'vendorid', subcode: 'fullname', value: 'Vendor', type: 'object' },
      { code: 'orderdate', value: 'Order Date', type: 'date' }, { code: 'shippingdate', value: 'Shipping Date', type: 'date' },
      { code: 'status', value: 'Status', type: 'string' }, { code: 'action', value: 'Action', type: 'button' }
    ];
    this.displayedColumns1 = ['prefix', "vendorid", 'orderdate', 'shippingdate', 'status', 'action'];

    this.displayedRow2 = [
      { code: 'prefix', subcode: 'pinumber', value: 'Doc Number', type: 'document' }, { code: 'vendorid', subcode: 'fullname', value: 'Vendor', type: 'object' },
      { code: 'invoicedate', value: 'Invoice Date', type: 'date' }, { code: 'shippingdate', value: 'Shipping Date', type: 'date' },
      { code: 'status', value: 'Status', type: 'string' }, { code: 'action', value: 'Action', type: 'button' }
    ];
    this.displayedColumns2 = ['prefix', 'vendorid', 'invoicedate', 'shippingdate', 'status', 'action'];

    this.displayedRow3 = [
      { code: 'prefix', subcode: 'sinumber', value: 'Doc Number', type: 'document' }, { code: 'customerid', subcode: 'fullname', value: 'Customer', type: 'object' },
      { code: 'invoicedate', value: 'Invoice Date', type: 'date' }, { code: 'status', value: 'Status', type: 'string' }
    ];
    this.displayedColumns3 = ['prefix', 'customerid', 'invoicedate', 'status'];

    this.displayedRow4 = [
      { code: 'prefix', subcode: 'sinumber', value: 'Doc Number', type: 'document' }, { code: 'customerid', subcode: 'fullname', value: 'Customer', type: 'object' },
      { code: 'invoicedate', value: 'Invoice Date', type: 'date' }, { code: 'status', value: 'Status', type: 'string' }
    ];
    this.displayedColumns4 = ['prefix', 'customerid', 'invoicedate', 'status'];

    this.dataSource1 = [];  // po
    this.dataSource2 = [];  // pI
    this.dataSource3 = [];  // so
    this.dataSource4 = [];  // si
     
    this.dataContent = {};

  }

  async LoadData() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    this.contentVisibility = false;

    await this._billItemService
      .AsyncGetByFilterView(postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0];

          this.dataSource1 = data[0]['purchaseorders'];
          this.dataSource1.map(a => a.routerurl = `/pages/purchase-module/purchase-order/` + a._id);
          this.dataSource2 = data[0]['purchaseinvoices'];
          this.dataSource2.map(a => a.routerurl = `/pages/purchase-module/purchase-invoice/` + a._id);
          this.dataSource3 = data[0]['saleorders'];
          this.dataSource4 = data[0]['saleinvoices'];

          this.contentVisibility = true;
          this.itemVisbility = true;

        }
      }, (error) => {
        console.error(error);
      })
  }


  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }



}
