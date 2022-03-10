import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { map, startWith } from 'rxjs/operators';
import { BillModel } from '../../../../core/models/sale/bill';
import { BasicValidators, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-inspetion-estimation',
  templateUrl: './inspetion-estimation.component.html',
  styles: [
  ]
})
export class InspetionEstimationComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  form: FormGroup;
  serviceForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindid: any;
  submitted: boolean;

  billItemList: any[] = [];
  billItemList2: any[] = [];
  billItemListGrp: any[] = [];

  serviceList: any[] = [];
  serviceList2: any[] = [];
  serviceListGrp: any[] = [];

  quotationList: any[] = [];
  quotationData: any = {};
  quotationList2: any[] = [];

  cartItemList: any[] = [];
  servicecartList: any[] = [];

  subtotal: number = 0;
  discount: number = 0;
  taxamount: number = 0;
  taxesList: any[] = [];
  taxdetail: any = {};
  grandtotal: number = 0;
  packagediscount: number = 0;

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

  assetid = new FormControl();
  assetList: any[] = [];
  customerList: any[] = [];
  assetfilteredOptions: Observable<string[]>;
  assetisLoadingBox: boolean = false;

  estimationDetails: any = {};

  appointmentid: any;
  inspectionid: any;
  quotationid: any;
  joborderid: any;


  status: any;
  statusList: any[] = [
    { code: 'requested', value: "Requested" },
    { code: 'accepted', value: "Accepted" },
    { code: 'declined', value: "Declined" }
  ];

  disableButton: boolean = false;


  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {

    super();

    this.pagename = 'sales-estimate';

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };
    this.searchAsset = { value: '', index: 0 };



    this.form = this.fb.group({
      'fullname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'email': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });

    this.serviceForm = this.fb.group({
      'title': ['', Validators.required],
      'refid': ['', Validators.required],
      'charges': [, Validators.required],
      'taxes': ['', Validators.required],
      'discount': [, Validators.required],
    });


  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      try {

        await super.ngOnInit();
        await this.initializeVariables();
        await this.getItems();
        await this.getServices();
        await this.getCustomer();
        await this.getAssets();
        await this.getQutation();
        if (this.bindid) {
          await this.getQnById(this.bindid);
          this.isDisableEdit = true;
        }

      } catch (e) {
        console.error(e);
        this.isLoadingData = false;
        this.isLoadingCart = false;
      } finally {
        this.isLoadingData = false;
      }

    });

    this.assetfilteredOptions = this.assetid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._assetFilter(option) : this.assetList.slice())
      );
  }

  LoadData() { }
  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async initializeVariables() {

    this.isLoadingData = true;
    this.isLoadingCart = false;
    this.isDisableEdit = false;
    this.isLoading = {};
    this.quotationData = {};
    this.isLoading['appointment'] = false;
    this.estimationDetails = {};
    this.appointmentid = "";
    this.inspectionid = "";
    this.quotationid = "";
    this.joborderid = "";
    return
  }

  async getItems() {

    var url = "billitems/filter/view"
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.billItemList = [];
    this.billItemList2 = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.billItemList = data;
          this.billItemList2 = data;
          this.billItemListGrp = this.groupBy(data, 'category');
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getServices() {

    var url = "services/filter"
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "type", "searchvalue": "jobservice", "criteria": "eq" });

    this.serviceList = [];



    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {



        if (data && data[0]) {


          this.serviceList = data;
          this.serviceList.map((val: any) => val['categoryid'] = val['category'] ? val['category']['_id'] : '')
          this.serviceList.map((val: any) => val['categoryname'] = val['category'] && val['category']['property']['name'] ? val['category']['property']['name'] : '')
          this.serviceList2 = this.serviceList;
          this.serviceListGrp = this.groupBy(this.serviceList, 'categoryid');
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getAssets() {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.assetList = [];

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.assetList = data;
          this.assetList.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png');
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  displayFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  enterAsset() {
    const controlValue = this.assetid.value;
    this.assetid.setValue(controlValue);
  }

  preloadAsset() {
    if (this.assetList && this.assetList.length == 0) {
      this.getAssets()
    }
  }

  handleEmptyAssetInput(event: any) {
    if (event.target.value === '') {
      this.assetid.setValue("");
      this.assetList = [];
    }
  }
 
  private _assetFilter(value: string): string[] {
    let results;
    if (value) {
      results = this.assetList.filter(option => {
        if (option.title) {
          return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
        } else {
          return;
        }
      });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.assetList.slice();
    }
    return results;
  }

  optionAssetSelected(option: any) {
    if (option.value) {
      this.assetid.setValue(option.value);
    }
  }


  async getCustomer() {

    var url = "common/contacts/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.customerList = [];
          this.customerList = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getQutation() {

    var sdate: Date = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    let postData = {};
    postData['formname'] = "service-salesestimate";

    postData['search'] = [];
    if (this.bindid) {
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });
    } else {
      postData["search"].push({ "searchfield": "date", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }

    this.quotationList = [];
    this.quotationList2 = [];
    this.isLoading['appointment'] = true;

    let api = "quotations/filter";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {

        if (data) {

          this.quotationData = data[0];

          this.quotationList = data;
          this.quotationList.map(a => a.shrname = a.customerid && a.customerid.fullname ? a.customerid.fullname.match(/\b(\w)/g).join('') : '--');
          this.quotationList.map(a => a.selected = false);
          this.quotationList2 = this.quotationList;
          this.quotationList.filter(a => a.status == 'requested');
          this.isLoading['appointment'] = false;
          return;
        }

      }).catch(e => {
        this.isLoading['appointment'] = false;
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

      this.quotationList.map(val => val.selected = false);
      this.billItemList.map(val => val.quantity = 0);
      this.serviceList.map(val => val.selected = false);

      var appRes = this.quotationList.find(a => a._id == id);

      this.estimationDetails = {};
      this.estimationDetails = appRes;

      this.appointmentid = this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.appointmentid ? this.estimationDetails.property.appointmentid : undefined;
      this.inspectionid = this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.inspectionid ? this.estimationDetails.property.inspectionid : undefined;
      this.quotationid = this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.quotationid ? this.estimationDetails.property.quotationid : undefined;
      this.joborderid = this.estimationDetails && this.estimationDetails.property && this.estimationDetails.property.joborderid ? this.estimationDetails.property.joborderid : undefined;

      this.status = this.estimationDetails.status;

      appRes['selected'] = true;

      if (this.assetList.length > 0 && appRes['customerid']) {
        var assetObj = this.assetList.find(a => a.customerid._id == appRes['customerid']['_id'])
        if (assetObj) {
          this.assetid.setValue(assetObj);
        }
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



      this.selectedDate = new Date(appRes['date']);
      setTimeout(async () => {
        await this.makeModel();
        await this.GetBillDetail(this._billModel);
        this.isLoadingCart = false;
      }, 100);
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  onAdd(billitem: any) {
    if (!this.assetid) {
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
      cartservice = this.servicecartList.find(a => a.refid == id);
      service = this.serviceList.find(a => a._id == id);
      this.serviceForm.controls['title'].setValue(service.title);
      this.serviceForm.controls['refid'].setValue(service._id);
      this.serviceForm.controls['charges'].setValue(service.charges);
      this.serviceForm.controls['taxes'].setValue(service.taxes);

      if (cartservice) {
        this.serviceForm.controls['discount'].setValue(cartservice.discount);
      }
      this.serviceForm.controls['charges'].disable();
      this.serviceForm.controls['taxes'].disable();
    } catch (e) {
      return e;
    }
  }

  async onSubmitService() {
    try {

      if (!this.assetid.value) {
        super.showNotification("top", "right", "Please select Customer !!", "danger");
        return;
      }
      this.disableBtn = true;
      var value = this.serviceForm.getRawValue();
      var i = this.servicecartList.findIndex(a => a.refid == value.refid);
      if (i != -1) {
        this.servicecartList.splice(i, 1, value);
      } else {
        this.servicecartList.push(value);
      }
      var srvc = this.serviceList.find(a => a._id == value.refid);
      srvc['selected'] = true;
      this.servicecartList.map(p => p.cost = p.charges);
      await this.makeModel();
      await this.GetBillDetail(this._billModel);
      $("#closeservice").click();
      this.disableBtn = false;
    } catch (e) {

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
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  async makeModel() {

    this.isLoadingCart = true;
    this._billModel.customerid = this.assetid.value.customerid._id;
    var customerObj = this.customerList.find(p => p._id == this.assetid.value.customerid._id);
    this._billModel.onModel = "Member";
    if (customerObj && customerObj.type == 'C') {
      this._billModel.onModel = "Prospect";
    } else if (customerObj && customerObj.type == 'U') {
      this._billModel.onModel = "User";
    }


    this._billModel.items = [];
    this._billModel.items = this.cartItemList;

    this._billModel.services = [];
    this._billModel.services = this.servicecartList;

    this._billModel.packages = [];

    this._billModel.amount = this.subtotal;
    this._billModel.totalamount = this.grandtotal;
    this.isLoadingCart = false;

    return;

  }

  async GetBillDetail(model: any) {

    this.isLoadingCart = true;

    let api = "bills/billdetail/";
    let method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model)
      .then((data: any) => {
        if (data) {

          this.subtotal = data.billamount ? data.billamount : 0.0;
          this.discount = data.discount ? data.discount : 0.0;
          this.grandtotal = data.grandtotal ? data.grandtotal : 0.0;
          this.taxamount = data.taxamount ? data.taxamount : 0.0;
          this.packagediscount = data.membershipdiscount ? data.membershipdiscount : 0.0;
          this.taxdetail = data.taxdetail ? data.taxdetail : 0.0;
          this.taxesList = [];
          this.isLoadingCart = false;
          return;
        }
      }).catch(e => {
        this.isLoadingCart = false;
      });

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

  async onNewQutn() {  // save qutation here
    try {
      var billRes;
      billRes = await this.onSaveQn();

      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "Quotation made successfully !!", "success");
        this._router.navigate([`/pages/dynamic-preview-list/estimate/${billRes['_id']}`]);
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
      await this.getAssets();

      let assetObj = this.assetList.find(a => a.customerid._id == datas._id);
      if (assetObj) {
        this.assetid.setValue(assetObj)
      }

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
    model['date'] = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    model['type'] = "service";
    model['items'] = this.cartItemList;
    model['services'] = this.servicecartList;
    model['amount'] = this.subtotal;
    model['taxamount'] = this.taxamount;
    model['taxdetail'] = this.taxdetail;
    model['totalamount'] = this.grandtotal;
    var discount = this.discount ? this.discount : 0;
    discount += this.packagediscount ? this.packagediscount : 0;
    model['discount'] = discount;

    model['property'] = {};
    model['property']['assetid'] = this.assetid?.value?._id;
    model['property']['inspectionid'] = this.estimationDetails?.property?.inspectionid;

    let api = "quotations";
    let method = this.bindid ? 'PUT' : 'POST';

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

  clearData() {
    this.cartItemList = [];
    this.servicecartList = [];
    this._billModel = new BillModel();

    this.billItemList.map(a => a.quantity = 0);
    this.serviceList.map(a => a.selected = 0);
    this.quotationList.map(a => a.selected = false);

    this.subtotal = 0;
    this.discount = 0;
    this.grandtotal = 0;
    this.taxamount = 0;
    this.packagediscount = 0;
    this.taxdetail = 0;
    this.taxesList = [];
    return;

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

  convertToJob() {

    let postData = {};
    postData["prefix"] = this.quotationData.prefix;
    postData["date"] = new Date;
    postData["assetid"] = this.assetid && this.assetid.value._id ? this.assetid.value._id : null;
    postData["customerid"] = this.quotationData.customerid._id;
    postData["onModel"] = this.quotationData.onModel;

    postData["items"] = [];

    if (this.quotationData.items && this.quotationData.items.length > 0) {
      this.quotationData.items.forEach(element => {
        element.item = element.item._id ? element.item._id : element.item;
        postData["items"].push(element)
      });
    }

    postData["services"] = [];

    if (this.quotationData.services && this.quotationData.services.length > 0) {
      this.quotationData.services.forEach(element => {

        let serviceObj = {
          refid: element.refid,
          taxes: element.taxes,
          assignee: null,
          cost: element.cost,
          taxamount: element.taxamount,
          totalcost: element.totalcost,
          discount: element.discount,
          status: element.status,

        };
        postData["services"].push(serviceObj)
      });
    }

    postData["amount"] = 0;
    postData["totalamount"] = this.quotationData.totalamount;
    postData["taxamount"] = this.quotationData.taxamount;
    postData["discount"] = this.quotationData.discount;
    postData["property"] = {};

    postData["property"]["appointmentid"] = this.appointmentid;
    postData["property"]["inspectionid"] = this.inspectionid;
    postData["property"]["quotationid"] = this.quotationid;
    postData["property"]["joborderid"] = this.joborderid;

    var url = "joborders"
    var method = "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          super.showNotification("top", "right", "job order has been Added successfully !!", "success");
          this._router.navigate([`/pages/inspection-module/job-order/${data['_id']}`]);
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  statusChange(type: any) {

    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${type} it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        let method = "PATCH";
        let url = "quotations/";

        var model = { 'status': type };

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, varTemp.estimationDetails._id)
          .then((data: any) => {
            if (data) {
              varTemp.ngOnInit();
              return;
            }
          }, (error) => {
            console.error(error);
          })
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your event is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
