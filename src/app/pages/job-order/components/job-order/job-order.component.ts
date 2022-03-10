import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BillModel } from '../../../../core/models/sale/bill';
import { BillPaymentModel } from '../../../../core/models/sale/billpayment';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators, OnlyPositiveNumberValidator, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
})

export class JobOrderComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  form: FormGroup;
  serviceForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindid: any;
  billid: any;
  billpayid: any;
  type: any;
  submitted: boolean;
  s_submitted: boolean;

  _billModel = new BillModel();
  _billPaymentModel = new BillPaymentModel();

  billItemList: any[] = [];
  billItemList2: any[] = [];
  billItemListGrp: any[] = [];

  serviceList: any[] = [];
  serviceList2: any[] = [];
  serviceListGrp: any[] = [];

  joborderList: any[] = [];
  joborderList2: any[] = [];

  selectedStatus: any[] = [];

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;

  providerList: any[] = [];

  cartItemList: any[] = [];
  servicecartList: any[] = [];

  subtotal: number = 0;
  discount: number = 0;
  taxamount: number = 0;
  taxesList: any[] = [];
  taxdetail: any = {};
  grandtotal: number = 0;
  packagediscount: number = 0;
  paidamount: number = 0;
  payamount: number = 0;
  outstandingamount: number = 0;

  searchMember: any;
  searchBox: any = {};
  searchService: any = {};
  selectedService: any;
  selectedIndexes: number = 0;

  selectedDate: Date = new Date();

  isLoading: any = {};

  isLoadingCart: boolean = false;
  isLoadingData: boolean = false;
  isPaymentMode: boolean = false;
  isDisableEdit: boolean = false;
  isIOUMode: boolean = false;
  disableBtn: boolean = false;

  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  statusList: any[] = [
    { code: 'requested', value: "Requested" },
    { code: 'inwaiting', value: "In Waiting" },
    { code: 'confirm', value: "Confirm" },
    { code: 'noshow', value: "No Show" },
    { code: 'checkout', value: "Checkout" },
    { code: 'cancel', value: "Cancel" },
    { code: 'active', value: "Active" },
  ];

  statusFormGroup: FormGroup;

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _billItemService: BillItemService,
    private _serviceService: ServiceService,
    private _billpaymentService: BillPaymentService,
    private _commonService: CommonService,
    private _billService: BillService
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.type = params["type"];
      this.billid = params["billid"];
      this.billpayid = params["billpayid"];

      this.pagename = 'job-order-frontdesk';
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };

    this.isLoading['appointment'] = false;
    this.selectedStatus = this.statusList.map(a => a.code);
    if (this.type) {
      this.selectedIndexes = this.type == 'product' ? 1 : this.type == 'service' ? 2 : this.type == 'package' ? 3 : 0;
      if (this.type == 'checkout') {
        this.isPaymentMode = true;
      }
    }

    this.form = this.fb.group({
      'fullname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'email': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });

    this.serviceForm = this.fb.group({
      'providers': [[]],
      'serviceid': [''],
      'title': [''],
      'cost': [0],
      // 'taxes': [],
      'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'status': ['',Validators.required],
    });

    this.statusFormGroup = new FormGroup({
      'status': new FormControl([this.selectedStatus])
    })
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      this.statusFormGroup.valueChanges.subscribe(res => {
        this.selectedStatus = [];
        this.selectedStatus = res.status;
        this.onStatusChanges();
      });
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
      this.getServices();
      await this.getCustomer();
      await this.getJobOrder();
      if (this.bindid) {
        this.jobOrderById(this.bindid);
      } else if (this.billid) {
        await this.getBillbyId(this.billid);
      } else if (this.billpayid) {
        await this.getBillPaymentbyId(this.billpayid);
      } else {
      }

      this.isDisableEdit = false;
      this.statusFormGroup.controls['status'].enable();
      if (this.bindid || this.billid || this.billpayid) {
        this.isDisableEdit = true;
        this.statusFormGroup.controls['status'].disable();
      }
    } catch (e) {
      console.log("e", e);
    }
  }

  async getCustomer() {
    let postData = {};
    postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];
    this.customerList = [];
    var datas = await this._commonService.AsyncContactsFilter(postData) as [];
    this.customerList = datas;
    this.customerfilteredOptions = of(datas);
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
    this._billItemService
      .GetByFilterView(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((datas: any) => {
        this.billItemList = datas;
        this.billItemList2 = datas;
        this.billItemListGrp = this.groupBy(datas, 'category');
      });
  }

  getServices() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "type", "searchvalue": "jobservice", "criteria": "eq" });

    this.serviceList = [];
    this._serviceService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.serviceList = data;
        this.serviceList.map((val: any) => val['categoryid'] = val['category'] ? val['category']['_id'] : '')
        this.serviceList.map((val: any) => val['categoryname'] = val['category'] && val['category']['property']['name'] ? val['category']['property']['name'] : '')
        this.serviceList2 = this.serviceList;
        this.serviceListGrp = this.groupBy(this.serviceList, 'categoryid');
      });
  }

  async onDateChanged() {
    this.clearData();
    await this.getJobOrder();
    this.onStatusChanges();
  }
  
  async onStatusChanges() {
    if (this.joborderList2 && this.joborderList2.length > 0) {
      this.isLoading['appointment'] = true;
      var statusExists: boolean = false;
      this.joborderList = [];
      this.joborderList2.forEach(element => {

        statusExists = false;
        if (this.selectedStatus && this.selectedStatus.length > 0) {
          var statusObj = this.selectedStatus.find(p => p == element.status);
          if (statusObj) {
            statusExists = true;
          }
        }
        if (statusExists) {
          this.joborderList.push(element);
        }
      });
      this.isLoading['appointment'] = false;
    }
  }


  onTabChanged(event: any) {
    setTimeout(() => {
      this.statusFormGroup.controls['status'].setValue(this.statusList.map(s => s.code));
    }, 200);
  }

  async getJobOrder() {
    var sdate: Date = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;

    let postData = {};
    postData['search'] = [];
    postData['formname'] = "joborder";

    if (this.bindid) {
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });
    } else if (this.billid) {
      postData["search"].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
    } else {
      
      // var today = new Date(sdate);
      // today.setHours(0, 0, 0, 0);
      // var tommrrow = new Date(sdate);
      // tommrrow.setDate(tommrrow.getDate() + 1);
      // tommrrow.setHours(0, 0, 0, 0);
      // postData["search"].push({ "searchfield": "date", "searchvalue": { "$gte": today, "$lt": tommrrow }, "criteria": "eq", "datatype": "Date" });

      postData["search"].push({ "searchfield": "date", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }

    this.joborderList = [];
    this.joborderList2 = [];

    let api = "joborders/filter";
    let method = "POST";
    this.isLoading['appointment'] = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, postData)
      .then((data: any) => {

        this.joborderList = data;
        this.joborderList.map(a => a.shrname = a.customerid && a.customerid.fullname ? a.customerid.fullname.match(/\b(\w)/g).join('') : '--');
        this.joborderList.map((a) =>{
         a.selected = false
         a.newStatus = this.statusList.find(s => s.code == a.status).value;
        });
        this.joborderList2 = this.joborderList;
        this.isLoading['appointment'] = false;
      });
  }


  async jobOrderById(id: any) {
    this.isLoadingCart = true;
    this.bindid = id;

    this.servicecartList = [];
    this.cartItemList = [];

    this.joborderList.map(val => val.selected = false);
    this.billItemList.map(val => val.quantity = 0);
    this.serviceList.map(val => val.selected = false);

    var joborder = this.joborderList.find(a => a._id == id);
    joborder.selected = true;
    if (this.customerList.length > 0 && joborder['customerid']['_id']) {
      this.searchMember = this.customerList.find(a => a._id == joborder['customerid']['_id'])
    }

    if (joborder['billid']) {

      this._billModel._id = '';
      this._billModel.status = '';

      let postData = {};
      postData['formname'] = "bill-job";
      postData['search'] = [];
      postData["search"].push({ "searchfield": "billid", "searchvalue": joborder['billid']['_id'], "criteria": "eq", "datatype": 'ObjectId' });


      var billRes, billPaymentRes;
      billPaymentRes = await this._billpaymentService.AsyncGetByfilter(postData) as any;  // billPaymentRes

      if (billPaymentRes && billPaymentRes.length > 0) {
        this._billPaymentModel = billPaymentRes[0];
        billRes = billPaymentRes[0]['billid'] as any;
      } else {
        billRes = await this._billService.AsyncGetById(joborder['billid']['_id']) as any;                        // billRes
      }

      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['balance'];
      this.payamount = billRes['balance'];
      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }
    }

    if (joborder.tasks && joborder.tasks.length > 0) {
      joborder.tasks.forEach(tsk => {
        var service = this.serviceList.find(a => a._id == tsk['serviceid']['_id']);
        service['selected'] = true;
        this.servicecartList.push({
          'providers': tsk.providers.length > 0 ? tsk.providers.map(a => a._id) : [],
          'serviceid': tsk.serviceid._id,
          'discount': tsk.discount,
          'cost': tsk.cost,
          'status': tsk.status,
          // 'taxes': tsk.taxes,
          'title': service['title'],
        });
      });
    }

    if (joborder.items && joborder.items.length > 0) {
      joborder['items'].forEach(itm => {
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
    setTimeout(() => {
      this.makeModel();
      this.GetBillDetail(this._billModel);
      this.getIOUAmount();
      this.isLoadingCart = false;
    }, 100);
  }

  async getBillbyId(id: any) {
    try {
      this.isLoadingCart = true;

      this.servicecartList = [];
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';

      let postData = {};
      postData['formname'] = "bill-job";
      postData['search'] = [];
      postData["search"].push({ "searchfield": "billid", "searchvalue": id, "criteria": "eq", "datatype": 'ObjectId' });

      var billRes, billPaymentRes;
      billPaymentRes = await this._billpaymentService.AsyncGetByfilter(postData) as any;  // billPaymentRes
      if (billPaymentRes && billPaymentRes.length > 0) {
        this._billPaymentModel = billPaymentRes[0];
        billRes = billPaymentRes[0]['billid'] as any;
      } else {
        billRes = await this._billService.AsyncGetById(id) as any;                        // billRes
      }

      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['balance'];
      this.payamount = billRes['balance'];
      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }
      if (this.customerList.length > 0 && billRes['customerid']) {
        this.searchMember = this.customerList.find(a => a._id == billRes['customerid']['_id'])
      }

      if (billRes['tasks'] && billRes['tasks'].length > 0) {
        billRes.tasks.forEach(tsk => {
          var service = this.serviceList.find(a => a._id == tsk['serviceid']['_id']);
          service['selected'] = true;
          this.servicecartList.push({
            'providers': tsk.providers.length > 0 ? tsk.providers.map(a => a._id) : [],
            'serviceid': tsk.serviceid._id,
            'discount': tsk.discount,
            'cost': tsk.cost,
            'status': tsk.status,
            // 'taxes': tsk.taxes,
            'title': service['title'],
          });
        });
      }
      if (billRes['items'] && billRes['items'].length > 0) {
        billRes['items'].forEach(itm => {
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
      var joborder = this.joborderList.find(a => a.billid && a.billid._id ? a.billid._id == this.billid : undefined);
      if (joborder) {
        joborder['selected'] = true;
        this.bindid = joborder._id;
      }
      setTimeout(() => {
        this.makeModel();
        this.GetBillDetail(this._billModel);
        this.getIOUAmount();
        this.isLoadingCart = false;
      }, 100);
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  async getBillPaymentbyId(id: any) {
    try {
      this.isLoadingCart = true;

      this.servicecartList = [];
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';

      let postData = {};
      postData['formname'] = "billpaymentjob";
      postData['search'] = [];
      postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": 'ObjectId' });

      var billRes, billPaymentRes;
      billPaymentRes = await this._billpaymentService.AsyncGetByfilter(postData) as any;  // billPaymentRes
      this._billPaymentModel = billPaymentRes[0];
      billRes = billPaymentRes[0]['billid'] as any;

      this.billid = billRes['_id']
      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['balance'];
      this.payamount = billRes['balance'];
      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }
      if (this.customerList.length > 0 && billRes['customerid']) {
        this.searchMember = this.customerList.find(a => a._id == billRes['customerid']['_id'])
      }

      if (billRes['tasks'] && billRes['tasks'].length > 0) {
        billRes.tasks.forEach(tsk => {
          var service = this.serviceList.find(a => a._id == tsk['serviceid']['_id']);
          service['selected'] = true;
          this.servicecartList.push({
            'providers': tsk.providers.length > 0 ? tsk.providers.map(a => a._id) : [],
            'serviceid': tsk.serviceid._id,
            'discount': tsk.discount,
            'cost': tsk.cost,
            'status': tsk.status,
            // 'taxes': tsk.taxes,
            'title': service['title'],
          });
        });
      }
      if (billRes['items'] && billRes['items'].length > 0) {
        billRes['items'].forEach(itm => {
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
      var joborder = this.joborderList.find(a => a.billid && a.billid._id ? a.billid._id == this.billid : undefined);
      if (joborder) {
        joborder['selected'] = true;
        this.bindid = joborder._id;
      }
      setTimeout(() => {
        this.makeModel();
        this.GetBillDetail(this._billModel);
        this.getIOUAmount();
        this.isLoadingCart = false;
      }, 100);
    } catch (e) {
      this.isLoadingCart = false;
    }
  }


  onClickApp(jo: any) {
    if (!this.isDisableEdit) {
      this.jobOrderById(jo._id);
    }
  }

  getColor(status: string) {
    if (status == 'checkout') {
      return '#4CAF50';
    } else if (status == 'requested') {
      return '#3788D8';
    } else if (status == 'noshow') {
      return '#FF9800';
    } else if (status == 'confirmed') {
      return '#9C27B0';
    } else if (status == 'cancel') {
      return '#F44336';
    } else if (status == 'active') {
      return '#e9a98c';
    } else if (status == 'inwaiting') {
      return '#FBD500';
    }
  }

  async onAdd(billitem: any) {
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
      await this.saveJO();
    } catch (e) {
      return e;
    }
  }

  async onSubtrct(billitem: any) {
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      cartItem['quantity'] -= 1;
      billitem['quantity'] = cartItem['quantity'];

      await this.saveJO();
    } catch (e) {
      return e;
    }
  }

  async onRemove(billitem: any) {
    try {
      billitem['quantity'] = 0;
      var ind = this.cartItemList.findIndex(a => a.itemid == billitem._id);
      this.cartItemList.splice(ind, 1);

      await this.saveJO();
    } catch (e) {
      return e;
    }
  }

  onClickService(serviceid: any) {

    var date = this.selectedDate && this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    var day = this.daysList[date.getDay()];
    this.selectedService = this.serviceList.find(a => a._id == serviceid);

    if (this.selectedService.availability && this.selectedService.availability.days.length > 0 && this.selectedService.availability.days.includes(day)) {
      this.selectedService['selected'] = true;
      this.providerList = [];
      this.providerList = this.selectedService.staff;

      var cartItem = this.servicecartList.find(a => a.serviceid == this.selectedService._id);
      if (!cartItem) {
        this.serviceForm.reset();
        this.serviceForm.controls['cost'].setValue(this.selectedService.charges);
        this.serviceForm.controls['cost'].disable();
        // this.serviceForm.controls['taxes'].setValue([]);
        // if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
        //   this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);
        //   this.serviceForm.controls['taxes'].disable();
        // }
        this.serviceForm.controls['status'].setValue('requested');
        this.serviceForm.controls['discount'].setValue(0);
        this.serviceForm.controls['providers'].setValue([]);
      } else {
        this.serviceForm.controls['providers'].setValue(cartItem.providers);
        this.serviceForm.controls['cost'].setValue(cartItem.cost);
        this.serviceForm.controls['cost'].disable();
        // this.serviceForm.controls['taxes'].setValue([]);
        // if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
        //   this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);
        //   this.serviceForm.controls['taxes'].disable();
        // }
        this.serviceForm.controls['discount'].setValue(cartItem.discount);
        this.serviceForm.controls['status'].setValue(cartItem.status);
      }
      this.serviceForm.controls['serviceid'].setValue(this.selectedService._id);
      this.serviceForm.controls['title'].setValue(this.selectedService.title);
      $("#srvcpopup").click();
    } else {
      super.showNotification("top", "right", `Service not availble today !!`, "danger");
      return;
    }
  }

  closeService(service: any) {
    this.serviceForm.reset();
    this.s_submitted = false;
    service['selected'] = false;
    var cartItem = this.servicecartList.find(a => a.serviceid == service._id);
    if (cartItem) {
      service['selected'] = true;
    }
  }

  async onSubmitService(value: any, valid: boolean) {
    this.s_submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }
    var savedService;
    savedService = this.serviceForm.getRawValue();
    var cartItem = this.servicecartList.find(a => a.serviceid == savedService.serviceid);
    if (!cartItem) {
      this.servicecartList.push(savedService);
    } else {
      var i = this.servicecartList.findIndex(a => a.serviceid == savedService.serviceid);
      this.servicecartList.splice(i, 1, savedService);
    }

    await this.saveJO();
    $("#closeservice").click();
    this.serviceForm.reset();
  }


  async saveJO() {
    var model = {};
    model['date'] = this.selectedDate && this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    model['customerid'] = this.searchMember._id;
    if (this.searchMember.type == 'M') {
      model['onModel'] = "Member";
    } else if (this.searchMember.type == 'C') {
      model['onModel'] = "Prospect";
    } else if (this.searchMember.type == 'U') {
      model['onModel'] = "User";
    } else {
      model['onModel'] = "User";
    }
    model['tasks'] = [];
    model['tasks'] = this.servicecartList;
    model['items'] = [];
    model['items'] = this.cartItemList;

    this.disableBtn = true;
    var url = "joborders";
    var method = this.bindid ? "PUT" : "POST";
    console.log("model",model);
    this.isLoadingCart = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindid)
      .then(async (data: any) => {
        if (data) {
          this.bindid = data._id;
          await this.getJobOrder();
          this.jobOrderById(data._id);
          this.disableBtn = false;
          this.isLoadingCart = false;
          this.showNotification("top", "right", "Job order updated !!", "success");

        }
      }).catch((e) => {
        console.log("e", e);
        this.disableBtn = false;
        this.isLoadingCart = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger");
      });
  }

  updateJO() {
    var model = {};
    model['billid'] = this.billid;
    var url = "joborders";
    var method = "PATCH";

    this.isLoadingCart = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, model, this.bindid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (data: any) => {

      });
  }

  async onRemoveService(serviceid: any, i: number) {
    var selectedService = this.serviceList.find(a => a._id == serviceid);
    selectedService['selected'] = false;
    this.servicecartList.splice(i, 1);
    await this.saveJO();
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
    this._billModel.services = [];
    this._billModel.packages = [];
    this._billModel.tasks = [];

    this._billModel.items = this.cartItemList;
    this._billModel.tasks = this.servicecartList;

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

  inputModelChangeValue() {
    this.clear();
    this.getIOUAmount();
  }

  getIOUAmount() {
    if (this.searchMember && this.searchMember._id) {
      let postData = {};
      postData['search'] = [{ "searchfield": "_id", "searchvalue": this.searchMember._id, "criteria": "eq", "datatype": "ObjectId" }];
      postData['pageNo'] = 1;
      postData['size'] = 10;

      this._billService
        .GetByIOU(this.searchMember._id, this.billid)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data && data.length > 0 && data[0].balance) {
            this.outstandingamount = data[0].balance ? data[0].balance : 0;
          }else if (data && !Array.isArray(data)){
            this.outstandingamount = data.outstandingamount;
          }
        });
    }
  }

  checkIOUMode() {
    this.isPaymentMode = true;
    this.isIOUMode = true;
  }

  onBackIOUMode() {
    this.isPaymentMode = false;
    this.isIOUMode = false;
    setTimeout(() => {
      this.statusFormGroup.controls['status'].setValue(this.statusList.map(s => s.code));
    }, 600);
    this.getIOUAmount();
  }

  redirecttoURL(event: any) {
    this._router.navigate([`/pages/sale-module/multiple-bill/bill-job/` + event._id]);
  }

  async onNewBill() {
    try {
      var billRes;
      billRes = await this.onSaveBill();
      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill made successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.billid = billRes['_id'];
        this.paidamount = billRes['balance'];
        this.payamount = billRes['balance'];
        if (this.bindid) this.updateJO();
        await this.getJobOrder();
        this.jobOrderById(this.bindid);
      }
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableBtn = false;
    }
  }

  onMoreOption() {
    this.isPaymentMode = false;
      this.isIOUMode = false;
    setTimeout(() => {
      this.statusFormGroup.controls['status'].setValue(this.statusList.map(s => s.code));
    }, 600);
  }

  async onCheckout() {
    try {
      var billRes;
      billRes = await this.onSaveBill();

      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill added successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.billid = billRes['_id'];
        this.paidamount = billRes['balance'];
        this.payamount = billRes['balance'];
        if (this.bindid) this.updateJO();
        await this.getJobOrder();
        this.jobOrderById(this.bindid);
        this.isPaymentMode = true;
      }
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableBtn = false;
    }
  }

  onPrint(id: any) {
    this._router.navigate(['/pages/dynamic-preview-list/bill-job/' + id]);
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

  async onSaveBill() {
    if (this.cartItemList.length == 0 && this.servicecartList.length == 0) {
      super.showNotification("top", "right", "Cart is empty !!", "danger");
      return;
    }
    this.disableBtn = true;
    this._billModel.billdate = new Date();
    this._billModel.duedate = new Date();

    var discount = this.discount ? this.discount : 0;
    discount += this.packagediscount ? this.packagediscount : 0;
    this._billModel.amount = this.subtotal;
    this._billModel.taxamount = this.taxamount;
    this._billModel.discount = discount;
    this._billModel.totalamount = this.grandtotal;
    this._billModel.taxdetail = this.taxdetail;
    this._billModel.paidamount = 0;
    this._billModel.type = 'joborder';
    if (this.bindid) {
      this._billModel.joborderid = this.bindid;
    }

    try {
      var billRes;

      if (this._billModel._id) {
        billRes = await this._billService.AsyncUpdate(this._billModel._id, this._billModel);
      } else {
        billRes = await this._billService.AsyncAdd(this._billModel);
      }
      this.disableBtn = false;
      return billRes;
    } catch (e) {
      this.disableBtn = false;
      return e;
    }
  }

  newJO() {
    this.ngOnInit();
    this.selectedDate = new Date();
    this.searchMember = "";
    this.outstandingamount = 0;
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.clearData();
  }

  clear(){
    this.clearData();
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }
  
  clearMember(){
    this.searchMember = ""; 
    this.clear();
  }
  
  clearData() {
    this.cartItemList = [];
    this.servicecartList = [];

    this._billModel = new BillModel();
    this._billPaymentModel = new BillPaymentModel();

    this.billItemList.map(a => a.quantity = 0);
    this.serviceList.map(a => a.quantity = 0);
    this.joborderList.map(a => a.selected = false);

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
