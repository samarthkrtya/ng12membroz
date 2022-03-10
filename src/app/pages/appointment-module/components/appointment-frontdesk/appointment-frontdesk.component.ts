import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {  Observable, of, Subject } from 'rxjs';
import {  debounceTime,  finalize, map,  startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';

import { BillModel } from '../../../../core/models/sale/bill';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { AppointmentService } from '../../../../core/services/service/appointment.service';
import { BillCheckOutComponent } from '../../../../shared/bill-check-out/bill-check-out.component';
import { BasicValidators, OnlyPositiveNumberValidator, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-appointment-frontdesk',
  templateUrl: './appointment-frontdesk.component.html',
  styles : [
    `
    .bg-blue { 
      background-color: #3D58D4;
      color: white;
    }
    .bg-pink { 
      background-color: #E152BF;
      color: white;
    }
    .bg-sky { 
      background-color: #2dbfb5; 
      color: white;
    }
    .bg-skyblue { 
      background-color: #47CCBF; 
      color: white;
    }
    .bg-green { 
      background-color: #008000;
      color: white;
    }
    .bg-red { 
      background-color: #E54D4D;
      color: white;
    }
    .bg-orange { 
      background-color: #f2a343;
      color: white;
    }
    .bg-yellow { 
      background-color: #FBD500;
      color: white;
    }
    .pointer {
      cursor: pointer
    }
       
    `
  ]
})

