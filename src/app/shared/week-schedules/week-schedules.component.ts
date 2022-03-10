import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';


import { DatePipe } from '@angular/common';

import { CommonService } from '../../core/services/common/common.service';
import { Subject } from 'rxjs';

import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BaseComponemntInterface } from '../base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-week-schedules',
  templateUrl: './week-schedules.component.html',
  styles: [
    `
      .schedule-table > tbody > tr > th {    
          font-size: 14px !important;
          font-weight: bold !important;
          background-color: #0071B4;
          color: #FFFFFF;
          vertical-align: top;
      }
      .schedule-table > tbody > tr > td {
          vertical-align: top;
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
export class WeekSchedulesComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  weekScheduleLists: any [] = [];
  selectedWeekSchedule: any = {};

  scheduleData: any [] = [];
  scheduleWiseData: any [] = [];
  schedule: any [] = [];
  weekscheduleHeadingLists: any [] = [];
  scheduleFormDataLists: any [] = [];

  isLoading: boolean = false;
  
  existingScheduleid: any;
  
  
  dayArray: any [] = [];

  days: any [] = [];
  heading: any;
  trainerid: any;
  refid: any;

  form: FormGroup;
  submitted: boolean;
  disablesubmit: boolean = false;

  @Input() formid: any;
  @Input() type: any;
  @Input() scheduleformid: any;
  @Input() memberid: any;
  
  @Output() onWeekScheduleData = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonService: CommonService,
  ) {
    super()

    this.form = fb.group({
      'days': [this.days],
      'heading': [this.heading, Validators.required],
      'refid': [this.refid, Validators.required],
    });

  }

  async ngOnInit() {
    try {
      
      await super.ngOnInit();
      await this.initializeVariables();
      await this.LoadData()
      await this.getHeading()
      await this.getAllWeekSchedules()
      if(this.scheduleformid) {
        await this.getScheduleformdata(this.scheduleformid)
      }
    } catch(error) {
      console.log("error", error);
    } finally {
    }
  }

  async initializeVariables() {

    this.weekScheduleLists = [];
    this.selectedWeekSchedule = {};

    this.dayArray = [];
    this.dayArray.push({ id: 0, name: "Monday"});
    this.dayArray.push({ id: 1, name: "Tuesday"});
    this.dayArray.push({ id: 2, name: "Wednesday"});
    this.dayArray.push({ id: 3, name: "Thursday"});
    this.dayArray.push({ id: 4, name: "Friday"});
    this.dayArray.push({ id: 5, name: "Saturday"});
    this.dayArray.push({ id: 6, name: "Sunday"});

    this.scheduleData = [];
    this.scheduleWiseData = [];
    this.schedule = [];
    this.weekscheduleHeadingLists = [];
    this.scheduleFormDataLists = [];
    
    this.isLoading = true;
    this.disablesubmit = false;

    this.existingScheduleid = "";
    

    return;
  }

  async LoadData() {

    let method = "POST";
    let url = "weekschedules/filter";
    
    let postData = {};
    postData["formname"] = this.type == "diet" ? "diettemplate" : "workouttemplate";
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "memberid", "searchvalue": this.memberid, "criteria": "eq"});
    postData["search"].push({"searchfield": "formid", "searchvalue": this.formid, "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {

          if(data && data[0]) {

            this.selectedWeekSchedule = data[0];

            this.dayArray = [];

            if(this.selectedWeekSchedule && this.selectedWeekSchedule.type == "Daily") {

              if(this.selectedWeekSchedule.schedule && this.selectedWeekSchedule.schedule.length > 0 ) {
                this.selectedWeekSchedule.schedule.forEach(element => {
                  var dayArrayObj = this.dayArray.find(p=>p.name == element.day);
                  if(!dayArrayObj) {
                    this.dayArray.push({ id: this.dayArray.length + 1, name: element.day });
                  }
                });
              } else {
                this.dayArray.push({ id: 0, name: "Day 1"});
              }

            } else {
              this.dayArray.push({ id: 0, name: "Monday"});
              this.dayArray.push({ id: 1, name: "Tuesday"});
              this.dayArray.push({ id: 2, name: "Wednesday"});
              this.dayArray.push({ id: 3, name: "Thursday"});
              this.dayArray.push({ id: 4, name: "Friday"});
              this.dayArray.push({ id: 5, name: "Saturday"});
              this.dayArray.push({ id: 6, name: "Sunday"});
            }
            
            this.dayArray= this.dayArray.sort((a,b)=>{ return a.id-b.id});


            this.existingScheduleid = this.selectedWeekSchedule._id;


            try {
              await this.preSelectValue();
              await this.loadData()
              await this.filldata();
            } catch(error) {
              console.log("error", error)
            } 
          } else {
            this.isLoading = false; 
          }
          return;
        }
      }, (error) => {
        console.error(error);
      })
    

  }

  async getAllWeekSchedules() {

    let method = "POST";
    let url = "weekschedules/filter";

    let postData = {};
    postData["search"] = [];
    postData["formname"] = this.type == "diet" ? "diettemplate" : "workouttemplate";
    postData["search"].push({ "searchfield": "formid", "searchvalue": this.formid, "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({"searchfield": "memberid", "searchvalue": false, "criteria": "exists", "datatype": "boolean"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.weekScheduleLists = [];
          this.weekScheduleLists = data;
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
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "lookup", "searchvalue": "Weekschedule Heading", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {

          this.weekscheduleHeadingLists = [];

          if(data && data[0] && data[0]['data']) {
            this.weekscheduleHeadingLists = data[0]['data'].filter(ele => (ele.type && ele.type == this.type));
          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  Save() {}

  Update() {}

  Delete() {}
  
  ActionCall() {}

  async dataChanged(newObj: any) {
    
    if(newObj) {
      
      this.selectedWeekSchedule = {};
      this.selectedWeekSchedule = newObj;

      this.dayArray = [];

      if(this.selectedWeekSchedule && this.selectedWeekSchedule.type == "Daily") {

        if(this.selectedWeekSchedule.schedule && this.selectedWeekSchedule.schedule.length > 0 ) {
          this.selectedWeekSchedule.schedule.forEach(element => {
            var dayArrayObj = this.dayArray.find(p=>p.name == element.day);
            if(!dayArrayObj) {
              this.dayArray.push({ id: this.dayArray.length + 1, name: element.day });
            }
          });
        } else {
          this.dayArray.push({ id: 0, name: "Day 1"});
        }

      } else {
        this.dayArray.push({ id: 0, name: "Monday"});
        this.dayArray.push({ id: 1, name: "Tuesday"});
        this.dayArray.push({ id: 2, name: "Wednesday"});
        this.dayArray.push({ id: 3, name: "Thursday"});
        this.dayArray.push({ id: 4, name: "Friday"});
        this.dayArray.push({ id: 5, name: "Saturday"});
        this.dayArray.push({ id: 6, name: "Sunday"});
      }
      
      this.dayArray= this.dayArray.sort((a,b)=>{ return a.id-b.id});

      try {
        await this.preSelectValue();
        await this.loadData()
        await this.filldata();
      } catch(error) {
        console.log("error", error)
      } 
    }
  }

  async getScheduleformdata(formid: any) {

    let method = "POST";
    let url = "formdatas/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formid", "searchvalue": formid, "criteria": "eq"});


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {

          if(data && data[0]) {
            this.scheduleFormDataLists = [];
            this.scheduleFormDataLists = data.map(element => ({ id: element._id, title: element.property.title}));
            
          }
          
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  async preSelectValue() {

    this.schedule = [];
    this.scheduleData = [];


    this.schedule = this.selectedWeekSchedule['schedule'];
    
    if(this.schedule && this.schedule.length !== 0) {
      this.schedule.forEach(element => {
        if(element.heading) {
          var scheduleObject = this.scheduleData.find(p=> p == element.heading);
          if(!scheduleObject) {
            this.scheduleData.push(element.heading);
          }
        }
      });
      
    }
    return;
  }

  async loadData() {
    this.scheduleWiseData = [];

    if(this.scheduleData && this.scheduleData.length !== 0) {

      this.scheduleData.forEach(element => {
        if(!this.scheduleWiseData[element]) {
          this.scheduleWiseData[element] = [];
        }

        this.dayArray.forEach(elementDay => {
          var data: any [] = [];
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

    for(var key in this.scheduleWiseData) {
      if(this.scheduleWiseData[key] && this.scheduleWiseData[key].length !== 0) {
        this.scheduleWiseData[key].forEach(element => {
          this.schedule.forEach(eleSchedule => {
            if(eleSchedule && eleSchedule.heading && eleSchedule.day) {
              if(element.dayname == eleSchedule.day && element.name == eleSchedule.heading) {
                eleSchedule.type = "active";
                element.data.push(eleSchedule);
              }
            }
          });
        });
      }
    }
    this.isLoading = false;
    return
    
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
      customClass:{
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
            customClass:{
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
          customClass:{
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
    if(data && data.dayname) {
      this.days.push(data.dayname)
      this.form.get('days').setValue(this.days);
    }
    if(data && data.name) {
      this.heading = data.name;
      this.form.get('heading').setValue(data.name);
    }
    this.refid = null;
    $("#formSchedule_"+ this.formid).click();
  }

  async saveSchedule() {

    this.disablesubmit = true;

    let method = "POST";
    let url = "weekschedules";

    let postData = {};
    postData = this.selectedWeekSchedule;
    postData["memberid"] = this.memberid;

    if(this.existingScheduleid && this.existingScheduleid !== "") {

      let deletemethod = "DELETE";
      let deleteurl = "weekschedules/";
      
      return this._commonService
        .commonServiceByUrlMethodIdOrDataAsync(deleteurl, deletemethod, this.existingScheduleid)
        .then(async data=>{
          if(data) {
            await this.addSchedule(url, method, postData)
            return;
          }
        }, (error)=>{
          console.error(error);
          this.disablesubmit = false;
      })
    } else {
      await this.addSchedule(url, method, postData)
    }
  }

  async addSchedule(url: any, method: any, postData: any) {

    postData["formid"] = postData.formid._id ? postData.formid._id : postData.formid;
    postData["scheduleformid"] = postData.scheduleformid._id ? postData.scheduleformid._id : postData.scheduleformid;

    if(postData["schedule"] && postData["schedule"].length > 0) 
      postData["schedule"].map(element => element.refid = element.refid._id ? element.refid._id : element.refid);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          this.disablesubmit = false;
          this.ngOnInit();
          return;
        }
      }, (error)=>{
        console.error(error);
        this.disablesubmit = false;
    })
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

      if(value.days.length == 0) {
        this.showNotification('top', 'right', 'Days cannt be empty!!!', 'danger');
        this.disablesubmit = false;
        return;
      } else {

        this.isLoading = true;

        $("#weekclose_"+ this.formid).click();
        //$('#myModal').modal('hide');
        

        this.days.forEach(element => {

          let obj = {
            day : element, 
            heading : this.heading, 
            refid : value.refid
          }
  
          if(!this.selectedWeekSchedule['schedule']) {
            this.selectedWeekSchedule['schedule'] = [];
          }
  
          this.selectedWeekSchedule['schedule'].push(obj);
        });
        await this.updateSchedule()
      }

    }
  }

  async updateSchedule() {

    this.disablesubmit = true;

    if(this.existingScheduleid && this.existingScheduleid == this.selectedWeekSchedule._id) { 

      let method = "PATCH";
      let url = "weekschedules/"+ this.selectedWeekSchedule._id;

      let postData = {};
      postData["schedule"] = this.selectedWeekSchedule['schedule'];
      

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(data=>{
          if(data) {
            this.form.reset();
            this.ngOnInit();
            this.disablesubmit = false;
            return;
          }
        }, (error)=>{
          console.error(error);
          this.disablesubmit = false;
      })

    } else if(this.existingScheduleid && this.existingScheduleid !== this.selectedWeekSchedule._id) {

      let deletemethod = "DELETE";
      let deleteurl = "weekschedules/";
    
      return this._commonService
        .commonServiceByUrlMethodIdOrDataAsync(deleteurl, deletemethod, this.existingScheduleid)
        .then(async data=>{
          if(data) {

            let method = "POST";
            let url = "weekschedules";

            let postData = {};
            postData = this.selectedWeekSchedule;
            postData["memberid"] = this.memberid;

            await this.addSchedule(url, method, postData)
            return;
          }
        }, (error)=>{
          console.error(error);
          this.disablesubmit = false;
        })

    } else {

      let method = "POST";
      let url = "weekschedules";

      let postData = {};
      postData = this.selectedWeekSchedule;
      postData["memberid"] = this.memberid;

      await this.addSchedule(url, method, postData)

    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  print() {
    const printContent = document.getElementById("componentID");
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }
}
