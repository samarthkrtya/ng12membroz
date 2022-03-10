import { FacilityBookingModel } from './../../../../core/models/service/facilitybooking';
import { FacilitybookingService } from './../../../../core/services/service/facilitybooking.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil, finalize, tap, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { AssetService } from './../../../../core/services/service/asset.service';
import { BasicValidators } from 'src/app/shared/components/basicValidators';
import { CommonDataService } from 'src/app/core/services/common/common-data.service';

@Component({
  selector: 'app-facility-dailybooking-form',
  templateUrl: './facility-dailybooking-form.component.html'
})
export class FacilityDailyBookingFormComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  facilitybookingModel = new FacilityBookingModel()
  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;
  customerId: any;

  today: Date = new Date();

  totalrooms: number[] = [];
  totaloccupants: number[] = [0, 1, 2, 3, 4, 5, 6];

  serviceList: any[] = [];
  servicefilteredOptions: Observable<any[]>;
  
  selectedCustomer: any;
  selectedFacility: any;
  status: string;
  redirectUrl: string;

  alltimeslotLists: any[] = [];
  timeslotfilteredOptions: Observable<any[]>;
  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  displayBillBtn: boolean = false;
  displayBillBtnList: any[] = [];

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false; 

  customerfields = {
    "fieldname": "customerid",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "form": {
      'apiurl' : "common/contacts/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "formname" : "contact",
    "value": "",
    "dbvalue": ""
  };

  displayFn2(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }


  htmlContent : string = `<div class="row"> <div class="col-md-12">
  <div class="border p-3 rounded alternative-light-blue">
    <div class="row">
      <div class="col-sm-4">
          <div class="media member-profile-item"><img  src='$[{profilepic}]' class="profile-avatar-img mr-2 rounded-circle" alt="">
          <div class="media-body"><div class="font-500 mb-1"> $[{fullname}] </div> <div class="@START[{membershipid.membershipname}]"> <div class="d-flex"><div class="flex-grow-1">  $[{membershipid.membershipname}]</div> </div> </div></div> </div>
        </div>
        <div class="col-sm-4 @START[{property.address}]">
            <div class="d-flex"><div class="mr-2"><img src="../assets/img/location-gray-icon.svg" alt=""></div><div> $[{property.address}]   <br>  $[{property.city}] </div></div>
        </div>
        <div class="col-sm-4">
           <div class="@START[{primaryemail}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/email-gray-icon.svg" alt=""></div><div>$[{primaryemail}]</div></div> </div>
           <div class="@START[{mobile}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/phone-gray-icon.svg" alt=""></div><div> $[{mobile}] </div></div> </div>
        </div>
    </div>
    </div>
    </div>
  </div>`;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _commonService: CommonService,
    private _commonDataService: CommonDataService,
    private _assetService: AssetService,
    private _facilitybookingService: FacilitybookingService,
  ) {
    super();

    this.totalrooms = []; 
    for (let i = 1; i <= 24; i++) {
      this.totalrooms.push(i);
    }

    this.form = this.fb.group({
      'customerid': ['', Validators.compose([Validators.required])],
      //'locationid': ['', Validators.required],
      //'resortid': [''],
      'bookingdate': [new Date(), Validators.required],
      'checkin': [''],
      'checkout': [''],
      'totalrooms': [1],
      'occupants': this.fb.array([]),
      //'reservation': [],
      //'guest': [],
      'refid': ['', Validators.compose([Validators.required,BasicValidators.objects])],
      'timeslot': ['', Validators.required],
      'cost': [0],
      'charges': [0],
      'taxes': [[]],
      'notes': [''],
      'status': ['active'],
      //'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.customerId = params["cid"];
      this.pagename = 'booking-form';
    });
    this.chooseRoom(1);
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();

    this.timeslotfilteredOptions = this.form.controls['timeslot'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._timefilter(option) : this.alltimeslotLists.slice())
      );

    this.servicefilteredOptions = this.form.controls['refid'].valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : ''),
        map(option => option ? this._servicefilter(option) : this.serviceList.slice())
      );

      if (this.isMemberLogin) {
        this.customerfields.dbvalue = this._loginUserId;

        this.selectedCustomer = this._loginUser;
        this.selectedCustomer['nickname'] = `${this.selectedCustomer?.fullname} ${ this.selectedCustomer?.property?.mobile ?  ' | ' + this.selectedCustomer?.property?.mobile : ''} ${ this.selectedCustomer.membernumber ?  ' | ' + this.selectedCustomer.membernumber : ''}`;
        
        this.selectedCustomer['primaryemail'] = this.selectedCustomer.property.primaryemail; 
        this.selectedCustomer['mobile'] = this.selectedCustomer.property.mobile; 
        this.selectedCustomer['type'] = "M";
  
        this.form.get('customerid').setValue(this.selectedCustomer);
        this.form.get('customerid').disable();

      }else if(this.customerId){
        this.customerfields.dbvalue = this.customerId;
      }


      var loadingDone = true;

      // this.form.controls['customerid']
      // .valueChanges
      // .pipe(debounceTime(500))
      // .subscribe((value)=>{
      //   if(loadingDone){
      //     this.getCustomer();
      //     loadingDone = false;
      //   }else{
      //     this.customerfilteredOptions =  of(this._customerfilter(value));
      //   }
      // });

      this.form.controls['customerid']
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

  private _servicefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.serviceList.filter(option => {
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
      results = this.serviceList.slice();
    }
    return results;
  }


 
  async LoadData() {
    this.isLoading = true;

    this.getfacility();
    if (this.bindId) {
      await this.getBookingByid(this.bindId);
    }
    this.isLoading = false;
  }

  
  async getCustomer() {
    try{
      this.customerisLoadingBox = true
      let postData = {};
      postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];
      this.customerList = [];
      var datas = await this._commonService.AsyncContactsFilter(postData) as [];
      this.customerList = datas;
      this.customerfilteredOptions = of(datas);
      this.customerisLoadingBox = false;
    }catch(e){
      this.customerisLoadingBox = false;
    }
  }


  private _customerfilter(value: string): string[] {
    if(typeof value == 'string'){
      let results = [];
      for (let i = 0; i < this.customerList.length; i++) {
        if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
          results.push(this.customerList[i]);
        }
      }
      return results;
    }
  }
  

  getfacility() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    //postData["search"].push({ "searchfield": "bookingtype", "searchvalue": "DAILY", "criteria": "eq" });

    this._assetService
      .GetByFilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.serviceList = data;
        this.servicefilteredOptions = of(this.serviceList);
      });
  }

  async getBookingByid(id: any) {
    await this._facilitybookingService
      .AsyncGetById(id)
      .then((data: any) => {

        // this.customerfields.dbvalue  = data.customerid._id;

        if(data.customerid && data.customerid._id){
          this.customerfields.dbvalue = data.customerid._id;
          this.selectedCustomer = data.customerid;
          this.selectedCustomer['primaryemail'] = this.selectedCustomer.property.primaryemail; 
          this.selectedCustomer['mobile'] = this.selectedCustomer.property.mobile; 
          this.selectedCustomer['nickname'] = `${this.selectedCustomer?.fullname} ${ this.selectedCustomer?.property?.mobile ?  ' | ' + this.selectedCustomer?.property?.mobile : ''} ${ this.selectedCustomer.membernumber ?  ' | ' + this.selectedCustomer.membernumber : ''}`;
          if(data.onModel == 'Member'){
            this.selectedCustomer['type'] = "M";
          }else if(data.onModel == 'Prospect'){
            this.selectedCustomer['type'] = "C";
          }else {
            this.selectedCustomer['type'] = "U";
          }
          this.form.controls['customerid'].setValue(this.selectedCustomer);
        }


        this.selectedFacility = this.serviceList.find(b => (data.refid != undefined && data.refid._id !== undefined) ? (b._id === data.refid._id) : (b._id === data.refid));
        if(this.selectedFacility !== undefined){
          this.onFacilitySelected(this.selectedFacility);    // added later(validation set)
          this.form.controls['refid'].setValue(this.selectedFacility);
          if(this.selectedFacility.bookingtype !== undefined && this.selectedFacility.bookingtype == "DAILY"){
            this.form.controls['checkin'].setValue(data.checkin);
            this.form.controls['checkout'].setValue(data.checkout);
            if(data.bookingdetail && data.bookingdetail.totalrooms){
              this.form.controls['totalrooms'].setValue(data.bookingdetail.totalrooms);
            }
            if (data.bookingdetail && data.bookingdetail.occupants && data.bookingdetail.occupants.length > 0) {
              let control = <FormArray>this.form.controls.occupants;
              control.clear();
              for (let i = 0; i < data.bookingdetail.occupants.length; i++) {
                control.push(
                  this.fb.group({
                    'room': [data.bookingdetail.occupants[i].room], 'adults': [data.bookingdetail.occupants[i].adults], 'childrens': [data.bookingdetail.occupants[i].childrens], 'extrabed': [data.bookingdetail.occupants[i].extrabed], 'extracost': [data.bookingdetail.occupants[i].extracost]
                  })
                );
              }
            }
          }
          if(this.selectedFacility.charges){
            this.form.controls['cost'].setValue(this.selectedFacility.charges);
          }
          this.form.controls['cost'].disable();
          if(this.selectedFacility.charges){
            this.form.controls['charges'].setValue(this.selectedFacility.charges);
          }
          if (this.selectedFacility.taxes && this.selectedFacility.taxes.length > 0) {
            this.form.controls['taxes'].setValue(this.selectedFacility.taxes);
          }
          this.form.controls['taxes'].disable();
  
          if(this.selectedFacility.bookingtype !== undefined && this.selectedFacility.bookingtype == "HOURLY"){
            this.form.controls['bookingdate'].setValue(data.bookingdate);
            var date1 = new Date(data.bookingdate);
            var day = this.daysList[date1.getDay()];
            this.selectedFacility['appointmentday'] = day;
            this.alltimeslotLists = [];
            this.timeslotfilteredOptions = of(this.alltimeslotLists);
            if (this.selectedFacility['availability']['days'].includes(day)) {
              this.alltimeslotLists = this.generatingTS(this.selectedFacility);
              this.timeslotfilteredOptions = of(this.alltimeslotLists);
            }
            var slot;
            if (this.alltimeslotLists.length > 0 && data.timeslot !== undefined) {
              slot = this.alltimeslotLists.find(a => a.starttime == data.timeslot.starttime && a.endtime == data.timeslot.endtime);
              this.form.controls['timeslot'].setValue(slot);
            }
          }
          this.disableButton = data.status && data.status == 'confirmed';
        }
        this.displayBillBtn = false;
        this.displayBillBtnList = [];
        if(data.billid && data.billid._id){
          if(data.status != "Unpaid"){
            this.getBillPaymentByBill(data);
          }else{
            this.displayBillBtnList.push({editurl : '/pages/dynamic-preview-list/bill/'+ data.billid._id ,displayName : "View Invoice"});
            this.displayBillBtn = true;
          }
        }
        if(data.status && (data.status == 'confirmed' || data.status == 'cancelled')){
          this.disableButton = true;
        }
      }).catch((e)=>{
        this.isLoading = false;
      });
  }

  chooseRoom(room: number) {
    let control = <FormArray>this.form.controls.occupants;
    if (control.value.length < room) {
      for (let i = 1; i <= room; i++) {
        if (i > control.value.length) {
          control.push(
            this.fb.group({
              'room': [i], 'adults': [0], 'childrens': [0], 'extrabed': [0], 'extracost': [0]
            })
          );
        }
      }
    } else {
      for (let i = control.value.length; i > room; i--) {
        control.removeAt(i - 1);
      }
    }
  }

  async Save(model?: FacilityBookingModel) {
    return await this._facilitybookingService.AsyncAdd(model);
  }

  async Update(id?: any, model?: FacilityBookingModel) {
    return await this._facilitybookingService.AsyncUpdate(id, model);
  }

  getBillPaymentByBill(data : any){
    var url = "billpayments/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'billid', "searchvalue": data.billid._id, "criteria": "eq", "datatype": "ObjectId" });

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((bills: any) => {
        if (bills && bills.length > 0) {
          if(bills.length == 1){
            this.displayBillBtnList.push({editurl : '/pages/dynamic-preview-list/bill/'+ bills[0]._id ,displayName : "View Receipt"});
          }else{
            this._commonDataService.isfilterDataForGlobalSearch  = true;
            this._commonDataService.filterDataForGlobalSearchparams['search'] = [];
            this._commonDataService.filterDataForGlobalSearchparams['search'].push({ "searchfield": 'billid', "searchvalue": data.billid._id, "criteria": "eq", "datatype": "ObjectId" });
            this.displayBillBtnList.push({editurl : '/pages/dynamic-list/list/billpayment' ,displayName : "View Receipts"});
          }
          this.displayBillBtn = true;
        }
      });
  }

  onlinePay(){
    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?facilitybookingid=${this.bindId}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }

  ActionCall() { }
  Delete() { }

  async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    this.disableButton = true;
    value = this.form.getRawValue();
    this.facilitybookingModel = value;
    this.facilitybookingModel.customerid = value.customerid._id;
    if (this.selectedCustomer.type == 'M') {
      this.facilitybookingModel.onModel = "Member";
    } else if (this.selectedCustomer.type == 'C') {
      this.facilitybookingModel.onModel = "Prospect";
    } else if (this.selectedCustomer.type == 'U') {
      this.facilitybookingModel.onModel = "User";
    } else {
      this.facilitybookingModel.onModel = "Member";
    }
    //this.facilitybookingModel.refid = value.refid._id;
    if (value.refid && value.refid._id) {
      this.facilitybookingModel.refid = value.refid._id;
    } else {
      this.facilitybookingModel.refid = null;
    }

    this.facilitybookingModel.charges = value.charges;
    this.facilitybookingModel.cost = value.charges;
    this.facilitybookingModel.bookingdetail = {};
    this.facilitybookingModel.bookingdetail = {};
    this.facilitybookingModel.bookingdetail['occupants'] = [];
    this.facilitybookingModel.bookingdetail['occupants'] = value.occupants;
    this.facilitybookingModel.bookingdetail['totalrooms'] = value.occupants.length;
    this.facilitybookingModel.bookingdetail['bookingcost'] = value.occupants.map(item => item.extracost).reduce((prev, next) => prev + next);
    this.facilitybookingModel.bookingdetail['totaladults'] = value.occupants.map(item => item.adults).reduce((prev, next) => prev + next);
    this.facilitybookingModel.bookingdetail['totalchildrens'] = value.occupants.map(item => item.childrens).reduce((prev, next) => prev + next);
    this.facilitybookingModel.status = this.status;

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "60ec24f8c9eab5c545c50bf3";
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'facilityid', "searchvalue": value.refid, "criteria": "eq", "datatype": "ObjectId" });
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": value.checkin, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": value.checkout, "criteria": "eq", "datatype": "date" });
 

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {
          
          let bookingAvailable: boolean = true;
          if(data && data.length > 0) {
            data.forEach(element => {
              if(element.availability == false || element.isClosed == true || element.isnoavailable == true || value.totalrooms > element.netavailable) {
                bookingAvailable = false;
              }
            });
          }

          if(bookingAvailable == true) {
            await this.booking();
          } else {
            this.disableButton = false;
            super.showNotification("top", "right", "Booking not available.", "danger");
            return;
          }
          // console.log("bookingAvailable", bookingAvailable)
          return;
        }
      }, (error) => {
        console.error(error);
      });

    return;
    
    
  }
 
  async booking() {
    // console.log("this.facilitybookingModel",this.facilitybookingModel);
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.facilitybookingModel);
      } else {
        res = await this.Update(this.bindId, this.facilitybookingModel);
      }
      
      if(res.billid && res.billid._id){
        this._router.navigate(['/pages/event/booking-payment/'+ res.billid._id]);
      } else {
        if (this.isMemberLogin) {
          this._router.navigate(['/pages/dynamic-list/list/myfacilitybooking']);
        } else {
          this._router.navigate(['/pages/dynamic-list/list/facilitybooking']);
        }
      }
      super.showNotification("top", "right", "Booking saved successfully  !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
      this._router.onSameUrlNavigation = 'reload';
    }
  }

  cancelbookingform() {
    if (this.isMemberLogin) {
      this._router.navigate(['/pages/dynamic-list/list/myfacilitybooking']);
    } else {
      this._router.navigate(['/pages/dynamic-list/list/facilitybooking']);
    }
  }

  onCustomerSelected() {
    this.selectedCustomer = this.form.get('customerid').value;
    if(this.selectedCustomer.type == "M"){
      this.redirectUrl = '/pages/members/profile/'+ this.selectedCustomer._id;
    }else if(this.selectedCustomer.type == "C"){
      this.redirectUrl = '/pages/customer-module/profile/'+ this.selectedCustomer._id;
    }
  }

  onFacilitySelected(event: any) {
    this.selectedFacility = event;
    if (this.selectedFacility.bookingtype == 'DAILY') {
      this.form.get('checkin').setValidators([Validators.required]);
      this.form.get('checkout').setValidators([Validators.required]);
      this.form.get('totalrooms').setValidators([Validators.required]);
      this.form.get('checkin').updateValueAndValidity();
      this.form.get('checkout').updateValueAndValidity();
      this.form.get('totalrooms').updateValueAndValidity();
      this.form.get('timeslot').clearValidators();
      this.form.get('timeslot').updateValueAndValidity();
      this.form.controls['checkin'].setValue('');
      this.form.controls['checkout'].setValue('');
      this.form.controls['timeslot'].setValue(null);
    } else {
      this.form.get('checkin').clearValidators();
      this.form.get('checkout').clearValidators();
      this.form.get('totalrooms').clearValidators();
      this.form.get('checkin').updateValueAndValidity();
      this.form.get('checkout').updateValueAndValidity();
      this.form.get('totalrooms').updateValueAndValidity();
      this.form.get('timeslot').setValidators([Validators.required]);
      this.form.get('timeslot').updateValueAndValidity();
      this.form.controls['checkin'].setValue(new Date());
      this.form.controls['checkout'].setValue(new Date());
    }
    this.form.controls['cost'].setValue(this.selectedFacility.charges);
    this.form.controls['cost'].disable();
    this.form.controls['charges'].setValue(this.selectedFacility.charges);
    if (this.selectedFacility.taxes && this.selectedFacility.taxes.length > 0) {
      this.form.controls['taxes'].setValue(this.selectedFacility.taxes);
    }
    this.form.controls['taxes'].disable();
    var date = new Date();
    var day = this.daysList[date.getDay()];
    this.selectedFacility['appointmentday'] = day;
    if (this.selectedFacility['availability']['days'].includes(day)) {
      this.alltimeslotLists = this.generatingTS(this.selectedFacility);
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
    }
  }

  handleEmptyInput(event : any){
  
    if(event){
      this.selectedFacility = null;
      this.form.controls['timeslot'].setValue(null);
      this.alltimeslotLists = [];
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.form.controls['cost'].setValue(null);
      this.form.controls['cost'].disable();
      this.form.controls['charges'].setValue(null);
      this.form.controls['taxes'].setValue(null);
      this.form.controls['taxes'].disable();
   }
  }


  bookingdateChange(date: any) {
    if (date != undefined && date.value != undefined && date.value._d != undefined) {
      var date1 = new Date(date.value._d);
      var day = this.daysList[date1.getDay()];
      this.form.controls['timeslot'].setValue(null);
      this.alltimeslotLists = [];
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.selectedFacility['appointmentday'] = day;
      if (this.selectedFacility['availability']['days'].includes(day)) {
        this.alltimeslotLists = this.generatingTS(this.selectedFacility);
        this.timeslotfilteredOptions = of(this.alltimeslotLists);
      }
    }
  }
  onFacilityActivated() {
    if (this.form.controls['refid'].value !== undefined && this.form.controls['refid'].value == "") {
      this.selectedFacility = undefined;
    }
  }

  // onLocationSelected(event: any) {
  //   if (event && event._id) {
  //     this.getResort(event._id)
  //   } else {
  //     this.getResort();
  //   }
  // }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  displayFacFn(fac: any): string {
    return fac && fac.title ? fac.title : '';
  }
  timeDisplayFn(time: any): string {
    return time && time.displaytext ? time.displaytext : '';
  }
  displayCusFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
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

  generatingTS(service: any) {

    var timeslotList = [];
    var starttime = service['availability'].starttime; // 06:00
    var endtime = service['availability'].endtime;     // 14:00
    var duration = service['duration'];

    var startmin = starttime.split(":");      // 06:00
    var timehr = parseInt(startmin[0]);       // 06
    var timemin = parseInt(startmin[1]);      // 00
    var totalstartmin = timehr * 60 + timemin;// 360 + 00

    var endmin = endtime.split(":");            // 14:00
    var endtimehr = parseInt(endmin[0]);        // 14
    var endtimemin = parseInt(endmin[1]);       // 00
    var totalendmin = endtimehr * 60 + endtimemin;// 840 + 00

    for (var time = totalstartmin; time < totalendmin;) { //360

      timemin = Number(timemin);            //00
      var start;
      start = this.setdigit(timehr) + ":" + this.setdigit(timemin)
      // if (timemin <= 9) {
      //   start = timehr + ":" + "0" + timemin;  //06:00
      // } else {
      //   start = timehr + ":" + timemin;
      // }
      var end;
      if (duration <= 60) {
        timemin += parseInt(duration);        //60
        if (timemin >= 60) {
          timehr += 1;                        //07
          timemin -= 60;                      //00
        }
        end = this.setdigit(timehr) + ":" + this.setdigit(timemin)
        // if (timemin <= 9) {
        //   end = timehr + ":" + "0" + timemin;
        // } else {
        //   end = timehr + ":" + timemin;
        // }
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
        "disable": false,
      }
      timeslotList.push(obj);
      time += parseInt(duration);
    }
    return timeslotList;
  }

}

