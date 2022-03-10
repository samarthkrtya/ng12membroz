import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, startWith, finalize, tap, switchMap} from 'rxjs/operators';
import * as moment from 'moment';

import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators, OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';

import { CommonService } from '../../../../core/services/common/common.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { AppointmentService } from '../../../../core/services/service/appointment.service';
import { AppointmentModel } from '../../../../core/models/appointment/appointment.model';


@Component({
  selector: 'app-appointment-booking-form',
  templateUrl: './appointment-booking-form.component.html',
})

export class AppointmentBookingFormComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  appointmentModel = new AppointmentModel()
  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  today: Date = new Date();

  serviceList: any[] = [];
  servicefilteredOptions: Observable<any[]>;

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false; 

  selectedCustomer: any;
  selectedService: any;
  customerId: any;
  status : string;
  redirectUrl: string;

  alltimeslotLists: any[] = [];
  timeslotfilteredOptions: Observable<any[]>;
  
  daysList: any[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  customerfields = {
    "fieldname": "attendee",
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

  hostid = new FormControl();
  hostoptions: string[] = [];
  filteredHostOptions: Observable<string[]>;
  allHostLists: any[] = [];
  hostisLoadingBox: boolean = false;


  displayFn2(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }


  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _commonService: CommonService,
    private _appointmentService: AppointmentService,
    private _serviceService: ServiceService,
  ) {
    super();
    this.form = this.fb.group({
      'attendee': ['', Validators.compose([Validators.required])],
      'appointmentdate': [new Date(), Validators.required],
      'refid': ['', Validators.compose([Validators.required,BasicValidators.objects])],
      'timeslot': ['', Validators.compose([Validators.required])],
      'hostid': [this.hostid],
      'cost': [0],
      'charges': [0],
      'taxes': [[]],
      'duration': [''],
      'discount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'notes': [''],
      'status': ['active'],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.customerId = params["cid"];
      this.pagename = 'appointmentbooking-form';
    });
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

    this.filteredHostOptions = this.hostid.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this._hostfilter(option) : this.allHostLists.slice())
      );

      
      var loadingDone = true;

      // this.form.controls['attendee']
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

      this.form.controls['attendee']
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
    this.allHostLists = [];
    await this.getServices();
    if (this.isMemberLogin) {
      // this.customerfields.dbvalue = this.currUserid; 
      this.selectedCustomer = this._loginUser;
      this.selectedCustomer['nickname'] = `${this.selectedCustomer?.fullname} ${ this.selectedCustomer?.property?.mobile ?  ' | ' + this.selectedCustomer?.property?.mobile : ''} ${ this.selectedCustomer.membernumber ?  ' | ' + this.selectedCustomer.membernumber : ''}`;
      
      this.selectedCustomer['primaryemail'] = this.selectedCustomer.property.primaryemail; 
      this.selectedCustomer['mobile'] = this.selectedCustomer.property.mobile; 
      this.selectedCustomer['type'] = "M";

      this.form.get('attendee').setValue(this.selectedCustomer);
      this.form.get('attendee').disable();
      
    }else if(this.customerId){
      this.customerfields.dbvalue = this.customerId;
    }
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
        this.servicefilteredOptions = of(this.serviceList);
      });
  }

  async getBookingByid(id: any) {
    await this._appointmentService
      .AsyncGetById(id)
      .then((data: any) => {
        if(data.attendee && data.attendee._id){
          this.customerfields.dbvalue = data.attendee._id;
          this.selectedCustomer = data.attendee;
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
          this.form.controls['attendee'].setValue(this.selectedCustomer);
        }
        
        this.selectedService = this.serviceList.find(b => (data.refid != undefined && data.refid._id !== undefined) ? (b._id === data.refid._id) : (b._id === data.refid));
        this.form.controls['refid'].setValue(this.selectedService);
        //this.form.controls['checkin'].setValue(data.checkin);
        //this.form.controls['checkout'].setValue(data.checkout);

        this.form.controls['appointmentdate'].setValue(data.appointmentdate);
        this.form.controls['cost'].setValue(this.selectedService.charges);
        this.form.controls['cost'].disable();
        this.form.controls['charges'].setValue(this.selectedService.charges);
        if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
          this.form.controls['taxes'].setValue(this.selectedService.taxes);
        }
        this.form.controls['taxes'].disable();

        var date1 = new Date(data.appointmentdate);
        var day = this.daysList[date1.getDay()];
        this.selectedService['appointmentday'] = day;
        this.alltimeslotLists = [];
        this.timeslotfilteredOptions = of(this.alltimeslotLists);
        if (this.selectedService['availability']['days'].includes(day)) {
          this.alltimeslotLists = this.generatingTS(this.selectedService);
          this.timeslotfilteredOptions = of(this.alltimeslotLists);
        }
        var slot;
        if (this.alltimeslotLists.length > 0) {
          slot = this.alltimeslotLists.find(a => a.starttime == data.timeslot.starttime && a.endtime == data.timeslot.endtime);
        }
        this.form.controls['timeslot'].setValue(slot);
        this.form.controls['duration'].setValue(this.selectedService.duration);
        this.disableButton = data.status && data.status == 'checkout';
        this.hostid.setValue(data.host);
      });
  }

  chooseTimeslot(timeslot : any){
    this.form.get('timeslot').setValue(timeslot);
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

  async Save(model?: AppointmentModel) {
    return await this._appointmentService.AsyncAdd(model);
  }

  async Update(id?: any, model?: AppointmentModel) {
    return await this._appointmentService.AsyncUpdate(id, model);
  }

  ActionCall() { }
  Delete() { }

  async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;
    
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }

    if(this.status == "confirmed" && this.hostid.value == null) {
      super.showNotification("top", "right", "please select service provider inorder to make confirmed !!!", "danger");
      return;
    }
    value = this.form.getRawValue();
    this.appointmentModel = value;
    
    this.appointmentModel.host = value?.hostid?.value?._id;

    // remove hostid
    delete this.appointmentModel["hostid"];

    this.appointmentModel.attendee = value.attendee._id;
    this.appointmentModel.customerid = this.appointmentModel.attendee;
    if (this.selectedCustomer.type == 'M') {
      this.appointmentModel.onModel = "Member";
    } else if (this.selectedCustomer.type == 'C') {
      this.appointmentModel.onModel = "Prospect";
    } else if (this.selectedCustomer.type == 'U') {
      this.appointmentModel.onModel = "User";
    } else {
      this.appointmentModel.onModel = "Member";
    }
    if (value.refid && value.refid._id) {
      this.appointmentModel.refid = value.refid;
    } else {
      this.appointmentModel.refid = null;
    }

    if(!this.isMemberLogin){
      // this.appointmentModel.host = this._loginUserId;
      this.appointmentModel.host = this.hostid.value && this.hostid.value._id ? this.hostid.value._id : this.hostid.value;
    }
    this.appointmentModel.status = this.status;


    // console.log("appointmentModel", this.appointmentModel);
    this.disableButton = true;
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.appointmentModel);
      } else {
        res = await this.Update(this.bindId, this.appointmentModel);
      }
      if(res.billid && res.billid._id){
        this._router.navigate(['/pages/event/booking-payment/'+ res.billid._id]);
      } else {
        if (this.isMemberLogin) {
          this._router.navigate(['/pages/dynamic-list/list/myappointment']);
        } else {
          this._router.navigate(['/pages/dynamic-list/list/appointment']);
        }
      }
      super.showNotification("top", "right", "Appointment saved successfully  !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
      if (this.isMemberLogin) {
        this._router.navigate(['/pages/dynamic-list/list/myappointment']);
      } else {
        this._router.navigate(['/pages/dynamic-list/list/appointment']);
      }
    }
  }

  cancelbookingform() {
    if (this.isMemberLogin) {
      this._router.navigate(['/pages/dynamic-list/list/myappointment']);
    } else {
      this._router.navigate(['/pages/dynamic-list/list/appointment']);
    }
  }
  
  onCustomerSelected() {
    this.selectedCustomer = this.form.controls['attendee'].value; 
    console.log("this.selectedCustomer", this.selectedCustomer);
    if(this.selectedCustomer.type == "M"){
      this.redirectUrl = '/pages/members/profile/'+ this.selectedCustomer._id;
    }else if(this.selectedCustomer.type == "C"){
      this.redirectUrl = '/pages/customer-module/profile/'+ this.selectedCustomer._id;
    }
  }

  onServiceSelected(event: any) {

    this.selectedService = event;

    this.form.controls['timeslot'].setValue(null);
    this.form.get('timeslot').setValidators([Validators.required]);
    this.form.get('timeslot').updateValueAndValidity();

    this.form.controls['cost'].setValue(this.selectedService.charges);
    this.form.controls['cost'].disable();
    this.form.controls['charges'].setValue(this.selectedService.charges);
    if (this.selectedService.taxes && this.selectedService.taxes.length > 0) {
      this.form.controls['taxes'].setValue(this.selectedService.taxes);
    }
    this.form.controls['taxes'].disable();
    var date = new Date();
    var day = this.daysList[date.getDay()];
    this.selectedService['appointmentday'] = day;
    if (this.selectedService['availability']['days'].includes(day)) {
      this.alltimeslotLists = this.generatingTS(this.selectedService);
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
    }
    this.form.controls['duration'].setValue(this.selectedService.duration);

    if (this.selectedService.staff && this.selectedService.staff.length > 0) {
      this.allHostLists = [];
      this.allHostLists = this.selectedService.staff;
    }
  }

  handleEmptyInput(event: any){
    
    if(event){
      this.selectedService = null;
      this.form.controls['timeslot'].setValue(null);
      this.alltimeslotLists = [];
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.form.controls['cost'].setValue(null);
      this.form.controls['cost'].disable();
      this.form.controls['charges'].setValue(null);
      this.form.controls['taxes'].setValue(null);
      this.form.controls['taxes'].disable();
      this.form.controls['duration'].setValue(null);
   }
  }


  appointmentdateChange(date: any) {
      if(!this.selectedService){
        super.showNotification("top", "right", "Select service !!", "danger");
        return;
      }
      if(!date || !date._d){
        super.showNotification("top", "right", "Select date !!", "danger");
        return;
      }
      var date1 = new Date(date._d);
      var day = this.daysList[date1.getDay()];
      this.form.controls['timeslot'].setValue(null);
      this.alltimeslotLists = [];
      this.timeslotfilteredOptions = of(this.alltimeslotLists);
      this.selectedService['appointmentday'] = day;
      if (this.selectedService['availability']['days'].includes(day)) {
        this.alltimeslotLists = this.generatingTS(this.selectedService);
        this.timeslotfilteredOptions = of(this.alltimeslotLists);
      }
  }

  onFacilityActivated() {
    if (this.form.controls['refid'].value !== undefined && this.form.controls['refid'].value == "") {
      this.selectedService = undefined;
    }
  }

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
      //   start = this.setdigit(timehr) + ":" + "0" + timemin;  //06:00
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

  enterHost() {
    const controlValue = this.hostid.value;
    this.hostid.setValue(controlValue);
  }

  preloadHostdata() {
    if (this.allHostLists && this.allHostLists.length == 0) {
      this.onServiceSelected(this.form.controls['refid'].value);
    }
  }

  handleEmptyHostInput(event: any) {
    if (event.target.value === '') {
      this.hostid.setValue("");
      this.allHostLists = [];
    }
  }

  onlinePay(){
    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?appointmentid=${this.bindId}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }

  displayFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  displayHostFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  optionHostSelected(option: any) {
    this.hostid.setValue(option.value);
  }

  private _hostfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allHostLists
        .filter(option => {
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
      results = this.allHostLists.slice();
    }
    return results;
  }

}

