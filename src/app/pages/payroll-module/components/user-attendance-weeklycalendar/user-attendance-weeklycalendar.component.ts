import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core/datetime/date-adapter';
import moment from 'moment';

import { CommonService } from 'src/app/core/services/common/common.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { Utilities } from 'src/app/utilities/utilities';
import { XeroService } from 'src/app/core/services/xero/xero.service';
import { AuthService } from 'src/app/core/services/common/auth.service';
import { element } from 'protractor';
import { Observable, Subject } from 'rxjs';

declare var $: any;

export interface Entry {
  created: Date;
}
export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-user-attendance-time-weekly',
  templateUrl: './user-attendance-weeklycalendar.component.html',
  styleUrls: ['./user-attendance-weeklycalendar.scss']
})

export class UserAttendanceTimeWeeklyComponent extends BaseComponemntComponent implements OnInit {

  userData: any[] = [];
  designationData: any[] = [];
  attendanceArray: any[] = [];
  userAttendanceArray: any[] = [];
  attendanceArrayWeek: any[] = [];
  attendanceList: any;
  date = new Date()
  month = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });
  daysInRange: any[];

  staffForm: FormGroup
  modalName: any;
  modalDate: any;
  modaldate: Date;
  checkinTime: any;
  checkoutTime: any;
  attendanceID: any
  membrozid: any
  disableBtn: boolean
  totalPresent: number = 0;
  totalWorkHours: any;
  totalAbsent: number = 0;
  totalWeeklyTime: any
  total: any
  pager: any = {};
  pager1: any = {};
  pagedItems: any[];
  pagedItem1: any[];
  selectedPageSize: number;
  totalPages = 0;
  selectedTimesheets = [];
  startDate: any
  endDate: any
  orgId: any
  isXeroConnected: any
  showCalendarButton: boolean = false;
  xeroCalendarId: any
  showCalendarButtonMsg: any
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  @ViewChild('closeBtn') closeBtn: ElementRef;
  constructor(public _commonService: CommonService,
    private authService: AuthService,
    private fb: FormBuilder,
    private _utilities: Utilities,
    private datePipe: DatePipe,
    private XeroService: XeroService,
    private _pagerService: PagerService) {
    super();

    if(this.authService.currentUser.organizationsetting) {
        this.orgId = this.authService.currentUser.organizationsetting._id;
    }

    this.staffForm = this.fb.group({
      staff: [],
      designation: []
    })
    this.listen().subscribe((m: any) => {
      this.getAttendanceList(this.startDate, this.endDate);
    })
  }

  async ngOnInit() {

    this.isXeroConnected = localStorage.getItem('xeroAuth')? localStorage.getItem('xeroAuth') : 'false';         

    if(localStorage.getItem('xeroCalendarId') == 'undefined'){
      this.xeroCalendarId = localStorage.getItem('xeroCalendarId');
      this.showCalendarButtonMsg = "No payment calendar found in your account.Please create a payment calendar to add timesheet in xero.";
    }

    try {
      await super.ngOnInit();
      await this.getInitialData();
      await this.getUserData();
      await this.getDesignation();
      await this.startDateSelection()
      await this.endDateSelection()

    }
    catch (error) {
      console.error(error)
    } finally {
    }
  }

  async getInitialData() {
    this.daysInRange = [];
  }

  async getUserData() {

    let postData = {};
    postData["search"] = [];
    postData["select"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["select"].push({ "fieldname": "fullname", "value": 1 });
    var url = "users/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.userData = [];
        this.userData = data;
      })

  }

  async getDesignation() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    var url = "designations/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.designationData = data;
      })
  }

 

  startDateSelection() {

    let start = new Date(this.range.controls["start"].value);
    let day;
    if(this._loginUserBranch.property.weekenddays){
      for(let i=0; i<this.days.length; i++ ){
        if(this._loginUserBranch.property.weekenddays == this.days[i]){
          day = i;
        }
      }
      switch(this._loginUserBranch.property.weekenddays) {
        case "Sunday":
          start.setDate(start.getDate() - start.getDay() + day + 1);
        case "Monday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
        case "Tuesday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
          if(day > start.getDay()) start.setDate(start.getDate() - this.days.length + day);
        case "Wednesday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
          if(day > start.getDay()) start.setDate(start.getDate() - this.days.length + day);
        case "Thursday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
          if(day > start.getDay()) start.setDate(start.getDate() - this.days.length + day);
        case "Friday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
          if(day > start.getDay()) start.setDate(start.getDate() - this.days.length + day);
        case "Saturday":
          if(day == start.getDay()) start.setDate(start.getDate() - this.days.length + 1);
          if(day > start.getDay()) start.setDate(start.getDate() - this.days.length + day);
        default:
          start.setDate(start.getDate() - start.getDay() + day + 1);
      }
    }
    // start.setDate(start.getDate() - start.getDay() + 1);
    this.range.controls["start"].setValue(start);

    this.selectedTimesheets = [];
  }

  endDateSelection() {

    let start = new Date(this.range.controls["start"].value);
    let end = new Date(start);
    end.setDate(start.getDate() + 6);
    this.range.controls["end"].setValue(end);
    this.daysInRange = [];
    var arr: any[] = [];
    var d = new Date(start);
    while (d <= end) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    if (this.daysInRange) {
      for (var i = 0; i < arr.length; i++) {
        this.daysInRange.push({
          date: new Date(arr[i]).toDateString(),
          checkin: "",
          checkout: "",
          day: this.days[new Date(arr[i]).getDay()]
        })
      }
    }
  
    this.startDate = new Date(start);
    this.endDate = new Date(end);

    this.getAttendanceList(new Date(start), new Date(end));
    this.selectedTimesheets = [];
  }

  async getAttendanceList(startDate, endDate) {

    this.pager = {};
    this.pager1 = {};
    this.pagedItems = [];
    this.pagedItem1 = [];
    this.selectedPageSize = 5;
    this.attendanceArray = [];
    this.attendanceArrayWeek = [];
    let startDateTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
    let endDateTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)

    let postData = {};
    postData["search"] = [];
    postData["search"].push(
      { "searchfield": "date", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date", "cond": "and" },
      { "searchfield": "date", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date", "cond": "and" },
      { "searchfield": "wfstatus", "searchvalue": "Approved", "criteria": "eq", "datatype": "text" },
      );

    var url = "users/viewattendance/filter"
    var method = "POST"
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        this.attendanceList = data;
        this.userData.forEach(userElement => {
          let user = {
            fullname: "",
            _id: ""
          }
          user.fullname = userElement.fullname
          user._id = userElement._id
          this.userAttendanceArray.push(user)
        })
        this.getAttendanceDayWise();
        this.setPage(1);
        return
      })
  }

  getAttendanceDayWise() {

    this.userData.forEach(element => {
      this.designationData.forEach(desgnElement => {
        if (element.designationid == desgnElement._id) {
          element.designation = desgnElement.title
        }
      });
    })

    this.userAttendanceArray.forEach(element => {
      this.attendanceList.push(element)
    })
    let groupedAttendanceList = this._utilities.groupBy(this.attendanceList, a => a.fullname)

    this.attendanceArray = [];
    groupedAttendanceList.forEach(attendanceElement => {
      //Weekly attendance
      if (this.daysInRange) {
        let attendance = {
          id: "",
          fullname: "",
          designation: "",
          day1: {},
          day2: {},
          day3: {},
          day4: {},
          day5: {},
          day6: {},
          day7: {},
          totalPresent: 0,
          workingHours: 0,
          absentDays: 0
        }
        if (attendanceElement.length > 0) {
          attendance.id = attendanceElement[0]._id
          attendance.fullname = attendanceElement[0].fullname
          attendance.designation = attendanceElement[0].designation
        }
        this.totalPresent = 0;
        this.totalWorkHours = 0;
        this.totalAbsent = 0;
        attendance.day1 = this.getDay(new Date(this.daysInRange[0].date), attendanceElement)
        attendance.day2 = this.getDay(new Date(this.daysInRange[1].date), attendanceElement)
        attendance.day3 = this.getDay(new Date(this.daysInRange[2].date), attendanceElement)
        attendance.day4 = this.getDay(new Date(this.daysInRange[3].date), attendanceElement)
        attendance.day5 = this.getDay(new Date(this.daysInRange[4].date), attendanceElement)
        attendance.day6 = this.getDay(new Date(this.daysInRange[5].date), attendanceElement)
        attendance.day7 = this.getDay(new Date(this.daysInRange[6].date), attendanceElement)
        attendance.totalPresent = this.totalPresent
        attendance.workingHours = this.totalWorkHours
        attendance.absentDays = this.totalAbsent
        this.attendanceArrayWeek.push(attendance)
      }
    });
  }

  getDay(date: Date, groupedAttendanceList: any[]) {
    let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    let foundAttendance = groupedAttendanceList.find(x => new Date(x.date) > startTime && new Date(x.date) < endTime)
    //console.log("foundAttendance", foundAttendance)
   
    if (foundAttendance) {
      var hours = foundAttendance['workhours'].toString();
      hours = hours.split('.');
      var minwork = 0;
      if (hours[1]) minwork = hours[1] * 60 / 10
      let totalWeeklyTime = hours[0] + " H : " + minwork + " M"
      this.totalPresent++;
      let attendance = {
        date: date,
        checkin: foundAttendance['check-in'],
        checkout: foundAttendance['check-out'],
        workhours: this.calculateHours(foundAttendance['workhours']),
        type: ((foundAttendance.type) ? foundAttendance.type : 'workingday'),
      }
      // let data = attendance.workhours.split(": ")
      // let hour = Number(data[0].split(" ")[0])
      // let min = Number(data[1].split(" ")[0])
      // let totalHour = ((hour * 60) + min)/60;

      this.totalWorkHours = (Number(this.totalWorkHours) + Number(foundAttendance.workhours.toFixed(2))).toFixed(2)
      
      return attendance;
    } else {
      this.totalAbsent++;
      let attendance = {
        date: date,
        checkin: "",
        checkout: "",
        workhours: "",
        type: "Absent"
      }
      return attendance;
    }
  }

  calculateHours(hours){
    hours = hours.toString();
    let data = hours.split(".");
    let hour = data[0];
    let min = ((hours - Math.floor(hours)) * 60).toFixed(0);
    return hour + " H : " + min + " M"
  }

  protected onClickbutton(element: any, rowobj: any) {
    console.log(element)
  }

  setPage(page: number) {

    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this._pagerService.getPager(this.attendanceArrayWeek.length, page, this.selectedPageSize);
    this.pagedItems = this.attendanceArrayWeek.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  calculateTotalTime(start, end) {

    var startTime = moment(start, "HH:mm:ss a");
    var endTime = moment(end, "HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));
    var hours = Number(duration.asHours()).toFixed(0);
    var minutes = (Number(duration.asMinutes()) % 60).toFixed(0);;
    let totalWeeklyTime = hours + " H : " + minutes + " M"
    return totalWeeklyTime

  }

  onSelectDesignation(degn){
    this.attendanceArrayWeek = this.attendanceArrayWeek.filter(x => x.designation===degn)
    this.setPage(1)
    this.getAttendanceDayWise()
}

  // valueChanged(value, days) {
  //   console.log("Day : ",value)
  //   if (value) {
  //     let date : Date;
  //     days.forEach(element => {
  //       date = new Date(element.date)
  //       if ( date.getFullYear() == this.date.getFullYear()  &&  date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
  //         this.calculateTotalTime(this.checkinTime, this.checkoutTime);
  //         element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M"
  //         this.total = element.totalHours;
  //       }
  //     });
  //   }

  // }

  // valueChanged1(value, days) {

  //     if (value) {
  //       let date : Date;
  //       days.forEach(element => {
  //         date = new Date(element.date)
  //         if ( date.getFullYear() == this.date.getFullYear()  &&  date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
  //           this.calculateTotalTime(element.checkin, element.checkout)
  //           element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M"
  //           this.total = element.totalHours
  //         }
  //       });
  //     }
  // }

  onClick(id, name, day) {
    this.disableBtn = true

     this.checkinTime = day.checkin; //15:20
    this.checkoutTime = day.checkout;
    this.total = day.totalHours;

    this.membrozid = id
    this.modalName = name
    this.modaldate = day.date;

    this.modalDate = day.date

    let postData = {}
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": id, "criteria": "eq" },
    );
    var url = "attendances/filter"
    var method = "POST"
    this.attendanceID = ""

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        let attendanceList = []
        attendanceList = data
        attendanceList.forEach(element => {
           let date = new Date(element.checkin);
          if (date.getFullYear() == this.modaldate.getFullYear() && date.getMonth() == this.modaldate.getMonth() && date.getDate() == this.modaldate.getDate())  {
            this.attendanceID = element._id;
          }
        })
      })
  }

  onUpdate(date: Date, checkinTime, checkoutTime) {
    var inspl = checkinTime.split(':');
    var outspl = checkoutTime.split(':');
    this.disableBtn = false
    let checkInDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), inspl[0], inspl[1], 0);
    let checkOutDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), outspl[0], outspl[1],0);

    let checkTimeobj = {
      checkin: checkInDateTime,
      checkout: checkOutDateTime,
      membrozid: this.membrozid,
      onModel: "User"
    }
    if (this.attendanceID) {
      var url = "attendances/" + this.attendanceID;
      var method = "PUT"

      return this._commonService
        .commonServiceByUrlMethodData(url, method, checkTimeobj)
        .subscribe(data => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance updated successfully', 'success');
            this.closeBtn.nativeElement.click();
            this.filter("Attendance updated successfully")
          }
        })
    }
    else {
      var url = "attendances"
      var method = "POST"
      return this._commonService
        .commonServiceByUrlMethodData(url, method, checkTimeobj)
        .subscribe(data => {
          this.showNotification('top', 'right', 'Attendance Added successfully', 'success');
          // location.reload()
          this.closeBtn.nativeElement.click();
          this.filter("Attendance Added successfully")
        })
    }
  }

  private _listeners = new Subject<any>();
  listen(): Observable<any>{
    return this._listeners.asObservable();
  }

  filter(filterBy: String){
    this._listeners.next(filterBy);
  }

  selectDeselectTimesheets(event, timesheetId) {
    const checked = event.target.checked;
    if (timesheetId === 'all') {
      if (this.pagedItems && this.pagedItems.length) {
        this.pagedItems.forEach((timesheet) => {
          this.addRemoveSelectedTimesheets(timesheet.id, checked);
        });
      }
    } else {
      this.addRemoveSelectedTimesheets(timesheetId, checked);
    }
  }

  addRemoveSelectedTimesheets(timesheetId, checked) {
    if (checked) {
      if (this.selectedTimesheets.indexOf(timesheetId) === -1) {
        this.selectedTimesheets.push(timesheetId);
      }
    } else {
      const existingSelectedTimesheetIndex = this.selectedTimesheets.findIndex(
        (slectedTimesheetId) => slectedTimesheetId === timesheetId
      );
      console.log(existingSelectedTimesheetIndex);
      if (existingSelectedTimesheetIndex !== -1) {
        this.selectedTimesheets.splice(existingSelectedTimesheetIndex, 1);
      }
    }
  }

  checkForAll() {
    let checked = false;

    if (this.pagedItems && this.pagedItems.length) {
      for (let i = 0; i < this.pagedItems.length; i++) {
        if (this.selectedTimesheets.indexOf(this.pagedItems[i].id) === -1) {
          checked = false;
          break;
        } else {
          checked = true;
        }
      }
    }    

    return checked;
  }

  addTimesheetToXero(){
    let postData = {}
    let employees = this.selectedTimesheets;

    if(!employees.length){
      this.showNotification('top', 'right', "Please select atleast one row.", 'danger');
      return false;
    }

    postData["employees"]     = employees;
    postData["startDate"]     = this.startDate;
    postData["endDate"]       = this.endDate;
    postData["orgId"]         = this.orgId;
    
    this.XeroService.CreateTimesheetXero(postData).subscribe((data: any) => {       
      if(data.Message == "Xero api error: Provided period doesn't correspond with a pay period"){
        this.showCalendarButton = true;        
        this.showCalendarButtonMsg = "Create a new payment calendar on xero if 'Add Timesheet' returns error ("+data.Message+ ").";
      }
      this.showNotification('top', 'right', data.Message, data.Status);      
      //location.reload()
    });
  }

  addPayrollCalendarToXero(){
    let postData = {}
    postData["startDate"]     = this.startDate;
    postData["endDate"]       = this.endDate;
    postData["orgId"]         = this.orgId;    
    this.XeroService.CreatePayrollCalendarXero(postData).subscribe((data: any) => { 
        localStorage.setItem('xeroCalendarId', "definded"); 
        this.showNotification('top', 'right', data?.Message, data?.Status);
      
    });
    location.reload();
  }

  connectToXeroBtn() {
    this.XeroService
    .ConnectToXero()
    .subscribe((data: any) => {              
        window.location.href = data.url;
    });
  }

}

