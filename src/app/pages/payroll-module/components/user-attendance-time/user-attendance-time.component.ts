import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DateSelectArg, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import moment from 'moment';
import { interval, Observable, Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';
declare var $:any;

export interface Entry {
  created: Date;
}

export interface TimeSpan {
  hours: number;
  minutes: number;
  seconds: number;
}

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-user-attendance-time',
  templateUrl: './user-attendance-time.component.html',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})

export class UserAttendanceTimeComponent extends BaseComponemntComponent implements OnInit {

  entries: Entry[]
  date : Date = new Date();
  checkInDate : any;
  checkindate: any;
  checkInTime: any;
  checkOutTime: any;
  checkInDateTime: Date
  bindId: any;
  attendance : any;
  attendanceId: any;

  hours = 0;
  minutes = 0;
  seconds = 0;
  totalTime :  any;
  totalHours: any;

  // currentLatitude: any;
  // currentLongitude: any;
  disableBtn: boolean = false;

  //Calendar
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  dataSource = new MatTableDataSource;
  destroy$: Subject<boolean> = new Subject<boolean>();
  calendarOptions: CalendarOptions;
  attendenceList: any[] = [];
  currtoday: Date = new Date();
  ELEMENT_DATA: any [] = [];
  month:any;
  absentList:any[]
  renderList:any[];

  checkIn : boolean = false;
  checkOut: boolean = false;
  onDisplay: boolean = false;
  startDate = moment().clone().startOf('month').format('YYYY-MM-DD');
  endDate = moment().clone().endOf('month').format('YYYY-MM-DD');
  today = moment().format('YYYY-MM-DD');
  currentMonth = moment().clone().startOf('month').format('M');

