import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../../core/services/common/common.service';

import swal from 'sweetalert2';
import { LookupsService } from 'src/app/core/services/lookups/lookup.service';
declare var $: any;
@Component({
  selector: 'app-week-schedule-template',
  templateUrl: './week-schedule-template.component.html',
  styles: [

    `
      .schedule-table > tbody > tr > th {    
          font-size: 14px !important;
          font-weight: bold !important;
          background-color: #2F408F;
          color: #FFFFFF;
          vertical-align: top;
          border-top: 1px solid #dee2e6;
      }
      .schedule-table > tbody > tr > td {
          vertical-align: top;
          border-top: 1px solid #dee2e6;
      }
      .mat-chip-list-wrapper-new {
          display: flex;
          flex-direction: column !important;
          flex-wrap: wrap;
          align-items: flex-start !important;
          margin: 0 0 25px;
      }
      .mat-chip-list-wrapper-new .mat-standard-chip {
          margin: 0 4px;
      }
      .mat-chip.mat-standard-chip {
          transition: box-shadow 280ms cubic-bezier(.4,0,.2,1);
          display: inline-flex;
          padding: 0 0 5px;
          border-radius: 0;
          align-items: center;    
          min-height: auto;
          height: auto;    
      }
      .mat-chip.mat-standard-chip {
          background-color: transparent !important;
          color: #333333 !important;
      }
      .mat-standard-chip:hover, .mat-standard-chip:focus, .mat-standard-chip:active {
          background-color: transparent !important;
      }
      .mat-chip.mat-standard-chip:active, .mat-chip.mat-standard-chip:focus, .mat-chip.mat-standard-chip:hover {
          background-color: transparent !important;
          color: inherit !important;
          box-shadow: none !important;
      }
      .mat-standard-chip:after {
          background-color: transparent !important;
      }

      .position-relative {
          position: relative;
      }

      .mat-standard-chip .mat-ripple-element, .mat-standard-chip .mat-ripple-element:focus, .mat-standard-chip .mat-ripple-element:focus:after {
          background-color: transparent !important;
          opacity: 0 !important;
      }
      .mat-ripple-element {
          background-color: transparent !important;
      }
      .schedule-add-icon {
          position: absolute; 
          bottom:0; 
          right: 0; 
          cursor: pointer;
      }

    
    `
  ]
})
export class WeekScheduleTemplateComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Output() onWeekScheduleData: EventEmitter<any> = new EventEmitter<any>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindId: any;
  isLoading: Boolean = false;

  scheduleData: any[] = [];
  scheduleWiseData: any[] = [];
  selectedWeekSchedule: any = {};
  post: any = {};
  weekscheduleHeadingLists: any[] = [];
  schedule: any[] = [];

  dietunitList: any[] = [];
 
  dayArray: any[] = [];

  days: any[] = [];
  heading: any;
  trainerid: any;
  refid: any;
  sets: any;
  reps: any;
  rest: any;
  amount: any;
  unit: any;

  form: FormGroup;
  submitted: boolean;
  disablesubmit: boolean = false;

  scheduleFormDataLists: any[] = [];

  title: any;
  type: any;
  formObj: any;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonService: CommonService,
    private _lookupService: LookupsService,
  ) {
    super()
    this.pagename = "app-week-schedule-template";

    this._route.params.subscribe(
      (param: any) => {
        this.bindId = param['id'];
      });

    this.form = fb.group({
      'days': [this.days],
      'heading': [this.heading, Validators.required],
      'refid': [this.refid, Validators.required],
      'sets': [this.sets],
      'reps': [this.reps],
      'rest': [this.rest],
      'amount': [this.amount],
      'unit': [this.unit],
    });


  }

  async ngOnInit() {

    try {

      await super.ngOnInit()
      await this.initializeVariables()

      if (this.dataContent) {
        this.selectedWeekSchedule = this.dataContent;
        if (this.selectedWeekSchedule && this.selectedWeekSchedule.formid && this.selectedWeekSchedule.formid.formname && this.selectedWeekSchedule.formid.formname == "diettemplate") {
          this.type = "diet"
        } else {
          this.type = "workout"
        }
        await this.getScheduleformdata(this.selectedWeekSchedule.scheduleformid._id)

        this.title = this.selectedWeekSchedule['title'];
      }
      await this.getHeading()
      await this.getScheduleData()
      await this.getScheduleWiseData()
      await this.filldata()
      this.getUnits(); 


    } catch (error) {
      console.error(error);
    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    this.isLoading = true;

    this.dayArray = [];

    if (this.dataContent.type == "Daily") {

      if (this.dataContent.schedule && this.dataContent.schedule.length > 0) {
        this.dataContent.schedule.forEach(element => {
          var dayArrayObj = this.dayArray.find(p => p.name == element.day);
          if (!dayArrayObj) {
            this.dayArray.push({ id: this.dayArray.length + 1, name: element.day });
          }
        });
      } else {
        this.dayArray.push({ id: 0, name: "Day 1" });
      }

    } else {
      this.dayArray.push({ id: 0, name: "Monday" });
      this.dayArray.push({ id: 1, name: "Tuesday" });
      this.dayArray.push({ id: 2, name: "Wednesday" });
      this.dayArray.push({ id: 3, name: "Thursday" });
      this.dayArray.push({ id: 4, name: "Friday" });
      this.dayArray.push({ id: 5, name: "Saturday" });
      this.dayArray.push({ id: 6, name: "Sunday" });
    }



    this.dayArray = this.dayArray.sort((a, b) => { return a.id - b.id });

    this.scheduleWiseData = [];
    this.scheduleData = [];
    this.weekscheduleHeadingLists = [];

    this.days = [];
    this.heading = [];
    this.trainerid = "";
    this.refid = "";

    this.sets = "";
    this.reps = "";
    this.rest = "";
    this.amount = "";
    this.unit = "";

    this.scheduleFormDataLists = [];

    this.disablesubmit = false;

    this.selectedWeekSchedule = {};
    this.schedule = [];
    this.title = "";
    this.type = "";

    return;
  }

  protected getUnits() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "dietunit", "criteria": "in", "datatype": "string" });

    this._lookupService
      .GetByfilterLookupName(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lookupData: any[]) => {
        
        this.dietunitList = lookupData.find(a => a.lookup == "dietunit")['data'];
      });
  }

  async getScheduleformdata(formid: any) {

    let method = "POST";
    let url = "formdatas/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "formid", "searchvalue": formid, "criteria": "eq" });


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          if (data && data[0]) {
            this.scheduleFormDataLists = [];
            this.scheduleFormDataLists = data.map(element => ({ id: element._id, title: element.property.title }));
          }

          return;
        }
      }, (error) => {
        console.error(error);
      })
  }



  getHeading() {

    let method = "POST";
    let url = "lookups/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "Weekschedule Heading", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {

          this.weekscheduleHeadingLists = [];

          if (data && data[0] && data[0]['data']) {
            this.weekscheduleHeadingLists = data[0]['data'].filter(ele => (ele.type && ele.type == this.type));
          }
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async getScheduleData() {

    this.scheduleData = [];
    this.schedule = this.selectedWeekSchedule['schedule'];

    if (this.weekscheduleHeadingLists && this.weekscheduleHeadingLists.length > 0) {
      this.scheduleData = this.weekscheduleHeadingLists.map(element => (element.name))
    }

    return;
  }

  async getScheduleWiseData() {

    this.scheduleWiseData = [];

    if (this.scheduleData && this.scheduleData.length > 0) {

      this.scheduleData.forEach(element => {

        if (!this.scheduleWiseData[element]) {
          this.scheduleWiseData[element] = [];
        }

        this.dayArray.forEach(elementDay => {
          var data: any[] = [];
          var obj = {
            data: data,
            dayname: elementDay.name,
            name: element
          };
          this.scheduleWiseData[element].push(obj);
        });
      });
    }


    this.isLoading = false;
    return;
  }

  async filldata() {

    for (var key in this.scheduleWiseData) {
      if (this.scheduleWiseData[key] && this.scheduleWiseData[key].length !== 0) {
        this.scheduleWiseData[key].forEach(element => {
          if (this.schedule && this.schedule.length !== 0) {
            this.schedule.forEach(eleSchedule => {
              if (eleSchedule && eleSchedule.heading && eleSchedule.day) {
                if (element.dayname == eleSchedule.day && element.name == eleSchedule.heading) {
                  eleSchedule.type = "active";
                  element.data.push(eleSchedule);
                }
              }
            });
          }

        });
      }
    }
    this.isLoading = false;
    return;
  }

  delete(data: any) {

    var varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this schedule!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {

        varTemp.remove(data._id, varTemp.selectedWeekSchedule['schedule']);

        swal.fire(
          {
            title: 'Deleted!',
            text: 'Your schedule has been deleted.',
            icon: 'success',
            customClass: {
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
          }
        )

        await varTemp.updateSchedule();

      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary schedule is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  remove(id: number, array: any) {
    for (let i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
      }
    }
  }

  add(data: any) {

    this.days = [];
    if (data && data.dayname) {
      this.days.push(data.dayname)
      this.form.get('days').setValue(this.days);
    }
    if (data && data.name) {
      this.heading.push(data.name);
      this.form.get('heading').setValue([data.name]);
    }
    this.refid = null;
    $("#formSchedule").click();
  }

  async onSubmit(value: any, isValid: boolean) {

    this.submitted = true;
    if (!isValid) {
      return false;
    } else {

      this.disablesubmit = true;

      this.days = value.days;
      this.refid = value.refid;
      this.heading = value.heading;

      this.sets = value.sets;
      this.reps = value.reps;
      this.rest = value.rest;
      this.amount = value.amount;
      this.unit = value.unit;

      if (value.days.length == 0) {
        this.showNotification('top', 'right', 'Days cannt be empty!!!', 'danger');
        this.disablesubmit = false;
        return;
      } else {
        this.isLoading = true;

        var schedule: any[] = [];

        this.days.forEach(element => {
          this.heading.forEach(elementHeading => {
            let obj = {
              day: element,
              heading: elementHeading,
              refid: value.refid,
              sets: value.sets,
              reps: value.reps,
              rest: value.rest,
              amount: value.amount,
              unit: value.unit,
            }

            schedule.push(obj);
          });

        });

        schedule.forEach(elementSchedule => {

          if (!this.selectedWeekSchedule['schedule']) {
            this.selectedWeekSchedule['schedule'] = [];
          }

          if (this.selectedWeekSchedule['schedule'].length > 0) {

            var scheduleObj = this.selectedWeekSchedule['schedule'].find(p => p.day == elementSchedule.day && p.heading == elementSchedule.heading && (p.refid && p.refid._id && p.refid._id == elementSchedule.refid));
            if (scheduleObj) {
              scheduleObj.sets = this.sets;
              scheduleObj.reps = this.reps;
              scheduleObj.rest = this.rest;
              scheduleObj.amount = this.amount;
              scheduleObj.unit = this.unit;
              return;
            }
          }
          this.selectedWeekSchedule['schedule'].push(elementSchedule);
        });


        await this.updateSchedule();
      }
    }
  }

  async updateSchedule() {

    this.disablesubmit = true;

    let method = "PATCH";
    let url = "weekschedules/" + this.bindId;

    let postData = {};
    postData["schedule"] = this.selectedWeekSchedule['schedule'];
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {

          $("#close").click();
          this.form.reset();

          this.disablesubmit = false;
          this.showNotification('top', 'right', 'Workout updated successfully', 'success');
          setTimeout(() => {
            this.onWeekScheduleData.emit();
          }, 500);

          return;
        }
      }, (error) => {
        console.error(error);
        this.disablesubmit = false;
      })
  }

  async addColumn() {
    this.dayArray.push({ id: this.dayArray.length + 1, name: 'Day ' + (this.dayArray.length + 1) });
    // sort the array
    //this.dayArray= this.dayArray.sort((a,b)=>{ return b.id-a.id});
    //localStorage.setItem('notes', JSON.stringify(this.notes));
    try {
      await this.getScheduleWiseData()
      await this.filldata()
    } catch (error) {
      console.error(error)
    } finally {

    }

  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

}
