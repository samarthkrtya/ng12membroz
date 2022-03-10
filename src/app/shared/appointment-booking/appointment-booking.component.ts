import { Component, ChangeDetectorRef , OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

import { debounceTime, distinctUntilChanged, finalize, first, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { async, of, Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';

import {MatExpansionPanel} from '@angular/material/expansion';

import { AppointmentModel } from '../../core/models/appointment/appointment.model';

import swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatOptionSelectionChange } from '@angular/material/core';

declare var $: any;

export const _filter = (opt: any[], value: any): any[] => {
  const filterValue = value.toLowerCase();
  return opt.filter(item => item.type.toLowerCase().includes(filterValue) || item.title.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-appointment-booking',
  templateUrl: './appointment-booking.component.html',
  styles: [
    `
      ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
        border: 2px solid !important
      }
    
      ::ng-deep dynamic-autocomplete mat-form-field.mat-form-field.example-full-width{
        margin-bottom: -1.00em !important;
      }

      .font-size-75 {
        font-size: 75% !important;
      }


      .example-action-buttons {
        padding-bottom: 20px;
      }

      .example-headers-align .mat-expansion-panel-header-title,
      .example-headers-align .mat-expansion-panel-header-description {
        flex-basis: 0;
      }

      .example-headers-align .mat-expansion-panel-header-description {
        justify-content: space-between;
        align-items: center;
      }

      .example-headers-align .mat-form-field + .mat-form-field {
        margin-left: 8px;
      }

      .example-form {
        min-width: 150px;
        max-width: 500px;
        width: 100%;
      }

      .example-full-width {
        width: 100%;
      }

      .example-option-img {
        vertical-align: middle;
        margin-right: 8px;
      }

      [dir='rtl'] .example-option-img {
        margin-right: 0;
        margin-left: 8px;
      }

      .nonworking {
        border: 1px solid red;
      }

      .mat-accordion .mat-expansion-panel-header {
        font-size: 1.00rem !important;
      }
    `
  ]
})
export class AppointmentBookingComponent extends BaseLiteComponemntComponent implements OnInit  {

  @ViewChildren(MatExpansionPanel) pannels:QueryList<MatExpansionPanel> 

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;
  
  _appointmentModel = new AppointmentModel();

  _id: any;
  date: Date;
  assign: any;
  
  @Input() dataContent: any;
  @Input() customerid: any;
  @Input() type: any;
  @Input() passondate: Date;
  @Input() selectInfo: any;
  @Input() isEdit: boolean;
  @Input() isReschedule: boolean;
  @Input() selectedAppointment: any;
  @Input() services: any;
  @Input() frontdeskdata: any;
  
  
  @Output() onAppointmentData = new EventEmitter();

  assignLists: any[] = [
    { id: "individual", name: "Individual", checked: true },
    { id: "group", name: "Group", checked: false }
  ];

  attendee = new FormControl();
  attendeeoptions: string[] = [];
  filteredAttendeeOptions: any;
  allAttendeeLists: any[] = [];
  attendeeisLoadingBox: boolean = false;

  group = new FormControl();
  groupoptions: string[] = [];
  filteredGroupOptions: Observable<string[]>;
  allGroupLists: any[] = [];
  groupisLoadingBox: boolean = false;

  service = new FormControl();
  serviceLists: any [] = [];
  filteredServices: Observable<any[]>;
  allServiceLists: any [] = [];
  allPackageLists: any [] = [];
  serviceisLoadingBox: boolean = false;

  appointmentLists: any [] = [];

  holidayLists: any [] = [];
  workinghours: any = {};

  recurringoccuranceLists: any[] = [];

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  step = 0;

  newCustomer: boolean = false;
  newGroup: boolean = false;

  busy: boolean = false;
  isEditVisible : boolean = false;
  
  minDate: Date;
  noshowAlert: boolean = false;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {


    super()
    this.pagename = "app-appointment-booking";

    this.form = fb.group({
      '_id': [this._id],
      'service': [this.service, { validators: [Validators.required] }],
      'assign': [this.assign],
      'attendee': [this.attendee, { validators: [] }],
      'isattendeeemail': [],
      'group': [this.group, { validators: [] }],
      'appointments': this.fb.array([])
    });

   }

  async ngOnInit() {

    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.getServiceLists()
      await this.getpackageLists()
      await this.getAllHolidays()
      if (this.type == "multi") {
        this.onAssignChanged("individual");
        await this.getAllGroups();
      }
      if(this.frontdeskdata)this.fillDatas();
      
    } catch (error) {
      console.error("error", error)
    } finally {
      
      if(this.isEdit || this.isReschedule) {
        await this.editFillValue()
      }
    }

    this.attendee.valueChanges
      .pipe(
        debounceTime(500),
        tap(item =>{
          this.filteredAttendeeOptions = [];
          if(item.length == 0) {
            this.attendeeisLoadingBox = false;
          } else {
            this.attendeeisLoadingBox = true;
          }
        }),
        switchMap((value) => 
          value.length > 2
          ? this._commonService.searchContact(value, 1)
            .pipe(
              finalize(() => {
                this.attendeeisLoadingBox = false
              }),
            )
          : []
        )
      )
      .subscribe(data => {
        this.filteredAttendeeOptions = [];
        this.filteredAttendeeOptions = data;
      });

    this.filteredGroupOptions = this.group.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._groupfilter(option) : this.allGroupLists.slice())
      );

    this.filteredServices = this.service.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._filterService(option) : this.serviceLists.slice())
      );

  }

  ngAfterViewChecked() {
    //your code to update the model
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.date = new Date(this.passondate);

    this.allServiceLists = [];
    this.allPackageLists = [];

    this.allAttendeeLists = [];
    this.allGroupLists = [];

    this.group.setValue(null)
    this.attendee.setValue(null)
    this.service.setValue(null)

    this.assign = "individual";
    this.form.get('assign').setValue('individual');

    this.recurringoccuranceLists = [];
    for (var i = 2; i < 52; i++) {
      this.recurringoccuranceLists.push(i);
    }

    this.holidayLists = [];

    this.workinghours = {};
    var branch  = this._authService.currentUser.user.branchid;
    this.workinghours = branch.workinghours;

    this.newCustomer = false;
    

    if(this.isEdit || this.isReschedule) {
      this.busy = true;
      this.isEditVisible = true;
    } else {
      this.busy = false;
      this.isEditVisible = false; 
    }
    this.assign = "individual";

    if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowAppointmentInThepast == "Yes") {
      this.minDate = new Date(2000, 0, 1);
    } else {
      this.minDate = new Date();
    }
    
    this.noshowAlert = false;

    return;
  }

 async fillDatas(){
    
    if(this.frontdeskdata.customerid) {
      this.optionAttendeeSelected(this.frontdeskdata?.customerid);
      this.attendee.disable();
    }
    if(this.frontdeskdata.refid) {
      let services , serviceObjbycat = this.serviceLists.find(p=>p._id == this.frontdeskdata.refid.categoryid);
      if(serviceObjbycat) {
        if(serviceObjbycat && serviceObjbycat.children && serviceObjbycat.children.length > 0 ) {
          services = serviceObjbycat.children.find(a=>a._id == this.frontdeskdata.refid._id);
        }
      } 
      let obj = { value: services };
      await this.optionSelected(obj);
      }
  }

  async editFillValue() {

    if(this.isEdit || this.isReschedule || this.form.get("_id")) {
      this._id = this.selectedAppointment._id;
      this.form.get("_id").setValue(this.selectedAppointment._id);
    }

    if(this.selectedAppointment && this.selectedAppointment.attendee && this.selectedAppointment.attendee._id) {

      if(this.selectedAppointment.onModel == "Groupclass") {
        this.assign="group";
        this.onAssignChanged(this.assign);
        if(this.form.get("assign")) {
          this.form.get("assign").setValue(this.assign);
        }
        if(this.form.get("group")) {
          this.group.setValue(this.selectedAppointment.attendee);
          this.form.get("group").setValue(this.selectedAppointment.attendee);
        }
        
      } else {
        this.assign="individual";
        this.onAssignChanged(this.assign);
        if(this.form.get("assign")) {
          this.form.get("assign").setValue(this.assign);
          this.type == "multi";
        }
        if(this.form.get("attendee")) {
          this.selectedAppointment.attendee.nickname = this.selectedAppointment?.attendee?.fullname;
          this.selectedAppointment.attendee.primaryemail = this.selectedAppointment?.attendee?.property?.primaryemail;
          this.attendee.setValue(this.selectedAppointment.attendee);
          this.form.get("attendee").setValue(this.selectedAppointment.attendee);
        }
      }

    }

    if(this.selectedAppointment && this.selectedAppointment.refid && this.selectedAppointment.refid._id) {
      if(this.form.get("service")) {
        this.selectedAppointment.refid.type = "service";
        this.selectedAppointment.refid.id = this.selectedAppointment.refid._id;
        this.service.setValue(this.selectedAppointment.refid);
        this.form.get("service").setValue(this.selectedAppointment.refid);
        let obj = {
          value: this.selectedAppointment.refid
        }
        await this.optionSelected(obj);
        await this.fillappointment()
      }
    } else {
      this.isEditVisible = false;
    }
  }

  async fillappointment() {

    if(this.appointmentLists && this.appointmentLists[0] && this.appointmentLists[0]["timeslotLists"] && this.appointmentLists[0]["timeslotLists"].length > 0) {

      var starttimeObj = this.appointmentLists[0]["timeslotLists"].find(p=>p.starttime == this.selectedAppointment.timeslot.starttime);
      if(starttimeObj && starttimeObj.id) {
        if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('starttime')) {
          ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('starttime').patchValue(starttimeObj.id);
        }
      }

      var endtimeObj = this.appointmentLists[0]["timeslotLists"].find(p=>p.starttime == this.selectedAppointment.timeslot.endtime);
      if(endtimeObj && endtimeObj.id) {
        if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('endtime')) {
          ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('endtime').patchValue(endtimeObj.id);
        }
      }

    }

    if(this.selectedAppointment && this.selectedAppointment["host"] && this.selectedAppointment["host"]["_id"]) {
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('staff')) {
        this.appointmentLists[0].staffvisible = true;
        this.appointmentLists[0].staffdbvalue = this.selectedAppointment.host._id;
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('staff').patchValue(this.selectedAppointment.host);
      }
    }
    
    if(this.appointmentLists && this.appointmentLists[0] && this.appointmentLists[0]["supportstaffLists"] && this.appointmentLists[0]["supportstaffLists"].length > 0 && this.selectedAppointment["property"] && this.selectedAppointment["property"]["supportstaff"] && this.selectedAppointment["property"]["supportstaff"].length > 0) {
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('supportstaff')) {
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('supportstaff').patchValue(this.selectedAppointment["property"]["supportstaff"]);
      }
    }

    if(this.selectedAppointment["property"] && this.selectedAppointment["property"]["note"]) {
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('note')) {
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('note').patchValue(this.selectedAppointment["property"]["note"]);
      }
    }


    if(this.selectedAppointment["property"] && this.selectedAppointment["property"]["islock"]) {
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('islock')) {
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('islock').patchValue(this.selectedAppointment["property"]["islock"]);
      }
    }

    if(this.selectedAppointment["resourceids"] && this.selectedAppointment["resourceids"].length > 0) {

      let products = this.selectedAppointment["resourceids"].filter(function(item){
        return item.onModel == 'Billitem';
      });
      var productids = products.map(choice => (choice.id._id));
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('products')) {
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('products').patchValue(productids);
      }
      

      let equipment = this.selectedAppointment["resourceids"].filter(function(item){
        return item.onModel == 'Asset' && item.id.category._id == "61cd402b53332318c84b5d58";
      });
      
      var equipmentids = equipment.map(choice => (choice.id._id));
      if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('equipments')) {
        ((this.form.get('appointments') as FormArray).at(0) as FormGroup).patchValue({equipments: equipmentids});
      }

      var roomObj =  this.selectedAppointment["resourceids"].find(p=>p.onModel == 'Asset' && p.id.category._id == "61cd41ca53332318c84b5d6c");
      
      if(roomObj) {
        if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('rooms')) {
          this.appointmentLists[0].roomvisible = false;
          setTimeout(() => {
            this.appointmentLists[0].roomvisible = true;
            this.appointmentLists[0]["roomsdbvalue"] = roomObj.id._id;
            ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('rooms').patchValue(roomObj.id);  
            
          });
          
        }
      }
    }
    this.isEditVisible = false;
    this.appointmentLists[0].valid = true;
    this.disableBtn = false;
  }

  saveAndSubmit(index: number) {
    this.nextStep(index)
    $("#submit").click();
  }

  checkAvailability(index: number) {

    var date = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value;
    var starttimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    var endtimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;
    var staff = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').value;

    

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff')) {
      var supportstaff = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff').value;
    }
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments')) {
      var equipments = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').value;
    }
    

    if(date == "" || starttimeid== "" || endtimeid== "") {
      this.showNotification('top', 'right', 'Date and Timeslot Cannt be Empty !!', 'danger');
      return;
    } else {

      if(!staff._id) {
        //this.showNotification('top', 'right', 'Staff Cannt be Empty !!', 'danger');
        //return
      }

      this.appointmentLists[index].staffnotAvailable = false;
      this.appointmentLists[index].supportstaffnotAvailable = false;
      this.appointmentLists[index].equipmentnotAvailable = false;

      var staffid = [];
      var staffids = [];
      var staffArray = [];
      staffArray.push(staff._id);
      
      if(supportstaff && supportstaff.length > 0 ) {
        staffids = staffArray.concat(supportstaff);
      } else {
        staffids = [...staffArray];
      }

      var starttime = this.appointmentLists[index].timeslotLists.find(p=>p.id == starttimeid);
      var endtime = this.appointmentLists[index].timeslotLists.find(p=>p.id == endtimeid);

      let postData = {};
      postData["id"] = "620b66fb7d94e103d5af029d";
      postData["search"] = [];
      postData["search"].push({ "searchfield": "appointmentdate", "searchvalue": new Date(date), "criteria": "fullday", "datatype": "Date" });
      //postData["search"].push({ "searchfield": "staffid", "searchvalue": staffArray, "criteria": "in", "datatype": "ObjectId" });
      postData["search"].push({ "searchfield": "staffids", "searchvalue": staffids, "criteria": "in", "datatype": "ObjectId" });
      postData["search"].push({ "searchfield": "assetid", "searchvalue": equipments ? equipments : [], "criteria": "in", "datatype": "ObjectId" });
      postData["search"].push({ "searchfield": "timeslot", "searchvalue": { "timeslotdate": new Date(date), "timeslot": { "starttime": starttime.starttime, "endtime": endtime.starttime } }, "criteria": "timeslot", "datatype": "Date" });

      if(this.isEdit || this.isReschedule) {
        postData["search"].push({ "searchfield": "appointmentid", "searchvalue": [this.selectedAppointment._id], "criteria": "nin", "datatype": "ObjectId" });
      }
      else {
        postData["search"].push({ "searchfield": "appointmentid", "searchvalue": [], "criteria": "nin", "datatype": "ObjectId" });
      }

      if (this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowStaffConcurrency == "No") {
        postData["id"] = "620b66fb7d94e103d5af029d";
      }
      else {
        postData["id"] = "62271e2e7d94e103d5af02fe";
      }

      var url = "analyticsreports/process/"
      var method = "POST";

      this.appointmentLists[index]['pendingValidation'] = true;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {

            this.appointmentLists[index]['pendingValidation'] = false;

            var checkValid = data.find(p=>p.data.length > 0);
            if(checkValid) {
              this.showNotification('top', 'right', 'Validation Failed!!', 'danger');

              var hostValid = data.find(p=>p.tablename == "host" && p.data.length > 0 );
              
              if(hostValid) {
                hostValid.data.forEach((element)=>{       
                  

                  if (supportstaff && supportstaff.length > 0 && element.property && element.property.supportstaff && element.property.supportstaff.length > 0 && supportstaff && supportstaff[0].toString() == element.property.supportstaff[0]) {
                    this.appointmentLists[index].supportstaffnotAvailable = true;
                  }

                  if (staff._id.toString() == element.host.toString()) {
                    this.appointmentLists[index].staffnotAvailable = true;
                  }

                  if (element.property && element.property.supportstaff && element.property.supportstaff.length > 0 && supportstaff && supportstaff[0].toString() == element.host.toString()) {
                    this.appointmentLists[index].supportstaffnotAvailable = true;
                  }
                })
                
              }

              var supportstaffValid = data.find(p=>p.tablename == "supportstaff" && p.data.length > 0 );
              
              if(supportstaffValid) {
                this.appointmentLists[index].supportstaffnotAvailable = true;
              }

              var assetValid = data.find(p=>p.tablename == "asset" && p.data.length > 0 );
              
              if(assetValid) {
                this.appointmentLists[index].equipmentnotAvailable = true;
              }

              return
            } 

            this.appointmentLists[index].valid = true;

            var submitValid = this.appointmentLists.find(p=>p.valid == false);
            if(!submitValid) {
              this.disableBtn = false;
            }

          }
        }, (error) => {
          console.error(error);
          this.appointmentLists[index]['pendingValidation'] = false;
          
        });

    }

    

  }

  onSubmit(value: any, isValid: boolean) {
    
    this.submitted = true;
    
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      if (this.type == "multi" && this.assign == "individual" && (!this.attendee || !this.attendee.value)) {
        this.showNotification('top', 'right', 'Please select attendee !!', 'danger');
        return;
      }

      if (this.type == "multi" && this.assign == "group"  && (!value.group || !value.group.value)) {
        this.showNotification('top', 'right', 'Please select group !!', 'danger');
        return;
      }
      
      if ((!this.service || !this.service.value)) {
        this.showNotification('top', 'right', 'Please select service !!', 'danger');
        return;
      }

      if ((typeof this.service.value === 'string')) {
        this.showNotification('top', 'right', 'Please select valid service !!', 'danger');
        return;
      }

      if(this.service.value && (this.service.value.type == "package" || this.service.value.type == "series") && this.appointmentLists.length == 0) {
        this.showNotification('top', 'right', 'Select atleast One Service !!', 'danger');
        return;
      }

      var services = [];


      if(this.appointmentLists && this.appointmentLists.length > 0) {

        for (let index = 0; index < this.appointmentLists.length; index++) {

          var element = this.appointmentLists[index];

          var timeslot = {};

          var starttime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
          var endtime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;


          var starttimeObj = element.timeslotLists.find(p=>p.id == starttime);
          var endtimeObj = element.timeslotLists.find(p=>p.id == endtime);

          if(starttimeObj && endtimeObj) {
            timeslot["day"] = starttimeObj.day;
            timeslot["starttime"] = starttimeObj.starttime;
            timeslot["endtime"] = endtimeObj.starttime;
          }
          var property = {};

          var onlinemeet = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeet').value;
          var onlinemeeturl = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl').value;

          if(onlinemeet == true) {
            
            property = {};
            property['onlinemeet'] = true;
            property['onlinemeeturl'] = onlinemeeturl;
          }

          var status = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('confirmed').value;
          var note = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('note').value;
          if(note !== "") {
            property['note'] = note;
          }

          var islock = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('islock').value;
          if(islock == true) {
            property['islock'] = true;
          }

          if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff') && ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff').value) {

            var supportstaff = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff').value;
            if(supportstaff && supportstaff.length > 0) {
              property['supportstaff'] = [];
              property['supportstaff'] = supportstaff;
            }

          }
          
          
          var schedule = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('schedule').value;

          var resourceids = [];

          if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments') && ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').value) {
            var equipments = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').value;
            if(equipments && equipments.length > 0 ) {
              equipments.forEach(elementEquipment => {
                let equipmentObj = { id: elementEquipment, onModel: "Asset" }
                resourceids.push(equipmentObj)
              });
            }
          }
          
          if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('rooms') && ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('rooms').value) {
            var rooms = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('rooms').value;
            if(rooms && rooms._id) {
              let roomObj = { id: rooms._id, onModel: "Asset" }
              resourceids.push(roomObj)
            }
          }
          
          if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('products') && ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('products').value) {
            var products = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('products').value;
            if(products && products.length > 0 ) {
              products.forEach(elementProduct => {
                let prodiObj = { id: elementProduct, onModel: "Billitem" }
                resourceids.push(prodiObj)
              });
            }
          }

          if(schedule == true) {

            if(element.appointmentscheduleList.length > 0) {
              element.appointmentscheduleList.forEach(elementDate => {

                var staff = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').value;

                var dayName = this.getDayName(elementDate);
                

                let tempTimeSLot = {};
                tempTimeSLot = {
                  day: dayName,
                  starttime: timeslot["starttime"],
                  endtime: timeslot["endtime"]
                };
                
                let obj = {
                  refid: element.serviceid,
                  date: new Date(elementDate),
                  timeslot: tempTimeSLot,
                  host: staff._id ? staff._id : staff,
                  charges: element.charges ? element.charges : 0,
                  duration: element.duration ? element.duration : 30,
                  resourceids: resourceids,
                  property: property,
                  status: status == true ? "confirmed" : undefined
                }
                services.push(obj);
              });
            }
          } else {

            var date = new Date(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value);
            var staff = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').value;

            let obj = {
              refid: element.serviceid,
              date: date,
              timeslot: timeslot,
              host: staff._id ? staff._id : staff,
              charges: element.charges ? element.charges : 0,
              duration: element.duration ? element.duration : 30,
              resourceids: resourceids,
              property: property,
              status: status == true ? "confirmed" : undefined
            }

            services.push(obj);
          }
        }
      }

      var url = "/appointments/multi";
      var method = "POST";
      
      let postData = {};
      postData['services'] = services;

      if(this.type == "multi" && this.assign == "individual") {

        postData['onModel'] = "Member";

        if (this.attendee && this.attendee.value && this.attendee.value.type) {
          
          switch (this.attendee.value.type) {
            case "M":
              postData['onModel'] = "Member";
              break;
            case "C":
              postData['onModel'] = "Prospect";
              break;
            case "U":
              postData['onModel'] = "User";
              break;
            default:
              postData['onModel'] = "Member";
          }
        }
        postData['attendee'] =  this.attendee.value._id ? this.attendee.value._id : this.dataContent._id;
      } else if (this.type == "multi" && this.assign == "group") {
        postData['onModel'] = "Groupclass";
        postData['attendee'] = value.group.value._id ? value.group.value._id : this.dataContent._id;
      }

      if(this.service.value && (this.service.value.type == "package" || this.service.value.type == "series")) {
        postData['packageid'] = this.service.value._id;
      }

      this.disableBtn = true;
      
      if (this.isReschedule){
        postData['onModel'] = this.selectedAppointment.onModel;
      }

      if(this.isEdit || this.isReschedule) {

        postData['onModel'] = this.selectedAppointment.onModel;
        postData['_id'] = this.selectedAppointment._id;
        postData['charges'] = postData["services"][0]["charges"] ? postData["services"][0]["charges"] : undefined;
        postData['appointmentdate'] = postData["services"][0]["date"] ? postData["services"][0]["date"] : undefined;
        postData['duration'] = postData["services"][0]["duration"] ? postData["services"][0]["duration"] : undefined;
        postData['host'] = postData["services"][0]["host"] ? postData["services"][0]["host"] : undefined;
        postData['property'] = postData["services"][0]["property"] ? postData["services"][0]["property"] : undefined;
        postData['refid'] = postData["services"][0]["refid"] ? postData["services"][0]["refid"] : undefined;
        postData['resourceids'] = postData["services"][0]["resourceids"] ? postData["services"][0]["resourceids"] : undefined;
        postData['timeslot'] = postData["services"][0]["timeslot"] ? postData["services"][0]["timeslot"] : undefined;
        
        delete postData['services'];

        var url = "/appointments/"+ this.selectedAppointment._id;
        var method = "PATCH";
        
      } 

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {

            this.disableBtn = false;
            super.showNotification('top', 'right', 'Services has been added Successfully !!', 'success');
            this.service.setValue("")
            this.attendee.setValue("")
            this.group.setValue("")
            this.form.reset();
            this.onAppointmentData.emit(data);
            return;
          }
        }, (error) => {
          console.error(error);
          this.disableBtn = false;
        });

    }
  }

  onAssignChanged(value: any) {
    if (value) {
      this.group.setValue("")
      this.attendee.setValue("")
      this.assign = value;
    }
  }

  // contacts

  enterAttendee() {
    const controlValue = this.attendee.value;
    this.attendee.setValue(controlValue);
  }

  handleEmptyAttendeeInput(event: any) {
    if (event.target.value === '') {
      this.attendee.setValue("");
      this.allAttendeeLists = [];
      this.form.get("isattendeeemail").setValue(false);
    }
  }

  displayAttendeeFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  focusLostAttendeeSelected(value: any) {
    
    if(this.attendee && this.attendee.value && this.attendee.value._id) {
    } else {
      this.addNewCustomer();
      this.form.get('customerfirstname').setValue(value);
    }
  }

  async optionAttendeeSelected(value: any) {
    this.attendee.setValue(value);

    if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.enableNoShowAlert && this._loginUserBranch.appointmentsetting.enableNoShowAlert == "Yes" && this._loginUserBranch.appointmentsetting.showAlertwhenacustomerhas && this._loginUserBranch.appointmentsetting.showAlertwhenacustomerhas !== "") {
      this.noshowAlert = false;
      await this.getNoshowData();
    }


    if(this.attendee && this.attendee.value && this.attendee.value.send_mail && this.attendee.value.send_mail == "Yes") {
      this.form.get("isattendeeemail").setValue(true);
    } else {
      this.form.get("isattendeeemail").setValue(false);
    }
    if(this.newCustomer == true)
      this.canceladdNewCustomer();
  }

  async getNoshowData() {

    this.noshowAlert = false;

    var url = "appointments/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "noshow", "criteria": "eq" });
    postData["search"].push({ "searchfield": "attendee", "searchvalue": this.attendee.value._id, "criteria": "eq" });

    var type;

    switch (this.attendee.value.type) {
      case "M":
        type = "Member";
        break;
      case "C":
        type = "Prospect";
        break;
      case "U":
        type = "User";
        break;
      default:
        type = "Member";
    }

    postData["search"].push({ "searchfield": "onModel", "searchvalue": type, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          
          if(data && data.length >= this._loginUserBranch.appointmentsetting.showAlertwhenacustomerhas) {
            this.noshowAlert = true;
          } else {
            this.noshowAlert = false;
          }
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  // Groups

  async getAllGroups() {

    var url = "groupclasses/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allGroupLists = []
          this.allGroupLists = data
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  enterGroup() {
    const controlValue = this.group.value;
    this.group.setValue(controlValue);
  }

  preloadGroupdata() {
    if (this.allGroupLists && this.allGroupLists.length == 0) {
      this.getAllGroups()
    }
  }

  handleEmptyGroupInput(event: any) {
    if (event.target.value === '') {
      this.group.setValue("");
      this.allGroupLists = [];
    }
  }

  displayGroupFn(user: any): string {
    return user && user.title ? user.title : '';
  }

  optionGroupSelected(option: any) {
    this.group.setValue(option.value);
    if(this.newGroup == true)
      this.canceladdNewGroup();
  }

  private _groupfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allGroupLists
        .filter(option => {
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
      results = this.allGroupLists.slice();
    }
    return results;
  }

  //Service

  async getServiceLists() {

    if(this.services && this.services.length > 0 ) {

      this.serviceisLoadingBox = true;

      this.allServiceLists = [];
      this.allServiceLists = this.services;

      this.allServiceLists.map(p=>p.type = "service");
      
      this.serviceLists = [];

      this.allServiceLists.forEach(element => {

        if(element && element.category && element.category.property && element.category.property.name) {

          var serviceObj = this.serviceLists.find(p=>p._id == element.category._id);
          if(!serviceObj) {
            let obj = {
              _id: element.category._id,
              name: element.category.property.name,
              children: []
            }
            obj['children'].push(element);
            this.serviceLists.push(obj);
          } else {
            serviceObj.children.push(element);
          }
        }
      });

      this.serviceisLoadingBox = false;
      return;


    } else {

      var url = "/services/filter";
      var method = "POST";
  
      let postData = {};
      postData['search'] = [];
      postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
  
      postData['select'] = [];
      postData['select'].push({ "fieldname": "availability", "value": 1 });
      postData['select'].push({ "fieldname": "category", "value": 1 });
      postData['select'].push({ "fieldname": "charges", "value": 1 });
      postData['select'].push({ "fieldname": "duration", "value": 1 });
      postData['select'].push({ "fieldname": "staff.fullname", "value": 1 });
      postData['select'].push({ "fieldname": "staff.status", "value": 1 });
      postData['select'].push({ "fieldname": "supportstaff.fullname", "value": 1 });
      postData['select'].push({ "fieldname": "supportstaff.status", "value": 1 });
      postData['select'].push({ "fieldname": "title", "value": 1 });
  
      this.serviceisLoadingBox = true;
  
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
  
          if(data && data.length == 0) {
            this.serviceisLoadingBox = false;
          }
  
          if (data && data[0]) {
  
            this.allServiceLists = [];
            this.allServiceLists = data;
  
            this.allServiceLists.map(p=>p.type = "service");
            
            this.serviceLists = [];
  
            this.allServiceLists.forEach(element => {
  
              if(element && element.category && element.category.property && element.category.property.name) {
  
                var serviceObj = this.serviceLists.find(p=>p._id == element.category._id);
                if(!serviceObj) {
                  let obj = {
                    _id: element.category._id,
                    name: element.category.property.name,
                    children: []
                  }
                  obj['children'].push(element);
                  this.serviceLists.push(obj);
                } else {
                  serviceObj.children.push(element);
                }
              }
            });
            
            this.serviceisLoadingBox = false;
            return;
          }
        }, (error) => {
          console.error(error);
          this.serviceisLoadingBox = false;
        });
    }

   

  }

  async getpackageLists() {

    var url = "/memberships/filter/";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    
    postData['select'] = [];
    postData['select'].push({ "fieldname": "membershipname", "value": 1 });
    postData['select'].push({ "fieldname": "services", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.title", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.duration", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.availability", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.category", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.charges", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.staff", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.assets", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.items", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.rooms", "value": 1 });
    postData['select'].push({ "fieldname": "serviceid.property", "value": 1 });
    postData['select'].push({ "fieldname": "property", "value": 1 });
    
    this.serviceisLoadingBox = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if(data && data.length == 0) {
          this.serviceisLoadingBox = false;
        }

        if (data && data[0]) {
          this.allPackageLists = [];
          this.allPackageLists = data;

          this.allPackageLists.map(p=>p.type = "package");
          this.allPackageLists.map(p=>p.title = p.membershipname);
          
          let packageObj = {
            name: "packages",
            children: []
          }

          let seriesObj = {
            name: "series",
            children: []
          }

          this.allPackageLists.forEach(element => {
            
            if(element && element.property && element.property.type && element.property.type == "series") {
              element.type =  element.property.type;
              seriesObj['children'].push(element);
            } else {
              packageObj['children'].push(element);
            }

            
          });
          if (packageObj && packageObj.children.length > 0) this.serviceLists.push(packageObj);
          if (seriesObj && seriesObj.children.length > 0) this.serviceLists.push(seriesObj);
          this.serviceisLoadingBox = false;
          return;
        }
        

      }, (error) => {
        console.error(error);
        this.serviceisLoadingBox = false;
      });

  }

  private _filterService(value: string): any[] {
    if (value) {
      
      return this.serviceLists
        .map(group => ({name: group.name, children: _filter(group.children, value)}))
        .filter(group => group.children.length > 0);
    }
    return this.serviceLists;
    
  }

  async preloaddata() {
    if (this.serviceLists && this.serviceLists.length == 0) {
      await this.getServiceLists();
      await this.getpackageLists();
    }
  }
  
  enter() {
    const controlValue = this.service.value;
    this.service.setValue(controlValue);
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.service.setValue("");
      this.serviceLists = [];
      this.appointmentLists = [];
      const control = <FormArray>this.form.controls['appointments'];
      control.removeAt(0)
    } 
  }

  displayFn(pkg: any): string {
    return pkg && pkg.title ? pkg.title : '';
  }

  async optionSelected(option: any) { 
    this.service.setValue(option.value);
 

    this.appointmentLists = [];
    this.busy = true;
    

    this.service.disable();

    const control = <FormArray>this.form.controls['appointments'];
    control.controls = [];


    if(this.service && this.service.value && this.service.value.type == "service") {
      var element = this.service.value;
      await this.getTimeSlotLists(element, 1);
    } else {
      if(this.service.value.services && this.service.value.services.length > 0) {

        for (let index = 0; index < this.service.value.services.length; index++) {

          var element = this.service.value.services[index]['serviceid'];

          if(this.service.value.type == "series" && this.service.value.services[index] && this.service.value.services[index]['visits'] && this.service.value.services[index]['visits'] > 0) {
            for (let j = 0; j < this.service.value.services[index]['visits']; j++) {
              await this.getTimeSlotLists(element, j);
            }
          } else {
            await this.getTimeSlotLists(element, index);
          }

        }

      }
    }

    if(this.selectInfo) {
      await this.autofilldata()
    } else {
      this.disableBtn = true;
    }

    
    

    setTimeout(() => {
      this.busy = false;  
      this.service.enable();
    });
    
    
  }

  async autofilldata() {

    console.log("selectInfo", this.selectInfo);

    if(this.selectInfo && this.selectInfo.start && this.selectInfo.end ) {
      var start = moment(this.selectInfo.start).format("HH:mm")
      var end = moment(this.selectInfo.end).format("HH:mm")

      if (this.appointmentLists && this.appointmentLists[0] && this.appointmentLists[0]['timeslotLists'] && this.appointmentLists[0]['timeslotLists'].length > 0) {
        var timeslotOBj = this.appointmentLists[0]['timeslotLists'].find(p=>p.starttime == start)
        if(timeslotOBj) {
          if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('starttime')) {
            ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('starttime').patchValue(timeslotOBj.id);
            
            await this.starttimeChange(0, this.appointmentLists[0]['trackingId'])
            await this.onItemNotAvailable(0, true)
          }
        }
      }

      
    }

    setTimeout(() => {
      if(this.selectInfo && this.selectInfo.resource && this.selectInfo.resource._resource && this.selectInfo.resource._resource.id) {
        
        var staffid = this.selectInfo.resource._resource.id;
        this.appointmentLists[0].staffvisible = false;

        setTimeout(() => {
          var staffObj = this.appointmentLists[0].staffLists.find(p=>p._id == staffid);
          if(staffObj) {
            if(((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('staff')) {
              this.appointmentLists[0].staffvisible = true;
              this.appointmentLists[0].staffdbvalue = staffid;
              ((this.form.get('appointments') as FormArray).at(0) as FormGroup).get('staff').patchValue(staffObj);
            }
          } else {
            this.appointmentLists[0].staffvisible = true;
          }

        }, 100);
      }  
    });

    

    
  }

  async getTimeSlotLists(element: any, index: number) {

    var istoday: boolean = false;
    var today = new Date();
    var selectedDay = this.getDayName(this.date);

    var starttime = element['availability'].starttime;
    var endtime = element['availability'].endtime;
    //var duration = element['duration'];
    var duration = 15;

    var newendtime = endtime;

    if(this._loginUserBranch && this._loginUserBranch.appointmentsetting && this._loginUserBranch.appointmentsetting.allowAppointmentsToEndAfterYourLocationOfficalClosingTime == "Yes" && this._loginUserBranch.appointmentsetting.overageduration) {
      var hours = Number(this._loginUserBranch.appointmentsetting.overageduration);
      var minutes = Math.floor(hours * 60);
      newendtime = moment(endtime, 'HH:mm:ss').add(minutes, 'minutes').format('HH:mm:ss');
    }

    var endmin = newendtime.split(":");
    var endtimehr = parseInt(endmin[0]);
    var endtimemin = parseInt(endmin[1]);

    var totalendmin = endtimehr * 60 + endtimemin;

    var startmin = starttime.split(":");
    var timehr = parseInt(startmin[0]);
    var timemin = parseInt(startmin[1]);
    var totalstartmin = timehr * 60 + timemin;

    var currenthr = today.getHours();
    var currentmin = today.getMinutes();
    var currenthrmin = currenthr * 60 + currentmin;

    var timeslotLists = [];

    if (today.getFullYear() == this.date.getFullYear() && today.getMonth() == this.date.getMonth() && today.getDate() == this.date.getDate()) {
      istoday = true;  // then do operation
    }

    for (var time = totalstartmin; time < totalendmin;) {
      timemin = Number(timemin);
      var start;
      if (timemin <= 9) {
        start = timehr + ":" + "0" + timemin;
      } else {
        start = timehr + ":" + timemin;
      }
      var end;
      if (duration <= 60) {
        timemin += duration;
        if (timemin >= 60) {
          timehr += 1;
          timemin -= 60;
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
      var disabled: boolean = false;
      if (istoday && time < currenthrmin) {
        disabled = true;
      }

      var obj = {
        "id": this.uuidv4(),
        "day": selectedDay,
        "starttime": start,
        "endtime": end,
        "displaytext": start + " - " + end,
        "disabled": disabled,
      }

      timeslotLists.push(obj);
      time += duration;
    }

    var supportstaff = element.supportstaff && element.supportstaff.length > 0 ? element.supportstaff : [];

    var result = await this.getStaffAvailByDate(this.date, element.staff, supportstaff);

    element.staff.forEach(elementStaff => {

      elementStaff.disable = false;
      
      var analyticsObj = result.find(p=> ((p._id == elementStaff._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString()) ));

      if(elementStaff.availability && elementStaff.availability.days && elementStaff.availability.days.length > 0) {
        var dayName = this.getDayName(this.date);
        var workingday = elementStaff.availability.days.includes(dayName)
        if(!workingday) {
          elementStaff.disable = true;
        }
      } 
      
      if(analyticsObj && analyticsObj.isnoavailable) {
        elementStaff.disable = true;
      } 

      // else if (analyticsObj && analyticsObj.quantity == 1 && analyticsObj.availability.length > 0) {
      //   elementStaff.staffavailability = [];
      //   elementStaff.staffavailability = analyticsObj.availability;
      //   elementStaff.quantity = analyticsObj.quantity;
      // }
    });

    if(supportstaff && supportstaff.length > 0) {
      supportstaff.forEach(elementSupportStaff => {
        elementSupportStaff.disable = false;

        var analyticsObj = result.find(p=> ((p._id == elementSupportStaff._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString()) ));

        if(elementSupportStaff.availability && elementSupportStaff.availability.days && elementSupportStaff.availability.days.length > 0) {
          var dayName = this.getDayName(this.date);
          var workingday = elementSupportStaff.availability.days.includes(dayName)
          if(!workingday) {
            elementSupportStaff.disable = true;
          }
        }

        if(analyticsObj && analyticsObj.isnoavailable) {
          elementSupportStaff.disable = true;
        } 

      });
    }

    supportstaff = supportstaff.filter(item => !item.disable && item.status == "active");
    
    let objApp = { 
      timeslotLists: timeslotLists, 
      index: index, 
      serviceid: element._id,
      staffvisible: true,
      appointmentscheduleList: [],
      staffLists: element.staff,
      pendingValidation: false,

      staffnotAvailable: false,
      supportstaffnotAvailable: false,
      equipmentnotAvailable: false,

      trackingId: this.generateUniqueId(),
      charges: element.charges,
      duration: element.duration,
      products: element.items && element.items.length > 0 ? element.items : [],
      equipments: element.assets && element.assets.length > 0 ? element.assets : [],
      rooms: element.rooms && element.rooms.length > 0 ? element.rooms : [],
      roomvisible: true,
      supportstaffLists: supportstaff,
      valid: false
    };

    this.appointmentLists.push(objApp);

    const val = this.fb.group({
      serviceid: [element._id],
      title: [element.title],
      date: [new Date(this.date), Validators.compose([Validators.required])],
      starttime: ['', Validators.compose([Validators.required])],
      endtime: ['', Validators.compose([Validators.required])],
      staff: ['', Validators.compose([Validators.required])],
      schedule: [''],
      recurringtype: [''],
      recurringoccurance: [''],
      onlinemeet: [''],
      onlinemeeturl: [''],
      trackingId: objApp.trackingId,
      confirmed: [''],
      note: [''],
      islock: [''],
    });


    if(element.supportstaff && element.supportstaff.length > 0) {
      val.addControl('supportstaff', new FormControl(''));
    }

    if(element.rooms && element.rooms.length > 0) {
      val.addControl('rooms', new FormControl(''));
    }

    if(element.items && element.items.length > 0) {
      val.addControl('products', new FormControl(''));
    }

    if(element.assets && element.assets.length > 0) {
      val.addControl('equipments', new FormControl('', []));
    }

    const control = <FormArray>this.form.controls['appointments'];
    control.push(val);

    return;
  }

  async supportStaffChangeMethod(event: MatOptionSelectionChange, index: number) {
    this.appointmentLists[index]["supportstaffnotAvailable"] = false;
    this.appointmentLists[index]["valid"] = false;
    this.disableBtn = true;
    
    await this.checkAvailability(index);
  }

  async equipmentsChangeMethod(event: MatOptionSelectionChange, index: number) {
    
    this.appointmentLists[index]["equipmentnotAvailable"] = false;
    this.appointmentLists[index]["valid"] = false;
    this.disableBtn = true;
    
    await this.checkAvailability(index);
    // if(event["value"] && event["value"].length > 0) {

    //   this.appointmentLists[index]["pendingEquipment"] = true;

    //   var date = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value;
    //   var starttimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    //   var endtimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;

    //   if(date == "" || starttimeid== "" || endtimeid== "") {

    //     ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').patchValue([]);
    //     this.showNotification('top', 'right', 'Date and Timeslot Cannt be Empty !!', 'danger');
    //     return;
    //   } else {

    //     var starttime = this.appointmentLists[index].timeslotLists.find(p=>p.id == starttimeid);
    //     var endtime = this.appointmentLists[index].timeslotLists.find(p=>p.id == endtimeid);

    //     var data = {
    //       appointmentdate: new Date(date),
    //       assetid: event["value"],
    //       timeslot: {
    //         starttime: starttime.starttime,
    //         endtime: endtime.starttime
    //       }
    //     }

    //     var url = "analyticsreports/process/"
    //     var method = "POST";

    //     var postData = {
    //       "id": "61dec4e96c1d72f31e18c1b2",
    //       "search": [
    //           { "searchfield": "assetid", "searchvalue": data.assetid, "criteria": "in", "datatype": "ObjectId" },
    //           { "searchfield": "appointmentdate", "searchvalue": data.appointmentdate, "criteria": "fullday", "datatype": "Date" },
    //           { "searchfield": "timeslotdate", "searchvalue": { "timeslotdate": data.appointmentdate, "timeslot": data.timeslot }, "criteria": "timeslot", "datatype": "Date" }
    //       ]
    //     }

    //     return this._commonService
    //       .commonServiceByUrlMethodDataAsync(url, method, postData)
    //       .then((data: any) => {
    //         if (data) {
    //           this.appointmentLists[index]['pendingEquipment'] = false;
              
    //           if(data.length > 0) {
    //             this.appointmentLists[index].equipmentNotAvailable = true;
    //           } else { 
    //             this.appointmentLists[index].equipmentNotAvailable = false;
    //           }
    //           return;
    //         }
    //       }, (error) => {
    //         console.error(error);
    //         this.appointmentLists[index]['pendingEquipment'] = false;
            
    //       });
    //   }
     
    // }
  }

  generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async getStaffAvailByDate(date: Date, staffLists: any, supportStaffLists: any) {

    var today = new Date(date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var staffids = staffLists.map(choice => (choice._id));
    var supportstaffids = supportStaffLists.map(choice => (choice._id));

    var staffs = staffids.concat(supportstaffids);

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "619c87614220efd6edda0232";
    
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": staffs, "criteria": "in", "datatype": "ObjectId"});
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": today, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": tommrrow, "criteria": "eq", "datatype": "date" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          return data;
        }
      }, (error) => {
        console.error(error);
      });
  }

  uuidv4() {
    let uuid = '', i, random;
    for (i = 0; i < 20; i++) {
      random = Math.random() * 14 | 0;
      if (i == 8 || i == 14) {
        uuid += '-'
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  getDayName(date: Date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(date);
    return days[d.getDay()];
  }

  trackByFn(index: number, item: any) {
    return item.trackingId;
  }

  removeGroup(index: number) {

    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Service!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        for (let i = 0; i < this.appointmentLists.length; i++) {
          if(i == index) {
            this.appointmentLists.splice(i, 1);
          }
        }


        const control = <FormArray>this.form.controls['appointments'];
        control.removeAt(index);

        swal.fire({
          title: 'Deleted!',
          text: 'Service has been deleted.',
          icon: 'success',
          customClass:{
            confirmButton: "btn btn-success",
          },
          buttonsStyling: false
        });

      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Service is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  getTimeSlot(index: number, trackingId: any) {

    var starttime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    var endtime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;

    if(starttime && endtime) {

      var appDetails = this.appointmentLists.find(p => p.trackingId == trackingId);
      if(appDetails && appDetails.timeslotLists && appDetails.timeslotLists.length > 0 ) {
  
        var starttimeDetails = appDetails.timeslotLists.find(p=>p.id == starttime);
        var endtimeDetails = appDetails.timeslotLists.find(p=>p.id == endtime);
        if(starttimeDetails && endtimeDetails) {
          return starttimeDetails.starttime + " - " + endtimeDetails.starttime
        } 
      }
    }

  }

  async onItemNotAvailable(index: number, fulldayNotAvailable: any) {

    

    this.appointmentLists[index].staffnotAvailable = false;
    this.appointmentLists[index].valid = false;
    this.disableBtn = true;
    
    await this.checkAvailability(index);

    // var date = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value;
    // var starttimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    // var endtimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;

    // var starttime = "";
    // var endtime = "";

    // var starttimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == starttimeid)
    // if (starttimeObj) {
    //   starttime = starttimeObj.starttime;
    // }
    // var endtimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == endtimeid)
    // if (endtimeObj) {
    //   endtime = endtimeObj.starttime;
    // }

    // if (date == "" || starttime == "" || endtime == "") {
    //   this.appointmentLists[index].staffvisible = false;
    //   this.showNotification('top', 'right', 'Date and Timeslot Cannt be Empty !!', 'danger');
    //   ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').patchValue(null);
    //   setTimeout(() => {
    //     this.appointmentLists[index].staffvisible = true;
    //   });
    //   return;

    // } else {

    //   let serverData = {
    //     appointmentdate: new Date(date),
    //     staffid: staff._id,
    //     timeslot: {
    //       starttime: starttime,
    //       endtime: endtime
    //     }
    //   }
    //   await this.checkStaffAvailabilityOnServer(serverData, index);
    // }

    // if (staff._id && staff.disable) {
    //   this.appointmentLists[index].notAvailable = true;
    // } else if (staff && staff.quantity == 1 && staff.staffavailability.length > 0) {

    //   var starttime = "";
    //   var endtime = "";

    //   var starttimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == starttimeid)
    //   if (starttimeObj) {
    //     starttime = starttimeObj.starttime;
    //   }
    //   var endtimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == endtimeid)
    //   if (endtimeObj) {
    //     endtime = endtimeObj.starttime;
    //   }
    //   if (date == "" || starttime == "" || endtime == "") {
    //     this.appointmentLists[index].staffvisible = false;
    //     this.showNotification('top', 'right', 'Date and Timeslot Cannt be Empty !!', 'danger');
    //     ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').patchValue(null);
    //     setTimeout(() => {
    //       this.appointmentLists[index].staffvisible = true;
    //     });
    //     return;
    //   } else {


    //     var validation = false;
    //     for (let i = 0; i < staff.staffavailability.length; i++) {


    //       var elementAvail = staff.staffavailability[i];

    //       var inputStartTime = moment(starttime, "HH:mm");
    //       var inputEndTime = moment(endtime, "HH:mm");

    //       var availableStartTime = moment(elementAvail.starttime, "HH:mm");
    //       var availableEndTime = moment(elementAvail.endtime, "HH:mm");


    //       var startvalidation = inputStartTime >= moment(availableStartTime, "HH:mm") && inputStartTime < moment(availableEndTime, "HH:mm");
    //       var endvalidation = inputEndTime >= moment(availableStartTime, "HH:mm") && inputEndTime < moment(availableEndTime, "HH:mm");

    //       if (startvalidation && endvalidation) {
    //         validation = true
    //       }

    //     }

    //     if (!validation) {
    //       this.appointmentLists[index].notAvailable = true;
    //     }     


    //   }

    // }

    // if(staff && staff.availability && staff.availability.starttime && staff.availability.endtime) {

    //   var inputStartTime = moment(starttime, "HH:mm");
    //   var inputEndTime = moment(endtime, "HH:mm");

    //   var availableStartTime = moment(staff.availability.starttime, "HH:mm");
    //   var availableEndTime = moment(staff.availability.endtime, "HH:mm");

    //   var startvalidation = inputStartTime >= moment(availableStartTime, "HH:mm") && inputStartTime < moment(availableEndTime, "HH:mm");
    //   var endvalidation = inputEndTime >= moment(availableStartTime, "HH:mm") && inputEndTime < moment(availableEndTime, "HH:mm");

    //   if (startvalidation && endvalidation) {
    //   } else {
    //     this.appointmentLists[index].notAvailable = true;
    //   }
    // }

  }

  // async checkStaffAvailabilityOnServer(data, index) {

  //   this.appointmentLists[index]['pendingStaff'] = true;
    

  //   var url = "analyticsreports/process/"
  //   var method = "POST";    
  //   var postData = {
  //     "id": "61e95ca96c1d72f31e30b1bc",
  //     "search": [
  //       { "searchfield": "staffid", "searchvalue": data.staffid, "criteria": "eq", "datatype": "ObjectId" },
  //       { "searchfield": "appointmentdate", "searchvalue": data.appointmentdate, "criteria": "fullday", "datatype": "Date" },
  //       { "searchfield": "timeslot", "searchvalue": { "timeslotdate": data.appointmentdate, "timeslot": data.timeslot }, "criteria": "timeslot", "datatype": "Date" }        
  //     ]
  //   }

  //   return this._commonService
  //     .commonServiceByUrlMethodDataAsync(url, method, postData)
  //     .then((data: any) => {
  //       if (data) {

  //         this.appointmentLists[index]['pendingStaff'] = false;
          
  //         if(data.length > 0) {
  //           this.appointmentLists[index].notAvailable = true;
  //         } else { 
  //           this.appointmentLists[index].notAvailable = false;
  //         }
  //         return;
  //       }
  //     }, (error) => {
  //       console.error(error);
  //       this.appointmentLists[index]['pendingStaff'] = false;
        
  //     });
    
  // }

  onResourceItemNotAvailable(itemNotAvailable: any) {
    
  }

  onScheduleChanged(index: number, event: MatCheckboxChange): void {
    if(event.checked) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringtype').patchValue("daily");
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringoccurance').patchValue(2);
    } else {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringtype').patchValue("");
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringoccurance').patchValue(0);
    }
  }

  onRecurringChanged(index: number, event: any) {
    this.appointmentLists[index].appointmentscheduleList = [];
  }

  getDay(date: Date) {
    const d = date.getDate();
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return d + "st";
      case 2: return d + "nd";
      case 3: return d + "rd";
      default: return d + "th";
    }
  }

  addtime(index: number) {

    var startDate = new Date(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value);

    if (startDate !== null) {

      this.appointmentLists[index].appointmentscheduleList = [];

      var schedule = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('schedule').value;


      if (schedule == true) {

        var recurringtype = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringtype').value;

        if (recurringtype !== "") {

          this.appointmentLists[index].appointmentscheduleList.push(startDate);

          if (recurringtype == "daily") {
            for (var i = 0; i < ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringoccurance').value - 1; i++) {
              startDate = this.getNextDay(startDate);
              this.appointmentLists[index].appointmentscheduleList.push(startDate);
            }
          } else if (recurringtype == "weekly") {
            for (var i = 0; i < ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringoccurance').value - 1; i++) {
              startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
              this.appointmentLists[index].appointmentscheduleList.push(startDate);
            }
          } else if (recurringtype == "monthly") {
            for (var i = 0; i < ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringoccurance').value - 1; i++) {
              startDate = this.getNexyDayOfMonth(startDate);
              this.appointmentLists[index].appointmentscheduleList.push(startDate);
            }
          }

          setTimeout(() => {
            if(this.appointmentLists[index].appointmentscheduleList.length > 0 ) {

              if(this.appointmentLists[index].staffnotAvailable == false) {
                
              }
              
            } else {
              this.showNotification('top', 'right', 'Please select days between specified date range!!', 'danger');
              return;
            }
          }, 100);

        } else {
          this.showNotification('top', 'right', 'Recurring type cannot be empty!!!', 'danger');
          return;
        }

      }

    } else {
      this.showNotification('top', 'right', 'Date cannot be empty!!!', 'danger');
      return;
    }
  }

  getNextDay(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setDate(resultDate.getDate() + 1));
    return resultDate;
  }

  getNextDayOfWeek(date: Date, dayOfWeek: any) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay() - 1) % 7 + 1);
    return resultDate;
  }

  getNexyDayOfMonth(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setMonth(resultDate.getMonth() + 1));
    return resultDate;
  }

  async getAllHolidays() {

    var url = "common/viewcalendar/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.date.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.holidayLists = [];
          this.holidayLists = data;
          
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  isInArray(array: any, value: Date) {
    var check = array.find(item=> new Date(item.date).toDateString() == new Date(value).toDateString())
    if(check) {
      return false
    } else {
      return true
    }
  }

  myFilter = (d: Date): boolean => {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return  this.isInArray(this.holidayLists, d) && this.workinghours.days.includes(dayName);
  }

  isHoliday(date: any) {
    
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(date).getDay()];
    
    var working = this.workinghours.days.includes(dayName);
    if(!working) {
      return false;
    } else {
      var check = this.holidayLists.find(item=> new Date(item.date).toDateString() == new Date(date).toDateString())
      if(check) {
        return false
      } else {
        return true
      }
    }
  }

  removeDate(index: number, date: Date) {
    this.remove(date, this.appointmentLists[index].appointmentscheduleList);
  }

  remove(date: Date, array: any) {
    var holidays = [new Date(date)];
    for (let i in array) {
      if (holidays.some(d => +d === + array[i])) {
        array.splice(i, 1);
      }
    }
  }

  async dateChange(index: number, event: MatDatepickerInputEvent<Date>) {
    
    var date = new Date(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('date').value);
    
    //this.appointmentLists[index].staffvisible = false;

    this.appointmentLists[index].staffnotAvailable = false;
    this.appointmentLists[index].supportstaffnotAvailable = false;
    this.appointmentLists[index].equipmentnotAvailable = false;
    this.appointmentLists[index].valid = false;
    this.disableBtn = true;
    
    this.appointmentLists[index].appointmentscheduleList = [];
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff')) {
      this.appointmentLists[index].staffvisible = false;
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').patchValue("");
    }

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('schedule')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('schedule').patchValue("");
    }
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringtype')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('recurringtype').patchValue("");
    }

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeet')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeet').patchValue("");
    }

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl')){
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl').patchValue("");
    }
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('supportstaff').patchValue([]);
    }
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('products')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('products').patchValue([]);
    }

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').patchValue([]);
    }
    
    
    var result = await this.getStaffAvailByDate(date, this.appointmentLists[index].staffLists, this.appointmentLists[index].supportstaffLists);

    this.appointmentLists[index].staffLists.forEach(element => {

      element.disable = false;
      
      var analyticsObj = result.find(p=> ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(date).toDateString()) ));

      if(element.availability && element.availability.days && element.availability.days.length > 0) {
        var dayName = this.getDayName(this.date);
        var workingday = element.availability.days.includes(dayName)
        if(!workingday) {
          element.disable = true;
        }
      } 

      if(analyticsObj && analyticsObj.isnoavailable) {
        element.disable = true;
      } 
      
      // else if (analyticsObj && analyticsObj.quantity == 1 && analyticsObj.availability.length > 0) {
      //   element.staffavailability = [];
      //   element.staffavailability = analyticsObj.availability;
      //   element.quantity = analyticsObj.quantity;
      // }
    });

    if(this.appointmentLists[index].supportstaffLists && this.appointmentLists[index].supportstaffLists.length > 0) {
      this.appointmentLists[index].supportstaffLists.forEach(elementSupportStaff => {
        elementSupportStaff.disable = false;

        var analyticsObj = result.find(p=> ((p._id == elementSupportStaff._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString()) ));

        if(elementSupportStaff.availability && elementSupportStaff.availability.days && elementSupportStaff.availability.days.length > 0) {
          var dayName = this.getDayName(this.date);
          var workingday = elementSupportStaff.availability.days.includes(dayName)
          if(!workingday) {
            elementSupportStaff.disable = true;
          }
        }

        if(analyticsObj && analyticsObj.isnoavailable) {
          elementSupportStaff.disable = true;
        } 

      });
    }

    this.appointmentLists[index].supportstaffLists = this.appointmentLists[index].supportstaffLists.filter(item => !item.disable);

    this.appointmentLists[index].staffvisible = true;
  }

  showOptions(index: number, event: MatCheckboxChange): void {
    if(event.checked) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl').setValidators([Validators.required]);
    } else {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl').clearValidators();
    }
    ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('onlinemeeturl').updateValueAndValidity();
  }

  async starttimeChange(index: number, trackingId: any) {


    this.appointmentLists[index].staffnotAvailable = false;
    this.appointmentLists[index].supportstaffnotAvailable = false;
    this.appointmentLists[index].equipmentnotAvailable = false;
    this.appointmentLists[index].valid = false;
    this.disableBtn = true;
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').patchValue([]);
    }

    this.appointmentLists[index].staffvisible = false;  
    this.appointmentLists[index].staffdbvalue = undefined;

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').patchValue("");
    }
    
    var starttime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    var appoint = this.appointmentLists.find(p=>p.trackingId == trackingId);
    if(appoint && appoint.timeslotLists && appoint.timeslotLists.length > 0) {
      var timeSlotIndex = appoint.timeslotLists.findIndex(p=>p.id == starttime);
      if(timeSlotIndex !== -1) {
        let min = appoint.duration;
        let time = appoint.timeslotLists[timeSlotIndex].starttime;
        let converted = this.addTimes('0:'+ min, time);
        var rest = converted.substring(0, converted.lastIndexOf(":00") + 0);
        const myArray = rest.split(":");
        var newStrig = this.round5(myArray[1]);
        var endtime: any;
        if(newStrig == 60) {
          endtime = (Number(myArray[0]) + Number(1)) + ":00";
        } else if(newStrig == 0) {
          endtime = myArray[0] + ":00";
        } else {
          endtime = myArray[0] + ":" + newStrig;
        }
        let endTimeObj = appoint.timeslotLists.find(p=>p.starttime == endtime);
        if(endTimeObj && endTimeObj.id) {
          if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime')) {
            ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').patchValue(endTimeObj.id);
          }
          
        }
      }
    }

    setTimeout(() => {
      this.appointmentLists[index].staffvisible = true;    
    });
    
    
    
    return;
  }

  endtimeChange(index: number, trackingId: any) {

    this.appointmentLists[index].staffnotAvailable = false;
    this.appointmentLists[index].supportstaffnotAvailable = false;
    this.appointmentLists[index].equipmentnotAvailable = false;
    this.appointmentLists[index].valid = false;
    this.disableBtn = true;
    
    var starttimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('starttime').value;
    var endtimeid = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;

    var starttime = "";
    var endtime = "";

    var starttimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == starttimeid)
    if (starttimeObj) {
      starttime = starttimeObj.starttime;
    }
    var endtimeObj = this.appointmentLists[index].timeslotLists.find(p => p.id == endtimeid)
    if (endtimeObj) {
      endtime = endtimeObj.starttime;
    }

    var starttimeNew = moment(starttime, "HH:mm");
    var endtimeNew = moment(endtime, "HH:mm");

    
    if(endtimeNew <= starttimeNew) {
      super.showNotification("top", "right", "Endtime cannot be before starttime", "danger");
      if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime')) {
        ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').patchValue("");
      }
    } 
    
    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('equipments').patchValue([]);
    }
    
    this.appointmentLists[index].staffvisible = false;  
    this.appointmentLists[index].staffdbvalue = undefined;

    if(((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff')) {
      ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('staff').patchValue("");
    }
    

    setTimeout(() => {
      this.appointmentLists[index].staffvisible = true;    
    });
  }

  round5(x){
    return Math.ceil(x/15)*15;
  }

  addTimes(t0, t1) {
    return this.secsToTime(this.timeToSecs(t0) + this.timeToSecs(t1));
  }
  
  // Convert time in H[:mm[:ss]] format to seconds
  timeToSecs(time) {
    let [h, m, s] = time.split(':');
    return h*3600 + (m|0)*60 + (s|0)*1;
  }
  
  // Convert seconds to time in H:mm:ss format
  secsToTime(seconds) {
    let z = n => (n<10? '0' : '') + n; 
    return (seconds / 3600 | 0) + ':' +
         z((seconds % 3600) / 60 | 0) + ':' +
          z(seconds % 60);
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep(index: number) {

    this.step = index;
    this.step++;

    var item = ((this.form.get('appointments') as FormArray).at(index + 1));
    if(item) {
      var upcomingStattime = ((this.form.get('appointments') as FormArray).at(index + 1) as FormGroup).get('starttime').value;
      if(upcomingStattime == "") {
        var endtime = ((this.form.get('appointments') as FormArray).at(index) as FormGroup).get('endtime').value;
        if(this.appointmentLists && this.appointmentLists[index] && this.appointmentLists[index] && this.appointmentLists[index].timeslotLists && this.appointmentLists[index].timeslotLists.length > 0) {
          let endTimeObj = this.appointmentLists[index].timeslotLists.find(p=>p.id == endtime);
          if(endTimeObj && endTimeObj.starttime) {

            if(this.appointmentLists && this.appointmentLists[index + 1] && this.appointmentLists[index + 1].timeslotLists && this.appointmentLists[index + 1].timeslotLists.length > 0) {
              var upcomingTimeSlotObj = this.appointmentLists[index + 1].timeslotLists.find(p=>p.starttime == endTimeObj.starttime);
              if(upcomingTimeSlotObj && upcomingTimeSlotObj.id) {
                if(((this.form.get('appointments') as FormArray).at(index + 1) as FormGroup).get('starttime')) {
                  ((this.form.get('appointments') as FormArray).at(index + 1) as FormGroup).get('starttime').patchValue(upcomingTimeSlotObj.id);  
                }
                
                var trackingId = ((this.form.get('appointments') as FormArray).at(index + 1) as FormGroup).get('trackingId').value;
                this.starttimeChange(index + 1, trackingId);
              }
            }
            
          }
        }
      }
    }
  }

  prevStep(index: number) {
    this.step = index;
    this.step--;
  }

  cancel() {
    this.form.reset();
    this.onAppointmentData.emit("cancel");
  }

  addNewGroup() {
    this.newGroup = true;
    this.attendee.setValue("");
    this.form.addControl('groupname', new FormControl('', Validators.required));    
    this.form.addControl('groupsize', new FormControl('', Validators.required));    
  }

  addNewCustomer() {
    this.newCustomer = true;
    this.attendee.setValue("");
    this.form.addControl('customerfirstname', new FormControl('', Validators.required));
    this.form.addControl('customerlastname', new FormControl('', Validators.required));
    this.form.addControl('customeremail', new FormControl(''));
    this.form.addControl('iscustomeremail', new FormControl(''));
    this.form.addControl('customermobile', new FormControl(''));
  }

  
  async submitAddNewGroup() {

    if(this.form.get('groupname').valid)  {

      let model = {};
      model['title'] = this.form.get('groupname').value;
      model['property'] = {
        bookingperson :this.form.get('groupsize').value,
        title :this.form.get('groupname').value
      }

      try {
        var datas = await this._commonService.commonServiceByUrlMethodDataAsync('groupclasses', 'POST', model) as any;
        
        this.group.setValue(datas);
        
        this.canceladdNewGroup();
        super.showNotification("top", "right", "Group added successfully !!", "success");
      } catch (e) {
        
        super.showNotification("top", "right", "Error Occured !!", "danger");
      }


    } else {
      this.submitted = true;
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    }
    
  }

  async submitAddNewCustomer() {

    if(this.form.get('customerfirstname').valid && this.form.get('customerlastname').valid && this.form.get('customeremail').valid && this.form.get('customermobile').valid)  {
      
      if(this.form.get('customeremail').value == "" && this.form.get('customermobile').value == "")  {
        this.showNotification('top', 'right', 'Mobile or Email is required fields !!', 'danger');
        return;
      }
      

      let model = {};
      model['fullname'] = this.form.get('customerfirstname').value + ' ' + this.form.get('customerlastname').value;
      model['property'] = {};
      //model['property']['fullname'] = this.form.get('customerfirstname').value + ' ' + this.form.get('customerlastname').value;
      model['property']['first_name'] = this.form.get('customerfirstname').value;
      model['property']['last_name'] = this.form.get('customerlastname').value;
      model['property']['mobile'] = this.form.get('customermobile').value;
      model['property']['primaryemail'] = this.form.get('customeremail').value;

      var iscustomeremail = this.form.get('iscustomeremail').value;
      if(iscustomeremail) {
        model['property']['send_mail'] = true;
      } else {
        model['property']['send_mail'] = false;
      }

      try {
        var datas = await this._commonService.commonServiceByUrlMethodDataAsync('prospects', 'POST', model) as any;
        
        if(!datas.nickname) {
          datas.nickname = datas.fullname;
        }
        if(!datas.primaryemail) {
          datas.primaryemail = datas.property.primaryemail;
        }

        datas.type = "C";

        if(datas.property.send_mail) {
          this.form.get("isattendeeemail").setValue(true);
        } else {
          this.form.get("isattendeeemail").setValue(false);
        }

        this.attendee.setValue(datas);

        
        this.canceladdNewCustomer();
        super.showNotification("top", "right", "Customer added successfully !!", "success");
      } catch (e) {
        
        super.showNotification("top", "right", "Error Occured !!", "danger");
      }


    } else {
      this.submitted = true;
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    }
    
  }
  
  canceladdNewGroup () {
    this.form.removeControl('groupname');
    this.form.removeControl('groupsize');
    this.form.removeControl('customerfirstname');
    this.form.removeControl('customerlastname');
    this.form.removeControl('customeremail');
    this.form.removeControl('iscustomeremail');
    this.form.removeControl('customermobile');
    this.newGroup = false;
  }

  canceladdNewCustomer () {
    
    this.form.removeControl('groupname');
    this.form.removeControl('groupsize');
    this.form.removeControl('customerfirstname');
    this.form.removeControl('customerlastname');
    this.form.removeControl('customeremail');
    this.form.removeControl('iscustomeremail');
    this.form.removeControl('customermobile');

    this.newCustomer = false;
  }

  getDisplayName(index: number, id: any, objectName: any, displayName: any) {
    if(this.appointmentLists && this.appointmentLists[index] && this.appointmentLists[index][objectName] && this.appointmentLists[index][objectName].length > 0) {
      var Obj = this.appointmentLists[index][objectName].find(p=>p._id == id);
      if(Obj && Obj[displayName]) {
        return Obj[displayName];
      }
    }
  }

  
  
  async sendMailChange(event: MatCheckboxChange) {
    

    var url = "common/massupdate"
    var method = "POST";

    var postData = {};


    postData['schemaname'] = "Member";

    if (this.attendee && this.attendee.value && this.attendee.value.type) {
      
      switch (this.attendee.value.type) {
        case "M":
          postData['schemaname'] = "members";
          break;
        case "C":
          postData['schemaname'] = "prospects";
          break;
        case "U":
          postData['schemaname'] = "users";
          break;
        default:
          postData['schemaname'] = "members";
      }
    }

    postData["ids"] = [this.attendee.value._id];
    postData["fieldname"] = "property.send_mail";
    postData["fieldvalue"] = event.checked ? "Yes" : "No";

    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            return;
          }
        }, (error) => {
          console.error(error);
          this.disableBtn = false;
        });


  }

  async addService(index: number) {
    
    if(this.service && this.service.value && this.service.value.type == "service") {
      
      var element = this.service.value;
      var index = this.appointmentLists.length + 1;
      await this.getTimeSlotLists(element, index);

    } else {

      var serviceid = this.appointmentLists[index]['serviceid'];

      var element = this.service.value.services.find(p=>p.serviceid && p.serviceid._id == serviceid);
      if(element) {
        var index = this.appointmentLists.length + 1;
        await this.getTimeSlotLists(element.serviceid, index);
      }
    }
    
  }
}

