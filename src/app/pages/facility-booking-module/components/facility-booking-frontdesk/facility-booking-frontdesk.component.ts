import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, finalize, tap, startWith, switchMap, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { BillModel } from '../../../../core/models/sale/bill';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { AssetService } from '../../../../core/services/service/asset.service';
import { FacilitybookingService } from '../../../../core/services/service/facilitybooking.service';
import { BillCheckOutComponent } from '../../../../shared/bill-check-out/bill-check-out.component';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BasicValidators, OnlyPositiveNumberValidator, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;
import swal from 'sweetalert2';


@Component({
  selector: 'app-facility-booking-frontdesk',
  templateUrl: './facility-booking-frontdesk.component.html',
})

export class FacilityBookingFrontdeskComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  form: FormGroup;
  serviceForm: FormGroup;
  billform: FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('billcheckout', { static: false }) BillCheckOutCmp: BillCheckOutComponent;

  bindid: any;
  billid: any;
  billpayid: any;
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


  serviceList: any[] = [];
  serviceList2: any[] = [];
  serviceListGrp: any[] = [];

  facilitybookingList: any[] = [];
  facilitybookingList2: any[] = [];

  alltimeslotLists: any[] = [];
  timeslotfilteredOptions: Observable<any[]>;
  timeisLoadingBox: boolean = false;

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;

  cartItemList: any[] = [];
  servicecartList: any[] = [];

  selectedStatus: any[] = [];

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

  searchMember: any;
  selectedItem: any = {};
  searchBox: any = {};
  searchService: any = {};
  selectedService: any;
  selectedIndexes: number = 0;

  selectedDate: Date = new Date();

  today : Date = new Date();

  selectedCoupon: any;
  couponList: any[] = [];
  couponfilteredOptions: Observable<any[]>;
  loadingprd: boolean = false;
  appliedCouponsIn : string[] = [];

  isLoadings: any = {};

  memberControl = new FormControl();

  isLoadingCart: boolean = true;
  isLoadingData: boolean = false;
  isPaymentMode: boolean = false;
  isDisableEdit: boolean = false;
  isIOUMode: boolean = false;
  disableBtn: boolean = false;

  isSubmitted : boolean = false;
  _propertyobjectModel : any;

  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  statusList: any[] = [
    { code: 'requested', value: "Requested" },
    { code: 'inwaiting', value: "In Waiting" },
    // { code: 'confirmed', value: "Confirm" },
    { code: 'noshow', value: "No Show" },
    // { code: 'checkout', value: "Checkout" },
    { code: 'cancel', value: "Cancel" },
  ];

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

  visible: boolean = false;

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }
  timeDisplayFn(time: any): string {
    return time && time.displaytext ? time.displaytext : '';
  }
  displayFnPr(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }
  displayCn(user: any): string {
    return user && user.couponcode ? user.couponcode : '';
  }

  statusFormGroup: FormGroup;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _billItemService: BillItemService,
    private _assetService: AssetService,
    private _billService: BillService,
    private _facilitybookingService: FacilitybookingService,
  ) {
    super();
    this.pagename = 'facilitybooking-frontdesk';
    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.type = params["type"];
      this.billid = params["billid"];
      this.billpayid = params["billpayid"];

      this._formName = "bill";
      
    });

    this.searchBox = { default: "Item", value: '', index: 0 };
    this.searchService = { value: '', index: 0 };
    this.isLoadings['facilitybooking'] = false;
    this.selectedStatus = this.statusList.map(a => a.code);

    this.selectedIndexes = this.type == 'product' ? 1 : this.type == 'service' ? 2 : this.type == 'package' ? 3 : 0;
    if (this.billid  || this.billpayid) {
      this.isPaymentMode = true;
    }

    this.serviceForm = this.fb.group({
      'refid': [''],
      'bookingid': [''],
      'timeslot': ['', Validators.required],
      'bookingdate': [],
      'cost': [0],
      'charges': [0],
      'taxes': [[]],
      'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'status': ['',Validators.required],
      'title': [''],
      'availability': [''],
      'appointmentday': [''],
      'duration': [''],
      'couponcode': [],
      'coupondiscount': [],
    });
    this.billform = this.fb.group({});

    this.form = this.fb.group({
      'firstname': ['', Validators.required],
      'lastname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'primaryemail': ['', Validators.compose([Validators.required, BasicValidators.email])],
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
      this.visible = true;
      if(this._loginUserBranch.appliedcoupons && this._loginUserBranch.appliedcoupons.length > 0)
      {
        this.appliedCouponsIn = this._loginUserBranch.appliedcoupons;
      }
    } catch (e) {
      console.error(e);
      this.isLoadingData = false;
    }

    this.timeslotfilteredOptions = this.serviceForm.controls['timeslot'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._timefilter(option) : this.alltimeslotLists.slice())
      );

    var loadingDone = true;

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
      // await this.getCustomer();
      this.getCoupons();
      await this.getServices();
      if (this.bindid) {
        await this.getFacilityBooking();
        await this.getAppointmentById(this.bindid);
        // this.getMoreFacilityBooking();
      } else if (this.billid) {
        await this.getBillbyId(this.billid);
      } else {
        await this.getFacilityBooking();
        this.isLoadingCart = false;
      }
      this.isDisableEdit = false;
      this.statusFormGroup.controls['status'].enable();
      if (this.bindid || this.billid || this.billpayid) {
        this.isDisableEdit = true;
        this.statusFormGroup.controls['status'].disable();
      }
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  private _timefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.alltimeslotLists.filter(option => {
        if (option.displaytext) {
          return option.displaytext.toLowerCase().indexOf(value.toLowerCase()) === 0
        } else {
          return;
        }
      });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.alltimeslotLists.slice();
    }
    return results;
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
            this.couponList = data;
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

 
  setTimers(time : string): object | undefined{
    if(!time) return undefined;
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  onClickCpn(items : any){
    this.selectedCoupon = items?.couponcode;
    this.selectedItem = items.item;
    if(this.selectedCoupon){
      this.selectedCoupon['coupondiscount'] = items?.coupondiscount;
    }
  }


  checkCpn(types ?: string){
    this.loadingprd = true;

    const url = "coupons/checkvalidity";
    const method = "POST"
    let postData = {};
    if(types == 'facility'){
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
    
 async applyCpn(){
   if(!this.selectedCoupon){
    super.showNotification("top", "right", "Please select coupon !!", "danger");
    return;
   }

    $("#closecn").click();
    this.makeModel();
    this.GetBillDetail(this._billModel);
    this.selectedCoupon = null;
    this.showNotification("top", "right", "Coupon applied successfully !!", "success");
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


  async getFacilityBooking() {

    var sdate: Date = this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    let postData = {};
    postData['formname'] = "facilitybooking";
    postData['search'] = [];

    if (this.billid) {
      postData["search"].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
    } else if (this.bindid) {
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });
    } else {

      // var today = new Date(sdate);
      // today.setHours(0, 0, 0, 0);
      // var tommrrow = new Date(sdate);
      // tommrrow.setDate(tommrrow.getDate() + 1);
      // tommrrow.setHours(0, 0, 0, 0);
      // postData["search"].push({ "searchfield": "bookingdate", "searchvalue": { "$gte": today, "$lt": tommrrow }, "criteria": "eq", "datatype": "Date" });

      postData["search"].push({ "searchfield": "bookingdate", "searchvalue": new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()), "criteria": "fullday", "datatype": "Date" });
    }
    this.facilitybookingList = [];
    this.facilitybookingList2 = [];
    this.isLoadings['facilitybooking'] = true;

    await this._facilitybookingService
      .AsyncGetByFilter(postData)
      .then((data: []) => {
        this.facilitybookingList = data;
        this.facilitybookingList.map(a => a.shrname = a.customerid && a.customerid.fullname ? a.customerid.fullname.match(/\b(\w)/g).join('') : '--');
        this.facilitybookingList.map(a => a.selected = false);
        this.facilitybookingList.map((ap) => {
          ap.viewCancel = true;
          if (ap.billid && ap.billid._id) {
            ap.viewCancel = false;
          }
        });

        this.facilitybookingList2 = this.facilitybookingList;
        this.facilitybookingList.filter(a => a.status == 'requested');
        this.isLoadings['facilitybooking'] = false;

      });
  }

  getMoreFacilityBooking() {

    let postData = {};
    postData['formname'] = "facilitybooking";
    postData['search'] = [];
    if (this.billid) {
      postData["search"].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
    }
    this.facilitybookingList = [];
    this.facilitybookingList2 = [];

    this._facilitybookingService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.servicecartList.forEach(srvc => {
          var app = data.find(a => a._id == srvc.bookingid);
          app.selected = true
          this.facilitybookingList.push(app);
        });
        this.facilitybookingList.map(a => a.shrname = a.customerid && a.customerid.fullname ? a.customerid.fullname.match(/\b(\w)/g).join('') : '--');
        this.facilitybookingList.map((ap) => {
          ap.viewCancel = true;
          if (ap.billid && ap.billid._id) {
            ap.viewCancel = false;
          }
        });
        this.facilitybookingList2 = this.facilitybookingList;
      });
  }

  async onStatusChanges() {
    if (this.facilitybookingList2 && this.facilitybookingList2.length > 0) {
      this.isLoadings['facilitybooking'] = true;
      var statusExists: boolean = false;
      this.facilitybookingList = [];
      this.facilitybookingList2.forEach(element => {

        statusExists = false;
        if (this.selectedStatus && this.selectedStatus.length > 0) {
          var statusObj = this.selectedStatus.find(p => p == element.status);
          if (statusObj) {
            statusExists = true;
          }
        }
        if (statusExists) {
          this.facilitybookingList.push(element);
        }
      });
      this.isLoadings['facilitybooking'] = false;
    }
  }

  onTabChanged(event: any) {
    setTimeout(() => {
      this.statusFormGroup.controls['status'].setValue(this.statusList.map(s => s.code));
    }, 200);
  }

  async onDateChanged() {
    await this.getFacilityBooking();
    this.onStatusChanges();
    this.clearData();
  }


  onClickApp(appnmt: any) {
    if (!this.isDisableEdit) {
      this.getAppointmentById(appnmt._id);
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

  async getServices() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "bookingtype", "searchvalue": "HOURLY", "criteria": "eq" });

    this.serviceList = [];
    await this._assetService
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

      var appRes = this.facilitybookingList.find(a => a._id == id);

      this.facilitybookingList.map(val => val.selected = false);
      this.billItemList.map(val => val.quantity = 0);
      this.serviceList.map(val => val.selected = false);

      this._billModel._id = '';
      this._billModel.status = '';

      // if (this.customerList.length > 0 && appRes['customerid']) {
      //   this.searchMember = this.customerList.find(a => a._id == appRes['customerid']['_id']) // ['_id']
      // }
      if (appRes['customerid'] && appRes['onModel']) {
        this.searchMember = appRes['customerid'];
        this.searchMember['email'] = appRes?.customerid?.property?.primaryemail;
        this.searchMember['mobile'] = appRes?.customerid?.property?.mobile;
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
        if (appRes['billid']['assets'] && appRes['billid']['assets'].length > 0) {
          appRes['billid']['assets'].forEach(srvc => {
            var service = this.serviceList.find(a => a._id == srvc['refid']['_id']);
            service['selected'] = true;
            this.servicecartList.push({
              'bookingdate': srvc.bookingdate,
              'bookingid': srvc.bookingid._id,
              'appointmentday': this.daysList[new Date(srvc.bookingdate).getDay()],
              'availability': srvc.refid.availability,
              'duration': srvc.refid.duration,
              'taxes': srvc.refid.taxes,
              'refid': srvc.refid._id,
              'cost': srvc.cost,
              'charges': srvc.charges,
              'status': srvc.bookingid.status ? srvc.bookingid.status :  srvc.status,
              'timeslot': {
                "day": srvc.timeslot.day,
                "starttime": srvc.timeslot.starttime,
                "endtime": srvc.timeslot.endtime,
                "displaytext": srvc.timeslot.starttime + " - " + srvc.timeslot.endtime,
                "disable": false,
              },
              'title': service['title'],
              'couponcode': srvc['couponcode'],
              'coupondiscount': srvc['coupondiscount'],
              'discount': srvc.discount - (srvc['coupondiscount'] * 1),
             
            });
          });
          this.servicecartList.forEach(srvc => {
            var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
            if (apnmt) {
              apnmt.selected = true;
            }
          });
        }
        if (appRes['billid']['items'] && appRes['billid']['items'].length > 0) {
        
          appRes['billid']['items'].forEach(itm => {
            var billitem;
            if(itm.giftcard)
            {
              billitem = this.giftCardList.find(a => a._id == itm.item._id);
            }else{
              billitem = this.billItemList.find(a => a._id == itm.item._id);
            }
            if(billitem) {
              billitem['item'] = itm.item;
              billitem['itemid'] = itm.item._id;
              billitem['sale'] = itm.item.sale;
              billitem['quantity'] = itm.quantity;
              billitem['couponcode'] = itm?.couponcode;
              billitem['coupondiscount'] = itm?.coupondiscount;
             

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
          'bookingdate': appRes.bookingdate,
          'bookingid': appRes._id,
          'appointmentday': this.daysList[new Date(appRes.bookingdate).getDay()],
          'availability': appRes.refid.availability,
          'duration': appRes.refid.duration,
          'taxes': appRes.refid.taxes,
          'refid': appRes.refid._id,
          'discount': 0,
          'cost': appRes.refid.charges,   // need to check
          'charges': appRes.refid.charges, // need to check
          'status': appRes.status,
          'timeslot': {
            "day": appRes.timeslot.day,
            "starttime": appRes.timeslot.starttime,
            "endtime": appRes.timeslot.endtime,
            "displaytext": appRes.timeslot.starttime + " - " + appRes.timeslot.endtime,
            "disable": false,
          },
          'title': appRes.refid['title'],
        });

        this.servicecartList.forEach(srvc => {
          var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
      }

      this.selectedDate = new Date(appRes['bookingdate']);
      setTimeout(() => {
          this.makeModel();
          this.subtotal = appRes.charges;
          this.discount = 0;
          this.grandtotal = appRes.charges;
          this.taxamount = 0;
          this.taxdetail = null;
          this.taxesList = [];
          this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance });
          this.isLoadingCart = false;
        }, 2000);
    } catch (e) {
      console.log("e", e);
      this.isLoadingCart = false;
    }
  }

  async getBillbyId(id: any) {
    try {
      this.isLoadingCart = true;
      this.servicecartList = [];
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';

      var billRes;
      billRes = await this._billService.AsyncGetById(id) as any;                        // billRes
      if(billRes && billRes.type == "facilitybooking-daily"){
        this._router.navigate(['/pages/event/booking-payment/'+ id]);
      }
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

      // if (this.customerList.length > 0 && billRes['customerid']) {
      //   this.searchMember = this.customerList.find(a => a._id == billRes['customerid']['_id'])
      // }
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
      this.getIOUAmount();

      if (billRes['assets'] && billRes['assets'].length > 0) {
        billRes['assets'].forEach(srvc => {
          var service = this.serviceList.find(a => a._id == srvc['refid']['_id']);
          service['selected'] = true;
          this.servicecartList.push({
            'bookingdate': srvc.bookingdate,
            'bookingid': srvc.bookingid._id,
            'appointmentday': this.daysList[new Date(srvc.bookingdate).getDay()],
            'availability': srvc.refid.availability,
            'duration': srvc.refid.duration,
            'taxes': srvc.refid.taxes,
            'refid': srvc.refid._id,
            'cost': srvc.cost,
            'charges': srvc.cost,
            'status': srvc.bookingid.status ? srvc.bookingid.status :  srvc.status,
            'timeslot': {
              "day": srvc.timeslot.day,
              "starttime": srvc.timeslot.starttime,
              "endtime": srvc.timeslot.endtime,
              "displaytext": srvc.timeslot.starttime + " - " + srvc.timeslot.endtime,
              "disable": false,
            },
            'title': service['title'],
            'couponcode': srvc['couponcode'],
            'coupondiscount': srvc['coupondiscount'],
            'discount': srvc.discount - (srvc['coupondiscount'] * 1),
          });
          this.selectedDate = new Date(srvc.bookingdate);
        });
        await this.getFacilityBooking();
        this.facilitybookingList = [];
        this.servicecartList.forEach(srvc => {
          var app = this.facilitybookingList2.find(a => a._id == srvc.bookingid);
          app.selected = true
          this.facilitybookingList.push(app);
        });
      }
      if (billRes['items'] && billRes['items'].length > 0) {
        billRes['items'].forEach(itm => {
          var billitem;
          if(itm.giftcard){
            billitem = this.giftCardList.find(a => a._id == itm.item._id);
          } else{
            billitem = this.billItemList.find(a => a._id == itm.item._id);
          }
          if (billitem) {
            billitem['item'] = itm.item;
            billitem['itemid'] = itm.item._id;
            billitem['sale'] = itm.item.sale;
            billitem['quantity'] = itm.quantity;
            billitem['couponcode'] = itm?.couponcode;
            billitem['coupondiscount'] = itm?.coupondiscount;
           

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

    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  async generateQR(value : number){
    let postData = {};
    postData['value'] = value.toString();
    return this._commonService.commonServiceByUrlMethodDataAsync('common/generateqrcode',"POST",postData);
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



  async onClickService(refid: any) {
    this.serviceForm.reset();

    this.selectedService = this.serviceList.find(a => a._id == refid);
    this.selectedService['selected'] = true;


    var date = this.selectedDate && this.selectedDate['_d'] ? this.selectedDate['_d'] : this.selectedDate;
    var day = this.daysList[date.getDay()];
    var cartItem = this.servicecartList.find(a => a.refid == refid);

    this.serviceForm.controls['refid'].setValue(this.selectedService._id);
    this.serviceForm.controls['title'].setValue(this.selectedService.title);
    this.serviceForm.controls['availability'].setValue(this.selectedService.availability);
    this.serviceForm.controls['duration'].setValue(this.selectedService.duration);
    this.serviceForm.controls['cost'].setValue(this.selectedService.charges);
    this.serviceForm.controls['cost'].disable();
    this.serviceForm.controls['charges'].setValue(this.selectedService.charges);
    if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
      this.serviceForm.controls['taxes'].setValue(this.selectedService.taxes);
    }
    this.serviceForm.controls['taxes'].disable();
    this.alltimeslotLists = [];
    if (this.selectedService['availability']['days'].includes(day)) {
      this.timeisLoadingBox = true;
      this.alltimeslotLists = await this.generatingTS(this.serviceForm.value);
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.timeisLoadingBox = false;
    }
    if (!cartItem) {
      this.serviceForm.controls['bookingdate'].setValue(date);
      this.serviceForm.controls['appointmentday'].setValue(day);
      this.serviceForm.controls['discount'].setValue(0);
      this.serviceForm.controls['status'].setValue('requested');
    } else {
      this.serviceForm.controls['bookingdate'].setValue(cartItem.bookingdate);
      this.serviceForm.controls['appointmentday'].setValue(cartItem.appointmentday);
      var slot;
      if (this.alltimeslotLists.length > 0) {
        slot = this.alltimeslotLists.find(a => a.starttime == cartItem.timeslot.starttime && a.endtime == cartItem.timeslot.endtime)
      }
      this.serviceForm.controls['timeslot'].setValue(slot);
      this.serviceForm.controls['discount'].setValue(cartItem.discount);
      this.serviceForm.controls['status'].setValue(cartItem.status);
    }
  }

  closeService(service: any) {
    this.serviceForm.reset();
    service['selected'] = false;
    this.s_submitted = false;
    var cartItem = this.servicecartList.find(a => a.refid == service._id);
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
    savedService['customerid'] = this.searchMember._id;
    if (this.searchMember.type == 'M') {
      savedService['onModel'] = "Member";
    } else if (this.searchMember.type == 'C') {
      savedService['onModel'] = "Prospect";
    } else if (this.searchMember.type == 'U') {
      savedService['onModel'] = "User";
    } else {
      savedService['onModel'] = "User";
    }

    var cartItem = this.servicecartList.find(a => a.refid == savedService.refid);

    this.disableBtn = true;
    if (!cartItem) {
      this._facilitybookingService
        .AsyncAdd(savedService)
        .then(async (res: any) => {
          savedService['bookingid'] = res._id;

          this.servicecartList.push(savedService);
          await this.getFacilityBooking();
          this.makeModel();
          this.GetBillDetail(this._billModel);
          this.disableBtn = false;
          $("#closeservice").click();
          this.serviceForm.reset();
          this.servicecartList.forEach(srvc => {
            var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
            if (apnmt) {
              apnmt.selected = true;
            }
          });
        }).catch((e) => {

          this.disableBtn = false;
        });
    } else {
      this._facilitybookingService
        .AsyncUpdate(cartItem.bookingid, savedService)
        .then(async (res: any) => {
          savedService['bookingid'] = res._id;
          var i = this.servicecartList.findIndex(a => a.refid == savedService.refid);
          this.servicecartList.splice(i, 1, savedService);
          await this.getFacilityBooking();
          this.makeModel();
          this.GetBillDetail(this._billModel);
          this.disableBtn = false;
          $("#closeservice").click();
          this.serviceForm.reset();
          this.servicecartList.forEach(srvc => {
            var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
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
    var bookingid = service['bookingid'];

    this.disableBtn = true;
    this._facilitybookingService
      .AsyncDelete(bookingid)
      .then(async (res: any) => {
        var ind = this.servicecartList.findIndex(a => a.refid == service._id);
        this.servicecartList.splice(ind, 1);
        this.makeModel();
        this.GetBillDetail(this._billModel);
        this.disableBtn = false;
        await this.getFacilityBooking();

        this.servicecartList.forEach(srvc => {
          var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
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

        varTemp._facilitybookingService
          .AsyncDelete(app._id)
          .then(async (data) => {
            if (data) {
              varTemp.showNotification('top', 'right', 'Booking deleted successfully !!', 'success');
              var ind = varTemp.servicecartList.findIndex(a => a.refid == app.refid._id);
              varTemp.servicecartList.splice(ind, 1);
              varTemp.makeModel();
              varTemp.GetBillDetail(varTemp._billModel);
              varTemp.disableBtn = false;
              await varTemp.getFacilityBooking();

              varTemp.servicecartList.forEach(srvc => {
                var apnmt = varTemp.facilitybookingList.find(a => a._id == srvc._id);
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

    this._billModel.assets = [];
    this._billModel.assets = this.servicecartList;

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
    this.searchMember = this.memberControl.value;
    this.clear();
    this.getIOUAmount();
  }

  setNewPayment(){
    this.BillCheckOutCmp.setNewPayment();
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
    this._router.navigate([`/pages/sale-module/multiple-bill/bill-facilitybooking/` + event._id]);
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

        await this.getFacilityBooking();
        this.servicecartList.forEach(srvc => {
          var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
          if (apnmt) {
            apnmt.selected = true;
          }
        });
      }
    } catch (e) {
      console.error(e)
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
      billRes = await this.onSaveBill("checkout");
      
      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill added successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.paidamount = billRes['paidamount'];
        this.balance = billRes['balance'];
        this.status = billRes['status'];
        
        this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance , bill : billRes });
        await this.getFacilityBooking();
        this.servicecartList.forEach(srvc => {
          var apnmt = this.facilitybookingList.find(a => a._id == srvc.bookingid);
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
    this._billModel.status = status;
    this._billModel.type = 'facilitybooking';

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

    this._billModel = new BillModel();

    this.billItemList.map(a => a.quantity = 0);
    this.serviceList.map(a => a.selected = 0);
    this.facilitybookingList.map(a => a.selected = false);

    this.subtotal = 0;
    this.discount = 0;
    this.grandtotal = 0;
    this.paidamount = 0;
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

  generatingTS(service: any, staffid?: any) {

    var timeslotList = [];
    this.timeisLoadingBox = true;
    var starttime = service['availability'].starttime; // 06:00
    var endtime = service['availability'].endtime;     // 14:00
    var duration = service['duration'];

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
        timemin += parseInt(duration);        //60
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
        "displaytext": start + " - " + end,
      }
      timeslotList.push(obj);
      time += parseInt(duration);
    }

    this.timeisLoadingBox = false;
    return timeslotList;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
