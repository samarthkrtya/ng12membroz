import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as moment from 'moment';
import { MatExpansionPanel } from '@angular/material/expansion';
import swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common'

declare var $: any;

export const _filter = (opt: any[], value: any): any[] => {

  const filterValue = value.toLowerCase();
  return opt.filter(item => item.title.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-schedule-multiple',
  templateUrl: './schedule-multiple.component.html',
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

  `
  ]
})
export class ScheduleMultipleComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChildren(MatExpansionPanel) pannels: QueryList<MatExpansionPanel>

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  _id: any;
  date: Date;
  assign: any;

  @Input() dataContent: any;
  @Input() memberid: any;
  @Input() type: any;
  @Input() passondate: Date;
  @Output() onScheduleData = new EventEmitter();

  package: any;
  service = new FormControl();
  serviceLists: any[] = [];
  filteredServices: Observable<any[]>;
  allServiceLists: any[] = [];
  allPackageLists: any[] = [];
  serviceisLoadingBox: boolean = false;

  attendee = new FormControl();
  attendeeoptions: string[] = [];
  filteredAttendeeOptions: Observable<string[]>;
  allAttendeeLists: any[] = [];
  attendeeisLoadingBox: boolean = false;

  group = new FormControl();
  groupoptions: string[] = [];
  filteredGroupOptions: Observable<string[]>;
  allGroupLists: any[] = [];
  groupisLoadingBox: boolean = false;

  pacakgesLists: any[] = [];
  serviceobject = []



  assignLists: any[] = [
    { id: "individual", name: "Individual", checked: true },
    { id: "group", name: "Group", checked: false }
  ];

  recurringtypeLists: any[] = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
  ];

  recurringoccuranceLists: any[] = [];
  step = 0;
  holidayLists: any[] = [];
  workinghours: any = {};
  allResourceLists: any[] = [];

  serviceLoading: boolean = false;
  visits: String;

  isVisible: boolean = false;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    public datepipe: DatePipe
  ) {

    super()
    this.pagename = "app-schedule-multiple";

    this.form = fb.group({
      '_id': [this._id],
      'package': [this.package, { validators: [Validators.required] }],
      'service': [this.service, { validators: [Validators.required] }],
      'assign': [this.assign],
      'visite': [],
      'attendee': [this.attendee, { validators: [] }],
      'group': [this.group, { validators: [] }],
    });
  }

  async ngOnInit() {
    try {

      super.ngOnInit()
      await this.initializeVariables()
      await this.getpackageLists()
      await this.getServiceLists()
      await this.getAllHolidays()
      await this.getAllResources()
      await this.getpackages();
      if (this.type == "multi") {

        this.onAssignChanged("individual");

        if (!this.memberid) {

          await this.getAllContacts()
          await this.getAllGroups()
        } else {

          if (!this.dataContent.nickname) {
            this.dataContent.nickname = this.dataContent.fullname;
          }
          this.form.get('attendee').setValue(this.dataContent);
          this.attendee.setValue(this.dataContent);
        }
      }

    } catch (error) {
      console.error("error", error)
    } finally {
      this.assign = "individual";
    }


    this.filteredAttendeeOptions = this.attendee.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.nickname),
        map(option => option ? this._attendeefilter(option) : this.allAttendeeLists.slice())
      );


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
        map(option => option ? this._filterService(option) : this.serviceobject.slice())
      );

  }

  ngOnDestroy() {

    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.date = new Date(this.passondate)

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
    var branch = this._authService.currentUser.user.branchid;
    this.workinghours = branch.workinghours;

    this.allResourceLists = [];
    this.serviceLoading = false;

    this.isVisible = true;
    return;
  }

  //Service
  async getServiceLists() {

    var url = "/services/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    this.serviceisLoadingBox = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data.length == 0) {
          this.serviceisLoadingBox = false;
        }

        if (data && data[0]) {

          this.allServiceLists = [];
          this.allServiceLists = data;

          this.allServiceLists.map(p => p.type = "service");
          this.allServiceLists.map(p => p.description = this.stripHtml(p?.description));
          this.allServiceLists.map(p => p.img = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg");

          this.serviceLists = [];

          this.allServiceLists.forEach(element => {
            if (element && element.category && element.category.property && element.category.property.name) {
              var serviceObj = this.serviceLists.find(p => p._id == element.category._id);
              if (!serviceObj) {
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

  async getpackageLists() {

    var url = "/memberships/filter/";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });

    this.serviceisLoadingBox = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {


        if (data && data.length == 0) {
          this.serviceisLoadingBox = false;
        }

        if (data && data[0]) {
          this.allPackageLists = [];
          this.allPackageLists = data;

          this.allPackageLists.map(p => p.type = "package");
          this.allPackageLists.map(p => p.description = this.stripHtml(p && p.property && p.property.description ? p.property.description : ""));
          this.allPackageLists.map(p => p.title = p.membershipname);
          this.allPackageLists.map(p => p.img = "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg");

          let obj = {
            name: "packages",
            children: []
          }

          this.allPackageLists.forEach(element => {
            obj['children'].push(element);
          });
          this.serviceLists.push(obj);

          this.serviceisLoadingBox = false;
          return;
        }

      }, (error) => {
        console.error(error);
        this.serviceisLoadingBox = false;
      });

  }


  private _filterService(value: string): string[] {
    let results;
    if (value) {
      results = this.serviceobject
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
      results = this.serviceobject.slice();
    }
    return results;
  }

  async preloaddata() {
    if (this.serviceobject && this.serviceobject.length == 0) {
      var packageObj = this.pacakgesLists.find(p => p._id == this.package);
      if (packageObj) {
        this.serviceobject = [];
        this.serviceobject = this.renderdata(packageObj.services);
        this.serviceobject.map(p => p.type = "service");
      }
    }
  }

  enter() {
    const controlValue = this.service.value;
    this.service.setValue(controlValue);
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.service.setValue("");
      this.serviceobject = [];
    }
  }

  displayFn(pkg: any): string {
    return pkg && pkg.title ? pkg.title : '';
  }

  async optionSelected(option: any) {
    // this.visits= option.value.visits
    this.serviceLoading = true;
    await this.getServiceById(option.value._id);
    await this.serviceSchedule();
  }

  async getServiceById(id: any) {

    if (this.allServiceLists && this.allServiceLists.length > 0) {
      var staffObj = this.allServiceLists.find(p => p._id == id);
      if (staffObj) {
        this.service.setValue(staffObj);
        return;
      } else {
        await this.getServiceApiCall(id);
      }
    } else {
      await this.getServiceApiCall(id);
    }
  }

  async getServiceApiCall(id: any) {

    var url = "services/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data && data[0]) {

          this.service.setValue(data[0]);
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async serviceSchedule() {

    if (this.service.value && this.service.value._id) {
      this.service.value["type"] = "service";
    }


    if (this.service && this.service.value && this.service.value.type == "service") {

      this.service.value.staffvisible = true;
      this.service.value.timeslotLists = [];
      this.service.value.appointmentscheduleList = [];

      var istoday: boolean = false;
      var today = new Date();
      var selectedDay = this.getDayName(this.date);

      var starttime = this.service.value['availability'].starttime;
      var endtime = this.service.value['availability'].endtime;
      var duration = this.service.value['duration'];

      var endmin = endtime.split(":");
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
          timemin += parseInt(duration);
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

        this.service.value.timeslotLists.push(obj);
        time += parseInt(duration);

      }

      let group: any = {};
      group['date'] = new FormControl(new Date(this.date), Validators.compose([Validators.required]));
      group['timeslot'] = new FormControl(null, Validators.compose([Validators.required]));
      group['staff'] = new FormControl(null, Validators.compose([]));
      group['schedule'] = new FormControl(null);
      group['recurringtype'] = new FormControl(null);
      group['recurringoccurance'] = new FormControl(null);
      group['onlinemeet'] = new FormControl(null);
      group['onlinemeeturl'] = new FormControl(null);
      group['resource'] = new FormControl(null);
      group['resourceid'] = new FormControl(null);


      this.form.addControl(this.service.value._id, this.fb.group(group));

      var result = await this.getStaffAvailByDate(this.date, this.service.value.staff);

      this.service.value.staff.forEach(element => {
        element.disable = false;
        var analyticsObj = result.find(p => ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString())));
        if (analyticsObj && analyticsObj.isnoavailable) {
          element.disable = true;
        }
      });

    } else if (this.service && this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length > 0) {

      this.service.value.services.forEach(async element => {

        element.timeslotLists = [];
        element.appointmentscheduleList = [];
        element.staffvisible = true;

        var istoday: boolean = false;
        var today = new Date();
        var selectedDay = this.getDayName(this.date);

        var starttime = element['serviceid']['availability'].starttime;
        var endtime = element['serviceid']['availability'].endtime;
        var duration = element['serviceid']['duration'];

        var endmin = endtime.split(":");
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
            timemin += parseInt(duration);
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

          element.timeslotLists.push(obj);
          time += parseInt(duration);

        }

        let group: any = {};
        group['date'] = new FormControl(new Date(this.date), Validators.compose([Validators.required]));
        group['timeslot'] = new FormControl(null, Validators.compose([Validators.required]));
        group['staff'] = new FormControl(null, Validators.compose([Validators.required]));
        group['schedule'] = new FormControl(null);
        group['recurringtype'] = new FormControl(null);
        group['recurringoccurance'] = new FormControl(null);
        group['onlinemeet'] = new FormControl(null);
        group['onlinemeeturl'] = new FormControl(null);
        group['resource'] = new FormControl(null);
        group['resourceid'] = new FormControl(null);

        this.form.addControl(element.serviceid._id, this.fb.group(group));

        var result = await this.getStaffAvailByDate(this.date, element.serviceid.staff);

        element.serviceid.staff.forEach(element => {
          element.disable = false;
          var analyticsObj = result.find(p => ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString())));
          if (analyticsObj && analyticsObj.isnoavailable) {
            element.disable = true;
          }
        });
      });
    }

    this.serviceLoading = false;
  }

  async getStaffAvailByDate(date: Date, staffLists: any) {
    var today = new Date(date);
    today.setHours(0, 0, 0, 0);

    var tommrrow = new Date(this.date);
    tommrrow.setDate(tommrrow.getDate() + 1);
    tommrrow.setHours(0, 0, 0, 0);

    var staffids = staffLists.map(choice => (choice._id));

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "619c87614220efd6edda0232";

    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": staffids, "criteria": "in", "datatype": "ObjectId" });
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

  // contacts

  async getAllContacts() {
    var url = "common/contacts/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["select"] = [];
    postData["select"].push({ fieldname: "nickname", value: 1 });
    // postData["select"].push({ fieldname: "fullname", value: 1 });
    // postData["select"].push({ fieldname: "type", value: 1 });
    // postData["select"].push({ fieldname: "primaryemail", value: 1 });
    // postData["select"].push({ fieldname: "mobile", value: 1 });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allAttendeeLists = []
          this.allAttendeeLists = data;
          this.allAttendeeLists.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  enterAttendee() {
    const controlValue = this.attendee.value;
    this.attendee.setValue(controlValue);
  }

  preloadAttendeedata() {
    if (this.allAttendeeLists && this.allAttendeeLists.length == 0) {
      this.getAllContacts()
    }
  }

  handleEmptyAttendeeInput(event: any) {
    if (event.target.value === '') {
      this.attendee.setValue("");
      this.allAttendeeLists = [];
    }
  }

  displayAttendeeFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  optionAttendeeSelected(option: any) {
    this.attendee.setValue(option.value);
  }

  private _attendeefilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allAttendeeLists
        .filter(option => {
          if (option.nickname) {
            return option.nickname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allAttendeeLists.slice();
    }
    return results;
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

  removeStep(index: number, id: any) {
    if (this.service && this.service.value && this.service.value.services && this.service.value.services.length > 0) {

      const varTemp = this;

      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this Service!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {

          varTemp.service.value.services.splice(index, 1);
          varTemp.form.removeControl(id);

          swal.fire({
            title: 'Deleted!',
            text: 'Service has been deleted.',
            icon: 'success',
            customClass: {
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
          });

        } else {
          swal.fire({
            title: 'Cancelled',
            text: 'Service is safe :)',
            icon: 'error',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })

    }
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep(index: number) {
    this.step++;
  }

  prevStep(index: number) {
    this.step--;
  }

  saveAndSubmit(index: number) {
    this.nextStep(index)
    $("#submit").click();
  }

  getTimeSlot(timeslots: any, value: any) {
    var timslotObj = timeslots.find(p => p.id == value);
    if (timslotObj) {
      return timslotObj.displaytext ? timslotObj.displaytext : '';
    }
  }

  getStaff(staffs: any, value: any) {
    var staffObj = staffs.find(p => p._id == value);
    if (staffObj) {
      return staffObj.fullname ? staffObj.fullname : '';
    }
  }

  onAssignChanged(value: any) {
    if (value) {
      this.group.setValue("")
      this.attendee.setValue("")
      this.assign = value;
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

      if (this.type == "multi" && this.assign == "group" && (!value.group || !value.group.value)) {
        this.showNotification('top', 'right', 'Please select group !!', 'danger');
        return;
      }


      if ((!value.service || !value.service.value)) {
        this.showNotification('top', 'right', 'Please select service !!', 'danger');
        return;
      }

      if ((typeof value.service.value === 'string')) {
        this.showNotification('top', 'right', 'Please select valid service !!', 'danger');
        return;
      }

      if (this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length == 0) {
        this.showNotification('top', 'right', 'Select atleast One Service !!', 'danger');
        return;
      }

      var services = [];

      if (this.service.value && this.service.value.type && this.service.value.type == "service") {

        var timeslot = {};
        var timslotObj = this.service.value.timeslotLists.find(p => p.id == this.form.get([this.service.value._id, 'timeslot']).value);
        if (timslotObj) {
          timeslot = {
            "day": timslotObj.day,
            "starttime": timslotObj.starttime,
            "endtime": timslotObj.endtime,
          };
        }

        var property = {};

        if (this.form.get([this.service.value._id, 'onlinemeet']).value == true) {
          property['onlinemeet'] = true;
          property['onlinemeeturl'] = this.form.get([this.service.value._id, 'onlinemeeturl']).value;
        }

        if (this.form.get([this.service.value._id, 'schedule']).value == true) {
          if (this.service.value.appointmentscheduleList.length > 0) {
            this.service.value.appointmentscheduleList.forEach(elementDate => {
              let obj = {
                refid: this.service.value._id,
                date: new Date(elementDate),
                timeslot: timeslot,
                host: this.form.get([this.service.value._id, 'staff']).value._id ? this.form.get([this.service.value._id, 'staff']).value._id : this.form.get([this.service.value._id, 'staff']).value ? this.form.get([this.service.value._id, 'staff']).value : null,
                charges: this.service.value.charges ? this.service.value.charges : 0,
                duration: this.service.value.duration ? this.service.value.duration : 30,
                property: property,
              }

              if (this.form.get([this.service.value._id, 'resource']).value && this.form.get([this.service.value._id, 'resource']).value == true) {
                obj['resourceid'] = this.form.get([this.service.value._id, 'resourceid']).value && this.form.get([this.service.value._id, 'resourceid']).value._id ? this.form.get([this.service.value._id, 'resourceid']).value._id : this.form.get([this.service.value._id, 'resourceid']).value;
              }
              services.push(obj);
            });
          }
        } else {
          let obj = {
            refid: this.service.value._id,
            date: new Date(this.form.get([this.service.value._id, 'date']).value),
            timeslot: timeslot,
            host: this.form.get([this.service.value._id, 'staff']) && this.form.get([this.service.value._id, 'staff']).value._id ? this.form.get([this.service.value._id, 'staff']).value._id : this.form.get([this.service.value._id, 'staff']).value ? this.form.get([this.service.value._id, 'staff']) && this.form.get([this.service.value._id, 'staff']).value : null,
            charges: this.service.value.charges ? this.service.value.charges : 0,
            duration: this.service.value.duration ? this.service.value.duration : 30,
            property: property
          }

          if (this.form.get([this.service.value._id, 'resource']).value && this.form.get([this.service.value._id, 'resource']).value == true) {
            obj['resourceid'] = this.form.get([this.service.value._id, 'resourceid']).value && this.form.get([this.service.value._id, 'resourceid']).value._id ? this.form.get([this.service.value._id, 'resourceid']).value._id : this.form.get([this.service.value._id, 'resourceid']).value;
          }
          services.push(obj);
        }

      } else if (this.service.value && this.service.value.type && this.service.value.type == "package") {

        if (this.service.value && this.service.value.services && this.service.value.services.length > 0) {

          this.service.value.services.forEach(element => {

            var timeslot = {};

            var timslotObj = element.timeslotLists.find(p => p.id == this.form.get([element.serviceid._id, 'timeslot']).value);
            if (timslotObj) {
              timeslot = {
                "day": timslotObj.day,
                "starttime": timslotObj.starttime,
                "endtime": timslotObj.endtime,
              };
            }

            var property = {};

            if (this.form.get([element.serviceid._id, 'onlinemeet']).value == true) {

              property = {};
              property['onlinemeet'] = true;
              property['onlinemeeturl'] = this.form.get([element.serviceid._id, 'onlinemeeturl']).value;
            }

            if (this.form.get([element.serviceid._id, 'schedule']).value == true) {

              if (element.appointmentscheduleList.length > 0) {
                element.appointmentscheduleList.forEach(elementDate => {

                  let obj = {
                    refid: element.serviceid._id,
                    date: new Date(elementDate),
                    timeslot: timeslot,
                    host: this.form.get([element.serviceid._id, 'staff']).value._id ? this.form.get([element.serviceid._id, 'staff']).value._id : this.form.get([element.serviceid._id, 'staff']).value,
                    charges: element.serviceid.charges ? element.serviceid.charges : 0,
                    duration: element.serviceid.duration ? element.serviceid.duration : 30,
                    property: property
                  }

                  if (this.form.get([element.serviceid._id, 'resource']).value && this.form.get([element.serviceid._id, 'resource']).value == true) {
                    obj['resourceid'] = this.form.get([element.serviceid._id, 'resourceid']).value && this.form.get([element.serviceid._id, 'resourceid']).value._id ? this.form.get([element.serviceid._id, 'resourceid']).value._id : this.form.get([element.serviceid._id, 'resourceid']).value;
                  }

                  services.push(obj);
                });
              }
            } else {
              let obj = {
                refid: element.serviceid._id,
                date: new Date(this.form.get([element.serviceid._id, 'date']).value),
                timeslot: timeslot,
                host: this.form.get([element.serviceid._id, 'staff']).value._id ? this.form.get([element.serviceid._id, 'staff']).value._id : this.form.get([element.serviceid._id, 'staff']).value,
                charges: element.serviceid.charges ? element.serviceid.charges : 0,
                duration: element.serviceid.duration ? element.serviceid.duration : 30,
                property: property
              }
              if (this.form.get([element.serviceid._id, 'resource']).value && this.form.get([element.serviceid._id, 'resource']).value == true) {
                obj['resourceid'] = this.form.get([element.serviceid._id, 'resourceid']).value && this.form.get([element.serviceid._id, 'resourceid']).value._id ? this.form.get([element.serviceid._id, 'resourceid']).value._id : this.form.get([element.serviceid._id, 'resourceid']).value;
              }
              services.push(obj);
            }
          });
        }
      }

      var url = "/appointments/multi";
      var method = "POST";

      let postData = {};
      postData['services'] = services;

      if (this.type == "multi" && this.assign == "individual") {

        postData['onModel'] = "Member";

        if (this.memberid) {

          postData['onModel'] = "Prospect";

        } else if (this.attendee && this.attendee.value && this.attendee.value.type) {

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
        postData['attendee'] = this.attendee.value._id ? this.attendee.value._id : this.dataContent._id;
      } else if (this.type == "multi" && this.assign == "group") {
        postData['onModel'] = "Groupclass";
        postData['attendee'] = value.group.value._id ? value.group.value._id : this.dataContent._id;
      }

      this.disableBtn = true;


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
            this.onScheduleData.emit("success");
            return;
          }
        }, (error) => {
          console.error(error);
          this.disableBtn = false;
        });

    }
  }

  cancel() {
    this.form.reset();
    this.onScheduleData.emit("cancel");
  }

  showOptions(id: any, event: MatCheckboxChange): void {
    if (event.checked) {
      this.form.get([id, 'onlinemeeturl']).setValidators([Validators.required]);
    } else {
      this.form.get([id, 'onlinemeeturl']).clearValidators();
    }
    this.form.get([id, 'onlinemeeturl']).updateValueAndValidity();
  }

  showResourceOptions(id: any, event: MatCheckboxChange): void {
    if (event.checked) {
      //this.form.get([id, 'resourceid']).setValidators([Validators.required]); 
      this.form.get([id, 'resourceid']).clearValidators();
    } else {
      this.form.get([id, 'resourceid']).clearValidators();
    }
    this.form.get([id, 'resourceid']).updateValueAndValidity();
  }

  onScheduleChanged(id: any, event: MatCheckboxChange): void {
    if (event.checked) {
      this.disableBtn = true;
      this.form.get([id, 'recurringtype']).setValue("daily");
      this.form.get([id, 'recurringoccurance']).setValue(2);
    } else {
      this.disableBtn = false;
      this.form.get([id, 'recurringtype']).setValue("");
      this.form.get([id, 'recurringoccurance']).setValue(0);
    }
  }

  onRecurringChanged(serviceid: any, event: any) {
    if (this.service.value && this.service.value.type && this.service.value.type == "service") {
      if (this.service.value._id) {
        this.service.value.appointmentscheduleList = [];
      }
    } else if (this.service.value && this.service.value.type && this.service.value.type == "package") {

      if (this.service.value && this.service.value.services && this.service.value.services.length > 0) {
        var serviceObj = this.service.value.services.find(p => p.serviceid._id == serviceid);

        if (serviceObj) {
          serviceObj.appointmentscheduleList = [];
        }
      }
    }

  }

  removeDate(serviceid: any, date: Date) {
    if (this.service.value && this.service.value.type && this.service.value.type == "service") {
      this.remove(date, this.service.value.appointmentscheduleList);
    } else if (this.service.value && this.service.value.type && this.service.value.type == "package") {
      if (this.service.value && this.service.value.services && this.service.value.services.length > 0) {
        var serviceObj = this.service.value.services.find(p => p.serviceid._id == serviceid);
        if (serviceObj) {
          this.remove(date, serviceObj.appointmentscheduleList);
        }
      }
    }
  }

  remove(date: Date, array: any) {
    var holidays = [new Date(date)];
    for (let i in array) {
      if (holidays.some(d => +d === + array[i])) {
        array.splice(i, 1);
      }
    }
  }

  addtime(serviceid: any) {
    if (this.service.value && this.service.value.type && this.service.value.type == "service") {

      if (this.form.get([this.service.value._id, 'date']).value !== null) {
        this.service.value.appointmentscheduleList = [];

        var startDate = new Date(this.form.get([this.service.value._id, 'date']).value);


        if (this.form.get([this.service?.value?._id, 'schedule']).value == true) {

          if (this.form.get([this.service?.value?._id, 'recurringtype']).value !== "") {

            this.service.value.appointmentscheduleList.push(startDate);

            if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "daily") {
              for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
                startDate = this.getNextDay(startDate);
                this.service.value.appointmentscheduleList.push(startDate);
              }
            } else if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "weekly") {
              for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
                startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
                this.service.value.appointmentscheduleList.push(startDate);
              }
            } else if (this.form.get([this.service?.value?._id, 'recurringtype']).value == "monthly") {
              for (var i = 0; i < this.form.get([this.service?.value?._id, 'recurringoccurance']).value - 1; i++) {
                startDate = this.getNexyDayOfMonth(startDate);
                this.service.value.appointmentscheduleList.push(startDate);
              }
            }

            setTimeout(() => {
              if (this.service.value.appointmentscheduleList.length > 0) {
                if (this.service.value.notAvailable == false) {
                  this.disableBtn = false;
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


    } else if (this.service.value && this.service.value.type && this.service.value.type == "package") {

      if (this.service.value && this.service.value.services && this.service.value.services.length > 0) {

        var serviceObj = this.service.value.services.find(p => p.serviceid._id == serviceid);

        if (serviceObj) {

          if (this.form.get([serviceid, 'date']).value !== null) {

            serviceObj.appointmentscheduleList = [];

            var startDate = new Date(this.form.get([serviceid, 'date']).value);


            if (this.form.get([serviceid, 'schedule']).value == true) {

              if (this.form.get([serviceid, 'recurringtype']).value !== "") {

                serviceObj.appointmentscheduleList.push(startDate);

                if (this.form.get([serviceid, 'recurringtype']).value == "daily") {
                  for (var i = 0; i < this.form.get([serviceid, 'recurringoccurance']).value - 1; i++) {
                    startDate = this.getNextDay(startDate);
                    serviceObj.appointmentscheduleList.push(startDate);
                  }
                } else if (this.form.get([serviceid, 'recurringtype']).value == "weekly") {
                  for (var i = 0; i < this.form.get([serviceid, 'recurringoccurance']).value - 1; i++) {
                    startDate = this.getNextDayOfWeek(startDate, startDate.getDay())
                    serviceObj.appointmentscheduleList.push(startDate);
                  }
                } else if (this.form.get([serviceid, 'recurringtype']).value == "monthly") {
                  for (var i = 0; i < this.form.get([serviceid, 'recurringoccurance']).value - 1; i++) {
                    startDate = this.getNexyDayOfMonth(startDate);
                    serviceObj.appointmentscheduleList.push(startDate);
                  }
                }

                setTimeout(() => {
                  if (serviceObj.appointmentscheduleList.length > 0) {
                    if (serviceObj.notAvailable == false) {
                      this.disableBtn = false;
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
      }
    }


  }

  getNextDay(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setDate(resultDate.getDate() + 1));
    return resultDate;
  }

  getNexyDayOfMonth(date: Date) {
    var resultDate = new Date(date.getTime());
    resultDate = new Date(resultDate.setMonth(resultDate.getMonth() + 1));
    return resultDate;
  }

  getNextDayOfWeek(date: Date, dayOfWeek: any) {
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay() - 1) % 7 + 1);
    return resultDate;
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

  onItemNotAvailable(itemNotAvailable: any) {
    this.disableBtn = false;

    if (this.service && this.service.value && this.service.value.type == "service") {
      this.service.value.notAvailable = false;
      if (this.form.get([this.service.value._id, 'staff']).value._id && this.form.get([this.service.value._id, 'staff']).value.disable == true) {
        this.disableBtn = true;
        this.service.value.notAvailable = true;
      }

    } else if (this.service && this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length > 0) {
      this.service.value.services.forEach(async element => {
        element.notAvailable = false
        if (this.form.get([element.serviceid._id, 'staff']).value && this.form.get([element.serviceid._id, 'staff']).value._id && this.form.get([element.serviceid._id, 'staff']).value.disable == true) {
          this.disableBtn = true;
          element.notAvailable = true
        }
      });
    }

  }

  async dateChange(serviceid: any, event: MatDatepickerInputEvent<Date>) {
    var date = new Date(event.value)

    if (this.service && this.service.value && this.service.value.type == "service") {

      this.service.value.staffvisible = false;
      this.form.get([serviceid, 'staff']).setValue("");

      this.form.get([serviceid, 'schedule']).setValue("");
      this.form.get([serviceid, 'recurringtype']).setValue("");
      this.form.get([serviceid, 'recurringoccurance']).setValue("");
      this.form.get([serviceid, 'onlinemeet']).setValue("");
      this.form.get([serviceid, 'onlinemeeturl']).setValue("");

      this.disableBtn = false;
      this.service.value.notAvailable = false;

      var result = await this.getStaffAvailByDate(date, this.service.value.staff);

      this.service.value.staff.forEach(element => {
        element.disable = false;
        var analyticsObj = result.find(p => ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString())));
        if (analyticsObj && analyticsObj.isnoavailable) {
          element.disable = true;
        }
      });

      this.service.value.staffvisible = true;

    } else if (this.service && this.service.value && this.service.value.type == "package" && this.service.value.services && this.service.value.services.length > 0) {

      var element = this.service.value.services.find(p => p.serviceid._id == serviceid);
      if (element) {

        element.staffvisible = false;

        this.form.get([serviceid, 'staff']).setValue("");
        this.form.get([serviceid, 'schedule']).setValue("");
        this.form.get([serviceid, 'recurringtype']).setValue("");
        this.form.get([serviceid, 'recurringoccurance']).setValue("");
        this.form.get([serviceid, 'onlinemeet']).setValue("");
        this.form.get([serviceid, 'onlinemeeturl']).setValue("");

        this.disableBtn = false;

        var result = await this.getStaffAvailByDate(this.date, element.serviceid.staff);

        element.serviceid.staff.forEach(elementStaff => {

          elementStaff.notAvailable = true
          elementStaff.disable = false;
          var analyticsObj = result.find(p => ((p._id == element._id) && (new Date(p.date).toDateString() === new Date(this.date).toDateString())));
          if (analyticsObj && analyticsObj.isnoavailable) {
            elementStaff.disable = true;
          }
        });

        element.staffvisible = true;
      }
    }
  }

  myFilter = (d: Date): boolean => {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(d).getDay()];

    return this.isInArray(this.holidayLists, d) && this.workinghours.days.includes(dayName);
  }

  isInArray(array: any, value: Date) {
    var check = array.find(item => new Date(item.date).toDateString() == new Date(value).toDateString())
    if (check) {
      return false
    } else {
      return true
    }
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

  isHoliday(date: any) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date(date).getDay()];

    var working = this.workinghours.days.includes(dayName);
    if (!working) {
      return false;
    } else {
      var check = this.holidayLists.find(item => new Date(item.date).toDateString() == new Date(date).toDateString())
      if (check) {
        return false
      } else {
        return true
      }
    }
  }

  stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  // Resource

  async getAllResources() {
    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allResourceLists = []
          this.allResourceLists = data
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getpackages() {
    var packages = []

    if (this.dataContent.addons && this.dataContent.addons.length > 0 && this.dataContent.membershipid) {
      packages.push({ _id: this.dataContent.membershipid._id, title: this.dataContent.membershipid.membershipname, services: this.dataContent.membershipid.services })

      this.dataContent.addons.forEach(element => {
        this.date = new Date();
        if (this.datepipe.transform(element.membershipend, 'yyyy-MM-dd') >= this.datepipe.transform(this.date, 'yyyy-MM-dd'))
          packages.push({
            _id: element.membershipid._id, title: element.membershipid.membershipname + ' -Expirying On ' +
              this.datepipe.transform(element.membershipend, 'yyyy-MM-dd'), services: element.membershipid.services, membershipend: element.membershipend
          })
      });
    }
    else if (this.dataContent.membershipid) {
      packages.push({ _id: this.dataContent.membershipid._id, title: this.dataContent.membershipid.membershipname, services: this.dataContent.membershipid.services })
    }
    else if (this.dataContent.addons) {
      this.dataContent.addons.forEach(element => {
        this.date = new Date();

        if (this.datepipe.transform(element.membershipend, 'yyyy-MM-dd') >= this.datepipe.transform(this.date, 'yyyy-MM-dd'))
          packages.push({
            _id: element.membershipid._id, title: element.membershipid.membershipname + ' -Expirying On ' +
              this.datepipe.transform(element.membershipend, 'yyyy-MM-dd'), services: element.membershipid.services, membershipend: element.membershipend
          })
      });
    }
    this.pacakgesLists = packages;
    this.isVisible = false;
  }

  onPCSelect(item: any) {
    this.package = item;
    var packageObj = this.pacakgesLists.find(p => p._id == this.package);
    if (packageObj) {
      this.serviceobject = [];
      this.serviceobject = this.renderdata(packageObj.services);
      this.serviceobject.map(p => p.type = "service");
    }
  }

  renderdata(services) {
    var tempArray = [];
    if (services && services.length > 0) {
      services.forEach(faci => {
        let obj = {};
        obj = faci.serviceid;
        obj["visits"] = faci.visits;
        obj["discount"] = faci.discount;
        obj["period"] = faci.period;
        obj["balance"] = faci.balance;
        tempArray.push(obj);
      });
    }
    return tempArray;
  }

}
