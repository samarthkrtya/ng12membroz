
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import * as moment from 'moment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
declare var $: any;
@Component({
  selector: 'app-exception-calendar',
  templateUrl: './exception-calendar.component.html',
  styles: [
  ]
})
export class ExceptionCalendarComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: boolean;
  isLoadingData: boolean = true;

  calendarOptions: CalendarOptions;
  userDetails: any = {};

  height: any;

  selecteddate = new Date();

  eventLists: any [] = [];
  customExeceptionData: any [] = [];
  notAvailableExeceptionData: any [] = [];

  @Input() userid: any;
  @Input() assetid: any;

  // form: FormGroup;
  // arr: FormArray;
  // submitted: boolean;

  // notavailable = new FormControl(false);
  // startdate: Date;
  // enddate: Date;
  // availability: any [] = [];

  // min: Date;
  // max: Date;

  // timeMin: Date;
  // timeMax: Date;

  disablesubmit: boolean = false;

  date = new Date()
  month = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });

  daysInRange: any[] = [];

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
      await this.getExeceptionCalendarData()
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
    this.customExeceptionData = [];
    this.notAvailableExeceptionData = [];
    this.disablesubmit = false;
    return;
  }

  async LoadData() {

    var url = this.userid ? "users/filter" : "assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.userid ? this.userid : this.assetid, "criteria": "eq" });

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

  async getExeceptionCalendarData() {

    var url = "availabilitycalendars/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'refid', "searchvalue": this.userid ? this.userid : this.assetid, "criteria": "eq" });
    postData['search'].push({ "searchfield": 'onModel', "searchvalue": this.userid ? "User" : "Asset", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {

          this.customExeceptionData = [];
          this.notAvailableExeceptionData = [];

          data.forEach(element => {

            var start = new Date(element.startdate);
            var end = new Date(element.enddate);
            var currentDate = new Date(start.getTime());
            
            while (currentDate < end) {

              if(element.availability && element.availability.length > 0) {
                element.availability.forEach(elementAvailability => {
                  
                  var title = this.assetid && this.userDetails && this.userDetails.bookingtype && this.userDetails.bookingtype == 'DAILY' ? element?.quantity + " Available" : "Exception" ;
                  let exceptionObj = { 
                    date: new Date(currentDate),
                    type: "custom",
                    title: title,
                    starttime: elementAvailability.starttime,
                    endtime: elementAvailability.endtime,
                    extendedProps: {
                      status: 'custom'
                    },
                    id: element._id,
                    quantity: element.quantity ? element.quantity : 0,
                  }
                  this.customExeceptionData.push(exceptionObj);
                });
              } else {
                let exceptionObj = { 
                  date: new Date(currentDate),
                  type: "noavailable",
                  title: "Not Avaialble",
                  extendedProps: {
                    status: 'noavailable'
                  },
                  id: element._id
                }
                this.notAvailableExeceptionData.push(exceptionObj)
              }
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getCalendarData() {

    var dateObj = new Date(this.selecteddate);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    
    var monthIndex = month - 1;
    var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var date = new Date(year, monthIndex, 1);
    this.eventLists = [];
    while (date.getMonth() == monthIndex) {
      
      var customDate = new Date(date);

      if(this.userDetails && this.userDetails.availability && this.userDetails.availability.days && this.userDetails.availability.days.length > 0 ) {
        var existDay = this.userDetails.availability.days.find(p=>p.toLowerCase() == names[customDate.getDay()].toLowerCase());
        if(existDay) {
          var title = this.assetid && this.userDetails && this.userDetails.bookingtype && this.userDetails.bookingtype == 'DAILY' ? this.userDetails.quantity + " Available" : "Available" ;
          this.eventLists.push({ title: title, date: new Date(customDate) })
        }
      }

      if(this.userDetails && this.userDetails.breaktime && this.userDetails.breaktime && this.userDetails.breaktime.length > 0 ) {
        this.userDetails.breaktime.forEach(element => {
          if(element && element.days && element.days.length > 0 ) {
            var existDay = element.days.find(p=>p.toLowerCase() == names[customDate.getDay()].toLowerCase());
            if(existDay) {
              this.eventLists.push({ title: element.title, date: new Date(customDate), extendedProps: {
                status: 'break'
              } })
            }
          } 
        });
      }
      
      if(this.customExeceptionData && this.customExeceptionData.length > 0) {
        this.customExeceptionData.forEach(elementCustomExeception => {
          if(new Date(elementCustomExeception.date).toDateString() === new Date(customDate).toDateString()) {
            this.eventLists = this.eventLists.filter(post => {
              return !((post.date.toDateString() === new Date(customDate).toDateString() && post.type !== 'custom'))
            })
            this.eventLists.push(elementCustomExeception)
          }
        });
      }

      if(this.notAvailableExeceptionData && this.notAvailableExeceptionData.length > 0) {
        this.notAvailableExeceptionData.forEach(elementnotAvailableExeception => {
          if(new Date(elementnotAvailableExeception.date).toDateString() === new Date(customDate).toDateString()) {
            this.eventLists = this.eventLists.filter(post => {
              return !(post.date.toDateString() === new Date(customDate).toDateString())
            })
            this.eventLists.push(elementnotAvailableExeception)
          }
        });
      }
      date.setDate(date.getDate() + 1);
    }
    return;
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
      eventDidMount: function (info) {
        //console.log("eventDidMount called");

        if (info.event.extendedProps.status === 'noavailable') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
        } else if (info.event.extendedProps.status === 'break') {
          // Change background color of row
          info.el.style.backgroundColor = 'yellow';
          info.el.style.color = 'black';
        } else if (info.event.extendedProps.status === 'custom') {
          // Change background color of row
          info.el.style.backgroundColor = 'orange';
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
    //console.log("eventClick", eventClick);
  }

  async handleDateSelect(selectionInfo: any) {
    //console.log("selectionInfo", selectionInfo);
    this.range.controls["start"].setValue(selectionInfo.start)
    this.startDateSelection()
    this.endDateSelection()
    $("#myModalExceptionCalendarBtn").click();
    
  }

  handleEventDrop(eventDrop: any) {
    //console.log("eventDrop", eventDrop);
  }

  async search(dateInfo: any) {

    try {
      this.selecteddate = new Date(dateInfo.view.currentEnd)
      await this.getCalendarData()
      await this.initCalendar()
    } catch(error) {
      console.log(error)
    } finally {
    }
  }

  async startDateSelection() {
    let start = new Date(this.range.controls["start"].value);
    start.setDate(start.getDate() - start.getDay());
    this.range.controls["start"].setValue(start);
    return;
  }

  async endDateSelection() {

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

        if(this.userDetails && this.userDetails.availability && this.userDetails.availability.days && this.userDetails.availability.days.length > 0 ) {
          let obj = {};
          obj["date"] = new Date(arr[i]).toDateString();
          var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          var existDay = this.userDetails.availability.days.find(p=>p.toLowerCase() == names[arr[i].getDay()].toLowerCase());
          obj["status"] = "Available";
          obj["availability"] = [];

          if(existDay) {

            obj["totalquantity"] = this.userDetails && this.userDetails.quantity ? this.userDetails.quantity : 0;
            obj["quantity"] = this.userDetails && this.userDetails.quantity ? this.userDetails.quantity : 0;
            obj["availability"].push({ starttime: this.userDetails.availability.starttime, endtime: this.userDetails.availability.endtime})

            var customExeceptionDataObj = this.customExeceptionData.filter(p=> new Date(p.date).toDateString() === new Date(arr[i]).toDateString() )
            if(customExeceptionDataObj && customExeceptionDataObj.length > 0) {

              obj["status"] = "Custom";
              
              obj["availability"] = []
              customExeceptionDataObj.forEach(element => {
                obj["id"] = element.id;
                obj["quantity"] = element.quantity;
                obj["availability"].push({ starttime: element.starttime, endtime: element.endtime})
              });
            }
            var notAvailableExeceptionDataObj = this.notAvailableExeceptionData.find(p=> new Date(p.date).toDateString() === new Date(arr[i]).toDateString() )
            if(notAvailableExeceptionDataObj) {
              obj["status"] = "Not Available";
              obj["id"] = notAvailableExeceptionDataObj.id;
            }
          } else {
            obj["status"] = "Closed"
          }
          this.daysInRange.push(obj)
        }
      }
    }
  }

  getDayName(dateString: any) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(dateString);
    return days[d.getDay()];
  }

  checkAvailability(status: any) {
    if(status == "Available" || status == "Custom") {
      return true
    } else {
      return false
    }
  }

  toggle(event: MatSlideToggleChange, item) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      if(event.checked) {
        daysInRangeObj.status = "Custom";
        daysInRangeObj["availability"] = [];
        daysInRangeObj["availability"].push({ starttime: this.userDetails.availability.starttime, endtime: this.userDetails.availability.endtime})

      } else {
        daysInRangeObj.status = "Not Available";
        daysInRangeObj["availability"] = [];
      }
    }
    
  }

  editAva(item: any) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj.status = "Custom"
      daysInRangeObj["availability"] = [];
      daysInRangeObj["availability"].push({ starttime:this.userDetails.availability.starttime, endtime: this.userDetails.availability.endtime})
    }
  }

  addAva(item: any) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj["availability"].push({ starttime: null, endtime: null})
    }
  }

  removeAva(item: any, index: any) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj["availability"].splice(index, 1);
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

  dateTimeConvert(date: Date, time: any) {
    let newdatetime = new Date(date);
    let shh = time.split(':')[0];
    let smm = time.split(':')[1];
    newdatetime.setHours(shh);
    newdatetime.setMinutes(smm);
    return newdatetime;
  }

  submit() {

    this.disablesubmit = true;
    var errorCount = 0;
    var calendarAvailability = [];
    this.daysInRange.forEach(element => {

      if(element.status == "Custom" || element.status == "Not Available") {
        var availability = [];
        if(element.status == "Custom") {

          if(element.availability && element.availability.length > 0) {

            element.availability.forEach(ele => {
              
              if(ele.starttime == "" || ele.starttime == null || ele.starttime == "NaN:NaN") {
                this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
                errorCount++;
                return;
              }

              if(ele.endtime == "" || ele.endtime == null || ele.endtime == "NaN:NaN") {
                this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
                errorCount++;
                return;
              }
              availability.push({starttime : ele.starttime, endtime : ele.endtime});
            });
          }
        }

        // Create new Date instance
        var enddate = new Date(element.date)
        // Add a day
        enddate.setDate(enddate.getDate() + 1)

        let obj = {
          _id: element.id,
          onModel: this.userid ? "User" : "Asset",
          refid: this.userid ? this.userid : this.assetid,
          startdate: new Date(element.date),
          enddate: enddate,
          availability: availability,
          quantity: element.quantity ? element.quantity : 0
        }
        calendarAvailability.push(obj);
      }
    });


    setTimeout(() => {

      if(errorCount == 0) {

        var url = "availabilitycalendars/massupdate";
        var method = "POST";
        var postData = {}
        postData["data"] = []
        postData["data"] = calendarAvailability

        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any) => {
            if (data ) {
              this.disablesubmit = false;
              $("#close").click();
              this.selecteddate = new Date()
              this.ngOnInit();
              return;
            }
          }, (error) => {
            console.error(error);
            this.disablesubmit = false;
          });


      } else {
        this.disablesubmit = false;
      }
    }, 1000);
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
