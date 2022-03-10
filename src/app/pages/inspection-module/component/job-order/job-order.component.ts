import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';


import { BillModel } from '../../../../core/models/sale/bill';
import { BillPaymentModel } from '../../../../core/models/sale/billpayment';
import { CommonService } from '../../../../core/services/common/common.service';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { BillCheckOutComponent } from '../../../../shared/bill-check-out/bill-check-out.component';
import { BasicValidators, OnlyPositiveNumberValidator, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-job-order',
  templateUrl: './job-order.component.html',
})
export class JobOrderComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  form: FormGroup;
  serviceForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('billcheckout', { static: false }) BillCheckOutCmp: BillCheckOutComponent;

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
  balance: number = 0;
  outstandingamount: number = 0;

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

  assetid = new FormControl();
  assetList: any[] = [];
  assetfilteredOptions: Observable<string[]>;
  assetisLoadingBox: boolean = false;


  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  statusList: any[] = [

    { code: 'completed', value: "Completed" },
    { code: 'inprogress', value: "In Progress" },
    { code: 'active', value: "Not Started" },
    { code: 'onhold', value: "On Hold" },


    // { code: 'requested', value: "Requested" },
    // { code: 'inwaiting', value: "In Waiting" },
    // { code: 'confirm', value: "Confirm" },
    // { code: 'noshow', value: "No Show" },
    // { code: 'checkout', value: "Checkout" },
    // { code: 'cancel', value: "Cancel" },
    // { code: 'active', value: "Active" },

  ];

  statusFormGroup: FormGroup;
  joborderDetails: any = {};
  status: any;

  statusPopupActive: boolean = false;


  billform: FormGroup;
  isSubmitted: boolean = false;
  _propertyobjectModel: any;
  visible: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _billItemService: BillItemService,
    private _serviceService: ServiceService,
    private _billService: BillService
  ) {
    super();

    this.pagename = 'job-order';

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.type = params["type"];
      this.billid = params["billid"];
      this.billpayid = params["billpayid"];

      this.pagename = 'job-order-frontdesk';

      this._formName = "bill";
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };

    this.isLoading['appointment'] = false;
    this.selectedStatus = this.statusList.map(a => a.code);
    this.selectedIndexes = this.type == 'product' ? 1 : this.type == 'service' ? 2 : this.type == 'package' ? 3 : 0;
    if (this.billid || this.billpayid) {
      this.isPaymentMode = true;
    }

    this.form = this.fb.group({
      'fullname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'email': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });

    this.serviceForm = this.fb.group({
      'assignee': [''],
      'refid': [''],
      'charges': [],
      'serviceid': [''],
      'title': [''],
      'cost': [0],
      'taxes': [''],
      'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'status': ['', Validators.required],
    });

    this.statusFormGroup = new FormGroup({
      'status': new FormControl([this.selectedStatus])
    });

    this.billform = this.fb.group({});

  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      try {

        this.isLoadingData = true;
        this.statusFormGroup.valueChanges.subscribe(res => {
          this.selectedStatus = [];
          this.selectedStatus = res.status;
          this.onStatusChanges();
        });

        await super.ngOnInit();
        await this.initializeVariables();

        await this.onLoadData();
        this.isLoadingData = false;
        this.visible = true;

      } catch (e) {
        console.error(e);
        this.isLoadingData = false;
      } finally {
      }
    });
    this.assetfilteredOptions = this.assetid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._assetFilter(option) : this.assetList.slice())
      );

  }

  async initializeVariables() {
    this.isLoading = {};
    this.joborderDetails = {};
    this.statusPopupActive = false;
    return;
  }

  LoadData() { }
  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }


  async onLoadData() {
    try {
      this.getItems();
      this.getServices();
      await this.getCustomer();
      await this.getAssets();
      await this.getJobOrder();

      if (this.bindid) {
        this.jobOrderById(this.bindid);
      } else if (this.billid) {
        await this.getBillbyId(this.billid);
      } else {
      }

      this.isDisableEdit = false;
      this.statusFormGroup.controls['status'].enable();
      if (this.bindid || this.billid || this.billpayid) {
        this.isDisableEdit = true;
        this.statusFormGroup.controls['status'].disable();
      }
    } catch (e) {
      console.error("e", e);
    }
  }

  async getCustomer() {
    let postData = {};
    postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];
    this.customerList = [];
    var datas = await this._commonService.AsyncContactsFilter(postData) as [];
    this.customerList = datas;

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
        this.joborderList.map((a) => {
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

    this.joborderDetails = {};
    this.joborderDetails = joborder;

    this.status = this.joborderDetails.status;
    joborder.selected = true;

    if (this.assetList.length > 0 && joborder['assetid']['_id']) {
      var assetObj = this.assetList.find(a => a._id == joborder['assetid']['_id']);
      if (assetObj) {
        this.assetid.setValue(assetObj);
      }
    }
    this.getIOUAmount();


    if (joborder['billid']) {

      this._billModel._id = '';
      this._billModel.status = '';

      var billRes;

      billRes = await this._billService.AsyncGetById(joborder['billid']['_id']) as any;                        // billRes

      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['paidamount'];
      this.balance = billRes['balance'];
      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }
      this._propertyobjectModel = billRes.property;
    }
    this.servicecartList = [];
    if (joborder.services && joborder.services.length > 0) {
      joborder.services.forEach(srvc => {
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
        
        if (!cartSer['selected']) {
          cartSer['selected'] = null;
        }
        cartSer['selected'] = true;
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
          
          billitem['discount'] = 0;
          billitem['cost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;
          billitem['totalcost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;
          this.cartItemList.push(billitem);
        }
      });
    }

    await this.makeModel();
    this.GetBillDetail(this._billModel);
  }


  onDelete() {
    if (this.paidamount > 0) {
      this.showNotification('top', 'right', 'Please delete payment first !!', 'danger');
      return;
    }

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        await this._billService
          .AsyncDelete(this._billModel._id)
          .then((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'Invoice deleted successfully !!', 'success');
              this._router.navigate(['/pages/dynamic-list/list/bill']);
            }
          });
      }
    });
  }

  async getBillbyId(id: any) {
    try {
      this.isLoadingCart = true;

      this.servicecartList = [];
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';


      var billRes,
        billRes = await this._billService.AsyncGetById(id) as any;
      this._billModel = billRes;
      this._propertyobjectModel = billRes.property;

      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['paidamount'];
      this.balance = billRes['balance'];

      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }

      if (this.assetList.length > 0 && billRes['customerid']) {
        var assetObj = this.assetList.find(a => a.customerid._id == billRes['customerid']['_id']);
        if (assetObj) {
          this.assetid.setValue(assetObj);
        }
      }

      if (billRes['services'] && billRes['services'].length > 0) {
        billRes.services.forEach(tsk => {
          if (tsk && tsk['serviceid'] && tsk['serviceid']['_id']) {
            var service = this.serviceList.find(a => a._id == tsk['serviceid']['_id']);
            if (!service['selected']) service['selected'] = null;
            service['selected'] = true;
            this.servicecartList.push({
              'host': tsk.assignee._id,
              'refid': tsk.serviceid._id,
              'discount': tsk.discount,
              'cost': tsk.cost,
              'status': tsk.status,
              'taxes': tsk.taxes,
              'title': service['title'],
            });
          }
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

            billitem['discount'] = 0;
            billitem['cost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;
            billitem['totalcost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;

            this.cartItemList.push(billitem);
          }
        });
      }

      var joborder = this.joborderList.find(a => a.billid && a.billid._id ? a.billid._id == this.billid : undefined);
      if (joborder) {

        this.joborderDetails = {};
        this.joborderDetails = joborder;

        this.status = this.joborderDetails.status;

        joborder['selected'] = true;
        this.bindid = joborder._id;
      }

      this.getIOUAmount();
      setTimeout(() => {
        this.makeModel();
        this.subtotal = billRes.amount;
        this.discount = billRes.discount;
        this.grandtotal = billRes.totalamount;
        this.taxamount = billRes.taxamount;
        this.taxdetail = billRes.taxdetail;
        this.taxesList = [];
        this._billService.AySubBilldetail.next({ customerid: this.assetid.value.customerid._id, onModel: this._billModel.onModel, subtotal: this.subtotal, grandtotal: this.grandtotal, outstandingamount: this.outstandingamount, balance: this.balance });
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
    if (!this.assetid) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      
      if (!cartItem) {
        billitem['quantity'] = 1;

        billitem['discount'] = 0;
        billitem['cost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;
        billitem['totalcost'] = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;

        this.cartItemList.push({ 'item': billitem, 'itemid': billitem._id, 'sale': billitem.sale, 'quantity': billitem['quantity'] });

      } else {
        
        billitem['quantity'] = cartItem['quantity'];
        billitem['quantity'] += 1;
        cartItem['quantity'] = billitem['quantity'];

        billitem['discount'] = 0;
        cartItem['discount'] = 0;

        var cost = billitem && billitem.sale && billitem.sale.rate ? billitem.sale.rate : 0;
        billitem['cost'] = cost + cartItem['cost'];
        cartItem['cost'] =  billitem['cost'];

        billitem['totalcost'] = cost + cartItem['totalcost'];
        cartItem['totalcost'] =  billitem['totalcost'];


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
        this.serviceForm.controls['status'].setValue('requested');
        this.serviceForm.controls['discount'].setValue(0);
        //this.serviceForm.controls['assignee'].setValue([]);
        this.serviceForm.controls['assignee'].setValue('');
        this.serviceForm.controls['refid'].setValue(this.selectedService._id);
        this.serviceForm.controls['charges'].setValue(this.selectedService.charges);
        this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);

      } else {

        this.serviceForm.controls['assignee'].setValue(cartItem.assignee);
        this.serviceForm.controls['cost'].setValue(cartItem.cost);
        this.serviceForm.controls['cost'].disable();
        this.serviceForm.controls['discount'].setValue(cartItem.discount);
        this.serviceForm.controls['status'].setValue(cartItem.status);
        this.serviceForm.controls['refid'].setValue(cartItem._id);
        this.serviceForm.controls['charges'].setValue(cartItem.charges);
        this.serviceForm.controls['taxes'].setValue(cartItem.taxes);
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

    if (!this.assetid.value) {
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

    model['customerid'] = this.assetid.value._id;

    var customerObj = this.customerList.find(p => p._id == this.assetid.value.customerid._id);

    model['onModel'] = "User";

    if (customerObj && customerObj.type == 'M') {
      model['onModel'] = "Member";
    } else if (customerObj && customerObj.type == 'C') {
      model['onModel'] = "Prospect";
    }

    model['services'] = [];
    model['services'] = this.servicecartList;


    model['items'] = [];
    model['items'] = this.cartItemList;

    model['amount'] = this.subtotal;
    model['taxamount'] = this.taxamount;
    model['discount'] = this.discount;
    model['taxdetail'] = this.taxdetail;
    model['taxdetail'] = this.taxdetail;
    model['property'] = {};
    model['property']['packagediscount'] = this.packagediscount;


    // this.GetBillDetail();

    this.disableBtn = true;
    var url = "joborders";
    var method = this.bindid ? "PATCH" : "POST";

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
        console.error("e", e);
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
    this._billModel.services = [];
    this._billModel.packages = [];

    this._billModel.items = this.cartItemList;
    this._billModel.services = this.servicecartList;

    this._billModel.amount = this.subtotal;
    this._billModel.totalamount = this.grandtotal;
    this.isLoadingCart = false;
    return;
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

          this._billService.AySubBilldetail.next({ customerid: this.assetid.value.customerid._id, onModel: this._billModel.onModel, subtotal: this.subtotal, grandtotal: this.grandtotal, outstandingamount: this.outstandingamount, balance: this.balance });
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


  setNewPayment() {
    this.BillCheckOutCmp.setNewPayment();
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

    if (this.assetid && this.assetid.value && this.assetid.value.customerid && this.assetid.value.customerid._id) {
      let postData = {};
      postData['search'] = [{ "searchfield": "_id", "searchvalue": this.assetid.value.customerid._id, "criteria": "eq", "datatype": "ObjectId" }];
      postData['pageNo'] = 1;
      postData['size'] = 10;

      this._billService
        .GetByIOU(this.assetid.value.customerid._id, this.billid)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data && data.length > 0 && data[0].balance) {
            this.outstandingamount = data[0].balance ? data[0].balance : 0;
          } else if (data && !Array.isArray(data)) {
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
    this._router.navigate([`/pages/sale-module/multiple-bill/bill/` + event._id]);
  }

  async onNewBill() {
    try {
      var billRes;
      billRes = await this.onSaveBill();

      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill made successfully !!", "success");
        
        //this._router.navigate([`/pages/dynamic-preview-list/joborder/${billRes['_id']}`]);

        this._router.navigate([`/pages/dynamic-preview-list/joborder/${this.bindid}`]);
        this._billModel._id = billRes['_id'];
        this.billid = billRes['_id'];
        this.balance = billRes['balance'];
        this.paidamount = billRes['paidamount'];
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
        this.paidamount = billRes['paidamount'];
        this.balance = billRes['balance'];

        this._billService.AySubBilldetail.next({ customerid: this.assetid.value.customerid._id, onModel: this._billModel.onModel, subtotal: this.subtotal, grandtotal: this.grandtotal, outstandingamount: this.outstandingamount, balance: this.balance });
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
    this._router.navigate(['/pages/dynamic-preview-list/bill/' + id]);
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

    var billform = this.billform.getRawValue();
    var valproperty = billform.property;
    if (!this._billModel.property) {
      this._billModel.property = {};
    }
    for (const key in valproperty) {
      if (!this._billModel.property[key]) {
        this._billModel.property[key] = '';
      }
      this._billModel.property[key] = valproperty && valproperty[key] && valproperty[key]["autocomplete_id"] ? valproperty[key]["autocomplete_id"] : valproperty[key];
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
    this.assetid.setValue("");
    this.outstandingamount = 0;
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.clearData();
  }

  clear() {
    this.clearData();
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }

  clearMember() {
    this.assetid.setValue("");
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

        if(type == 'completed' && this.servicecartList.length > 0) {
          this.statusPopupActive = true;
        } else {

          let method = "PATCH";
          let url = "joborders/";

          var model = { 'status': type };

          return varTemp._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, varTemp.joborderDetails._id)
            .then((data: any) => {
              if (data) {
                varTemp.ngOnInit();
                return;
              }
            }, (error) => {
              console.error(error);
            })
        }


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

  getSubmittedData(submit: any) {
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
