import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { CalendarOptions, DateSelectArg, FullCalendarComponent } from '@fullcalendar/angular';
import moment from 'moment';
import { element } from 'protractor';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConversionOtherDetailsComponent } from 'src/app/pages/customer-module/components/customer-conversion/components/conversion-other-details/conversion-other-details.component';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-user-attendance-calendar',
  templateUrl: './user-attendance-calendar.component.html'
})
export class UserAttendanceCalendarComponent extends BaseLiteComponemntComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: boolean;
  isLoadingData: boolean = true;

  calendarOptions: CalendarOptions;
  userDetails: any = {};

  @Input() bindId: any;
  @Input() dataContent: any;
  // customExeceptionData = [];
  // notAvailableExeceptionData = [];
  // allExceptionData = [];

  eventLists: any [] = [];
  attendanceList: any [] = [];
  holidayList: any[] = [];
  disablesubmit: boolean = false;

  selecteddate = new Date();
  startdate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth(), 1);
  enddate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth() + 1, 0);

  height: any;

  date = new Date()
  month = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });

  daysInRange: any[] = [];
  counter = 0;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonService: CommonService
  ) {
    super()
  }

   async ngOnInit() {
    try {
      
      super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData();
      await this.getHolidayData();
      //await this.getExeceptionCalendarData()
      await this.getCalendarData()
      await this.initCalendar()

    } catch (error) {
      console.log("error", error)
    } finally {
      await this.startDateSelection()
      await this.endDateSelection()
    }

  }

  async initializeVariables() {
    this.height = 1350;
    this.isLoadingData = true;
    this.userDetails = {};
    
    // this.customExeceptionData = [];
    // this.notAvailableExeceptionData = [];
    // this.allExceptionData = [];

    this.eventLists = [];
    this.attendanceList = [];
    this.disablesubmit = false;
    return;
  }

  async LoadData() {

    var url = "users/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.bindId, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.userDetails = data[0];
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getHolidayData(){
    var url = "formdatas/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'formid', "searchvalue": "611b60b0bfd7600ed8ec5429", "criteria": "eq" ,"cond" : "or"});
    postData['search'].push({ "searchfield": 'formid', "searchvalue": "5b1e5a81a04aa41070137cc7", "criteria": "eq" ,"cond" : "or" });

    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.holidayList = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getCalendarData() {

    var url = "attendances/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'membrozid', "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });
    postData['search'].push({ "searchfield": 'checkin', "searchvalue": this.startdate,"criteria": "gte", "datatype": "Date", "cond": "and" });
    postData['search'].push({ "searchfield": 'checkin', "searchvalue": this.enddate, "criteria": "lte", "datatype": "Date", "cond": "and" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        
        if (data) {

          this.attendanceList = [];
          this.eventLists = [];
          this.attendanceList = data;
          this.attendanceList.forEach(element => {
            element.type = "Present"
          })
          this.holidayList.forEach(element => {
             if(new Date(element.property.date).getMonth() == new Date(this.startdate).getMonth()){
               element.type = "Holiday"
               this.attendanceList.push(element)
             }
          })

          if(data[0]) {
            data.forEach(element => {
              if(element.type == "Holiday"){
                let totalAvailableobj = {
                  title: element.property.title, 
                  date: new Date(element.property.date), 
                  extendedProps: {
                    status: "Holiday"
                  }
                };
                this.eventLists.push(totalAvailableobj)
              }else if(element.type == "Present"){
                let totalAvailableobj = {
                  title: "Present", 
                  date: new Date(element.checkin), 
                  extendedProps: {
                    status: "Present"
                  }

                };
                this.eventLists.push(totalAvailableobj)
              }else{
                let totalAvailableobj = {
                  title: "Absent", 
                  date: new Date(element.checkin), 
                  extendedProps: {
                    status: "Absent"
                  }

                };
                this.eventLists.push(totalAvailableobj)
              }
            });
          }
                 
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async initCalendar() {

    this.calendarOptions = {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      selectable: true,
      weekends: true,
      events:  this.eventLists,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      height: this.height,
      allDaySlot: false,
      initialDate: this.selecteddate,
      displayEventTime: false,
      eventDisplay : 'auto',
      eventDidMount: function (info) {
        //console.log("eventDidMount called");
        if (info.event.extendedProps.status === 'Absent') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
        } else if (info.event.extendedProps.status === 'Holiday') {
          // Change background color of row
          info.el.style.backgroundColor = 'lightyellow';
          info.el.style.color = 'black';
        }

        // Change color of dot marker
        var dotEl = info.el.getElementsByClassName('fc-event-dot')[0];
        if (dotEl) {
          dotEl["style"].backgroundColor = 'white';
        }

      },
      eventMouseEnter: eventEnter => {
        //console.log("eventMouseEnter called");
      },
      eventMouseLeave: eventLeave => {
        //console.log("eventMouseLeave called");
      },
      eventClick: eventClick => {
        //this.onEventClick(eventClick); // Call custom code
      },
      select: selectionInfo => {
        this.handleDateSelect(selectionInfo); // Call custom code
      },
      eventDrop: eventDrop => {
        //this.handleEventDrop(eventDrop); // Call custom code
      },
      datesSet: (dateInfo) => {
        this.search(dateInfo); // Call custom code
      }
    };

    this.isLoadingData = false;
    return;
  }

  onEventClick(eventClick: any) {
  }

  async handleDateSelect(selectionInfo: any) {
    this.range.controls["start"].setValue(selectionInfo.start)
    this.startDateSelection()
    this.endDateSelection()
    $("#myModalExceptionCalendarBtn").click();

  }

  handleEventDrop(eventDrop: any) {
    //console.log("eventDrop", eventDrop);
  }

  async search(dateInfo: any) {
    if(this.counter == 0) {
      this.counter++;
    } else {
      try {
        this.selecteddate = new Date(dateInfo.view.currentStart);

        this.startdate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth(), 1);
        this.enddate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth() + 1, 0);

        await this.getCalendarData()
        await this.initCalendar()
      } catch(error) {
        console.log(error)
      } finally {
      }
    }

  }

  async startDateSelection() {
    let start = new Date(this.range.controls["start"].value);
    start.setDate(start.getDate() - start.getDay());
    this.range.controls["start"].setValue(start);
    return;
  }

  async endDateSelection() {


    let startDateNew = new Date(this.range.controls["start"].value).toLocaleString(this._commonService.currentLocale())

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

    

    if(this.daysInRange) {

      for(var i=0;i<arr.length;i++) {
        
        if(this._loginUserBranch && this._loginUserBranch.workinghours && this._loginUserBranch.workinghours.days && this._loginUserBranch.workinghours.days.length > 0 ) {

          let obj = {};
          obj["date"] = new Date(arr[i]).toDateString();
          obj["status"] = "Available";
          obj["availability"] = [];

          var analyticsObj = this.attendanceList.find(p=>new Date(p.date).toDateString() === new Date(arr[i]).toDateString());
          if(analyticsObj) {

            if(analyticsObj.availabilitycalendarid) {
              obj["id"] = analyticsObj.availabilitycalendarid;
            }

            if(analyticsObj.isClosed || analyticsObj.isHoliday) {
              obj["status"] = "Closed"
            } else if(analyticsObj.isnoavailable) {
              obj["status"] = "Not Available"
            }

          }
          this.daysInRange.push(obj)
        }
      }
    }
  }

  checkAvailability(status: any) {
    if(status == "Available" || status == "Custom") {
      return true
    } else {
      return false
    }
  }

  tConvert (time: any) {
    if(time) {
      // Check correct time format and split into components
      time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

      if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
      }
      return time.join (''); // return adjusted time or original string
    } else {
      return time
    }

  }

  convertDateToUTC(date: Date) {
    var date = new Date(date); 
    var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return new Date(now_utc);
  }

  toggle(event: MatSlideToggleChange, item) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )

    if(daysInRangeObj) {
      if(event.checked) {
        daysInRangeObj.status = "Custom";
        daysInRangeObj["availability"] = [];
        daysInRangeObj["availability"].push({ starttime: this._loginUserBranch.workinghours.starttime, endtime: this._loginUserBranch.workinghours.endtime })

      } else {
        daysInRangeObj.status = "Not Available";
        daysInRangeObj["availability"] = [];
      }
    }

  }
}