  //week
  daysInRange:any[];
  month1 = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
      start: new FormControl(new Date(this.year, this.month1, this.date.getDate())),
      end: new FormControl(new Date(this.year, this.month1, this.date.getDate()))
    });
  selectedEntry: any
  weekStartDate: any
  weekEndDate: any
  totalWeeklyTime: any = "00H: 00M"
  checkinTime: any
  checkoutTime: any
  breakmin: any
  total: any
  attendanceID: any;
  openModal: boolean = false
  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild('closeBtn1') closeBtn1: ElementRef;



  constructor(private datePipe: DatePipe,
    private _route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    public _commonService : CommonService,) {
      super();
      this.pagename = "app-user-attendance";
      this.endDate = this.today;
      this._route.params.forEach((params) => {
        this.bindId = params["id"];
      });
      this.listen().subscribe((m: any) => {
        this.getAttendanceDataOnLoad();
        this.getWeeklyAttendanceDataOnLoad();
      })
   }

  async ngOnInit(){
    await super.ngOnInit();
    this._loginUser = this._authService.currentUser.user;
    this.bindId = this._loginUser._id;
    // this.getLocation()
    this.loaddata();
    this.getAttendanceDataOnLoad();
    this.checkInDate = this.datePipe.transform(this.date, 'dd/MM/yyyy')
    this.startDateSelection()
    this.endDateSelection()
  }

  onValChange(value){
    if(value == 'Month'){
      this.getAttendanceDataOnCalendar();
      this.calenderInit()
    }
  }

  startDateSelection(){
    let start = new Date(this.range.controls["start"].value);
    start.setDate(start.getDate() - start.getDay());
    this.range.controls["start"].setValue(start);
  }

  endDateSelection(){
    let start = new Date(this.range.controls["start"].value);
    let end = new Date(start);
    end.setDate(start.getDate() + 6);
    this.range.controls["end"].setValue(end);
    this.daysInRange = [];
    var arr : any[] = [];
    var d = new Date(start);
    while (d <= end) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
      if(this.daysInRange){
        for(var i=0;i<arr.length;i++){
          this.daysInRange.push({
            date:new Date(arr[i]),
            checkin:"",
            checkout: "",
          })
        }
      }
      this.weekStartDate = this.daysInRange[0].date
      this.weekEndDate = this.daysInRange[6].date
      this.getWeeklyAttendanceDataOnLoad()
  }

  setNumber(number : number){
   return number > 9 ? `${number}` : `0${number}`;
  }

  onClick(c){ 
    this.selectedEntry = c
    if(new Date().getDate() >= new Date(c.date).getDate() 
    && new Date().getMonth() >= new Date(c.date).getMonth() 
    && new Date().getFullYear() >= new Date(c.date).getFullYear()){
      this.openModal = true
      
      this.date = c.date;
      var splci = c.checkin.split(':');
      var splcu = c.checkout.split(':');
     
      this.checkinTime = `${this.setNumber(+splci[0])}:${this.setNumber(+splci[1])}`;
      this.checkoutTime = `${this.setNumber(+splcu[0])}:${this.setNumber(+splcu[1])}` ;
      this.breakmin = c.breakmin
      this.total = c.totalHours;
      let postData = {}
      postData["search"] = [];
      postData["search"].push({ "searchfield": "membrozid", "searchvalue": this.bindId, "criteria": "eq" },
      );
      var url ="attendances/filter"
      var method = "POST"

      this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data:any) => {
          let attendanceList = []
          attendanceList=data
          attendanceList.forEach(element => {
          let date = new Date(element.checkin);
          if ( date.getFullYear() == c.date.getFullYear()  &&  date.getMonth() == c.date.getMonth() && date.getDate() == c.date.getDate()) {
            this.attendanceID=element._id
          }
          })
      })
    }
    else{
      this.openModal = false
      this.date = c.date
    }
  }

  valueChanged(value, days){
     
    if(value){
      let date : Date;
      days.forEach(element => {
        date = new Date(element.date);
        if ( date.getFullYear() == this.date.getFullYear()  &&  date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
          this.calculateTotalTime(this.checkinTime, this.checkoutTime);
          element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M";
          this.total = element.totalHours;
        }
      });
    }
  }

  valueChanged1(value, days){
    if(value){
      let date : Date;
      days.forEach(element => {
        date = new Date(element.date);
        if(date.getFullYear() == this.date.getFullYear()  &&  date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
          this.calculateTotalTime(this.checkinTime, this.checkoutTime);
          element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M"
          this.total = element.totalHours
        }
      });
    }
  }

  calculateTotalTime(start, end){
    var startTime = moment(start, "HH:mm:ss a");
    var endTime = moment(end, "HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));    
    var date = new Date();
    var timezone = date.getTimezoneOffset();
    console.log(timezone);
    var h = duration.asHours().toString();
    var hour = h.split(".")
    var minutes = (Number(duration.asMinutes()) % 60).toFixed(0);
    let totalWeeklyTime = hour[0] + " H : " + minutes + " M"
    return totalWeeklyTime
  }

  onUpdate(date,checkin,checkout){
    if(!checkin || !checkout){
      this.showNotification('top', 'right', 'Enter required fields !!', 'danger');
      return;
    }
    var inspl = checkin.split(':');
    var outspl = checkout.split(':');
    this.disableBtn = false
    let checkInDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), inspl[0], inspl[1], 0);
    let checkOutDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), outspl[0], outspl[1],0);
  
    let attendancecheckinObj = {
      membrozid: this.bindId,
      checkin: checkInDateTime,
      checkout: checkOutDateTime,
      onModel: "User"
    };
    attendancecheckinObj["property"] = {};
    attendancecheckinObj["property"]["attendancedate"] = new Date(date);
    attendancecheckinObj["property"]["checkin"] = checkInDateTime;
    attendancecheckinObj["property"]["checkout"] = checkOutDateTime;
    attendancecheckinObj["property"]["breaktime"] = this.breakmin;
    attendancecheckinObj["property"]["mode"] = checkInDateTime == checkOutDateTime ? 'checkin' : 'checkout';
    // attendancecheckinObj["property"]["location"] =  { "latitude" : this.currentLatitude, "longitude" : this.currentLongitude}


    if(this.attendanceID){
      var url = "attendances/"+this.attendanceID;
      var method = "PUT"
  
      return this._commonService
      .commonServiceByUrlMethodData(url,method,attendancecheckinObj)
      .subscribe( data => {
        if(data){
          this.showNotification('top', 'right', 'Attendance updated successfully', 'success');
          this.closeBtn1.nativeElement.click();
          this.filter("Check Out Successfull")
        }
      })
    }
    else{
      var url = "attendances"
      var method = "POST"

      this._commonService.commonServiceByUrlMethodData(url,method,attendancecheckinObj)
      .subscribe((data:any) => {
        if (data) {
          this.showNotification('top', 'right', 'Attendance Added successfully!!', 'success');
          this.closeBtn1.nativeElement.click();
          this.filter("Check Out Successfull")
          // location.reload()
        }
      });
   }
  }

