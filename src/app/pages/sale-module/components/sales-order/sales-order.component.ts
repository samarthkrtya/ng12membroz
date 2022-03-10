import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetService } from '../../../../core/services/service/asset.service';

import { BillModel } from '../../../../core/models/sale/bill';

import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';

import { ServiceService } from '../../../../core/services/service/service.service';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.component.html',
})

export class SalesOrderComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  form: FormGroup;
  serviceForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindid: any;
  type: any;
  submitted: boolean;

  billItemList: any[] = [];
  billItemList2: any[] = [];
  billItemListGrp: any[] = [];

  serviceList: any[] = [];
  serviceList2: any[] = [];
  serviceListGrp: any[] = [];

  assetList: any[] = [];
  assetList2: any[] = [];
  assetListGrp: any[] = [];

  saleorderList: any[] = [];
  saleorderList2: any[] = [];

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;

  cartItemList: any[] = [];
  servicecartList: any[] = [];
  assetcartList: any[] = [];



  subtotal: number = 0;
  discount: number = 0;
  taxamount: number = 0;
  taxesList: any[] = [];
  taxdetail: any = {};
  grandtotal: number = 0;
  packagediscount: number = 0;

  searchMember: any;
  searchBox: any = {};
  searchService: any = {};
  searchAsset: any = {};

  _billModel = new BillModel();

  selectedIndexes: number = 0;

  selectedDate: Date = new Date();

  isLoading: any = {};

  isLoadingCart: boolean = true;
  isLoadingData: boolean = false;
  isDisableEdit: boolean = false;
  disableBtn: boolean = false;


  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _billItemService: BillItemService,
    private _serviceService: ServiceService,
    private _assetService: AssetService,
    private _commonService: CommonService,
    private _billService: BillService,


  ) {
    super();
    this.pagename = 'sales-estimate';
    this._route.params.forEach((params) => {
      this.type = params["type"];
      this.bindid = params["id"];
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };
    this.searchAsset = { value: '', index: 0 };

    this.isLoading['appointment'] = false;

    this.form = this.fb.group({
      'fullname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'email': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });
    this.serviceForm = this.fb.group({
      'title': ['', Validators.required],
      'refid': ['', Validators.required],
      'cost': ['', Validators.required],
      'taxes': ['', Validators.required],
      'discount': ['', Validators.required],
    });


  }


  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.onLoadData();


      this.isLoadingData = false;

    } catch (e) {
      console.error(e);
      this.isLoadingData = false;
    }
  }

  async onLoadData() {
    try {
      this.getItems();
      if (this.type == 'service') this.getServices();
      if (this.type == 'asset') this.getAssets();
      await this.getCustomer();
      await this.getQutation();
      if (this.bindid) await this.getQnById(this.bindid);

      this.isLoadingCart = false;
      this.isDisableEdit = false;
      if (this.bindid) {
        this.isDisableEdit = true;
      }
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  async getCustomer() {

    let postData = {};
    postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];

    this.customerList = [];
    await this._commonService
      .AsyncContactsFilter(postData)
      .then((datas: any) => {
        this.customerList = datas;
        this.customerfilteredOptions = of(datas);
      });
  }

  enterCustomer(event) {
    if (event.target.value) {
      this.customerfilteredOptions = of(this._customerfilter(event.target.value));
    } else {
      this.customerfilteredOptions = of(this.customerList);
    }
  }

  private _customerfilter(value: string): string[] {
    let results = [];
    for (let i = 0; i < this.customerList.length; i++) {
      if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
        results.push(this.customerList[i]);
      }
    }
    return results;
  }

  getItems() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.billItemList = [];
    this.billItemList2 = [];
    this._billItemService
      .GetByFilterView(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((datas: any) => {
        this.billItemList = datas;
        this.billItemList2 = datas;
        this.billItemListGrp = this.groupBy(datas, 'category');
      });
  }

  getAssets() {
    let postData = {};
    postData['formname'] = "asset";
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.assetList = [];
    this._assetService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: []) => {
        this.assetList = data;
        this.assetList.map((val: any) => val['categoryid'] = val['category'] ? val['category']['_id'] : '')
        this.assetList.map((val: any) => val['categoryname'] = val['category'] && val['category']['property']['name'] ? val['category']['property']['name'] : '')
        this.assetList2 = this.assetList;
        this.assetListGrp = this.groupBy(this.assetList, 'categoryid');
      });
  }


  getServices() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "type", "searchvalue": "appointmentservice", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });


    this.serviceList = [];
    this._serviceService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: []) => {
        this.serviceList = data;
        this.serviceList.map((val: any) => val['categoryid'] = val['category'] ? val['category']['_id'] : '')
        this.serviceList.map((val: any) => val['categoryname'] = val['category'] && val['category']['property']['name'] ? val['category']['property']['name'] : '')
        this.serviceList2 = this.serviceList;
        this.serviceListGrp = this.groupBy(this.serviceList, 'categoryid');

      });
  }

  async getQutation() {

    var sdate: Date = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    let postData = {};
    postData['formname'] = "salesorder";
    postData['search'] = [];
    if (this.bindid) {
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });
    } else {
      postData["search"].push({ "searchfield": "orderdate", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }
    postData["search"].push({ "searchfield": "type", "searchvalue": this.type, "criteria": "eq", "datatype": "text" });
    

    this.saleorderList = [];
    this.saleorderList2 = [];
    this.isLoading['appointment'] = true;

    let api = "salesorders/filter";
    let method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {

        this.saleorderList = data;
        this.saleorderList.map(a => a.shrname = a.customerid && a.customerid.fullname ? a.customerid.fullname.match(/\b(\w)/g).join('') : '--');
        this.saleorderList.map(a => a.selected = false);

        this.saleorderList2 = this.saleorderList;
        this.saleorderList.filter(a => a.status == 'requested');
        this.isLoading['appointment'] = false;
      }).catch(e => {
        this.isLoading['appointment'] = false;
        console.log(e);
      });
  }

  async onDateChanged() {
    await this.getQutation();
    this.clearData();
  }


  onClickApp(appnmt: any) {
    if (!this.isDisableEdit) {
      this.getQnById(appnmt._id);
    }
  }
  

  async getQnById(id: any) {

    try {
      this.isLoadingCart = true;
      this.servicecartList = [];
      this.cartItemList = [];

      this.bindid = id;

      this.saleorderList.map(val => val.selected = false);
      this.billItemList.map(val => val.quantity = 0);
      this.serviceList.map(val => val.selected = false);

      var appRes = this.saleorderList.find(a => a._id == id);
      appRes['selected'] = true;

      if (this.customerList.length > 0 && appRes['customerid']) {
        this.searchMember = this.customerList.find(a => a._id == appRes['customerid']['_id'])
      }

      this.cartItemList = [];
      if (appRes.items && appRes.items.length > 0) {
        appRes.items.forEach(itm => {
          var billitem = this.billItemList.find(a => a._id == itm.item._id);
          if (billitem) {
            billitem['item'] = itm.item;
            billitem['itemid'] = itm.item._id;
            billitem['sale'] = itm.item.sale;
            billitem['quantity'] = itm.quantity;

            this.cartItemList.push(billitem);
          }
        });
      }

      this.servicecartList = [];
      if (appRes.services && appRes.services.length > 0) {
        appRes.services.forEach(srvc => {
          this.servicecartList.push({
            refid: srvc.refid['_id'],
            taxes: srvc.taxes,
            cost: srvc.cost,
            charges: srvc.cost,
            totalcost: srvc.totalcost,
            discount: srvc.discount,
            title: srvc.refid['title']
          });
          var cartSer = this.serviceList.find(a => a._id == srvc.refid['_id']);
          cartSer['selected'] = true;
        });
      }

      this.assetcartList = [];
      if (appRes.assets && appRes.assets.length > 0) {
        appRes.assets.forEach(srvc => {
          this.assetcartList.push({
            refid: srvc.refid['_id'],
            taxes: srvc.taxes,
            cost: srvc.cost,
            charges: srvc.cost,
            totalcost: srvc.totalcost,
            discount: srvc.discount,
            title: srvc.refid['title']
          });
          var cartSer = this.assetList.find(a => a._id == srvc.refid['_id']);
          cartSer['selected'] = true;
        });
      }

      this.selectedDate = new Date(appRes['orderdate']);

      this.subtotal = appRes.amount;
      this.discount = appRes.discount;
      this.grandtotal = appRes.totalamount;
      this.taxamount = appRes.taxamount;
      this.packagediscount = appRes.membershipdiscount;
      this.taxdetail = appRes.taxdetail;
      
      this.isLoadingCart = false;
    } catch (e) {
      console.log("e", e);
      this.isLoadingCart = false;
    }
  }


  onAdd(billitem: any) {
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      if (!cartItem) {
        billitem['quantity'] = 1;
        this.cartItemList.push({ 'item': billitem, 'itemid': billitem._id, 'sale': billitem.sale, 'quantity': billitem['quantity'] });
      } else {
        billitem['quantity'] = cartItem['quantity'];
        billitem['quantity'] += 1;
        cartItem['quantity'] = billitem['quantity'];
      }
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  onSubtrct(billitem: any) {
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);

      cartItem['quantity'] -= 1;
      billitem['quantity'] = cartItem['quantity'];

      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  onRemove(billitem: any) {
    try {
      var ind = this.cartItemList.findIndex(a => a.itemid == billitem._id);
      this.cartItemList.splice(ind, 1);
      var item = this.billItemList.find(a => a._id == billitem._id);
      item['quantity'] = 0;
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  onClickService(id: any) {
    try {

      this.serviceForm.reset();
      var cartservice, service;
      if (this.type == 'service') {
        cartservice = this.servicecartList.find(a => a.refid == id);
        service = this.serviceList.find(a => a._id == id);
      } else {
        cartservice = this.assetcartList.find(a => a.refid == id);
        service = this.assetList.find(a => a._id == id);
      }
      this.serviceForm.controls['title'].setValue(service.title);
      this.serviceForm.controls['refid'].setValue(service._id);
      this.serviceForm.controls['cost'].setValue(service.charges);
      this.serviceForm.controls['taxes'].setValue(service.taxes);

      if (cartservice) {
        this.serviceForm.controls['discount'].setValue(cartservice.discount);
      }
      this.serviceForm.controls['cost'].disable();
      this.serviceForm.controls['taxes'].disable();
    } catch (e) {
      return e;
    }
  }

  onSubmitService() {
    try {
      if (!this.searchMember) {
        super.showNotification("top", "right", "Please select customer !!", "danger");
        return;
      }
      var value = this.serviceForm.getRawValue();
      if(value.discount > value.cost){
        super.showNotification("top", "right", "discount should be less than chanrges !!", "danger");
        return;
      }
      this.disableBtn = true;
      value.charges = value.cost;
      if (this.type == 'service') {
        var i = this.servicecartList.findIndex(a => a.refid == value.refid);
        if (i != -1) {
          this.servicecartList.splice(i, 1, value);
        } else {
          this.servicecartList.push(value);
        }
        var srvc = this.serviceList.find(a => a._id == value.refid);
        srvc['selected'] = true;
      } else {
        var i = this.assetcartList.findIndex(a => a.refid == value.refid);
        if (i != -1) {
          this.assetcartList.splice(i, 1, value);
        } else {
          this.assetcartList.push(value);
        }
        var ast = this.assetList.find(a => a._id == value.refid);
        ast['selected'] = true;
      }
      this.makeModel();
      this.GetBillDetail(this._billModel);
      $("#closeservice").click();
      this.disableBtn = false;
    } catch (e) {
      console.error("e", e);
      this.disableBtn = false;
      return e;
    }
  }
  closeService() {
    this.serviceForm.reset();
  }

  onRemoveService(service: any) {
    try {
      var item = this.serviceList.find(a => a._id == service.refid);
      item['selected'] = false;
      var ind = this.servicecartList.findIndex(a => a.refid == service.refid);
      this.servicecartList.splice(ind, 1);

      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }
 
  onRemoveAsset(service: any) {
    try {
      var item = this.assetList.find(a => a._id == service.refid);
      item['selected'] = false;
      var ind = this.assetcartList.findIndex(a => a.refid == service.refid);
      this.assetcartList.splice(ind, 1);
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  makeModel() {

    this.isLoadingCart = true;
    this._billModel.customerid = this.searchMember._id;
    if (this.searchMember.type == 'M') {
      this._billModel.onModel = "Member";
    } else if (this.searchMember.type == 'C') {
      this._billModel.onModel = "Prospect";
    } else if (this.searchMember.type == 'U') {
      this._billModel.onModel = "User";
    } else {
      this._billModel.onModel = "Member";
    }
    this._billModel.items = [];
    this._billModel.items = this.cartItemList;

    this._billModel.services = [];
    this._billModel.services = this.servicecartList;

    this._billModel.assets = [];
    this.assetcartList.map(a => a.refid = a.refid);
    this._billModel.assets = this.assetcartList;

    this._billModel.packages = [];

    this._billModel.amount = this.subtotal;
    this._billModel.totalamount = this.grandtotal;
    this.isLoadingCart = false;

    
  }

  GetBillDetail(model: any) {

    this.isLoadingCart = true;
    try {
      this._billService
        .BillDetail(model)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {

          this.subtotal = data.billamount;
          this.discount = data.discount;
          this.grandtotal = data.grandtotal;
          this.taxamount = data.taxamount;
          this.packagediscount = data.membershipdiscount;
          this.taxdetail = data.taxdetail;
          this.taxesList = [];
          this.isLoadingCart = false;
        });
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  checkItem() {
    if (this.cartItemList.length > 0)
      for (let i = 0; i < this.billItemList.length; i++) {
        for (let j = 0; j < this.cartItemList.length; j++) {
          if (this.billItemList[i]._id === this.cartItemList[j]._id) {
            this.billItemList.splice(i, 1, this.cartItemList[j]);
          }
        }
      }
  }

  onSearchItem() {
    var searchItem = this.searchBox.value;
    if (searchItem && searchItem != '') {
      this.searchBox.index = 0;
      var temparray = [];
      for (let i = 0; i < this.billItemList2.length; i++) {
        if (this.billItemList2[i].itemname.toLowerCase().indexOf((searchItem).toLowerCase()) > -1) {
          temparray.push(this.billItemList2[i]);
        }
      }
      var barcodefilter = this.billItemList2.filter(a => a.barcode == searchItem);
      if (barcodefilter && barcodefilter.length > 0) {
        this.billItemList = barcodefilter
      } else {
        this.billItemList = temparray;
      }
    } else {
      this.billItemList = this.billItemList2;
    }
  }

  onSearchService() {
    var searchItem = this.searchService.value;
    if (searchItem && searchItem != '') {
      this.searchService.index = 0;
      var temparray = [];
      for (let i = 0; i < this.serviceList2.length; i++) {
        if (this.serviceList2[i].title.toLowerCase().indexOf((searchItem).toLowerCase()) > -1) {
          temparray.push(this.serviceList2[i]);
        }
      }
      this.serviceList = temparray;
    } else {
      this.serviceList = this.serviceList2;
    }
  }

  onSearchAsset() {
    var searchItem = this.searchAsset.value;
    if (searchItem && searchItem != '') {
      this.searchAsset.index = 0;
      var temparray = [];
      for (let i = 0; i < this.assetList2.length; i++) {
        if (this.assetList2[i].title.toLowerCase().indexOf((searchItem).toLowerCase()) > -1) {
          temparray.push(this.assetList2[i]);
        }
      }
      this.assetList = temparray;
    } else {
      this.assetList = this.assetList2;
    }
  }



  async onNewQutn() {  // save qutation here
    try {
      var billRes;
      billRes = await this.onSaveQn();
      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "Sale Order made successfully !!", "success");
        this._router.navigate([`/pages/dynamic-preview-list/salesorder/${billRes['_id']}`]);
        // this.bindid = billRes['_id'];
        // await this.getQutation();
        // var qn = this.saleorderList.find(a => a._id == this.bindid);
        // if (qn) {
        //   qn.selected = true;
        // }
      }
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableBtn = false;
    }
  }


  async onSubmitProspect(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    this.disableBtn = true;
    let model = {};
    model['fullname'] = value.fullname;
    model['property'] = {};
    model['property']['fullname'] = value.fullname;
    model['property']['mobile'] = value.mobile;
    model['property']['email'] = value.email;

    try {
      var datas = await this._commonService.commonServiceByUrlMethodDataAsync('prospects', 'POST', model) as any;
      await this.getCustomer();
      this.searchMember = this.customerList.find(a => a._id == datas._id);
      this.disableBtn = false;
      super.showNotification("top", "right", "Customer added successfully !!", "success");
      $("#close").click();
      this.form.reset();
    } catch (e) {
      this.disableBtn = false;
      super.showNotification("top", "right", "Error Occured !!", "danger");
      $("#close").click();
    }
  }

  async onSaveQn() {
    if (this.cartItemList.length == 0 && this.servicecartList.length == 0) {
      super.showNotification("top", "right", "Cart is empty !!", "danger");
      return;
    }
    this.disableBtn = true;
    var model = {};

    model['customerid'] = this._billModel.customerid;
    model['onModel'] = this._billModel.onModel;
    model['orderdate'] = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    model['type'] = this.type;

    model['items'] = this.cartItemList;
    model['services'] = this.servicecartList;
    model['assets'] = this.assetcartList;

    model['amount'] = this.subtotal;
    model['taxamount'] = this.taxamount;
    model['taxdetail'] = this.taxdetail;
    model['totalamount'] = this.grandtotal;
    model['balance'] = this.grandtotal;
    var discount = this.discount ? this.discount : 0;
    discount += this.packagediscount ? this.packagediscount : 0;
    model['discount'] = discount;

    let api = "salesorders";
    let method = this.bindid ? 'PUT' : 'POST';

    console.log("model", model);
    var res;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model, this.bindid)
      .then((data) => {
        
        this.disableBtn = false;
        res = data
      }).catch((e) => {
        this.disableBtn = false;
        return e;
      });
    return res;
  }

  newAppointment() {
    this.ngOnInit();
    this.clearData();
    this.selectedDate = new Date();
    this.searchMember = "";
    this.selectedIndexes = 1;
    this.bindid = null;
  }

  clearMember(){
    this.searchMember = null;
    this.clearData();
    this.bindid = null;
  }

  clearData() {
    this.cartItemList = [];
    this.servicecartList = [];
    this.assetcartList = [];

    this._billModel = new BillModel();

    this.billItemList.map(a => a.quantity = 0);
    this.serviceList.map(a => a.selected = 0);
    this.saleorderList.map(a => a.selected = false);

    this.subtotal = 0;
    this.discount = 0;
    this.grandtotal = 0;
    this.taxamount = 0;
    this.packagediscount = 0;
    this.taxdetail = 0;
    this.taxesList = [];

  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