export class AppointmentFrontdeskComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  form: FormGroup;
  serviceForm: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('billcheckout', { static: false }) BillCheckOutCmp: BillCheckOutComponent;

  bindid: any;
  billid: any;
  billpayid: any;
  pkid: any;
  type: any;
  submitted: boolean;
  s_submitted: boolean;

  _billModel = new BillModel();

  billItemList: any[] = [];
  billItemList2: any[] = [];
  billItemListGrp: any[] = [];

  giftCardList: any[] = [];
  giftCardList2: any[] = [];
  
  giftCertificateList: any[] = [];
  giftCertificateList2: any[] = [];

  packageList: any[] = [];
  packageList2: any[] = [];
  packageListGrp: any[] = [];

  serviceList: any[] = [];
  serviceList2: any[] = [];
  serviceListGrp: any[] = [];

  appintmentList: any[] = [];
  appintmentList2: any[] = [];

  alltimeslotLists: any[] = [];
  timeisLoadingBox: boolean = false;

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;

  providerList: any[] = [];
  providerfilteredOptions: Observable<any[]>;

  cartItemList: any[] = [];
  servicecartList: any[] = [];
  packagecartList: any[] = [];

  selectedStatus: string[] = [];

  selectedCoupon: any = {};
  loadingprd: boolean = false;
  couponList: any[] = [];
  couponfilteredOptions: Observable<any[]>;
  
  subtotal: number = 0;
  discount: number = 0;
  taxamount: number = 0;
  taxesList: any[] = [];
  taxdetail: any = {};
  grandtotal: number = 0;
  packagediscount: number = 0;
  paidamount: number = 0;
  balance: number = 0;
  status: string;
  outstandingamount: number = 0;

  today : Date = new Date();

  memberControl = new FormControl();
  selectedItem: any = {};
  searchMember: any;
  searchBox: any = {};
  searchService: any = {};
  selectedService: any;
  selectedIndexes: number = 0;

  selectedDate: Date = new Date();

  isLoadings: any = {};

  isLoadingCart: boolean = true;
  isLoadingData: boolean = false;
  isPaymentMode: boolean = false;
  isDisableEdit: boolean = false;
  isIOUMode: boolean = false;
  disableBtn: boolean = false;
  // canEditCustomer: boolean = true;

  addAppointmnet: boolean;

  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  statusList: any[] = [
    { code: 'requested', value: "Requested" },
    { code: 'confirmed', value: "Confirmed" },    
    { code: 'checkinguest', value: "Checkin" },    
    { code: 'checkout', value: "Checkout" },
    { code: 'noshow', value: "No Show" }
  ];

  billform: FormGroup;
  isSubmitted : boolean = false;
  _propertyobjectModel : any;
  visible: boolean = false;

  provider_fields = {
    "fieldname": "paymentreceivedby",
    "fieldtype": "form",
    "search": [
        { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
        { "fieldname": "_id", "value": 1 },
        { "fieldname": "property", "value": 1 },
        { "fieldname": "fullname", "value": 1 }
    ],
    "form": {
        "apiurl": "users/filter",
        "formfield": "_id",
        "displayvalue": "fullname",
    },
    "dbvalue": "",
    "visible": true,
      "modelValue": {},
  };
  selectInfo : any = {};

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }
  displayFnPr(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }
  displayCn(user: any): string {
    return user && user.couponcode ? user.couponcode : '';
  }

  discount_fields = {
    "fieldname": "discountreason",
    "fieldtype": "lookup",
    "search": [
        { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
        { "searchfield": "lookup", "searchvalue": "discountreason", "criteria": "eq" }
    ],
    "select": [
        { "fieldname": "_id", "value": 1 },
        { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",
    "visible" : true,
 };

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _billItemService: BillItemService,
    private _serviceService: ServiceService,
    private _billService: BillService,
    private _appointmentService: AppointmentService,
  ) {
    super();
    this.pagename = 'appointment-frontdesk';
    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.type = params["type"];
      this.billid = params["billid"];
      this.billpayid = params["billpayid"];
      this.pkid= params["pkid"];

      this._formName = "bill";
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };
    this.isLoadings['appointment'] = false;
    this.selectedStatus = this.statusList.map(a => a.code);
    this.selectedIndexes = this.type == 'product' ? 1 : this.type == 'service' ? 2 : this.type == 'package' ? 3 : 0;
    if (this.billid || this.billpayid) {
      this.isPaymentMode = true;
      // this.canEditCustomer = false;
    }else if(this.bindid || this.pkid){
      // this.canEditCustomer = false;
    }

    // ['', Validators.required]

    this.serviceForm = this.fb.group({
      'refid': [''],
      'appointmentid': [''],
      'timeslot': this.fb.group({ 'starttime': [''], 'endtime': [''] , 'day': [''] }),
      'host': ['', Validators.required],
      'appointmentdate': [],
      'cost': [0],
      'charges': [0],
      'taxes': [[]],
      'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'discountreason': [],      
      'status': ['', Validators.required],
      'title': [''],
      'availability': [''],
      'appointmentday': [''],
      'staffavailability': [''],
      'duration': [''],
      'packageid': [],
      'couponcode': [],
      'coupondiscount': [],
    });

    this.form = this.fb.group({
      'firstname': ['', Validators.required],
      'lastname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'primaryemail': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });

    this.billform = this.fb.group({}); 
  }


  async ngOnInit() {
    try {
      this.isLoadingData = true;
    
      await super.ngOnInit();
      await this.onLoadData();
      this.isLoadingData = false;
      this.visible = true;
    } catch (e) {
      console.error(e);
      this.isLoadingData = false;
    }

    this.providerfilteredOptions = this.serviceForm.controls['host'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._providerfilter(option) : this.providerList.slice())
      );
 
      // this.memberControl
      // .valueChanges
      // .pipe(debounceTime(500))
      // .subscribe((value)=>{
      //   if(loadingDone){
      //     this.getCustomer();
      //     loadingDone = false;
      //   }else{
      //     this.enterCustomer(value);
      //   }
      // });

      this.memberControl
      .valueChanges
      .pipe(
        debounceTime(500),
        tap((item)=>{
          this.customerList = [];
          if(item.length == 0) {
            this.customerisLoadingBox = false;
          } else {
            this.customerisLoadingBox = true;
          }
        }),
        switchMap((value) => 
          value.length > 2
          ? this._commonService.searchContact(value, 1)
            .pipe(
              finalize(() => {
                this.customerisLoadingBox = false
              }),
            )
          : []
        )
      )
      .subscribe((data : any) => {
        this.customerList = [];
        this.customerList = data;
        this.customerfilteredOptions = of(data);
      });

  }

  async onLoadData() {
    try {
      this.getItems();
      this.getPackages();
      this.getCoupons();
      // await this.getCustomer();
      await this.getServices();
      if (this.bindid) {
        await this.getAppointments();
        await this.getAppointmentById(this.bindid);
        // this.getMoreAppointments();
      } else if (this.billid) {
        await this.getBillbyId(this.billid);
      } else if (this.pkid) {
        await this.getAppointmentbyPackageId(this.pkid);
      }  else {
        await this.getAppointments();
        this.isLoadingCart = false;
      }
      this.isDisableEdit = false;
      if (this.bindid || this.billid || this.billpayid || this.pkid) {
        this.isDisableEdit = true;
      }
    } catch (e) {
      this.isLoadingCart = false;
    } finally {
    }
  }
 
  private _providerfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.providerList.filter(option => {
        if (option.fullname) {
          return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
        } else {
          return;
        }
      });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.providerList.slice();
    }
    return results;
  }


  async getCustomer() {

    let postData = {};
    postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];

    this.customerisLoadingBox = true;

    this.customerList = [];
    await this._commonService
      .AsyncContactsFilter(postData)
      .then((datas: any) => {
        this.customerList = datas;
        this.customerfilteredOptions = of(datas);
        this.customerisLoadingBox = false;
      });
  }

  enterCustomer(val) {
    if (typeof val == 'string') {
      this.customerfilteredOptions = of(this._customerfilter(val));
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

  getCoupons() {
    const url = "coupons/view/filter";
    const method = "POST"
    
    let postData = {};
    postData['search'] = [{ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" }];
    postData['viewname'] = "couponviews";
    
    this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            console.log("data",data)
            this.couponList = data;
            if(this.globalfunctionpermissions.includes('Allow Order Price Override')){
              this.couponList.push({'couponcode' : 'Override Price' })  
            }
            this.couponfilteredOptions = of(this.couponList);
        });
  }

  enterCoupon(event) {
    if (event.target.value) {
        this.couponfilteredOptions = of(this._couponfilter(event.target.value));
    } else {
        this.couponfilteredOptions = of(this.couponList);
    }
  }

  private _couponfilter(value: string): string[] {
      let results = [];
      for (let i = 0; i < this.couponList.length; i++) {
          if (this.couponList[i].couponcode.toLowerCase().indexOf((value).toLowerCase()) > -1) {
              results.push(this.couponList[i]);
          }
      }
      return results;
 }

 
  setTimers(time : string): object | undefined{
    if(!time) return undefined;
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }


  handleEmptyInput(event){
    if(event.target.value === '') {
      let item = this.cartItemList.find(a => a.itemid == this.selectedItem._id);
      item['couponcode'] = null;
      item['coupondiscount'] = null;
      this.selectedCoupon = null;
    }
  }

  checkCpn(types ?: string){
    this.loadingprd = true;

    const url = "coupons/checkvalidity";
    const method = "POST"
    let postData = {};
    if(types == 'service'){
      postData['_id'] = this.selectedService._id;
      postData['type'] =  types;
    }else{
      postData['_id'] = this.selectedItem._id;
      postData['type'] = types ? types :  this.selectedItem?.to ?  "giftcertificate" : this.selectedItem?.itemnumber ? "giftcard" : "product";
    }
    
    this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            
            this.couponList = data;
            this.couponfilteredOptions = of(this.couponList);
            this.loadingprd = false;
        });
  }

  async onCouponSelect(coupon : any){
    if(coupon._id){
       try {
         let discount = this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0;
         let totalcost = this.selectedItem?.sale?.rate - discount;
         
         const url = "coupons/applycoupon";
         const method = "POST";
         
         let postData = {};
         postData['search'] = [{ "searchfield": "couponcode", "searchvalue": this.selectedCoupon.couponcode, "criteria": "eq", "datatype": "text" }];
         postData['billamount'] = totalcost;
         this.selectedCoupon.disable = true;
 
         let cpnres = await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData) as any;
         
         this.selectedCoupon.disable = false;
         if (cpnres && cpnres.couponcode) {
             let couponamount = cpnres.value ? cpnres.value : 0;
             let appliedcpn = totalcost >= couponamount ? couponamount : totalcost;
             let item = this.cartItemList.find(a => a.itemid == this.selectedItem._id);
             item['couponcode'] = this.selectedCoupon;
             item['coupondiscount'] = appliedcpn;
             this.selectedCoupon['coupondiscount'] = appliedcpn;
             this.selectedCoupon['finaltotalcost'] = this.selectedItem['totalcost'] - (appliedcpn * this.selectedItem?.quantity);
         } else {
             super.showNotification("top", "right", "Coupon not available !!", "danger");
             this.selectedCoupon = null;
         }
       } catch (e) {
           console.log("e", e);
       }
     }
   }
    
   async onDonePrd(){
      this.disableBtn = true;
      let cartItem = this.cartItemList.find(a => a.itemid == this.selectedItem?._id);
      if(this.provider_fields?.modelValue && this.provider_fields?.modelValue['_id']){
        cartItem['seller'] = this.provider_fields?.modelValue;
      }
      cartItem['quantity'] = this.selectedItem['quantity'];
      cartItem['stock'] = this.selectedItem?.orginalstock - this.selectedItem?.quantity;
      this.makeModel();
      this.GetBillDetail(this._billModel);
      this.disableBtn = false;
      this.selectedCoupon = null;
      $("#closecn").click();
    // this.showNotification("top", "right", "Coupon applied successfully !!", "success");
  }



  async onCouponSelectForService(){
    this.serviceForm.get('coupondiscount').setValue(0);
    this.serviceForm.get('discount').disable();
    if(this.selectedCoupon._id){
       try {
             let payamount = this.selectedService?.charges;
          
             let url = "coupons/applycoupon";
             let method = "POST";
             let postData = {};
             postData['search'] = [{ "searchfield": "couponcode", "searchvalue": this.selectedCoupon.couponcode, "criteria": "eq", "datatype": "text" }];
             postData['billamount'] = payamount;
             this.selectedCoupon.disable = true;
             let cpnres = await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData) as any;
             this.selectedCoupon.disable = false;
             if (cpnres && cpnres.couponcode) {
                     let couponamount = cpnres.value ? cpnres.value : 0;
                     let appliedcpn = payamount >= couponamount ? couponamount : payamount;
                     if (appliedcpn >= payamount) {
                         swal.fire({
                             title: 'Are you sure?',
                             text: 'Coupon amount is greater than pay amount !',
                             icon: 'warning',
                             showCancelButton: true,
                             confirmButtonText: 'Yes, Use it!',
                             cancelButtonText: 'No',
                             customClass: {
                                 confirmButton: "btn btn-success",
                                 cancelButton: "btn btn-danger",
                             },
                             buttonsStyling: false
                         }).then((result) => {
                             if (result.value) {
                                 this.selectedService['couponcode'] = this.selectedCoupon;
                                 this.selectedService['coupondiscount'] = appliedcpn;
                                 this.selectedCoupon['coupondiscount'] = appliedcpn;
                                 this.serviceForm.get('coupondiscount').setValue(appliedcpn);
                                 this.serviceForm.get('coupondiscount').disable();
                             } else {
                               // remove code
                             }
                         });
                     } else {
                      this.selectedService['couponcode'] = this.selectedCoupon;
                      this.selectedService['coupondiscount'] = appliedcpn;
                      this.selectedCoupon['coupondiscount'] = appliedcpn;
                      this.serviceForm.get('coupondiscount').setValue(appliedcpn);
                      this.serviceForm.get('coupondiscount').disable();
                    }
             } else {
                 super.showNotification("top", "right", "Coupon not available !!", "danger");
                 this.selectedCoupon = null;
                 this.serviceForm.get('couponcode').setValue(null);
                 this.serviceForm.get('coupondiscount').setValue(null);
             }
          
       } catch (e) {
           console.log("e", e);        
       }
    }else if(this.selectedCoupon.couponcode == 'Override Price'){
      this.serviceForm.get('discount').enable();
    }
    // console.log("this.serviceForm",this.serviceForm.value);
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
      .subscribe((datas: any[]) => {
        this.billItemList = datas.filter(a=>a.categoryid != '61dbbd1c521c4f132099f87e' &&  a.categoryid != '621e0d61ad278f15ae6620b2');
        this.billItemList.map(itm => itm.originalstock = itm.stock ? itm.stock : 0);
        this.billItemList2 = this.billItemList;
        this.billItemListGrp = this.groupBy(this.billItemList, 'category');
        this.giftCardList = datas.filter(a=>a.categoryid == '61dbbd1c521c4f132099f87e');
        this.giftCardList2 = this.giftCardList;
        this.giftCertificateList = datas.filter(a=>a.categoryid == '621e0d61ad278f15ae6620b2');
        this.giftCertificateList2 = this.giftCertificateList;
      });
  }

  getPackages() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "property.type", "searchvalue": ["package", "series"], "criteria": "in" });

    this.packageList = [];
    this.packageList2 = [];

    this._commonService
      .commonServiceByUrlMethodData('memberships/filter', 'POST', postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((datas: any[]) => {
        datas.map(a=>a.rate  = a.property.cost);
        this.packageList = datas;
        this.packageList2 = this.packageList;
      });
  }

  async getAppointments() {

    var sdate: Date = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    let postData = {};
    postData['formname'] = "appointment";
    postData['search'] = [];
    if (this.bindid) {
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });
    } else if (this.billid) {
      postData["search"].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
    } else if (this.pkid) {
      postData["search"].push({ "searchfield": "packageid", "searchvalue": this.pkid, "criteria": "eq", "datatype": "ObjectId" });
    } else {

      // var today = new Date(sdate);
      // today.setHours(0, 0, 0, 0);
      // var tommrrow = new Date(sdate);
      // tommrrow.setDate(tommrrow.getDate() + 1);
      // tommrrow.setHours(0, 0, 0, 0);
      // postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": { "$gte": today, "$lt": tommrrow }, "criteria": "eq", "datatype": "Date" });

      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }
    postData["search"].push({ "searchfield": "status", "searchvalue": ["delete","cancel" ,"deleted"], "criteria": "nin", "datatype": "text" });
  
    this.appintmentList = [];
    this.appintmentList2 = [];
    this.isLoadings['appointment'] = true;
    
    await this._appointmentService
      .AsyncGetByFilter(postData)
      .then((data: []) => {
        this.appintmentList = data;
        
        this.appintmentList.map((ap) => {
          ap.viewCancel = true;
          ap.selected = false;
          if (ap.billid && ap.billid._id) {
            ap.viewCancel = false;
          }
          ap.islock = !!ap?.property?.islock;
          ap.note = !!ap?.property?.note;
          ap.packages = !!ap?.packageid?._id;
        });
        this.appintmentList2 = this.appintmentList;
        this.isLoadings['appointment'] = false;
      }).catch(e => {
        this.isLoadings['appointment'] = false;
        console.log(e);
      });
  }

  getMoreAppointments() {

    let postData = {};
    postData['search'] = [];
    if (this.billid) {
      postData["search"].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
    }
    this.appintmentList = [];
    this.appintmentList2 = [];

    this._appointmentService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.servicecartList.forEach(srvc => {
          var app = data.find(a => a._id == srvc.appointmentid);
          app.selected = true
          this.appintmentList.push(app);
        });
         this.appintmentList.map((ap) => {
          ap.viewCancel = true;
          if (ap.billid && ap.billid._id) {
            ap.viewCancel = false;
          }
          ap.islock = !!ap?.property?.islock;
          ap.note = !!ap?.property?.note;
          ap.packages = !!ap?.packageid?._id;
        });
        this.appintmentList2 = this.appintmentList;
      });
  }

 async addStatus(status : string){
  if(this.isDisableEdit) return;
   const ind =  this.selectedStatus.indexOf(status);
    if(ind != -1) {
      this.selectedStatus.splice(ind, 1);  
    }else{
      this.selectedStatus.push(status);
    }
     await this.onStatusChanges();
  }

  async onStatusChanges() {
    if (this.appintmentList2 && this.appintmentList2.length > 0) {
      this.isLoadings['appointment'] = true;
      var statusExists: boolean = false;
      this.appintmentList = [];
      this.appintmentList2.forEach(element => {

        statusExists = false;
        if (this.selectedStatus && this.selectedStatus.length > 0) {
          var statusObj = this.selectedStatus.find(p => p == element.status);
          if (statusObj) {
            statusExists = true;
          }
        }
        if (statusExists) {
          this.appintmentList.push(element);
        }
      });
      this.isLoadings['appointment'] = false;
    }
    return;
  }

  onTabChanged(event: any) {
   
  }

  async onDateChanged() {
    await this.getAppointments();
    this.onStatusChanges();
    this.clearData();
  }

  chooseTimeslot(timeslot : any){
    // this.serviceForm.get('timeslot').setValue(timeslot);
    const timeslotgrp = (this.serviceForm.controls['timeslot'] as FormGroup);
    timeslotgrp.controls['day'].setValue(this.alltimeslotLists[0].day);
  }
  
  onClickApp(appnmt: any) {
    this.serviceForm.reset();
    this.selectedService = this.serviceList.find(a => a._id == appnmt.refid._id);
    this.selectedService['selected'] = true;
    this.providerList = [];
    this.alltimeslotLists = [];
    this.providerList = this.selectedService.staff;
    this.serviceForm.controls['refid'].setValue(this.selectedService._id);
    this.serviceForm.controls['title'].setValue(this.selectedService.title);
    this.serviceForm.controls['availability'].setValue(this.selectedService.availability);
    this.serviceForm.controls['staffavailability'].setValue(this.selectedService.staffavailability);
    this.serviceForm.controls['duration'].setValue(this.selectedService.duration);
    this.serviceForm.controls['cost'].setValue(this.selectedService.charges);
    this.serviceForm.controls['cost'].disable();
    this.serviceForm.controls['charges'].setValue(this.selectedService.charges);
    if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
      this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);
    }
    this.serviceForm.controls['taxes'].disable();
    this.serviceForm.controls['appointmentdate'].setValue(appnmt.appointmentdate);
    this.serviceForm.controls['appointmentday'].setValue(appnmt.appointmentday);
    this.onChangeProvider(appnmt.host, this.serviceForm.value);
    this.serviceForm.controls['host'].setValue(appnmt.host);
    this.serviceForm.controls['host'].disable();

    const timeslotgrp = (this.serviceForm.controls['timeslot'] as FormGroup);
    timeslotgrp.controls['day'].setValue(appnmt.timeslot.day);
    timeslotgrp.controls['starttime'].setValue(appnmt.timeslot.starttime);
    timeslotgrp.controls['endtime'].setValue(appnmt.timeslot.endtime);
    timeslotgrp.controls['starttime'].disable();
    timeslotgrp.controls['endtime'].disable();

    this.serviceForm.controls['discount'].setValue(appnmt.discount);
    this.serviceForm.controls['status'].setValue(appnmt.status);
    this.serviceForm.controls['packageid'].setValue(appnmt.packageid);
    this.serviceForm.controls['appointmentid'].setValue(appnmt._id);
    
    // this.serviceForm.controls['couponcode'].disable();
    if(appnmt.isoverridediscount){
      this.serviceForm.controls['couponcode'].setValue({couponcode : 'Override Price'});
    }
    
    if (appnmt['attendee'] && appnmt['onModel'] && !this.searchMember) {
      this.searchMember = appnmt['attendee'];
      this.searchMember['email'] = appnmt?.attendee?.property?.primaryemail;
        this.searchMember['mobile'] = appnmt?.attendee?.property?.mobile;
      this.searchMember['type'] = "";
      if(appnmt['onModel'] == 'Member'){
        this.searchMember.type = 'M';
      }else if(appnmt['onModel'] == 'Prospect'){
        this.searchMember.type = 'C';
      }else{
        this.searchMember.type = 'U';
      }
    } 
    // if (!this.isDisableEdit) {
      // this.getAppointmentById(appnmt._id);
    // }
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
    } else if (status == 'checkinguest') {
      return '#28a745';
    }
  }

  async getServices() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "type", "searchvalue": "appointmentservice", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });


    this.serviceList = [];
    await this._serviceService
      .GetByAsyncFilter(postData)
      .then((data: []) => {
        this.serviceList = data;
        this.serviceList.map((val: any) => val['categoryid'] = val['category'] ? val['category']['_id'] : '')
        this.serviceList.map((val: any) => val['categoryname'] = val['category'] && val['category']['property']['name'] ? val['category']['property']['name'] : '')
        this.serviceList2 = this.serviceList;
        this.serviceListGrp = this.groupBy(this.serviceList, 'categoryid');
      });
  }

  async getAppointmentById(id: any) {
    try {
      this.isLoadingCart = true;
      this.servicecartList = [];
      this.cartItemList = [];
      
      var appRes = this.appintmentList.find(a => a._id == id);
      
      this.appintmentList.map(val => val.selected = false);
      this.billItemList.map(val => val.quantity = 0);
      this.serviceList.map(val => val.selected = false);

      this._billModel._id = '';
      this._billModel.status = '';

      if (appRes['attendee'] && appRes['onModel']) {
        this.searchMember = appRes['attendee'];
        this.searchMember['email'] = appRes?.attendee?.property?.primaryemail;
        this.searchMember['mobile'] = appRes?.attendee?.property?.mobile;
        this.searchMember['type'] = "";
        if(appRes['onModel'] == 'Member'){
          this.searchMember.type = 'M';
        }else if(appRes['onModel'] == 'Prospect'){
          this.searchMember.type = 'C';
        }else{
          this.searchMember.type = 'U';
        }
      }

      this.getIOUAmount();
      if (appRes['billid']) {
        this.billid = appRes['billid']['_id'];
        this._billModel._id = '';
        this._billModel.status = '';

        var billRes;
        billRes = await this._billService.AsyncGetById(appRes['billid']['_id']) as any;                        // billRes

        this._billModel.docnumber = billRes['docnumber'];
        this._billModel._id = billRes['_id'];
        this._billModel.status = billRes['status'];
        this.paidamount = billRes['paidamount'];
        this.balance = billRes['balance'];
        this.status = billRes['status'];

        if (billRes.property && billRes.property['packagediscount']) {
          this.packagediscount = billRes.property['packagediscount'];
        }

        if (appRes['billid']['services'] && appRes['billid']['services'].length > 0) {
          appRes['billid']['services'].forEach(srvc => {
            var service = this.serviceList.find(a => a._id == srvc['refid']['_id']);
            service['selected'] = true;
            this.servicecartList.push({
              'appointmentdate': srvc.appointmentdate,
              'appointmentid': srvc.appointmentid._id,
              'appointmentday': this.daysList[new Date(srvc.appointmentdate).getDay()],
              'availability': srvc.refid.availability,
              'staffavailability': srvc.refid.staffavailability,
              'duration': srvc.refid.duration,
              'taxes': srvc.refid.taxes,
              'host': srvc.host,
              'refid': srvc.refid._id,
              'cost': srvc.cost,
              'charges': srvc.cost,
              'status': srvc.appointmentid.status ? srvc.appointmentid.status : srvc.status,
              'timeslot': {
                "day": srvc.timeslot.day,
                "starttime": srvc.timeslot.starttime,
                "endtime": srvc.timeslot.endtime
              },
              'title': service['title'],
              'couponcode': srvc['couponcode'],
              'coupondiscount': srvc['coupondiscount'],
              'isoverridediscount': srvc?.isoverridediscount,
              'discount': srvc.discount - (srvc['coupondiscount'] * 1),
              'property': srvc.appointmentid['property'],
            });
          });
          this.servicecartList.forEach(srvc => {
            var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
            if (apnmt) {
              apnmt.selected = true;
            }
          });
        }
        if (appRes['billid']['items'] && appRes['billid']['items'].length > 0) {
          appRes['billid']['items'].forEach(itm => {
            var billitem
            if(itm.to){
              billitem = this.giftCertificateList.find(a => a._id == itm.item._id);
            } else if(itm.itemnumber){
              billitem = this.giftCardList.find(a => a._id == itm.item._id);
            }  else{
              billitem = this.billItemList.find(a => a._id == itm.item._id);
            }
            if (billitem) {
              billitem['item'] = itm.item;
              billitem['itemid'] = itm.item._id;
              billitem['sale'] = itm.item.sale;
              billitem['quantity'] = itm.quantity;
              billitem['couponcode'] = itm?.couponcode;
              billitem['coupondiscount'] = itm?.coupondiscount;
              billitem['discount'] = itm?.item?.sale?.discounttype == 'Fixed' ?  itm?.item?.sale?.discount : itm?.item?.sale?.discounttype  ==  'Percentage' ? itm?.item?.sale?.discount : 0;
              billitem['seller'] = itm?.seller;
              billitem['to'] = itm?.to;
              billitem['valid'] = itm?.valid;
              billitem['used'] = itm?.used;
              billitem['itemnumber'] = itm?.itemnumber;
              billitem['qrcode'] = itm?.qrcode;
              this.cartItemList.push(billitem);
            }
          });
        }

        setTimeout(() => {
          this.makeModel();
          this.subtotal = billRes.amount;
          this.discount = billRes.discount;
          this.grandtotal = billRes.totalamount;
          this.taxamount = billRes.taxamount;
          this.taxdetail = billRes.taxdetail;
          this.taxesList = [];
          this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance , bill : billRes });
          this.isLoadingCart = false;
        }, 2000);

      } else {

        var srvc = this.serviceList.find(a => a._id == appRes['refid']['_id']);
        srvc['selected'] = true;
        this.servicecartList.push({
          'appointmentdate': appRes.appointmentdate,
          'appointmentid': appRes._id,
          'appointmentday': this.daysList[new Date(appRes.appointmentdate).getDay()],
          'availability': appRes.refid.availability,
          'staffavailability': appRes.refid.staffavailability,
          'duration': appRes.refid.duration,
          'taxes': appRes.refid.taxes,
          'host': srvc.host ? srvc.host : appRes.host,
          'refid': appRes.refid._id,
          'discount': 0,
          'deposit': appRes.deposits ? appRes.deposits.paidamount : 0,
          'cost': appRes.refid.charges,
          'charges': appRes.refid.charges,
          'status': appRes.status,
          'timeslot': appRes.timeslot ? {
            "day": appRes.timeslot.day,
            "starttime": appRes.timeslot.starttime,
            "endtime": appRes.timeslot.endtime
          } : {},
          'title': appRes.refid['title'],
          'property': appRes.property,
        });

        this.servicecartList.forEach(srvc => {
          var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
        if (appRes['resourceids'] && appRes['resourceids'].length > 0) {
          let resourceids = [...appRes['resourceids']].filter(a=>a?.onModel == 'Billitem' && !!a?.product);
          let billitem = {};
          resourceids.forEach(itm => {
                billitem = {};
                billitem['item'] = itm?.id;
                billitem['itemid'] = itm?.id?._id;
                billitem['sale'] = itm?.id?.sale;
                billitem['quantity'] = itm?.quantity ? itm?.quantity : 1;
                billitem['discount'] = itm?.id?.sale?.discounttype == 'Fixed' ?  itm?.id?.sale?.discount : itm?.id?.sale?.discounttype  ==  'Percentage' ? itm?.id?.sale?.discount : 0;
                this.cartItemList.push(billitem);
          });
        }

        
        await this.getgroupappointments(appRes);
        
        setTimeout(() => {
          this.makeModel();
          this.GetBillDetail(this._billModel);
          // this.subtotal = appRes.charges;
          // this.discount = 0;
          // this.grandtotal = appRes.charges;
          // this.taxamount = 0;
          // this.taxdetail = null;
          // this.taxesList = [];
          // this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance });
          this.isLoadingCart = false;
        }, 2000);
      }

      this.selectedDate = new Date(appRes['appointmentdate']);      

    } catch (e) {
      console.log("e", e);
      this.isLoadingCart = false;
    }
  }

  async getgroupappointments(appRes: any) {

    var groupappointments = [];
    
    if (appRes.property && appRes.property.group && appRes.attendee._id == appRes.property.group.billerid) {
      let postData = {};
      postData['formname'] = "appointment";
      postData['search'] = [];
      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": appRes.appointmentdate, "criteria": "fullday", "datatype": "Date" });
      postData["search"].push({ "searchfield": "status", "searchvalue": ["delete", "cancel", "deleted"], "criteria": "nin", "datatype": "text" });
      postData["search"].push({ "searchfield": "property.group.billerid", "searchvalue": appRes.attendee._id, "criteria": "eq", "datatype": "text" });

      await this._appointmentService
        .AsyncGetByFilter(postData)
        .then((data: []) => {
          
          groupappointments = data.filter((app: any) => {
            return app.attendee._id != app.property.group.billerid;
          });
          groupappointments.forEach((grouapp) => {
            var srvc = this.serviceList.find(a => a._id == grouapp['refid']['_id']);
            srvc['selected'] = true;
            this.servicecartList.push({
              'appointmentdate': grouapp.appointmentdate,
              'appointmentid': grouapp._id,
              'appointmentday': this.daysList[new Date(grouapp.appointmentdate).getDay()],
              'availability': grouapp.refid.availability,
              'staffavailability': grouapp.refid.staffavailability,
              'duration': grouapp.refid.duration,
              'taxes': grouapp.refid.taxes,
              'host': srvc.host ? srvc.host : grouapp.host,
              'refid': grouapp.refid._id,
              'discount': 0,
              'deposit': grouapp.deposits ? grouapp.deposits.paidamount : 0,
              'cost': grouapp.refid.charges,
              'charges': grouapp.refid.charges,
              'status': grouapp.status,
              'timeslot': grouapp.timeslot ? {
                "day": grouapp.timeslot.day,
                "starttime": grouapp.timeslot.starttime,
                "endtime": grouapp.timeslot.endtime
              } : {},
              'title': grouapp.refid['title'],
              'property': grouapp.property,
            });

            this.servicecartList.forEach(srvc => {
              var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
              if (apnmt) {
                apnmt.selected = true;
              }
            });

            if (grouapp['resourceids'] && grouapp['resourceids'].length > 0) {
              let billitem = {};
              grouapp['resourceids'].forEach(itm => {
                if (itm?.onModel == 'Billitem' && itm?.quantity && itm?.quantity > 0) {
                  billitem['item'] = itm?.id;
                  billitem['itemid'] = itm?.id?._id;
                  billitem['sale'] = itm?.id?.sale;
                  billitem['quantity'] = itm?.quantity;
                  billitem['discount'] = itm?.id?.sale?.discounttype == 'Fixed' ? itm?.id?.sale?.discount : itm?.id?.sale?.discounttype == 'Percentage' ? itm?.id?.sale?.discount : 0;
                  this.cartItemList.push(billitem);
                }
              });
            }
          });
        })
    }

  }

 async getAppointmentbyPackageId(id : any){
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "property.linkid", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" });
    
    var groupappointments = [];
    groupappointments = this.appintmentList.filter(a => {
      if (a.property && a.property.group && a._id == a.property.group.billerid){
        return a;
      }
    });
    this.appintmentList = [];
    this.appintmentList2 = [];
    await this._appointmentService
      .AsyncGetByFilter(postData)
      .then((data: []) => {
  
        if(data.length > 0){
        this.appintmentList = data;
        this.appintmentList.map((ap) => {
          ap.viewCancel = true;
          if (ap.billid && ap.billid._id) {
            ap.viewCancel = false;
          }
          ap.islock = !!ap?.property?.islock;
          ap.note = !!ap?.property?.note;
          ap.packages = !!ap?.packageid?._id;
        });
        this.appintmentList2 = this.appintmentList;
        this.servicecartList = [];
        this.packagecartList = [];
        let packages = {} , bill;
        packages = this.packageList.find(a=>a._id == this.appintmentList[0].packageid._id);
        
        
        bill = this.appintmentList[0].billid;
        if(bill){
          this._billModel._id = '';
          this._billModel.status = '';
          this._billModel.docnumber = bill['docnumber'];
          this._billModel._id = bill['_id'];
          this._billModel.status = bill['status'];
          if (bill.property && bill.property['packagediscount']) {
            this.packagediscount = bill.property['packagediscount'];
          }
          this._propertyobjectModel = bill.property;

          bill['items'].forEach(itm => {
            var billitem
            if(itm.itemnumber){
              billitem = this.giftCardList.find(a => a._id == itm.item._id);
            }else{
              billitem = this.billItemList.find(a => a._id == itm.item._id);
            }
            if (billitem) {
              billitem['item'] = itm.item;
              billitem['itemid'] = itm.item._id;
              billitem['sale'] = itm.item.sale;
              billitem['quantity'] = itm.quantity;
              billitem['couponcode'] = itm?.couponcode;
              billitem['coupondiscount'] = itm?.coupondiscount;
              billitem['discount'] = itm?.item?.sale?.discounttype == 'Fixed' ?  itm?.item?.sale?.discount : itm?.item?.sale?.discounttype  ==  'Percentage' ? itm?.item?.sale?.discount : 0;
              billitem['seller'] = itm?.seller;
              billitem['to'] = itm?.to;
              billitem['valid'] = itm?.valid;
              billitem['used'] = itm?.used;
              billitem['itemnumber'] = itm?.itemnumber;
              billitem['qrcode'] = itm?.qrcode;
              this.cartItemList.push(billitem);
            }
          });
        }
       if (this.appintmentList[0]['attendee'] && this.appintmentList[0]['onModel']) {
          this.searchMember = this.appintmentList[0]['attendee'];
          this.searchMember['type'] = "";
          this.searchMember['email'] = this.appintmentList[0].attendee?.property?.primaryemail;
          this.searchMember['mobile'] = this.appintmentList[0].attendee?.property?.mobile;
          if(this.appintmentList[0]['onModel'] == 'Member'){
            this.searchMember.type = 'M';
          }else if(this.appintmentList[0]['onModel'] == 'Prospect'){
            this.searchMember.type = 'C';
          }else{
            this.searchMember.type = 'U';
          }
        }
        
        packages['packageid'] = packages['_id'];
        packages['quantity'] = 1;
        packages['bookingids'] = [];
        
        this.appintmentList.forEach(appointment => {
          packages['bookingids'].push({bookingid : appointment , onModel : 'Appointment'});
        });
        this.packagecartList.push(packages);
        this.makeModel();
        this.GetBillDetail(this._billModel);
      }
        this.isLoadingCart = false;
      }).catch((e)=>{
        console.error("e", e);
        throw e;
      });
  }

  async getBillbyId(id: any) {
    try {
      this.isLoadingCart = true;
      this.servicecartList = [];
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';

      var billRes;
      billRes = await this._billService.AsyncGetById(id) as any;
      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.paidamount = billRes['paidamount'];
      this.balance = billRes['balance'];
      this.status = billRes['status'];

      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }

      this._propertyobjectModel = billRes.property;

      if (billRes['customerid'] && billRes['onModel']) {
        this.searchMember = billRes['customerid'];
        this.searchMember['email'] = billRes?.customerid?.property?.primaryemail;
        this.searchMember['mobile'] = billRes?.customerid?.property?.mobile;
        this.searchMember['type'] = "";
        if(billRes['onModel'] == 'Member'){
          this.searchMember.type = 'M';
        }else if(billRes['onModel'] == 'Prospect'){
          this.searchMember.type = 'C';
        }else{
          this.searchMember.type = 'U';
        }
      }

      if (billRes['services'] && billRes['services'].length > 0) {
        billRes['services'].forEach(srvc => {
          var service = this.serviceList.find(a => a._id == srvc['refid']['_id']);
          service['selected'] = true;
          this.servicecartList.push({
            'appointmentdate': srvc.appointmentdate,
            'appointmentid': srvc?.appointmentid?._id,
            'appointmentday': this.daysList[new Date(srvc.appointmentdate).getDay()],
            'availability': srvc.refid.availability,
            'staffavailability': srvc.refid.staffavailability,
            'duration': srvc.refid.duration,
            'taxes': srvc.refid.taxes,
            'host': srvc.host ,
            'refid': srvc.refid._id,
            'cost': srvc.cost,
            'charges': srvc.cost,
            'status': srvc.appointmentid.status ? srvc.appointmentid.status : srvc.status,
            'timeslot': {
              "day": srvc.timeslot.day,
              "starttime": srvc.timeslot.starttime,
              "endtime": srvc.timeslot.endtime
            },
            'title': service['title'],
            'couponcode': srvc['couponcode'],
            'coupondiscount': srvc['coupondiscount'],
            'isoverridediscount': srvc?.isoverridediscount,
            'property': srvc.appointmentid.property,
            'discount': srvc.discount - (srvc['coupondiscount'] * 1),
          });
          this.selectedDate = new Date(srvc.appointmentdate);
        });
        await this.getAppointments();
        this.appintmentList = [];
        this.servicecartList.forEach(srvc => {
          var app = this.appintmentList2.find(a => a._id == srvc.appointmentid);
          app.selected = true
          this.appintmentList.push(app);
        });
      }
      if (billRes['items'] && billRes['items'].length > 0) {
        billRes['items'].forEach(itm => {
          var billitem;
          if(itm.to){
            billitem = this.giftCertificateList.find(a => a._id == itm.item._id);
          }else if(itm.itemnumber){
            billitem = this.giftCardList.find(a => a._id == itm.item._id);
          }   else{ 
            billitem = this.billItemList.find(a => a._id == itm.item._id);
          }
          if (billitem) {
            billitem['item'] = itm.item;
            billitem['itemid'] = itm.item._id;
            billitem['sale'] = itm.item.sale;
            billitem['quantity'] = itm.quantity;
            billitem['couponcode'] = itm?.couponcode;
            billitem['coupondiscount'] = itm?.coupondiscount;
            billitem['discount'] = itm?.item?.sale?.discounttype == 'Fixed' ?  itm?.item?.sale?.discount : itm?.item?.sale?.discounttype  ==  'Percentage' ? itm?.item?.sale?.discount : 0;
            billitem['seller'] = itm?.seller;
            billitem['to'] = itm?.to;
            billitem['valid'] = itm?.valid;
            billitem['used'] = itm?.used;
            billitem['itemnumber'] = itm?.itemnumber;
            billitem['qrcode'] = itm?.qrcode;

            this.cartItemList.push(billitem);
          }
        });
      }

      if (billRes['packages'] && billRes['packages'].length > 0) {
        billRes['packages'].forEach(itm => {
          if (itm.bookingids) {
            this.packagecartList.push({ ...itm.packageid , bookingids : itm.bookingids , 'packageid': itm.packageid._id, 'rate': itm.packageid.property.cost, 'quantity': itm['quantity']  });
          }
        });
      }
      // console.log("this.packagecartList 2 ",this.packagecartList)
      this.getIOUAmount();
      setTimeout(() => {
        this.makeModel();
        this.subtotal = billRes.amount;
        this.discount = billRes.discount;
        this.grandtotal = billRes.totalamount;
        this.taxamount = billRes.taxamount;
        this.taxdetail = billRes.taxdetail;
        this.taxesList = [];
        this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance ,bill : billRes });
        this.isLoadingCart = false;
      }, 2000);
    } catch (e) {
      console.log("e",e);
      this.isLoadingCart = false;
    }
  }
  

  async generateQR(value : number){
    let postData = {};
    postData['value'] = value.toString();
    return this._commonService.commonServiceByUrlMethodDataAsync('common/generateqrcode',"POST",postData);
  }

   ondGiftCrtfAdd(){
    if(!this.selectedItem.quantity || !this.selectedItem.valid || !this.selectedItem.to){
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    this.selectedItem['stock'] -= this.selectedItem.quantity;
    let giftobj = {};
    giftobj["used"] = false;
    giftobj["valid"] = this.selectedItem.valid;
    giftobj["to"] = this.selectedItem.to;
    giftobj["qrcode"]  = this.selectedItem?.qrcode;
    giftobj['itemnumber'] = this.selectedItem?.itemnumber;
    let obj = { 'item': this.selectedItem, 'itemid': this.selectedItem._id, 'sale': this.selectedItem.sale, 'quantity': this.selectedItem['quantity'] , 'discount': this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0, ...giftobj };
    let ind = this.cartItemList.findIndex(a => a.itemid == this.selectedItem._id);
    
    if(ind < 0){
      this.cartItemList.push(obj);
    }else{
      this.cartItemList.splice(ind,1,obj);
    }
    $("#gctClose").click();
    this.makeModel();
    this.GetBillDetail(this._billModel);
  }

  onGiftCardAdd(){
    if(this.selectedItem.itemnumber.length < 6){
      super.showNotification("top", "right", "Gitcard should be upto 6 digit !!", "danger");
      return;
    }
    this.selectedItem['stock'] -= 1;
    let giftobj = {}; 
    giftobj["itemnumber"] = this.selectedItem.itemnumber;
    giftobj["used"] = false;
    giftobj["valid"] = this.selectedItem.valid;
     
    this.cartItemList.push({ 'item': this.selectedItem, 'itemid': this.selectedItem._id, 'sale': this.selectedItem.sale, 'quantity': this.selectedItem['quantity'] , 'discount': this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0, ...giftobj });
    
    $("#gcClose").click();
    this.makeModel();
    this.GetBillDetail(this._billModel);
  }


async  onAdd(billitem: any) {
    this.selectedItem = billitem;
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }else if(billitem.enableinventory && billitem.stock <= 0){
      super.showNotification("top", "right", "Item out of Stock !!", "danger");
      return;
    }
    if(billitem.categoryid  == "61dbbd1c521c4f132099f87e"){
      this.selectedItem['itemnumber'] = null;
      this.selectedItem["valid"] = moment().add(billitem?.property?.expires_after,'days');
      this.selectedItem['quantity'] = 1;
      $("#giftcardmodal").click();
      return;
    } else if(billitem.categoryid  == "621e0d61ad278f15ae6620b2"){
      this.selectedItem['to'] = this.searchMember?.primaryemail;
      this.selectedItem['content'] = billitem?.property?.content;
      this.selectedItem["used"] = false;
      this.selectedItem["valid"] = moment().add(billitem?.property?.expires_after,'days');
      this.selectedItem['quantity'] = 1;
      this.selectedItem['itemnumber'] = Math.floor(Math.pow(10, 10) + Math.random() * 9 * Math.pow(10, 10)).toString();
      let qrcode  = await this.generateQR(this.selectedItem['itemnumber']);
      this.selectedItem["qrcode"] = qrcode;
      $("#giftcertficatemodal").click();
      return;
    }
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      if (!cartItem) {
        billitem['quantity'] = 1;
        billitem['stock'] -= 1;
        this.cartItemList.push({ 'item': billitem, 'itemid': billitem._id, 'sale': billitem.sale, 'quantity': billitem['quantity'] ,  'discount': billitem?.sale?.discounttype == 'Fixed' ?  billitem?.sale?.discount : billitem?.sale?.discounttype  ==  'Percentage' ? billitem?.sale?.discount : 0 });
      } else {
        billitem['quantity'] = cartItem['quantity'];
        billitem['quantity'] += 1;
        billitem['stock'] -= 1;
        cartItem['quantity'] = billitem['quantity'];
        cartItem['stock'] = billitem['stock'];
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
      billitem['quantity'] -= 1;
      billitem['stock'] += 1;
      cartItem['quantity'] = billitem['quantity'];
      cartItem['stock'] = billitem['stock'];

      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

  onRemove(billitem: any, items : any) {
    try {
      let ind = this.cartItemList.findIndex(a => a.itemid == billitem._id);
      this.cartItemList.splice(ind, 1);
      var item;
      if(items?.to){
        item = this.giftCertificateList.find(a => a._id == billitem._id);
      }else if(items?.itemnumber){
        item = this.giftCardList.find(a => a._id == billitem._id);
      }else{
        item = this.billItemList.find(a => a._id == billitem._id);
      }
      item['quantity'] = 0;
      item['stock'] = billitem.originalstock;
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }
  
  async onstaticqty(qty : number){
    if(qty <= 0) {
      this.selectedItem['quantity'] = 1;
      return;
    }
    let discount = this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0;
    let totalcost = (this.selectedItem?.sale?.rate - discount) * this.selectedItem?.quantity;
    this.selectedItem['totalcost'] = totalcost;
    
    if(this.selectedCoupon && this.selectedCoupon._id){
      await this.onCouponSelect(this.selectedCoupon);
    }
  }

  onEditPrd(items : any , modal : boolean){
    if(items?.quantity <= 0) {
      items.quantity = 1;
      return;
    }
    this.selectedCoupon = items?.couponcode;
    let discount = items?.item?.sale?.discounttype == 'Fixed' ?  items?.item?.sale?.discount : items?.item?.sale?.discounttype  ==  'Percentage' ? items?.item?.sale?.discount : 0;
    let totalcost = (items?.item?.sale?.rate - discount) * items?.quantity;
    if(this.selectedCoupon){
      this.selectedCoupon['coupondiscount'] = items?.coupondiscount ? items?.coupondiscount : 0;
      this.selectedCoupon['finaltotalcost'] = totalcost - (items?.coupondiscount ? (items?.coupondiscount * items?.quantity) : 0)
    }
    
    this.selectedItem = {...items.item , 'quantity' : items?.quantity , 'totalcost' : totalcost , 'discount' : discount , 'valid' : items?.valid , 'to' : items?.to , 'itemnumber' : items?.itemnumber , 'qrcode' : items?.qrcode };
    this.provider_fields.dbvalue = items?.seller?._id;
    

    if(!modal) return;
    if(items?.to){
      $("#giftcertficatemodal").click();
    }else if(items?.itemnumber){
      $("#giftcardmodal").click();
    }else{
      $("#productModal").click();
    }
    
  }
  
 onChangeQty(val : number ,billitem : any){
  var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
  if(billitem?.enableinventory && val > billitem?.stock){
    this.showNotification('top', 'right', `quantity should not be more than stocks(${billitem?.originalstock}) !!`, 'danger');
  }
  billitem['quantity'] = val;
  billitem['stock'] = billitem.originalstock;
  billitem['stock'] -= val;
  cartItem['quantity'] = billitem['quantity'];
  cartItem['stock'] = billitem['stock'];

  this.onEditPrd(cartItem, false);
  this.makeModel();
  this.GetBillDetail(this._billModel);
}

  onChangeProvider(provider: any, serviceFormValue: any) {
    this.alltimeslotLists = [];
    this.alltimeslotLists = this.generatingTS(serviceFormValue, provider); 
  }

 async getSubmittedData(event : any[]) {
    // console.log('event with generated appointments =>',event);
    let savedObj = {};
    event.forEach(appnt => {
      savedObj = {
        'appointmentdate': appnt.appointmentdate,
        'appointmentid' : appnt._id,
        'attendee' : appnt?.attendee?._id,
        'onModel' : appnt?.onModel,
        'appointmentday': this.daysList[new Date(appnt.appointmentdate).getDay()],
        'availability': appnt?.refid?.availability,
        'staffavailability': appnt?.refid.staffavailability,
        'host' : appnt?.host,
        'refid' : appnt?.refid?._id,
        'timeslot' : appnt?.timeslot,
        'cost' : appnt?.charges,
        'charges' : appnt?.charges,
        'taxes' : [],
        'discount': 0,
        'status' : appnt?.status,
        'title' : appnt?.refid?.title,
        'duration' : appnt?.refid?.duration,
      };
      this.servicecartList.push(savedObj);
    });
    await this.getAppointments();
    this.makeModel();
    this.GetBillDetail(this._billModel);
    
    this.servicecartList.forEach(srvc => {
      var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
      if (apnmt) {
        apnmt.selected = true;
      }
    });
    this.addAppointmnet = !this.addAppointmnet;
    $("#appointmentClose").click();
  }


  onClickServiceNew(service : any){
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }
    this.addAppointmnet = !this.addAppointmnet;
    this.selectedService = service;
    this.selectInfo = {};
    this.selectInfo.refid = service;
    this.selectInfo.customerid = this.searchMember;

    $("#newsrvcModal").click();
  }

  onClickService(refid: any) {
    this.serviceForm.reset();

    this.selectedService = this.serviceList.find(a => a._id == refid);
    this.selectedService['selected'] = true;

    this.providerList = [];
    this.providerList = this.selectedService.staff;
    this.alltimeslotLists = [];

    var date = this.selectedDate && this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    var day = this.daysList[date.getDay()];
    var cartItem = this.servicecartList.find(a => a.refid == refid);

    this.serviceForm.controls['refid'].setValue(this.selectedService._id);
    this.serviceForm.controls['title'].setValue(this.selectedService.title);
    this.serviceForm.controls['availability'].setValue(this.selectedService.availability);
    this.serviceForm.controls['staffavailability'].setValue(this.selectedService.staffavailability);
    this.serviceForm.controls['duration'].setValue(this.selectedService.duration);
    this.serviceForm.controls['cost'].setValue(this.selectedService.charges);
    this.serviceForm.controls['cost'].disable();
    
    this.serviceForm.controls['charges'].setValue(this.selectedService.charges);
    if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
      this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);
    }
    this.serviceForm.controls['taxes'].disable();
    
    if (!cartItem) {
      this.serviceForm.controls['appointmentdate'].setValue(date);
      this.serviceForm.controls['appointmentday'].setValue(day);
      this.serviceForm.controls['discount'].setValue(0);
      this.serviceForm.controls['host'].setValue('');
      this.serviceForm.controls['status'].setValue('requested');
      if (this.selectedService['availability']['days'].includes(day)) {
        this.alltimeslotLists = this.generatingTS(this.serviceForm.value);
      }
      this.serviceForm.controls['discount'].disable();
    } else {
      this.serviceForm.controls['appointmentdate'].setValue(cartItem.appointmentdate);
      this.serviceForm.controls['appointmentday'].setValue(cartItem.appointmentday);
      this.onChangeProvider(cartItem.host, this.serviceForm.value);
      this.serviceForm.controls['host'].setValue(cartItem.host);
      const timeslotgrp = (this.serviceForm.controls['timeslot'] as FormGroup);
      timeslotgrp.controls['day'].setValue(cartItem.timeslot.day);
      timeslotgrp.controls['starttime'].setValue(cartItem.timeslot.starttime);
      timeslotgrp.controls['endtime'].setValue(cartItem.timeslot.endtime);
      this.serviceForm.controls['discount'].setValue(cartItem.discount);
      this.serviceForm.controls['discount'].disable();
      this.serviceForm.controls['status'].setValue(cartItem.status);
      this.serviceForm.controls['discountreason'].setValue(cartItem?.property?.discountreason);
      this.discount_fields.visible = false;
      this.discount_fields.dbvalue = cartItem?.property?.discountreason;
      
      if(cartItem.couponcode){
        this.selectedCoupon = cartItem.couponcode;
        this.selectedCoupon['coupondiscount'] = cartItem.coupondiscount;
        this.serviceForm.controls['couponcode'].setValue(cartItem.couponcode);
        this.serviceForm.controls['coupondiscount'].setValue(cartItem.coupondiscount);
        this.serviceForm.get('coupondiscount').disable();
      }
      if(cartItem.isoverridediscount){
        this.serviceForm.controls['couponcode'].setValue({couponcode : 'Override Price'});
        this.serviceForm.controls['discount'].enable();
      }

      this.serviceForm.controls['host'].disable();
      this.serviceForm.controls['status'].disable();
      
      // this.serviceForm.controls['couponcode'].disable();
      timeslotgrp.controls['starttime'].disable();
      timeslotgrp.controls['endtime'].disable();
      setTimeout(() => {
        this.discount_fields.visible = true;
      }, 200);
    }
  }

  closeService(service: any) {
    this.serviceForm.reset();
    this.s_submitted = false;
    service['selected'] = false;
    var cartItem = this.servicecartList.find(a => a.refid == service._id);
    if (cartItem) {
      service['selected'] = true;
    }
  }

  async onSubmitService(savedService: any, valid: boolean) {
    this.s_submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }
    savedService = this.serviceForm.getRawValue();
    savedService['attendee'] = this.searchMember._id;
    if (this.searchMember.type == 'M') {
      savedService['onModel'] = "Member";
    } else if (this.searchMember.type == 'C') {
      savedService['onModel'] = "Prospect";
    } else if (this.searchMember.type == 'U') {
      savedService['onModel'] = "User";
    } else {
      savedService['onModel'] = "User";
    }
    savedService['host'] = savedService['host']['_id'];
    if(savedService.packageid){
      this.updatePackageAppointment(savedService);
    }
    if(!savedService['property']){
      savedService['property'] = {};
    }

    if(savedService?.couponcode?.couponcode == 'Override Price'){
      savedService['couponcode'] = null;
      savedService['isoverridediscount'] = true;
    }
    if(savedService.discountreason && savedService.discountreason.autocomplete_id){
      savedService['property']['discountreason'] = savedService.discountreason.autocomplete_id;
    }

    var cartItem = this.servicecartList.find(a => a.refid == savedService.refid);
    this.disableBtn = true;
    console.log("savedService",savedService)
    if (!cartItem) {
      this._appointmentService
        .AsyncAdd(savedService)
        .then(async (res: any) => {
              savedService['appointmentid'] = res._id;
              savedService['host'] = res.host;
              this.servicecartList.push(savedService);
              await this.getAppointments();
              this.makeModel();
              this.GetBillDetail(this._billModel);
              this.disableBtn = false;
              $("#closeservice").click();
              this.serviceForm.reset();
              this.servicecartList.forEach(srvc => {
                var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
                if (apnmt) {
                  apnmt.selected = true;
                }
              });
        }).catch((e) => {
          this.disableBtn = false;
        });
    } else {
      this._appointmentService
        .AsyncUpdate(cartItem.appointmentid, savedService)
        .then(async (res: any) => {
            savedService['appointmentid'] = res._id;
            savedService['host'] = res.host;
            var i = this.servicecartList.findIndex(a => a.refid == savedService.refid);
            this.servicecartList.splice(i, 1, savedService);
            await this.getAppointments();
            this.makeModel();
            this.GetBillDetail(this._billModel);
            this.disableBtn = false;
            $("#closeservice").click();
            this.serviceForm.reset();
            this.servicecartList.forEach(srvc => {
              var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
              if (apnmt) {
                apnmt.selected = true;
              }
            }); 
        }).catch((e) => {
          this.disableBtn = false;
        });
    }
  }

  onRemoveService(service: any) {

    service['selected'] = false;
    var appointmentid = service['appointmentid'];

    this.disableBtn = true;
    this._appointmentService
      .AsyncDelete(appointmentid)
      .then(async (res: any) => {
        var ind = this.servicecartList.findIndex(a => a.refid == service._id);
        this.servicecartList.splice(ind, 1);
        this.makeModel();
        this.GetBillDetail(this._billModel);
        this.disableBtn = false;
        await this.getAppointments();

        this.servicecartList.forEach(srvc => {
          var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
        var srvc = this.serviceList.find(a => a._id == service['refid'])
        srvc.selected = false;
      }).catch((e) => {
        this.disableBtn = false;
      });
  }

  updatePackageAppointment(value : any){
    
    this.disableBtn = true;
    this._appointmentService
        .AsyncUpdate(value.appointmentid, value)
        .then(async (res: any) => {
          if (this.billid) {
            await this.getBillbyId(this.billid);
          } else if (this.pkid) {
            await this.getAppointmentbyPackageId(this.pkid);
          } 
          this.makeModel();
          this.GetBillDetail(this._billModel);
          this.disableBtn = false;
          $("#closeservice").click();
        }).catch((e) => {
          this.disableBtn = false;
        });
  }

  onRemoveApp(app: any) {

    const varTemp = this;
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
    }).then((result) => {
      if (result.value) {

        varTemp.disableBtn = true;

        varTemp._appointmentService
          .AsyncDelete(app._id)
          .then(async (data) => {
            if (data) {
              varTemp.showNotification('top', 'right', 'Appointment deleted successfully !!', 'success');
              var ind = varTemp.servicecartList.findIndex(a => a.refid == app.refid._id);
              varTemp.servicecartList.splice(ind, 1);
              varTemp.makeModel();
              varTemp.GetBillDetail(varTemp._billModel);
              varTemp.disableBtn = false;
              await varTemp.getAppointments();

              varTemp.servicecartList.forEach(srvc => {
                var apnmt = varTemp.appintmentList.find(a => a._id == srvc._id);
                if (apnmt) {
                  apnmt.selected = true;
                }
              });

              var serv = this.serviceList.find(a => a._id == data['refid']['_id']);
              if (serv) {
                serv.selected = false;
              }
            }
          }).catch((e) => {
            varTemp.disableBtn = false;
            varTemp.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          });
      }
    });
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

    this._billModel.packages = [];
    this._billModel.packages = this.packagecartList;
     
    this._billModel.amount = this.subtotal;
    this._billModel.totalamount = this.grandtotal;
    this.isLoadingCart = false;
  }

  GetBillDetail(model: any) {
    console.log("model",model);
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
          this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance });
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

  setNewPayment(){
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

  onSearchGCR() {
    var searchItem = this.searchBox.value;
    if (searchItem && searchItem != '') {
      this.searchBox.index = 0;
      var temparray = [];
      for (let i = 0; i < this.giftCertificateList2.length; i++) {
        if (this.giftCertificateList2[i].itemname.toLowerCase().indexOf((searchItem).toLowerCase()) > -1) {
          temparray.push(this.giftCertificateList2[i]);
        }
      }
      var filterdata = this.giftCertificateList2.filter(a => a.itemname == searchItem);
      if (filterdata && filterdata.length > 0) {
        this.giftCertificateList = filterdata;
      } else {
        this.giftCertificateList = temparray;
      }
    } else {
      this.giftCertificateList = this.giftCertificateList2;
    }
  }

  inputModelChangeValue(value : any) {
    this.searchMember = this.memberControl.value;
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
          } else if (data && !Array.isArray(data)) {
            this.outstandingamount = data.outstandingamount ? data.outstandingamount : 0
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
    this.getIOUAmount();
  }

  redirecttoURL(event: any) {
    this._router.navigate([`/pages/sale-module/multiple-bill/bill-service/` + event._id]);
  }

  async onNewBill() {
    try {
      var billRes;
      billRes = await this.onSaveBill(undefined);
      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill made successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.paidamount = billRes['paidamount'];
        this.balance = billRes['balance'];
        this.status = billRes['status'];
        await this.getAppointments();
        this.servicecartList.forEach(srvc => {
          var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
      }
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableBtn = false;
    }
  }

  onMoreOption() {
    this.isPaymentMode = false;
    this.isIOUMode = false;
  }

  async onCheckout() {
    try {
      var billRes;
      billRes = await this.onSaveBill(undefined);

      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill added successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.paidamount = billRes['paidamount'];
        this.balance = billRes['balance'];
        this.status = billRes['status'];
        this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance , bill : billRes });
        await this.getAppointments();
        this.servicecartList.forEach(srvc => {
          var apnmt = this.appintmentList.find(a => a._id == srvc.appointmentid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
        this.isPaymentMode = true;
      }
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableBtn = false;
    }
  }

  onDelete(){
    if(this.paidamount > 0){
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
              if(data){
                this.showNotification('top', 'right', 'Invoice deleted successfully !!', 'success');
                this._router.navigate(['/pages/dynamic-list/list/bill']);
              }
          });
        }
      });
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
    model['fullname'] = value.firstname +' '+ value.lastname;
    model['property'] = {};
    model['property']['firstname'] = value.firstname;
    model['property']['lastname'] = value.lastname;
    model['property']['mobile'] = value.mobile;
    model['property']['primaryemail'] = value.primaryemail;
    model['property']['fullname'] = value.firstname +' '+ value.lastname;
    
    try {
      let datas = await this._commonService.commonServiceByUrlMethodDataAsync('prospects', 'POST', model) as any;
      this.searchMember = datas;
      this.searchMember['email'] = datas?.property?.primaryemail;
      this.searchMember['mobile'] = datas?.property?.mobile;
      this.searchMember['type'] = "";
      this.searchMember['type'] = 'C';
      this.disableBtn = false;
      this.memberControl.setValue('');
      super.showNotification("top", "right", "Customer added successfully !!", "success");
      $("#close").click();
      this.form.reset();
    } catch (e) {
      this.disableBtn = false;
      super.showNotification("top", "right", "Error Occured !!", "danger");
      $("#close").click();
    }
  }

  async onSaveBill(status) {
    if (this.cartItemList.length == 0 && this.servicecartList.length == 0 && this.packagecartList.length == 0) {
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
    if (this._billModel._id){
      this._billModel.paidamount = this.paidamount;      
    } else {
      this._billModel.paidamount = 0;
    }    
    this._billModel.status = status;
    this._billModel.type = 'appointment';

    var billform = this.billform.getRawValue();
    var valproperty = billform.property;
    if(!this._billModel.property){
      this._billModel.property = {};
    }
    for (const key in valproperty){
      if(!this._billModel.property[key]){
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

  newAppointment() {
    this.ngOnInit();
    this.clearData();
    this.selectedDate = new Date();
    this.searchMember = "";
    this.memberControl.setValue(null);
    this.selectedIndexes = 2;
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }

  clearMember(){
    this.searchMember = "";
    this.memberControl.setValue('');
    this.clear();
  }

  clear(){
    this.clearData();
    this.bindid = null;
    this.billid = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }

  clearData() {
    this.cartItemList = [];
    this.servicecartList = [];
    this.packagecartList = [];
    // this.canEditCustomer = false;
    this.isPaymentMode = false;
    this._billModel = new BillModel();

    this.billItemList.map(a => a.quantity = 0);
    this.serviceList.map(a => a.selected = 0);
    this.appintmentList.map(a => a.selected = false);

    this.subtotal = 0;
    this.discount = 0;
    this.grandtotal = 0;
    this.taxamount = 0;
    this.paidamount = 0;
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

  previewGRC(){
    const defaultpagesizesetting  = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";
    let printContents, popupWin;
    printContents = '<img src="https://res.cloudinary.com/dlopjt9le/image/upload/v1646214610/krp1pc6dlqp8gddn517o.png"/>'
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title></title>
            <style type="text/css">
                @page {`+ defaultpagesizesetting + `


                }

           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
              }
              * {
                box-sizing: border-box;
              }
              .print-page {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
                  background: #ffffff;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .text-left {
                text-align: left;
              }

              .align-top {
                vertical-align: top;
              }
             .print-company {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
             }
             .print-text {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
                line-height: 1.24;
             }
             address {
                font-style: normal;
                line-height: inherit;

            }


             .print-page-item-head {
                font-family: poppins, arial;
                font-size: 31px;
                font-weight: 500;
                color: #000000;
                line-height: 1.24;
             }
             .print-item-number {
                font-family: poppins, arial;
                font-size: 16px;
                color: #000000;
                font-weight: bold;
                text-transform: uppercase;
            }

            .table-print-head-row {
                 height:34px;
            }
            .table-print-head {
              color: #ffffff;
              font-size: 13px;
              background-color: #393837;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;

            }

            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
            }

            @supports (-ms-ime-align:auto) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
          }

          .text-break {
            word-break: break-word !important;
            word-wrap: break-word !important;
         }

         .print-table-td {
          color: #000000;
          font-size: 13px;
         }

         .break-row-after {
          page-break-after: auto;
          }
          .break-row-inside {
              page-break-inside: avoid;
          }

          .align-middle {
            vertical-align: middle;
          }

          .d-none {
            display:none;
          }

          .d-block {
              display: block;
          }


          .row {
              display: flex;
              flex-wrap: wrap;
          }

          .col-7 {
              flex: 0 0 58.3333333333%;
              max-width: 58.3333333333%;
          }
          .col-5 {
              flex: 0 0 41.6666666667%;
              max-width: 41.6666666667%;
          }


          .table-bordered {
              border: 1px solid #dee2e6;
          }


              }
            </style>
          </head>
          <body onload="window.print();window.close()">${printContents}</body>
        </html>`
    );
    popupWin.document.close(); 
  }

  generatingTS(service: any, staffid?: any) {

    var timeslotList = [];
    this.timeisLoadingBox = true;
    var starttime = service['availability'].starttime; // 06:00
    var endtime = service['availability'].endtime;     // 14:00

    if (service.staffavailability.length > 0 && staffid) {
      var availStaff = service.staffavailability.filter(a => {
        return a.userid._id.toString() == staffid._id.toString()
      });

      availStaff.forEach(element => {

        if (element.days.length > 0 && element.days.includes(service['appointmentday'])) {
          starttime = element.starttime; // 06:00
          endtime = element.endtime;     // 14:00
          return;
        }
      });
    }

    // let duration = service['duration'];
    let duration = 15;

    var startmin = starttime.split(":");      // 08:00
    var timehr = parseInt(startmin[0]);       // 06
    var timemin = parseInt(startmin[1]);      // 00
    var totalstartmin = timehr * 60 + timemin;// 480 + 00

    var endmin = endtime.split(":");            // 14:00
    var endtimehr = parseInt(endmin[0]);        // 14
    var endtimemin = parseInt(endmin[1]);       // 00
    var totalendmin = endtimehr * 60 + endtimemin;// 1020 + 30

    for (var time = totalstartmin; time < totalendmin;) { //360

      timemin = Number(timemin);            //00
      var start;
      if (timemin <= 9) {
        start = timehr + ":" + "0" + timemin;  //06:00
      } else {
        start = timehr + ":" + timemin;
      }
      var end;
      if (duration <= 60) {
        timemin += duration;        //60
        if (timemin >= 60) {
          timehr += 1;                        //07
          timemin -= 60;                      //00
        }
        if (timemin <= 9) {
          end = timehr + ":" + "0" + timemin;
        } else {
          end = timehr + ":" + timemin;
        }
      } else {
        end = moment(timehr + ':' + timemin, 'HH:mm');
        end.add(duration, 'm');
        end = end.format("HH:mm");
        var tempstartmin = end.split(":");
        timehr = parseInt(tempstartmin[0]);
        timemin = parseInt(tempstartmin[1]);
      }

      var obj;
      obj = {
        "day": service['appointmentday'],
        "starttime": start,
        "endtime": end,
      }
      timeslotList.push(obj);
      time += duration;
    }

    this.timeisLoadingBox = false;
    return timeslotList;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