//   getLocation() {
//     var th = this;
//     navigator.geolocation.getCurrentPosition(function(){
//        th.disableBtn = false;
//        console.log('Location accessed')
//     },function() {
//        th.disableBtn = true;
//        console.log('User not allowed')
//     })
//     if (navigator.geolocation) {
//        navigator.geolocation.getCurrentPosition(position => {
//           this.currentLatitude = position.coords.latitude;
//           this.currentLongitude = position.coords.longitude;
//        });
//     } else {
//       console.log("Geolocation is not supported by this browser.")
//     }

//  }

//  arePointsNear(checkPoint: any, centerPoint: any, km: any) {
//     var ky = 40000 / 360;
//     var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
//     var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
//     var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
//     return Math.sqrt(dx * dx + dy * dy) <= km;
//  }

  async getAttendanceDataOnLoad(){
    let attendanceData: any
    let startDateTime = new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate(),0,0,0)
    let endDateTime = new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate(),23,59,59)
    
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectid"});
    postData["search"].push({ "searchfield": "checkin", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date",  "cond": "and"});
    postData["search"].push({ "searchfield": "checkin", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date",  "cond": "and"});

    var url = "attendances/filter"
    var method = "POST"
    
    this._commonService.commonServiceByUrlMethodData(url,method,postData)
    .subscribe((data: any) => {
      attendanceData = data;
      attendanceData.forEach(element => {
        if(new Date().getDate() == new Date(element.checkin).getDate() 
        && new Date().getMonth() == new Date(element.checkin).getMonth() 
        && new Date().getFullYear() == new Date(element.checkin).getFullYear()){
          this.attendance = element
          if(this.attendance.property.mode == 'checkout'){
            this.checkIn = false;
            this.checkOut = false
            this.onDisplay = true;
          }else if(this.attendance.property.mode == 'checkin'){
            this.checkIn= true;
            this.checkOut = false
          }
          this.attendanceId= element._id
          this.checkInDate = element.checkin
          this.entries= [
            { created: new Date(new Date(this.checkInDate).getTime()  ) }
          ];
          this.checkindate = this.datePipe.transform(element.checkin, 'dd/MM/yyyy')
          this.checkInTime = new Date(element.checkin).getHours() + " H : " + new Date(element.checkin).getMinutes() +" M"
          this.checkOutTime = new Date(element.checkout).getHours() + " H : " + new Date(element.checkout).getMinutes() +" M"
          this.totalHours = this.calculateTotalTime(this.checkInTime,this.checkOutTime)
        }
      })
    })
  }

  async getWeeklyAttendanceDataOnLoad(){
    let startDateTime = new Date(new Date(this.daysInRange[0].date).getFullYear(),new Date(this.daysInRange[0].date).getMonth(),new Date(this.daysInRange[0].date).getDate(),0,0,0)
    let endDateTime = new Date(new Date(this.daysInRange[6].date).getFullYear(),new Date(this.daysInRange[6].date).getMonth(),new Date(this.daysInRange[6].date).getDate(),23,59,59)
    let weeklyAttendance: any

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectid"});
    postData["search"].push({ "searchfield": "checkin", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date",  "cond": "and"});
    postData["search"].push({ "searchfield": "checkin", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date",  "cond": "and"});

    var url = "attendances/filter"
    var method = "POST"
    
    this._commonService.commonServiceByUrlMethodData(url,method,postData)
    .subscribe(data => {

      weeklyAttendance = data
      this.daysInRange.forEach(element => {
        weeklyAttendance.forEach(weekElement => {
          if(new Date(weekElement.checkin).getDate() == new Date(element.date).getDate() 
          && new Date(weekElement.checkin).getMonth() == new Date(element.date).getMonth() 
          && new Date(weekElement.checkin).getFullYear() == new Date(element.date).getFullYear()){
            element.checkin = new Date(weekElement.checkin).getHours() + ":" + new Date(weekElement.checkin).getMinutes();
            element.checkout = new Date(weekElement.checkout).getHours() + ":" + new Date(weekElement.checkout).getMinutes();
            element.breakmin = weekElement.property?.breaktime;
            element.totalHours = this.calculateTotalTime(element.checkin,element.checkout);
            element.location = weekElement?.property?.location;
          }
        });
      })
    })
  }

  onCheckIn(){
    if(!this.attendance){
      this.checkIn = true;
      this.checkindate = this.datePipe.transform(this.date, 'dd/MM/yyyy')
      this.checkInTime = new Date(this.date).getHours() + ":" + new Date(this.date).getMinutes() 
      
      this.entries= [
        { created: new Date(new Date().getTime()  ) }
      ];
      interval(1000).subscribe(() => {
        if (!this.changeDetector['destroyed']) {
          this.changeDetector.detectChanges();
        }
      });
      this.changeDetector.detectChanges();
      this.date = new Date()
      this.checkInDateTime = new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate(),this.date.getHours(),this.date.getMinutes(),this.date.getSeconds())

      let attendancecheckinObj = {
        checkin: this.checkInDateTime,
        checkout: this.checkInDateTime,
        membrozid:this.bindId,
        onModel: 'User',
        property: {
            checkin: this.checkInDateTime,
            checkout: this.checkInDateTime,
            attendancedate: this.checkInDateTime,
            breaktime: null,
            mode: 'checkin',
            // location: { latitude: this.currentLatitude, longitude: this.currentLongitude }
        }
      }
      
      var url = "attendances"
      var method = "POST"

      this._commonService.commonServiceByUrlMethodData(url,method,attendancecheckinObj)
      .subscribe((data:any) => {
        this.attendanceId = data._id
        if (data) {
          this.showNotification('top', 'right', 'Checkin done successfully!!', 'success');
          this.filter("Checkin Successfull")
        }
      })
    }
    else{
      this.checkIn = true;

      let attendancecheckinObj = {
        checkin: this.attendance.checkin,
        checkout: this.attendance.checkout,
        membrozid:this.bindId,
        onModel: 'User',
        property: {
            checkin: this.attendance.checkin,
            checkout: this.attendance.checkout,
            attendancedate: this.attendance.checkin,
            breaktime: this.getBreakTime(new Date(this.attendance.checkout),new Date()),
            mode: 'checkin',
            // location: { latitude: this.currentLatitude, longitude: this.currentLongitude }
        }
      }
      var url = "attendances/"+this.attendance._id
      var method = "PATCH"

      this._commonService.commonServiceByUrlMethodData(url,method,attendancecheckinObj)
      .subscribe((data:any) => {
        this.attendanceId = data._id
        if (data) {
          this.showNotification('top', 'right', 'Checkin done successfully!!', 'success');
        }
      })
    }
  }

  getBreakTime(start, end){
    var diff =(end.getTime() - start.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  
  }

  ngAfterViewChecked(){
    this.changeDetector.detectChanges();
  }

  getElapsedTime(entry: Entry): TimeSpan {
      let totalSeconds = Math.floor((new Date().getTime() - entry.created.getTime()) / 1000);
      if (totalSeconds >= 3600) {
        this.hours = Math.floor(totalSeconds / 3600);
        totalSeconds -= 3600 * this.hours;
      }
      if (totalSeconds >= 60) {
        this.minutes = Math.floor(totalSeconds / 60);
        totalSeconds -= 60 * this.minutes;
      }
      this.seconds = totalSeconds;
      this.totalTime = this.hours +":"+this.minutes+":"+this.seconds
      return {
        hours: this.hours,
        minutes: this.minutes,
        seconds: this.seconds
    };
  }

  onCheckOut(){
    
    this.checkOut = true;
    this.checkIn = true;
    this.entries= [
      { created: new Date(new Date(this.checkInDate).getTime()  ) }
    ];
    
    // if(this.attendance){
      let checkoutDate = new Date()
      this.checkOutTime = checkoutDate.getHours()+ ":" +checkoutDate.getMinutes()+ ":" +checkoutDate.getSeconds()
      let checkOutDateTime = new Date(checkoutDate.getFullYear(),checkoutDate.getMonth(),checkoutDate.getDate(),checkoutDate.getHours(),checkoutDate.getMinutes(),checkoutDate.getSeconds())

      let attendanceObj = {
        checkin: this.attendance.checkin,
        checkout: checkOutDateTime,
        property: {
            checkin:  this.attendance.checkin,
            checkout: checkOutDateTime,
            attendancedate:  this.attendance.checkin,
            breaktime: null,
            mode: 'checkout',
            // location: { latitude: this.currentLatitude, longitude: this.currentLongitude }
        }
      }

      var url = "attendances/"+this.attendanceId
      var method = "PUT"

      this._commonService.commonServiceByUrlMethodData(url,method,attendanceObj)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Check out done successfully!!', 'success');
          this.closeBtn.nativeElement.click();
          this.filter("Checkin Successfull")

          // location.reload()
        }
      })
    // }
    // else{
    //   let checkoutDate = new Date()
    //   this.checkOutTime = checkoutDate.getHours()+ ":" +checkoutDate.getMinutes()+ ":" +checkoutDate.getSeconds()
    //   let checkInDateTime : Date = new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate(),this.date.getHours(),this.date.getMinutes(),this.date.getSeconds())
    //   let checkOutDateTime : Date = new Date(checkoutDate.getFullYear(),checkoutDate.getMonth(),checkoutDate.getDate(),checkoutDate.getHours(),checkoutDate.getMinutes(),checkoutDate.getSeconds())

    //   let attendanceObj = {
    //     checkin:checkInDateTime,
    //     checkout: checkOutDateTime,
    //   }

    //   var url = "attendances/"+this.attendanceId
    //   var method = "PATCH"

    //   this._commonService.commonServiceByUrlMethodData(url,method,attendanceObj)
    //   .subscribe(data => {
    //     if (data) {
    //       this.showNotification('top', 'right', 'Check out done successfully!!', 'success');
    //       location.reload()
    //     }
    //   })
    // }
  }

 // getCalendarMonth()
  // {
  //   return this.calendarComponent.getApi().getDate().getMonth();
  // } 

  someMethod() {
    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.getDate();
    this.month = currentDate.getMonth()+1
    this.onChangeMonth(this.month)
  }

  async loaddata()
  {
    this.ELEMENT_DATA.push(this._loginUser)
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  }

  getAttendanceDataOnCalendar()
  {
    let url = "attendances/filter";
    let method = "POST"
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": this.bindId, "criteria": "eq","datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "checkin", "searchvalue": new Date(this.currtoday.getUTCFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "checkout", "searchvalue": new Date(this.currtoday.getUTCFullYear(), 11, 31),"criteria": "lte", "datatype": "Date", "cond": "and" });

    this.isLoading = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any[]) => {
        if (data && data.length > 0) {
          this.attendenceList = data;
          this.renderCalendar();
      }
    })
  }

  calenderInit() {
    this.calendarOptions = {
      initialView: 'dayGridMonth', //resourceTimeGridDay
      weekends: true,
      editable: true,
      select: this.handleDateSelect.bind(this),
      headerToolbar: {
        right: 'prev,next'
      },
      events: this.renderList,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      allDaySlot: false,
      slotDuration: "00:15:00",
      slotMinTime: "00:00:00",
      slotMaxTime: "24:00:00",
      initialDate: this.today,
      displayEventTime: false,
    };
    $('.fc-prev-button').on('click', x => {
      this.someMethod()
    });
    $('.fc-next-button').on('click', x => {
      this.someMethod()
    });
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    //console.log("hi")
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  //get current month and fetch to start and end date
  async getDateRange(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate1 = moment(stopDate);
    while (currentDate <= stopDate1) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'))
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
  }

  //calculate calender date and post data to calender compoment
  async renderCalendar() {
    var dateArray = await this.getDateRange(this.startDate, this.endDate)
    let combineArray = [];

    await this.attendenceList.forEach(element => {

      // if (element && element['date']) combineArray.push(moment(element['date']).format('YYYY-MM-DD'))
      if (element && element['checkin']) combineArray.push(moment(element['checkin']).format('YYYY-MM-DD'))
    });

    var checkMonthvalidation = moment(this.startDate).isBefore(this.today);

    if (checkMonthvalidation == true) {
      var absent = dateArray.filter(function (item) {
      return !combineArray.includes(item)
    })
    this.absentList = absent;
    this.renderList = [];

    await absent.forEach(element => {
        if (element) {
            this.dateConversion(moment(element).format('YYYY-MM-DD'), '#ffcccb','A')
        }
    });
    }
    else {
      this.absentList=[];
    }
    await this.attendenceList.forEach(element => {
    // if (element && element['date']) {
    //     this.dateConversion(moment(element['date']).format('YYYY-MM-DD'), 'green','p')
    // }

     if (element && element['checkin']) {
       element.checkinTime = new Date(element.checkin).getHours() + ":" + new Date(element.checkin).getMinutes()
       element.checkoutTime = new Date(element.checkout).getHours() + ":" + new Date(element.checkout).getMinutes()
        element.totalHours = this.calculateTotalTime(element.checkinTime,element.checkoutTime)
        this.dateConversion(moment(element['checkin']).format('YYYY-MM-DD'), 'green',element.totalHours)
    }
    });

    this.calenderInit();
    return;
  }

  //date convert to object of list
  async dateConversion(date, color,title) {
    if (!this.renderList) {
      this.renderList = [];
   }
    var dt = moment(date, "YYYY-MM-DD").format('dddd');
    let data={
      date: date,
      color: dt == "Sunday" ? "#F0E68C" :color,
      title: dt == "Sunday" ? "":title
    }
    this.getDayColor(date,color)
    this.renderList.push(data);
  }

  getDayColor(date, color) {
    var dt = moment(date, "YYYY-MM-DD").format('dddd');
    if (dt == "Sunday") return "#F0E68C"
    return color;
  }

  //change month to call funation
  onChangeMonth(month) {

    this.startDate = moment().month(month - 1).startOf('month').format('YYYY-MM-DD');

    if (this.currentMonth == month) {
      this.endDate = this.today;
    } else {
      this.endDate = moment().month(month - 1).endOf('month').format('YYYY-MM-DD');
    }

    let data = {
      id: this.bindId,
      datRange: { "$gte": this.startDate, "$lte": this.endDate }
    }
    this.getAttendanceDataOnCalendar()
  }

  private _listeners = new Subject<any>();
  listen(): Observable<any>{
    return this._listeners.asObservable();
  }

  filter(filterBy: String){
    this._listeners.next(filterBy);
  }
}
