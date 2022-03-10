import { Component, OnInit, Injectable, ViewChild, ChangeDetectorRef  } from "@angular/core";

import {DateAdapter} from '@angular/material/core';

import {
  MatDateRangeSelectionStrategy,
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';


import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';

import * as moment from 'moment';
import swal from 'sweetalert2';
//declare var $: any;
declare var $: any;
@Injectable()
export class FiveDayRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<any> {
    if (date) {

      var now = moment(date);

      var monday = now.clone().weekday(1);
      var sunday = now.clone().weekday(7);

      const start = this._dateAdapter.addCalendarDays(date, 0);
      const end = this._dateAdapter.addCalendarDays(date, 7);

      return new DateRange(monday, sunday);
    }

    return new DateRange<D>(null, null);
  }
}

@Component({
  selector: 'app-user-timesheets',
  templateUrl: './user-timesheets.component.html',
  styles: [
  ],
  providers: [{
    provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
    useClass: FiveDayRangeSelectionStrategy
  }]
})
export class UserTimesheetsComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit {

  form: FormGroup;
  submitted: boolean;

  formTask: FormGroup;
  taskSubmitted: boolean;

  selectedUser = new FormControl();
  allUsers: any [] = [];
  selectedUserfilteredOptions: Observable<string[]>;
  selectedUserisLoadingBox: boolean = false;

