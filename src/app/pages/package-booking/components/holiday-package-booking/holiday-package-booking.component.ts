import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';
import { CommonDataService } from '../../../../core/services/common/common-data.service';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
import * as moment from 'moment';

@Component({
  selector: 'app-holiday-package-booking',
  templateUrl: './holiday-package-booking.component.html'
})
export class HolidayPackageBookingComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChildren('destinationDayRef') destinationDayRef: QueryList<MatSelect>;
  @ViewChildren('transferDayRef') transferDayRef: QueryList<MatSelect>;
  @ViewChildren('flightDayRef') flightDayRef: QueryList<MatSelect>;
  @ViewChildren('activityDayRef') activityDayRef: QueryList<MatSelect>;

  form: FormGroup;
  submitted: boolean;
  isLoadingData: boolean;
  isLoadingtab: boolean;

  disableButton: boolean;
  disableButton2: boolean;

  today: Date = new Date();

  currentcounter : number = 0;
  ind: number = 0;
  status : string;

  resortlocation_fieldsArray : any[]= [];

  resortlocationTFrm_fieldsArray : any[]= [];
  resortlocationTTo_fieldsArray : any[]= [];

  resortlocationFFrm_fieldsArray : any[]= [];
  resortlocationFTo_fieldsArray : any[]= [];

  resortlocationE_fieldsArray : any[]= [];
  resort_fieldsArray : any[]= [];

  activity_fieldsArray : any[]= [];

  resortlocation_fields = {
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "locationname", "value": 1 },
    ],
    "form": {
      "apiurl": "resortlocations/filter",
      "formfield": "_id",
      "displayvalue": "locationname",
    },
    "method": "POST",
    "visible": true,
    "disabled": false,
    "dbvalue": {}
  };

  resort_fields = {
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "resortname", "value": 1 },
    ],
    "form": {
      "apiurl": "resorts/filter",
      "formfield": "_id",
      "displayvalue": "resortname",
    },
    "method": "POST",
    "visible": true,
    "disabled": false,
    "dbvalue": {}
  };

  event_fields = {
    "fieldname": "event",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "title", "value": 1 },
    ],
    "form": {
      "apiurl": "events/filter",
      "formfield": "_id",
      "displayvalue": "title",
    },
    "method": "POST",
    "visible": true,
    "disabled": false,
    "dbvalue": {}
  };

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  selectedCustomer: any;

  tourPackageList: any[] = [];
  tourPackagefilteredOptions: Observable<any[]>;
  selectedtourPackage: any;
  selectedchildtourPackage: any;
  availablePackages: any[] = [];
  availcapacity : number = 0;
  occupiedcapacity : number = 0;

  pid : string;
  cid : string;

  docnumber : string;
  displayBillBtnList: any[] = [];

  totalrooms: number[] = [1, 2, 3, 4];
  totaloccupants: number[] = [0, 1, 2, 3, 4, 5, 6];

  resortTypeLists: any [] = [];
  resortTypeLists_fieldsArray: any [] = [];

  durationList : any[] = [
    { id : 0 , name  : '1 Day/0 Nights' , day : 'Day 1' , night : 'Night 0' },
    { id : 1 , name  : '2 Day/1 Nights' , day : 'Day 2' , night : 'Night 1' },
    { id : 2 , name  : '3 Day/2 Nights' , day : 'Day 3' , night : 'Night 2' },
    { id : 3 , name  : '4 Day/3 Nights' , day : 'Day 4' , night : 'Night 3' },
    { id : 4 , name  : '5 Day/4 Nights' , day : 'Day 5' , night : 'Night 4' },
    { id : 5 , name  : '6 Day/5 Nights' , day : 'Day 6' , night : 'Night 5' },
    { id : 6 , name  : '7 Day/6 Nights' , day : 'Day 7' , night : 'Night 6' },
    { id : 7 , name  : '8 Day/7 Nights' , day : 'Day 8' , night : 'Night 7' },
    { id : 8 , name  : '9 Day/8 Nights' , day : 'Day 9' , night : 'Night 8' },
    { id : 9 , name  : '10 Day/9 Nights' , day : 'Day 10'  , night : 'Night 9'  },
    { id : 10 , name  : '11 Day/10 Nights' , day : 'Day 11' , night : 'Night 10' },
    { id : 11 , name  : '12 Day/11 Nights' , day : 'Day 12' , night : 'Night 11' },
    { id : 12 , name  : '13 Day/12 Nights' , day : 'Day 13' , night : 'Night 12' },
    { id : 13 , name  : '14 Day/13 Nights' , day : 'Day 14' , night : 'Night 13' },
    { id : 14 , name  : '15 Day/14 Nights' , day : 'Day 15' , night : 'Night 14' },
  ];

  subdurationList : any[] = [];
  subdurationnightArrayList : any[] = [];

  subdurationArrayList : any[] = [];
  subdurationTrnsArrayList : any[] = [];
  subdurationFltArrayList : any[] = [];
  subdurationActArrayList : any[] = [];

   constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonDataService: CommonDataService,
  ) {
    super();

    this.form = fb.group({
      'customerid' : ['', Validators.required],
      'tourpackageid' : [],
      'traveldate' : [, Validators.required],
      'bookedcapacity' : [],
      'quantity' : [1,Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'charges' : [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'totaladults' : [,Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'totalchildrens' : [,Validators.compose([, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'destinations' : fb.array([]),
      'transfer' :  fb.array([]),
      'flight' :  fb.array([]),
      'activity' : fb.array([]),
      'status' : ['active'],
      'notes' : [],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pid = params["pid"];
      this.cid = params["cid"];
    });
  }

 async addNewdestination() {
    const destin = this.form.get('destinations') as FormArray;

    this.resortlocation_fieldsArray[destin.controls.length] = this.resortlocation_fields;
    this.resortTypeLists_fieldsArray[destin.controls.length] = [];
    this.resortTypeLists_fieldsArray[destin.controls.length] = this.resortTypeLists;
    this.resort_fieldsArray[destin.controls.length] = [];
    this.resort_fieldsArray[destin.controls.length] = this.resort_fields;

    if(destin.controls.length > 0){
      const prevduration = (destin.controls[destin.controls.length-1] as FormGroup).get('day').value;
      const predObj = this.durationList.find(a=>a.day == prevduration);
      this.subdurationArrayList[destin.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
    }

    destin.push(this.fb.group({
      'day' : [ , Validators.required],
      'destination' : [, Validators.required],
      'resortid' : [],
      'totalrooms': [1, Validators.required],
      'occupants': this.fb.array([this.createItem()]),
      'checkin' : [, Validators.required],
      'checkout' : [, Validators.required],
    }));
    this.ind = 0;
    setTimeout(() => {
      if(this.destinationDayRef && this.destinationDayRef.last){
        this.destinationDayRef.last.focus();
      }
    }, 500);
    return;
  }

  createItem() {
    return this.fb.group({
      roomtype: [, Validators.required],
      quantity: [1, Validators.required],
      adults: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      childrens: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      includes: [],
      cost: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
    });
  }

  addNewtransfer() {
    const transfer = this.form.get('transfer') as FormArray;

    this.resortlocationTFrm_fieldsArray[transfer.controls.length] = this.resortlocation_fields;
    this.resortlocationTTo_fieldsArray[transfer.controls.length] = this.resortlocation_fields;

    if(transfer.controls.length > 0){
      const prevduration = (transfer.controls[transfer.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationTrnsArrayList[transfer.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationTrnsArrayList[transfer.controls.length] = this.subdurationList;
    }else{
      this.subdurationTrnsArrayList[0] = this.subdurationList;
    }
    transfer.push(this.fb.group({
      'day' : [ , Validators.required],
      'from' : [,Validators.required],
      'to' : [,Validators.required],
      'transfertype' : [],
      'cost' : [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      'duration' : [,Validators.required],
      'date' : [,Validators.required],
      'nightscover' : [],
      'facilities' : [],
    }));
    this.ind = 1;

    setTimeout(() => {
      if(this.transferDayRef){
        this.transferDayRef.last.focus();
      }
    }, 500);
  }

  addNewflight() {
    const flight = this.form.get('flight') as FormArray;

    this.resortlocationFFrm_fieldsArray[flight.controls.length] = this.resortlocation_fields;
    this.resortlocationFTo_fieldsArray[flight.controls.length] = this.resortlocation_fields;
    if(flight.controls.length > 0){
      const prevduration = (flight.controls[flight.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationFltArrayList[flight.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationFltArrayList[flight.controls.length] = this.subdurationList;
    }else{
      this.subdurationFltArrayList[0] = this.subdurationList;
    }
    flight.push(this.fb.group({
      'day' : [ , Validators.required],
      'from' : [],
      'to' : [],
      'cost' : [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      'duration' : [,Validators.required],
      'date' : [],
      'nightscover' : [],
      'tickettype' : [],
    }));
    this.ind = 2;
    setTimeout(() => {
      if(this.flightDayRef){
        this.flightDayRef.last.focus();
      }
    }, 500);
  }

  addNewactivity() {
    const activity = this.form.get('activity') as FormArray;
    this.activity_fieldsArray[activity.controls.length]  = this.event_fields;
    this.resortlocationE_fieldsArray[activity.controls.length] = this.resortlocation_fields;
    if(activity.controls.length > 0){
      const prevduration = (activity.controls[activity.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationActArrayList[activity.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationActArrayList[activity.controls.length] = this.subdurationList;
    }else{
      this.subdurationActArrayList[0] = this.subdurationList;
    }
    activity.push(this.fb.group({
      'day' : [ , Validators.required],
      'event' : [,Validators.required],
      'cost' : [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      'date' : [,Validators.required],
      'location' : [,Validators.required],
      'duration' : [,Validators.required],
      'description' : [],
      'includes' : [],
    }));
    this.ind = 3;
    setTimeout(() => {
      if(this.activityDayRef){
        this.activityDayRef.last.focus();
      }
    }, 500);
  }

  removeDestination(ind : number){
    const fnd = this.form.get('destinations') as FormArray;
    fnd.removeAt(ind);
  }

  removeTransfer(ind : number){
    const fnd = this.form.get('transfer') as FormArray;
    fnd.removeAt(ind);
  }

  removeFlight(ind : number){
    const fnd = this.form.get('flight') as FormArray;
    fnd.removeAt(ind);
  }

  removeActivity(ind : number){
    const fnd = this.form.get('activity') as FormArray;
    fnd.removeAt(ind);
  }

  onTabChanged(value : any){
    this.isLoadingtab = true;
      setTimeout(() => {
      this.isLoadingtab = false;
      }, 1000);
  }

  chooseRoom(room: number , at : number) {
    const destin = this.form.get('destinations') as FormArray;
    const occupants = destin.controls[at].get('occupants') as FormArray;

    if (occupants.value.length < room) {
      for (let i = 1; i <= room; i++) {
        if (i > occupants.value.length) {
          occupants.push(
            this.fb.group({
              roomtype: [, Validators.required],
              adults: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
              childrens: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
              includes: [],
              quantity: [],
              cost: [,OnlyPositiveNumberValidator.insertonlypositivenumber],
            })
          );
        }
      }
    } else {
      for (let i = occupants.value.length; i > room; i--) {
        occupants.removeAt(i - 1);
      }
    }
    this.resortTypeLists_fieldsArray[at] = [];
    this.resortTypeLists_fieldsArray[at] = this.resortTypeLists;
  }

  displayCusFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }
  displayTPFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.LoadData();
      this.isLoadingData = false;
    } catch (error) {
      this.isLoadingData = false;
      console.error(error);
    }
  }

  async LoadData(){
    try{
    this.getResort();
    await this.getPackages();
    await this.addNewdestination();
    await this.getCustomer();
    if(this.bindId){
      await this.getBookingByid(this.bindId);
    }else if(this.pid && this.cid){
      this.setPackages(this.pid , this.cid);
    }else{
      this.subdurationList = this.durationList;
      this.subdurationArrayList = [];

      this.subdurationnightArrayList[0] =  [];

      this.subdurationArrayList[0] = [];
      this.subdurationTrnsArrayList[0] = [];
      this.subdurationFltArrayList[0] = [];
      this.subdurationActArrayList[0] = [];

      this.subdurationArrayList[0] = this.subdurationList;
      this.subdurationTrnsArrayList[0] = this.subdurationList;
      this.subdurationFltArrayList[0] = this.subdurationList;
      this.subdurationActArrayList[0] = this.subdurationList;
    }
    this.isLoadingtab = false;

    this.form
      .controls['customerid']
       .valueChanges
        .subscribe((cus)=>{
           if (cus) {
            this.customerfilteredOptions = of(this._customerfilter(cus));
          } else {
            this.customerfilteredOptions = of(this.customerList);
          }
        });

      this.form
        .controls['tourpackageid']
         .valueChanges
          .subscribe((tp)=>{
             if (tp) {
              this.tourPackagefilteredOptions = of(this._tourpackagefilter(tp));
            } else {
              this.tourPackagefilteredOptions = of(this.tourPackageList);
            }
          });

      this.form
      .controls['traveldate']
        .valueChanges
        .subscribe((td)=>{
          if(td && td._d){
            this.travelDateChnd(td._d);
          }
        });
    return;
  }catch(e){
    console.log("e",e);
  }
  }

 _tourpackagefilter(value: string): string[] {
    if(typeof(value) != 'string') return;
    let results = [];
    for (let i = 0; i < this.tourPackageList.length; i++) {
      if (this.tourPackageList[i].title.toLowerCase().indexOf((value).toLowerCase()) > -1) {
        results.push(this.tourPackageList[i]);
      }
    }
    return results;
  }

  dayChanges(value : any, i : any , types : string){
    if(types == 'destination'){
      const destin = this.form.get('destinations') as FormArray;
      destin.controls.splice(i+1 , destin.controls.length);
    }else if(types == 'transfer'){
      const transfer = this.form.get('transfer') as FormArray;
      transfer.controls.splice(i+1 , transfer.controls.length);
    }else if(types == 'activity'){
      const activity = this.form.get('activity') as FormArray;
      activity.controls.splice(i+1 , activity.controls.length);
    }else if(types == 'flight'){
      const flight = this.form.get('flight') as FormArray;
      flight.controls.splice(i+1 , flight.controls.length);
    }
  }

 getResort(){
    let postData = {};
    postData['search'] = [{ "searchfield": "lookup", "searchvalue": "roomtypes", "criteria": "eq", "datatype": "text" }];
    postData['formname'] = "tourpackage";

    let url = 'lookups/filter';
    let method = 'POST';

    this._commonService
      .commonServiceByUrlMethodData(url,method,postData)
      .pipe(takeUntil(this.destroy$))
        .subscribe((data : any)=>{
          this.resortTypeLists = [];
          this.resortTypeLists = data[0].data;

          this.resortTypeLists_fieldsArray = [];
          this.resortTypeLists_fieldsArray[0] = [];
          this.resortTypeLists_fieldsArray[0] = this.resortTypeLists;
        });
  }

 async getPackages(){
  let postData = {};
  postData['search'] = [{ "searchfield": "status", "searchvalue": "active" , "criteria": "eq", "datatype": "text" }];
  postData['formname'] = "tourpackage";

  let url = 'tourpackages/filter/view';
  let method = 'POST';

  await this._commonService
    .commonServiceByUrlMethodDataAsync(url,method,postData)
      .then((data : any)=>{
        this.tourPackageList = [];
        this.tourPackageList = data;
        this.tourPackagefilteredOptions = of(this.tourPackageList);
      }).catch((e)=>{ 
      });
  }

  async getCustomer() {
    let postData = {};
    postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];

    this.customerList = [];
    this.customerList = await this._commonService.AsyncContactsFilter(postData) as [];
    this.customerfilteredOptions = of(this.customerList);
  }

  onCustomerSelected(event: any) {
    this.selectedCustomer = event;
  }

  private _customerfilter(value: string): string[] {
    if(typeof(value) != 'string') return;
     let results = [];
      for (let i = 0; i < this.customerList.length; i++) {
        if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
          results.push(this.customerList[i]);
        }
      }
      return results;
  }

  dateValueChange(ind : number) {

  }

  handleEmptyInput(event: any){
    if(event){
      this.selectedtourPackage = null;
      this.selectedchildtourPackage= null;
      this.availablePackages= [];
      this.availcapacity = null;
      this.occupiedcapacity = null;

      this.form.controls['totaladults'].setValue(null);
      this.form.controls['totalchildrens'].setValue(null);
      this.form.controls['charges'].setValue(null);
      this.form.controls['traveldate'].setValue(null);

      this.form.controls['totaladults'].enable();
      this.form.controls['totalchildrens'].enable();
      this.form.controls['charges'].enable();

      const destin = this.form.get('destinations') as FormArray;
      const flight = this.form.get('flight') as FormArray;
      const transfer = this.form.get('transfer') as FormArray;
      const activity = this.form.get('activity') as FormArray;
      destin.clear();
      flight.clear();
      transfer.clear();
      activity.clear();
      this.addNewdestination();
   }
  }

  onItemAdded(event : any , ind : number , type : string , disabled ?: boolean){
    if(type == 'destination'){
      this.resortlocation_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocation_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocation_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'transferfrom'){
      this.resortlocationTFrm_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationTFrm_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocationTFrm_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'transferto'){
      this.resortlocationTTo_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationTTo_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocationTTo_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'flightfrom'){
      this.resortlocationFFrm_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationFFrm_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocationFFrm_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'flightto'){
      this.resortlocationFTo_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationFTo_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocationFTo_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'evnt'){
      this.activity_fieldsArray[ind] = Object.assign({},this.event_fields);
      this.activity_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.activity_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'evntlcn'){
      this.resortlocationE_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationE_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resortlocationE_fieldsArray[ind].disabled = disabled;
        });
      }
    }else if(type == 'resort'){
      this.resort_fieldsArray[ind] = Object.assign({},this.resort_fields);
      this.resort_fieldsArray[ind].dbvalue = event;
      if(disabled){
        setTimeout(() => {
          this.resort_fieldsArray[ind].disabled = disabled;
        });
      }
    }
  }

 onPackageSelected(event: any , isDisable ?: boolean) {
  this.selectedtourPackage = event;

  if(this.selectedtourPackage.status && this.selectedtourPackage.status == 'publish'){
    isDisable = true;
  }
  this.form.controls['totaladults'].setValue(null);
  this.form.controls['totalchildrens'].setValue(null);
  this.form.controls['charges'].setValue(null);
  this.form.controls['traveldate'].setValue(null);
  this.form.controls['bookedcapacity'].setValue(null);
  
  this.subdurationList = this.durationList;
  if(event){
    this.selectedtourPackage = event;
    this.availablePackages = [];
    if(this.selectedtourPackage.childpackages && this.selectedtourPackage.childpackages.length > 0){
      this.availablePackages = this.selectedtourPackage.childpackages.map((a)=>{
        return {'traveldate' : a.traveldate, '_id' : a._id , 'capacity' : a.capacity, 'bookedcapacity' : a.bookedcapacity }
      });
    }
    
    this.form.controls['totaladults'].setValue(this.selectedtourPackage.totaladults);
    this.form.controls['totalchildrens'].setValue(this.selectedtourPackage.totalchildrens);
    this.form.controls['charges'].setValue(this.selectedtourPackage.cost);
    this.form.controls['quantity'].setValue(1);
    this.form.controls['totaladults'].enable();
    this.form.controls['totalchildrens'].enable();
    this.form.controls['charges'].enable();

    this.selectedtourPackage.bookedcapacity += 1;
    this.form.controls['bookedcapacity'].setValue(this.selectedtourPackage.bookedcapacity);

    this.disableButton = false;
    if(this.selectedtourPackage.bookedcapacity > this.selectedtourPackage.capacity){
      this.showNotification("top", "right", "Package has been occupied !!", "danger");
      this.disableButton = true;
      return;
    }

    if(isDisable){
      this.form.controls['totaladults'].disable();
      this.form.controls['totalchildrens'].disable();
      this.form.controls['charges'].disable();
    }
    if(this.availablePackages.length > 0){
      if(this.availablePackages && this.availablePackages[0]){
        // this.form.controls['traveldate'].setValue(new Date(this.availablePackages[0].traveldate));
      }
    }
    var day = this.durationList.find(d=>d.name == this.selectedtourPackage.duration);

    this.subdurationList = this.durationList.filter(a=>a.id <= day.id);
    this.resortTypeLists_fieldsArray = [];
    this.subdurationnightArrayList = [];
    this.subdurationArrayList = [];
    if(this.selectedtourPackage.destinations && this.selectedtourPackage.destinations.length > 0){
      const destin = this.form.get('destinations') as FormArray;
      destin.clear();
       this.selectedtourPackage.destinations.forEach((destn, i) => {
          destin.push(
            this.fb.group({
              day: [{value : destn.day , disabled: isDisable}, Validators.required],
              destination: [{value : destn.destination,disabled: isDisable}, Validators.required],
              resortid: [destn.resortid],
              includes: [destn.includes],
              checkin: [{value : destn.checkin ,disabled: isDisable}, Validators.required],
              checkout: [{value : destn.checkout,disabled: isDisable}, Validators.required],
              totalrooms: [1, Validators.required],
              occupants: this.fb.array([this.createItem()]),
            })
          );
        this.resortlocation_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
        this.resortlocation_fieldsArray[i].dbvalue = destn.destination;
        this.resortlocation_fieldsArray[i].visible = false;
        this.resortTypeLists_fieldsArray[i] = this.resortTypeLists;
        this.subdurationnightArrayList[i] = [];
        this.subdurationnightArrayList[i].push(this.durationList[this.durationList.findIndex(a=>a.day == destn.day)]);
        this.subdurationnightArrayList[i].push(this.durationList[this.durationList.findIndex(a=>a.day == destn.day)+1]);
        this.subdurationArrayList[i] = [];
        this.subdurationArrayList[i] = this.subdurationList.filter(a=>a.day >= destn.day);
        setTimeout(() => {
            this.resortlocation_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocation_fieldsArray[i].visible = true;
        });
        this.resort_fieldsArray[i] = Object.assign({},this.resort_fields);
        this.resort_fieldsArray[i].dbvalue = destn.resortid;
     });
    }

    this.flightArray(this.selectedtourPackage.flight ,isDisable);
    this.transferArray(this.selectedtourPackage.transfer ,isDisable);
    this.activityArray(this.selectedtourPackage.activity ,isDisable);
   
    if(this.form.get('traveldate').value){
      this.travelDateChnd(this.form.get('traveldate').value);
    }
  }
 }

 setPackages(parent : string, child : string){
  let selectedPackage =  this.tourPackageList.find(a=>a._id == parent);
  this.form.controls['tourpackageid'].setValue(selectedPackage);
  this.onPackageSelected(selectedPackage,true);
  let selectedchildPackage =  selectedPackage.childpackages.find(a=>a._id == child);
  this.form.get('traveldate').setValue(selectedchildPackage.traveldate);
  this.travelDateChnd(this.form.get('traveldate').value);
 }

 flightArray(flights : any[] , isDisable : boolean){
  this.subdurationFltArrayList = [];
  if(flights && flights.length > 0){
    const flight = this.form.get('flight') as FormArray;
    flight.clear();
    let duration;
     flights.forEach((destn, i) => {
      duration = destn.duration.split(':');
        flight.push(
          this.fb.group({
            day: [{value : destn.day,disabled: isDisable},Validators.required],
            from: [{value : destn.from, disabled: isDisable} ,Validators.required],
            to: [{value : destn.to ,disabled: isDisable} ,Validators.required],
            cost: [destn.cost,OnlyPositiveNumberValidator.insertonlypositivenumber],
            duration: [{value : `${duration[0]}${duration[1]}` ,disabled: isDisable},Validators.required],
            date: [{value : destn.date, disabled: isDisable},Validators.required],
            nightscover: [{value : destn.nightscover ,disabled: isDisable}],
            tickettype: [destn.tickettype],
          })
        );
        this.resortlocationFFrm_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
        this.resortlocationFFrm_fieldsArray[i].dbvalue = destn.from;
        this.resortlocationFFrm_fieldsArray[i].visible = false;
        setTimeout(() => {
            this.resortlocationFFrm_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocationFFrm_fieldsArray[i].visible = true;
        });
        this.resortlocationFTo_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
        this.resortlocationFTo_fieldsArray[i].dbvalue = destn.to;
        this.resortlocationFTo_fieldsArray[i].visible = false;
        setTimeout(() => {
            this.resortlocationFTo_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocationFTo_fieldsArray[i].visible = true;
        });
        this.subdurationFltArrayList[i] = [];
        // this.subdurationFltArrayList[i] = this.subdurationList.filter(a=>a.day >= destn.day);
        this.subdurationFltArrayList[i] = this.subdurationList;
   });
  }
 }

 transferArray(transfers : any[] , isDisable : boolean){
  this.subdurationTrnsArrayList = [];
  if(transfers && transfers.length > 0){
    const transfer = this.form.get('transfer') as FormArray;
    transfer.clear();
    let duration;
     transfers.forEach((destn, i) => {
      duration = destn.duration.split(':');
        transfer.push(
          this.fb.group({
            day: [{value : destn.day , disabled: isDisable},Validators.required],
            from: [{value : destn.from, disabled: isDisable},Validators.required],
            to: [{value : destn.to,disabled: isDisable},Validators.required],
            cost: [destn.cost,OnlyPositiveNumberValidator.insertonlypositivenumber],
            duration: [{value : `${duration[0]}${duration[1]}` ,disabled: isDisable},Validators.required],
            transfertype: [destn.transfertype],
            date: [{value : destn.date ,disabled: isDisable},Validators.required],
            nightscover: [{value : destn.nightscover , disabled: isDisable}],
            facilities: [{value : destn.facilities , disabled: isDisable}],
          })
        );
        this.resortlocationTFrm_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
        this.resortlocationTFrm_fieldsArray[i].dbvalue = destn.from;
        this.resortlocationTFrm_fieldsArray[i].visible = false;
        setTimeout(() => {
            this.resortlocationTFrm_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocationTFrm_fieldsArray[i].visible = true;
        });
        this.resortlocationTTo_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
        this.resortlocationTTo_fieldsArray[i].dbvalue = destn.to;
        this.resortlocationTTo_fieldsArray[i].visible = false;
        setTimeout(() => {
            this.resortlocationTTo_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocationTTo_fieldsArray[i].visible = true;
        });
        this.subdurationTrnsArrayList[i] = [];
        // this.subdurationTrnsArrayList[i] = this.subdurationList.filter(a=>a.day >= destn.day);
        this.subdurationTrnsArrayList[i] = this.subdurationList;
   });
  }
 }

 activityArray(activities : any[] , isDisable : boolean){
  this.subdurationActArrayList = [];
  if(activities && activities.length > 0){
    const activity = this.form.get('activity') as FormArray;
    activity.clear();
    let duration;
     activities.forEach((destn, i) => {
      duration = destn.duration.split(':');
        activity.push(
          this.fb.group({
            day: [{value : destn.day, disabled: isDisable},Validators.required],
            event: [{value : destn.event,disabled: isDisable},Validators.required],
            location: [{value : destn.location,disabled: isDisable},Validators.required],
            cost: [destn.cost,OnlyPositiveNumberValidator.insertonlypositivenumber],
            date: [{value : destn.date, disabled: isDisable} ,Validators.required],
            includes: [destn.includes],
            description: [destn.description],
            duration: [{value : `${duration[0]}${duration[1]}` ,disabled: isDisable},Validators.required],
          })
        );
        this.activity_fieldsArray[i]  = Object.assign({},this.event_fields);;
        this.activity_fieldsArray[i].dbvalue  = destn.event;
        this.activity_fieldsArray[i].visible = false;

        this.resortlocationE_fieldsArray[i]  = Object.assign({},this.resortlocation_fields);
        this.resortlocationE_fieldsArray[i].dbvalue  = destn.location;

        setTimeout(() => {
            this.activity_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.activity_fieldsArray[i].visible = true;

            this.resortlocationE_fieldsArray[i].disabled = isDisable ? isDisable : false;
            this.resortlocationE_fieldsArray[i].visible = true;
        });
        this.subdurationActArrayList[i] = [];
        // this.subdurationActArrayList[i] = this.subdurationList.filter(a=>a.day >= destn.day);
        this.subdurationActArrayList[i] = this.subdurationList;
   });
  }
 }


 disableDate = (d: any | null): boolean => {
    if(this.selectedtourPackage){
      if(this.availablePackages.length > 0){
          let date = moment(d._d) ? moment(d._d) : moment(d);
          let bl =  this.availablePackages.find((avail) =>{
            let mavail = moment(avail.traveldate);
            return (mavail.year() == date.year() &&  mavail.month() == date.month() && mavail.date() == date.date());
          });
          return bl;
        }
    }else{
      return true;
    }
 }

 travelDateChnd(date : Date){
  var destination = this.form.get('destinations') as FormArray;
  var flight = this.form.get('flight') as FormArray;
  var transfer = this.form.get('transfer') as FormArray;
  var activity = this.form.get('activity') as FormArray;

  var dayObj, travelDate, inDate ,outDate;
    destination.controls.forEach((fg : FormGroup , ind : any) => {
      travelDate = new Date(date);
      dayObj = this.durationList.find(a=>a.day == fg.get('day').value);
      if(!dayObj) return;
      if(ind == 0){
        inDate = travelDate;
        outDate = new Date(travelDate.getFullYear() ,travelDate.getMonth(),travelDate.getDate() + dayObj.id);
      }else{
        inDate = new Date(destination.controls[ind-1].get('checkout').value);
        outDate = new Date(travelDate.getFullYear() ,travelDate.getMonth(),travelDate.getDate() + dayObj.id);
      }
      fg.get('checkin').patchValue(inDate);
      fg.get('checkout').patchValue(outDate);
    });

    flight.controls.forEach((fg : FormGroup , ind : any) => {
      travelDate = new Date(date);
      dayObj = this.durationList.find(a=>a.day == fg.get('day').value);
      inDate = new Date(travelDate.getFullYear() ,travelDate.getMonth(),travelDate.getDate() + dayObj.id);
      fg.get('date').patchValue(inDate);
    });
    transfer.controls.forEach((fg : FormGroup , ind : any) => {
      travelDate = new Date(date);
      dayObj = this.durationList.find(a=>a.day == fg.get('day').value);
      inDate = new Date(travelDate.getFullYear() ,travelDate.getMonth(),travelDate.getDate() + dayObj.id);
      fg.get('date').patchValue(inDate);
    });
    activity.controls.forEach((fg : FormGroup , ind : any) => {
      travelDate = new Date(date);
      dayObj = this.durationList.find(a=>a.day == fg.get('day').value);
      inDate = new Date(travelDate.getFullYear() ,travelDate.getMonth(),travelDate.getDate() + dayObj.id);
      fg.get('date').patchValue(inDate);
    });
    let mdate = moment(date);
    this.selectedchildtourPackage  =  this.availablePackages.find(a=>{
      return moment(a.traveldate).year()  ==  mdate.year() &&  moment(a.traveldate).month()  ==  mdate.month() && moment(a.traveldate).date()  ==  mdate.date();
    });
    this.availcapacity = 0;
    if(this.selectedchildtourPackage){
      this.availcapacity = this.selectedchildtourPackage.capacity - this.selectedchildtourPackage.bookedcapacity;
    }
 }

 async getBookingByid(id : any){

  var url = "packagebookings/";
  var method = "GET";

  await this._commonService
   .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
    .then((data: any) => {

      this.docnumber = `${data.prefix}-${data.tournumber}`;
      
      
      this.selectedCustomer = this.customerList.find(a=>a._id == data.customerid._id);
      this.form.controls['customerid'].setValue(this.selectedCustomer);
      let isDisable = false;
      if(data.package && data.package.basetourpackage){
        isDisable = true;
        this.selectedtourPackage = this.tourPackageList.find(a=>a._id == data.package.basetourpackage._id);
        this.selectedchildtourPackage =  this.selectedtourPackage.childpackages.find(a=>a._id == data.package._id);

        this.availablePackages = [];
        if(this.selectedtourPackage.childpackages && this.selectedtourPackage.childpackages.length > 0){
          this.availablePackages = this.selectedtourPackage.childpackages.map((a)=>{
            return {'traveldate' : a.traveldate, '_id' : a._id , 'capacity' : a.capacity, 'bookedcapacity' : a.bookedcapacity }
          });
        }
        
        
        this.availcapacity = 0;
        this.occupiedcapacity = 0;
        if(this.selectedchildtourPackage){
          this.availcapacity = this.selectedchildtourPackage.capacity - this.selectedchildtourPackage.bookedcapacity;
        }
        this.occupiedcapacity = data.quantity;
        
        this.form.controls['tourpackageid'].setValue(this.selectedtourPackage);
        var day = this.durationList.find(d=>d.name == this.selectedtourPackage.duration);
        this.subdurationList = this.durationList.filter(a=>a.id <= day.id);

        this.selectedtourPackage.bookedcapacity += 1;
        this.form.controls['bookedcapacity'].setValue(this.selectedtourPackage.bookedcapacity);

        this.disableButton = false;
        if(this.selectedtourPackage.bookedcapacity > this.selectedtourPackage.capacity){
          this.showNotification("top", "right", "Package has been occupied !!", "danger");
          this.disableButton = true;
          return;
        }
      }else{
        this.subdurationList = this.durationList;
      }

      this.form.controls['totaladults'].setValue(data.totaladults);
      this.form.controls['totalchildrens'].setValue(data.totalchildrens);
      this.form.controls['charges'].setValue(data.charges);
      this.form.controls['traveldate'].setValue(data.traveldate);

      this.form.controls['totaladults'].disable();
      this.form.controls['totalchildrens'].disable();
      this.form.controls['charges'].disable();
      
      this.form.controls['quantity'].setValue(data.quantity);
      

      if(data.destinations && data.destinations.length > 0){
        const destin = this.form.get('destinations') as FormArray;
        destin.clear();
        this.resortTypeLists_fieldsArray = [];

        var occupantsArray , tempArray;
        this.subdurationnightArrayList = [];
        this.subdurationArrayList = [];
        data.destinations.forEach((destn, i) => {
          if(!this.resortTypeLists_fieldsArray[i]){
            this.resortTypeLists_fieldsArray[i] = [];
          }
          this.resortTypeLists_fieldsArray[i] = this.resortTypeLists;
          tempArray  = [];
          occupantsArray = this.fb.array([]);
          if(destn.occupants && destn.occupants.length > 0){
           destn.occupants.forEach((ocp , subin) => {
               occupantsArray.push(
                  this.fb.group({
                    roomtype: [{value : ocp.roomtype ,disabled: isDisable}, Validators.required],
                    adults: [{value : ocp.adults ,disabled: isDisable},OnlyPositiveNumberValidator.insertonlypositivenumber],
                    childrens: [{value : ocp.childrens,disabled: isDisable},OnlyPositiveNumberValidator.insertonlypositivenumber],
                    includes: [{value : ocp.includes ,disabled: isDisable}],
                    quantity: [{value : ocp.quantity,disabled: isDisable}],
                    cost: [{value : ocp.cost ,disabled: isDisable},OnlyPositiveNumberValidator.insertonlypositivenumber],
                  })
                );
              tempArray.push(this.resortTypeLists);
            });
          }
            destin.push(
              this.fb.group({
                day: [{value :destn.day ,disabled: isDisable }, Validators.required],
                destination: [{value : destn.destination, disabled: isDisable}, Validators.required],
                includes: [{value : destn.includes ,disabled: isDisable}],
                resortid: [{value : destn.resortid ,disabled: isDisable}],
                checkin: [{value : destn.checkin,disabled: isDisable}, Validators.required],
                checkout: [{value : destn.checkout ,disabled: isDisable}, Validators.required],
                totalrooms: [{value : destn.totalrooms,disabled: isDisable}, Validators.required],
                occupants: occupantsArray,
              })
            );
          this.resortlocation_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
          this.resortlocation_fieldsArray[i].dbvalue = destn.destination;
          this.resortlocation_fieldsArray[i].visible = false;

          this.resort_fieldsArray[i] = Object.assign({},this.resort_fields);
          this.resort_fieldsArray[i].dbvalue = destn.resortid;
          this.resort_fieldsArray[i].visible = false;

          this.subdurationnightArrayList[i] = [];
          this.subdurationnightArrayList[i].push(this.durationList[this.durationList.findIndex(a=>a.day == destn.day)]);
          this.subdurationnightArrayList[i].push(this.durationList[this.durationList.findIndex(a=>a.day == destn.day)+1]);
          this.subdurationArrayList[i] = [];
          this.subdurationArrayList[i] = this.subdurationList.filter(a=>a.day >= destn.day);
          setTimeout(() => {
            this.resortlocation_fieldsArray[i].disabled = isDisable;
            this.resortlocation_fieldsArray[i].visible = true;

            this.resort_fieldsArray[i].disabled = isDisable;
            this.resort_fieldsArray[i].visible = true;
          });
       });
      }

      this.flightArray(data.flight ,isDisable);
      this.transferArray(data.transfer ,isDisable);
      this.activityArray(data.activity ,isDisable);
  
      if(data.status){
        if(data.status == 'confirmed' ){
          this.disableButton = true;
        }else if(data.status == 'cancelled'){
          this.disableButton2 = true;
          this.disableButton = true;
        }
      }

      if(data.billid && data.billid._id){
        this.displayBillBtnList.push({editurl : '/pages/dynamic-preview-list/bill-packagebooking/'+ data.billid._id ,displayName : "View Invoice"});
        this.getBillPaymentByBill(data.billid._id);
      }
    });
 }
 

 getBillPaymentByBill(billid : any){
  var url = "billpayments/filter";
  var method = "POST";

  let postData = {};
  postData['search'] = [];
  postData['search'].push({ "searchfield": 'billid', "searchvalue": billid, "criteria": "eq", "datatype": "ObjectId" });

  this._commonService
    .commonServiceByUrlMethodData(url, method, postData)
    .pipe(takeUntil(this.destroy$))
    .subscribe((bills: any) => {
      if (bills && bills.length > 0) {
        if(bills.length == 1){
          this.displayBillBtnList.push({editurl : '/pages/dynamic-preview-list/billpaymentpackage/'+ bills[0]._id ,displayName : "View Receipt"});
        }else{
          this._commonDataService.isfilterDataForGlobalSearch  = true;
          this._commonDataService.filterDataForGlobalSearchparams['search'] = [];
          this._commonDataService.filterDataForGlobalSearchparams['search'].push({ "searchfield": 'billid', "searchvalue": billid, "criteria": "eq", "datatype": "ObjectId" });
          this.displayBillBtnList.push({editurl : '/pages/dynamic-list/list/billpaymentpackage' ,displayName : "View Receipts"});
        }
      }
    });

 }

  onSubmit(value: any, valid : boolean){
    this.submitted = true;
    if(this.selectedtourPackage && value.quantity > this.availcapacity){
      super.showNotification("top", "right", "Capacity not available !!", "danger");
      return;
    }

    let destinations =  this.form.controls['destinations'] as FormArray;
    let transfer =  this.form.controls['transfer'] as FormArray;
    let flight =  this.form.controls['flight'] as FormArray;
    let activity =  this.form.controls['activity'] as FormArray;


    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      if(destinations.invalid) {
         this.ind = 0;
      }else if(transfer.invalid) {
          this.ind = 1;
      }else if(flight.invalid) {
          this.ind = 2;
      }else if(activity.invalid) {
        this.ind = 3;
      }
      return;
    }else if(destinations.length == 0 &&  transfer.length == 0 && flight.length == 0 && activity.length == 0){
      super.showNotification("top", "right", "Atleast one type !!", "danger");
      return;
    }
    var url = "packagebookings";
    var method = this.bindId ? "PUT" : "POST";
    var model = this.form.getRawValue();

    model['traveldate'] = model.traveldate && model.traveldate._d ? model.traveldate._d  : model.traveldate;
    if(this.selectedtourPackage){
      model['package'] = this.selectedchildtourPackage && this.selectedchildtourPackage._id ? this.selectedchildtourPackage._id : null;
      model['bookedcapacity'] = model.quantity + this.selectedchildtourPackage.bookedcapacity;
    }
    model['itemid'] = this.selectedtourPackage && this.selectedtourPackage.itemid && this.selectedtourPackage.itemid._id ? this.selectedtourPackage.itemid._id : null;
    model['customerid'] = this.selectedCustomer._id;
    model['bookingdate']  = this.today;
    if (this.selectedCustomer.type == 'M') {
      model['onModel'] = "Member";
    } else if (this.selectedCustomer.type == 'C') {
      model['onModel'] = "Prospect";
    } else if (this.selectedCustomer.type == 'U') {
      model['onModel'] = "User";
    } else {
      model['onModel'] = "User";
    }
    var count = 0;
    model['destinations'].forEach((desgn) => {
      desgn.checkin = desgn.checkin && desgn.checkin._d ? desgn.checkin._d : desgn.checkin;
      desgn.checkout = desgn.checkout && desgn.checkout._d ? desgn.checkout._d : desgn.checkout;

      if(desgn.occupants && desgn.occupants.length > 0){
        desgn.occupants.map((ocp,i) => {
          ocp.room = i+1;
        });
      }
    });
    model['activity'].forEach((actv) => {
      actv.duration = this.subStr(actv.duration);
      actv.date = actv.date && actv.date._d ? actv.date._d : actv.date;
    });
    model['flight'].forEach((actv) => {
      actv.duration = this.subStr(actv.duration);
      actv.date = actv.date && actv.date._d ? actv.date._d : actv.date;
      if((actv.from.autocomplete_id &&  actv.to.autocomplete_id && actv.from.autocomplete_id ==  actv.to.autocomplete_id)){
        count++;
      }else if(actv.from &&  actv.to &&  actv.from ==  actv.to){
        count++;
      }
    });
    model['transfer'].forEach((actv) => {
      actv.duration = this.subStr(actv.duration);
      actv.date = actv.date && actv.date._d ? actv.date._d : actv.date;
      if((actv.from.autocomplete_id &&  actv.to.autocomplete_id && actv.from.autocomplete_id ==  actv.to.autocomplete_id)){
        count++;
      }else if(actv.from &&  actv.to &&  actv.from ==  actv.to){
        count++;
      }
    });
    model['status'] = this.status;
    model['property'] = {};
    model['property']["notes"] = "";
    model['property']["notes"] = value.notes;

    if(count>0){
      this.showNotification("top", "right", "Source and destination are not same !!", "danger");
      return;
    }

    console.log("model",model);

    this.disableButton = true;
    this.disableButton2 = true;
      this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
        .then((data: any) => {
          // console.log("data",data);
          if (data) {
            if(data && data.billid && data.billid._id){
              this.showNotification("top", "right", "Package booked successfully !!", "success");
              this._router.navigate(['/pages/event/booking-payment/' + data.billid._id]);
            }else{
                this.showNotification("top", "right", "Package booked successfully !!", "success");
                this._router.navigate([`/pages/dynamic-list/list/packagebooking`]);
            }
            this.disableButton = false;
            this.disableButton2 = false;
          }
        }).catch ((e) =>{
          this.disableButton = false;
          this.disableButton2 = false;
          this.showNotification("top", "right", "Something went wrong !!", "danger");
          this._router.navigate([`/pages/dynamic-list/list/packagebooking`]);
        });
  }

 async cancelBooking(){
  swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to revert this !',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancelled it!',
    cancelButtonText: 'No',
    customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
    },
    buttonsStyling: false
}).then(async (result) => {
    if (result.value) {

      this.disableButton = true;
      this.disableButton2 = true;
    
      var url = "common/updatestatus";
      var method = "POST";

      let model = {
          'ids' : [this.bindId],
          'schemaname' : "packagebookings",
          'value' : "cancelled",
      };

      await this._commonService
         .commonServiceByUrlMethodDataAsync(url, method, model)
         .then(async (data: any) => {
          if (data) {
            if(this.displayBillBtnList.length == 0){
              this.showNotification('top', 'right', 'Booking cancelled successfully !!', 'success');
              this._router.navigate([`/pages/dynamic-list/list/packagebooking`]);
              return;
            }

            var url = "tourpackages";
            var method = "PATCH";
            let model = {};
            let pid = this.selectedchildtourPackage && this.selectedchildtourPackage._id ? this.selectedchildtourPackage._id : null;
            model['bookedcapacity'] = this.selectedchildtourPackage.bookedcapacity - this.occupiedcapacity;

            await this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model ,pid)
            .then(async (data: any) => {
             if (data) {
               console.log("data",data);

               this._router.navigate(['/pages/payment-module/credit-debit-note/customer-refund/customer/'+this.selectedCustomer._id]);
               this.showNotification('top', 'right', 'Booking cancelled successfully !!', 'success');
  
               this.disableButton = false;
               this.disableButton2 = false;
             }
            });
          }
      });
    }
  });

  }

  subStr(str : string) {
    let s1=  str.substring(0,2);
    let s2=  str.substring(2,4);
    return  `${this.setdigit(parseInt(s1))}:${this.setdigit(parseInt(s2))}`;
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


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