  displayedColumns: string[] = ['task', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday','action' ];
  dataSource = new MatTableDataSource;

  ELEMENT_DATA: any [] = [];

  formImageArray: any[]

  selectedDate: Date;
  dates: any [] = [];
  minutes: any;
  comments: any;

  taskMinutes: any;
  taskDay: any;
  taskDate: any;
  taskData: any;
  taskEditVisible: boolean;

  descriptions: any;

  disableAddBtn: boolean = true;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  bindData: any;

  totalHoursMinutes: any;
  weeklystatus: any;
  submittedWeek: boolean;

  datesValidation: boolean = false;

  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute
  ) {

    super()

    this.pagename="app-user-timesheets";

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })

    this.form = fb.group({
      'dates': [this.dates, Validators.required],
      'minutes': [this.minutes, Validators.required],
      'comments': [this.comments, Validators.required],
    });

    this.formTask = fb.group({
      'taskMinutes': [this.taskMinutes, Validators.required],
    });

  }


  async ngOnInit() {


    this._route.params.forEach(async (params) => {

      console.log("this.bindis", this.bindId)

      try {
        await super.ngOnInit();
        await this.initializeVariables();
        await this.userLists()
        if(!this.bindId) {
          await this.LoadData()
        }
      } catch(error) {
        console.error(error)
      } finally {

        if(this.bindId) {
          await this.getTimesheetDataById()
        } else {
          this.selectedUser.setValue(this._loginUser)
          await this.getTimesheetData()
        }

      }
    })

    this.selectedUserfilteredOptions = this.selectedUser.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this._selectedUserfilter(option) : this.allUsers.slice())
      );
  }

  async initializeVariables() {
    this.dates = [];
    this.allUsers = [];
    this.selectedDate = new Date();
    this.disableAddBtn = true;
    this.bindData = {};
    this.totalHoursMinutes = "00:00";
    this.weeklystatus = "";
    this.submittedWeek = false;
    this.taskEditVisible = false;
    this.datesValidation = false;
    return;
  }

  async LoadData() {
    try {
      await this.loadWeeklyDates()

    } catch(error) {

    }
    return;
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async userLists() {

    var url = "users/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data){

          this.allUsers = [];
          this.allUsers = data;
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  async loadWeeklyDates() {

    var curr = new Date(this.selectedDate); // get current date

    this.dates = [];
    for (let i = 1; i <= 7; i++) {
      curr.setHours(15);
      let first = curr.getDate() - curr.getDay() + i;

      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);


      var d = new Date(day);

      var dayName = this.days[d.getDay()];


      this.dates.push({ date: day, dayName: dayName, shortdayname: dayName.substring(0, 3).toLowerCase(), checked: false })
    }

    this.range.controls.start.setValue(new Date(this.dates[0]['date']))
    this.range.controls.end.setValue(new Date(this.dates[this.dates.length - 1 ]['date']))

  }

  onSelection(event) {
    this.datesValidation = false;
  }

  async onSubmit(value: any, isValid: boolean) {

    this.submitted = true;

    if(value.dates == 0) {
      this.datesValidation = true;
    } else {
      this.datesValidation = false;
    }

    if (!isValid) {
      return false;
    } else {
      var validation = true;


      this.ELEMENT_DATA.forEach(element => {
        if(element.task.toLowerCase() === value.comments.toLowerCase()) {
          for(var key in element) {
            if(key !== "action" && key !== 'task' && element[key] !== "---") {
              value.dates.forEach(ele => {
                if(ele) {
                  var d = new Date(ele);
                  var dayName = this.days[d.getDay()];

                  if(dayName === key) {
                    validation = false;
                    this.showNotification('top', 'right', 'Task already exists !!!', 'danger');
                    return;
                  }
                }
              });
            }
          }
        }

      });

      setTimeout(() => {
        if(validation == true) {

          this.ELEMENT_DATA.push({
            task: value.comments,
            Monday:  this.getHours(value, 'Monday'),
            Tuesday:  this.getHours(value, 'Tuesday'),
            Wednesday:  this.getHours(value, 'Wednesday'),
            Thursday:  this.getHours(value, 'Thursday'),
            Friday:  this.getHours(value, 'Friday'),
            Saturday:  this.getHours(value, 'Saturday'),
            Sunday:  this.getHours(value, 'Sunday'),
            action:''
          });
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          this.calculator()
          this.form.reset();
          $("#closeModal").click();
        }
      }, 1000);

    }
  }

  calculator() {

    var totalminutes = 0;


    this.ELEMENT_DATA.forEach(element => {
      for(var key in element) {

        if(key !== "action" && key !== 'task' && element[key] !== "---") {


          var date: any;
          var dateObj = this.dates.find(p=>p.dayName == key);
          if(dateObj) {
            date = dateObj.date
          }
          var minutes;
          var res = element[key].split(":");

          var hoursCal = 0;
          if(res[0]) {
            hoursCal = res[0] * 60;
          }
          minutes = Number(hoursCal) + Number(res[1]);

          totalminutes = totalminutes  + minutes;
        }
      }
    });


    var hours = Math.floor(totalminutes / 60);
    var minutes = totalminutes % 60;
    this.totalHoursMinutes = hours + ":" + minutes;

  }

  getHours(value: any, day: any) {

    if(value.dates && value.dates.length > 0) {

      var dayName: any;
      var dayLists: any [] = [];

      for(var i = 0; i < value.dates.length; i++){
        var d = new Date(value.dates[i]);
        dayName = this.days[d.getDay()];
        dayLists.push(dayName);
      }
      var dayObj = dayLists.find(p=>p == day)
      if(dayObj) {
        var hours = Math.floor(value.minutes / 60);

        var hours = Math.floor(value.minutes / 60);
        var minutes = value.minutes % 60;
        return hours + ":" + minutes;

        //return hours;
      } else {
        return "---";
      }
    } else {
      return "---";
    }
  }

  async submit() {

    if(this.ELEMENT_DATA && this.ELEMENT_DATA.length == 0 ) {
      this.showNotification('top', 'right', 'Tasks cannot be empty!!!', 'danger');
      return;
    } else {

      let postData = {};
      postData["userid"] = this.selectedUser.value._id;
      postData["fromdate"] = this.dates[0]['date'];
      postData["todate"] = this.dates[this.dates.length - 1]['date'];
      postData["tasks"] = [];
      postData["totalminutes"] = 0;
      postData["notes"] = this.descriptions;

      if(this.submittedWeek) {
        postData["status"] = "submitted";
      }

      this.ELEMENT_DATA.forEach(element => {
        for(var key in element) {

          if(key !== "action" && key !== 'task' && element[key] !== "---") {


            var date: any;
            var dateObj = this.dates.find(p=>p.dayName == key);
            if(dateObj) {
              date = dateObj.date
            }
            var minutes;
            var res = element[key].split(":");

            var hoursCal = 0;
            if(res[0]) {
              hoursCal = res[0] * 60;
            }
            minutes = Number(hoursCal) + Number(res[1]);

            postData["totalminutes"] = postData["totalminutes"] + minutes;

            let obj = {
              task:  undefined,
              onModel:  'Other',
              date: date,
              minutes: minutes,
              notes: element['task']
            }

            postData["tasks"].push(obj);
          }
        }
      });

      if(this.bindData && this.bindData._id) {

        postData["_id"] = this.bindData._id;

        var url = "timesheets"
        var method = "PUT";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData, this.bindData._id)
          .then( (data: any) => {
            if(data) {
              this.showNotification('top', 'right', 'Timesheet has been updated successfully', 'success');
              this._router.navigate(['/pages/dynamic-list/list/timesheet']);
              return;
            }
        }, (error) =>{
          console.error(error);
        });

      } else {
        var url = "timesheets"
        var method = "POST";

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then( (data: any) => {
            if(data) {
              this.showNotification('top', 'right', 'Timesheet has been added successfully', 'success');
              this._router.navigate(['/pages/dynamic-list/list/timesheet']);
              return;
            }
        }, (error) =>{
          console.error(error);
        });
      }

    }

  }

  async saveAndsubmit() {
    this.submittedWeek = true;
    this.submit();
  }

  private _selectedUserfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allUsers
        .filter(option => {
          if(option.fullname) {
            return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.allUsers.slice();
    }
    return results;
  }

  enterSelectedUser() {
    const controlValue = this.selectedUser.value;
    this.selectedUser.setValue(controlValue);
  }

  preloadSelectedUserdata() {
    if(this.allUsers && this.allUsers.length == 0) {
      this.userLists()
    }
  }

  handleEmptySubformidInput(event: any){
    if(event.target.value === '') {
      this.selectedUser.setValue("");
      this.allUsers = [];
    }
  }

  displaySubformidFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  optionSubformidSelected(option: any) {
    this.selectedUser.setValue(option.value);
    this.getTimesheetData()
  }

  AddTasks() {

    this.selectedDate = this.range.controls.start.value;
    this.datesValidation = false;
    this.loadWeeklyDates();

  }

  addNewDate() {
    this.getTimesheetData()
  }

  async getTimesheetData() {

    this.ELEMENT_DATA = [];
    this.bindData = {};
    this.totalHoursMinutes = "00:00";
    this.submittedWeek = false;

    if(this.range.controls.start && this.range.controls.end && this.selectedUser && this.selectedUser.value !== "") {

      var url = "timesheets/filter"
      var method = "POST";

      var today = new Date(this.range.controls.start.value);
      //today.setHours(0, 0, 0, 0);

      var tommrrow = new Date(this.range.controls.start.value);
      tommrrow.setDate(tommrrow.getDate() + 1);
      //tommrrow.setHours(0, 0, 0, 0);

      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "fromdate", "searchvalue": { "$gte": today, "$lt": tommrrow }, "criteria": "eq", "datatype": "Date" });
      postData["search"].push({ "searchfield": "userid", "searchvalue": this.selectedUser?.value?._id, "criteria": "eq" });


      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( (data: any) => {
          if(data) {

            if(data[0]) {

              this.bindData = data[0];
              var totalMinutes = 0;

              var taskLists = this.groupBy(data[0].tasks, "notes");
              taskLists.forEach(element => {
                let obj = {};
                obj["task"] = element[0]["notes"];
                obj["Monday"] = "---";
                obj["Tuesday"] = "---";
                obj["Wednesday"] = "---";
                obj["Thursday"] = "---";
                obj["Friday"] = "---";
                obj["Saturday"] = "---";
                obj["Sunday"] = "---";
                obj["action"] = '';

                element.forEach(ele => {
                  var d = new Date(ele.date);
                  var dayName = this.days[d.getDay()];
                  if(obj[dayName]) {

                    totalMinutes = totalMinutes + ele.minutes;

                    var hours = Math.floor(ele.minutes / 60);
                    var minutes = ele.minutes % 60;
                    var minu = hours + ":" + minutes;
                    obj[dayName] = minu;
                  }
                });
                this.ELEMENT_DATA.push(obj);
              });


              var hours = Math.floor(totalMinutes / 60);
              var minutes = totalMinutes % 60;
              this.totalHoursMinutes = hours + ":" + minutes;

            }



            this.dataSource = new MatTableDataSource();
            this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
            return;
          }
      }, (error) =>{
        console.error(error);
      });

    }
  }

  async getTimesheetDataById() {

    var url = "timesheets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq" });


    return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( async (data: any) => {
          if(data) {

            console.log("data", data)

            if(data[0]) {

              this.bindData = data[0];
              var totalMinutes = 0;

              this.selectedUser.setValue(this.bindData["userid"])
              this.selectedDate = new Date(this.bindData["fromdate"])
              this.descriptions = this.bindData["notes"];

              await this.LoadData()

              var taskLists = this.groupBy(data[0].tasks, "notes");
              taskLists.forEach(element => {
                let obj = {};
                obj["task"] = element[0]["notes"];
                obj["Monday"] = "---";
                obj["Tuesday"] = "---";
                obj["Wednesday"] = "---";
                obj["Thursday"] = "---";
                obj["Friday"] = "---";
                obj["Saturday"] = "---";
                obj["Sunday"] = "---";
                obj["action"] = '';

                element.forEach(ele => {
                  var d = new Date(ele.date);
                  var dayName = this.days[d.getDay()];
                  if(obj[dayName]) {

                    totalMinutes = totalMinutes + ele.minutes;

                    var hours = Math.floor(ele.minutes / 60);
                    var minutes = ele.minutes % 60;
                    var minu = hours + ":" + minutes;
                    obj[dayName] = minu;
                  }
                });
                this.ELEMENT_DATA.push(obj);
              });


              var hours = Math.floor(totalMinutes / 60);
              var minutes = totalMinutes % 60;
              this.totalHoursMinutes = hours + ":" + minutes;

            }



            this.dataSource = new MatTableDataSource();
            this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
            return;
          }
      }, (error) =>{
        console.error(error);
      });

  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
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

  getWeekDates(dates: any) {
    if(dates && dates.length > 0) {
      return new Date(dates[0]["date"]).toDateString().split(' ').slice(1).join(' ') + " to " + new Date(dates[dates.length - 1]["date"]).toDateString().split(' ').slice(1).join(' ');
    }
    return
  }

  doubleClickFunction(element: any, dayname: any) {


    this.taskData = {};
    this.taskDate = "";
    this.taskDay = "";
    this.taskMinutes = 0;
    this.taskEditVisible = false;

    this.taskData = element;
    this.taskDay = dayname;

    var curr = new Date(this.range.controls.start.value)

    for (let i = 1; i <= 7; i++) {
      curr.setHours(15);
      let first = curr.getDate() - curr.getDay() + i;
      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10);
      var d = new Date(day);
      var dayName = this.days[d.getDay()];
      if(dayName == dayname) {
        this.taskDate = d;
      }
    }

    var totalminutes = 0;
    var res = element[dayname].split(":");

    var hoursCal = 0;
    if(res[0]) {
      hoursCal = res[0] * 60;
    }
    totalminutes = Number(hoursCal) + Number(res[1]);

    this.formTask.controls["taskMinutes"].setValue(totalminutes);

    this.taskMinutes = totalminutes;
    $("#editTaskBtn").click()
    this.taskEditVisible = true;
  }

  async onTasksSubmit(value: any, isValid: boolean) {

    this.taskSubmitted = true;

    if (!isValid) {
      return false;
    } else {



      this.ELEMENT_DATA.forEach(element => {
        if(element.task.toLowerCase() == this.taskData.task.toLowerCase()) {
          var d = new Date(this.taskDate);
          var dayName = this.days[d.getDay()];
          if(dayName == this.taskDay) {
            if(element[dayName]) {

              var hours = Math.floor(value.taskMinutes / 60);
              var minutes = value.taskMinutes % 60;
              var minu = hours + ":" + minutes;

              element[dayName] = minu;
            }
          }
        }
      });
      this.calculator()
      $(".close").click();

    }
  }

  deletTasks() {

    this.ELEMENT_DATA.forEach(element => {
      if(element.task.toLowerCase() == this.taskData.task.toLowerCase()) {
        var d = new Date(this.taskDate);
        var dayName = this.days[d.getDay()];
        if(dayName == this.taskDay) {
          if(element[dayName]) {
            element[dayName] = "---";
          }
        }
      }
    });
    this.calculator()
    $(".close").click();

  }

  deleteRow(element: any) {

    const varTemp = this;
      swal.fire({
          title: 'Are you sure?',
          text: 'You will not be able to recover this!',
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

          varTemp.remove(element.task, varTemp.ELEMENT_DATA);
          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          varTemp.calculator()

          swal.fire({
              title: 'Deleted!',
              text: 'Task has been deleted.',
              icon: 'success',
              customClass:{
                confirmButton: "btn btn-success",
              },
              buttonsStyling: false
          });

        } else {
          swal.fire({
              title: 'Cancelled',
              text: 'Task is safe :)',
              icon: 'error',
              customClass:{
                confirmButton: "btn btn-info",
              },
              buttonsStyling: false
          });
        }
      })

  }

  remove(task: any, array: any) {

    for (const i in array) {

      if (array[i].task.toLowerCase() == task.toLowerCase()) {

        array.splice(i, 1);

      }
    }
  }

}
