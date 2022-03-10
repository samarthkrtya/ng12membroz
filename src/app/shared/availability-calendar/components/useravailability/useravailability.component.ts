
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import * as moment from 'moment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-useravailability',
  templateUrl: './useravailability.component.html',
  styles: [
    `
      ::ng-deep .fc-daygrid-event-dot {
        display: none !important
      }

      ::ng-deep .fc-event-title {
          margin-left: 10px !important;
      }

      .notavailable {
        color: red; 
        font-weight: bold
      }
      .move-up {
        margin-top: 0.75em;
      }
    `
  ],
})
export class UseravailabilityComponent  extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: boolean;
  isLoadingData: boolean = true;

  calendarOptions: CalendarOptions;
  userDetails: any = {};
  userlastdate: any = {};

  @Input() userid: any;

  customExeceptionData = [];
  notAvailableExeceptionData = [];
  allExceptionData = [];

  eventLists: any [] = [];
  availableLists: any [] = [];
  weekLists: any [] = [];
  selectedWeek : number = 1;

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
      // await this.getExeceptionCalendarData()
      await this.getCalendarData()
      await this.initCalendar()
      this.weekLists = [];
      this.weekLists =  this.countWeeks(new Date());  
      this.onSelectWeek(this.weekLists[0]);
      
    } catch (error) {
      console.log("error", error)
    } finally {
      // await this.startDateSelection()
      // await this.endDateSelection()
    }
  }

  async initializeVariables() {
    this.height = 1350;
    this.isLoadingData = true;
    this.userDetails = {};
    
    
    this.customExeceptionData = [];
    this.notAvailableExeceptionData = [];
    this.allExceptionData = [];

    this.eventLists = [];
    this.availableLists = [];
    this.disablesubmit = false; 
   
    return;
  }

  countWeeks(date : Date){
    let weeks = [], firstremaning , lastremaining;
    const dateinMoment = moment(date);
    const lastday = moment(date).daysInMonth();
    firstremaning = 1;
    lastremaining = 7 - parseInt(moment({year : dateinMoment.year(), month : dateinMoment.month(), date : 1 }).format('d'));
    let islastdatedone  = false;
    for (let i = 0; i < Math.ceil((1 + lastday)/7); i++) {
        if(this.userDetails?.availability?.availibilitydate){
          let firstdate =  moment({year : dateinMoment.year(), month : dateinMoment.month(), date : firstremaning });
          islastdatedone = firstdate.isBefore(moment(this.userDetails?.availability?.availibilitydate))
        }
        weeks.push({week : i+1 , start : firstremaning , end : lastremaining , islastdatedone : islastdatedone });
        firstremaning = lastremaining + 1;
        lastremaining +=  (lastday - lastremaining) > 7 ? 7 : lastday - lastremaining;
    }
    return weeks;
  }

  async LoadData() {

    var url = "users/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.userid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.userDetails = data[0];
          this.userlastdate = this.userDetails?.availability?.availibilitydate;

          if(this.userDetails.availability && !this.userDetails.availability.starttime){
            this.userDetails.availability.starttime = this._loginUserBranch?.workinghours?.starttime;   
          }
          if(this.userDetails.availability && !this.userDetails.availability.endtime){
            this.userDetails.availability.endtime = this._loginUserBranch?.workinghours?.endtime;   
          }
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
    postData['search'].push({ "searchfield": 'refid', "searchvalue":  this.userid, "criteria": "eq" });
    postData['search'].push({ "searchfield": 'onModel', "searchvalue": "User", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {

          this.customExeceptionData = [];
          this.notAvailableExeceptionData = [];
          this.allExceptionData = [];
          this.allExceptionData = data;

          data.forEach(element => {
            
            var start = new Date(element.startdate);
            var end = new Date(element.enddate);
            var currentDate = new Date(start.getTime());

            while (currentDate < end) {

              if(element.availability && element.availability.length > 0) {
                element.availability.forEach(elementAvailability => {

                  var title = "Exception" ;
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

    var url = "analyticsreports/process";
    var method = "POST";

    var startdate = new Date(this.startdate);
    startdate.setHours(0, 0, 0, 0);

    var enddate = new Date(this.enddate);
    enddate.setDate(enddate.getDate() + 1);
    enddate.setHours(0, 0, 0, 0);

    let postData = {};
    postData['id'] = "619c87614220efd6edda0232"; // "616146248815964fe0e7ae6b";
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": [this.userid], "criteria": "in", "datatype": "ObjectId" });
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": this.startdate, "criteria": "eq", "datatype": "date", "locationtime": true });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": this.enddate, "criteria": "eq", "datatype": "date", "locationtime": true });

    // console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        // console.log("data==>", data);

        if (data) {

          this.availableLists = [];
          this.eventLists = [];
          this.availableLists = data;
          // console.log("this.availableLists", this.availableLists);
          let workinghours,breaktime;
          if(this._loginUserBranch.workinghours.starttime && this._loginUserBranch.workinghours.endtime){
            workinghours = `${this.tConvert(this._loginUserBranch.workinghours.starttime)}-${this.tConvert(this._loginUserBranch.workinghours.endtime)}`
          }
          if(this._loginUserBranch.breaktime && this._loginUserBranch.breaktime.length > 0){
            breaktime = this._loginUserBranch.breaktime;
          }
          
          if(data[0]) {
            data.forEach(element => {
              
              if(element.isClosed) {

                let closeObj = {
                  title: `Closed`,
                  date: new Date(element.date),
                  allDay: false,
                  extendedProps: {
                    quantity: element.quantity,
                    availability: element.availability,
                    exceptionQuantity: element.exceptionQuantity,
                    exceptionAvailability: element.exceptionAvailability,
                    totalbooking: element.bookingsum,
                    netavailable: element.netavailable,
                    status: "Closed"
                  }
                };
                this.eventLists.push(closeObj)
              } else if (element.isnoavailable) {

                let noavailableObj = {
                  title: `Not Available`,
                  date: new Date(element.date),
                  allDay: false,
                  extendedProps: {
                    quantity: element.quantity,
                    availability: element.availability,
                    exceptionQuantity: element.exceptionQuantity,
                    exceptionAvailability: element.exceptionAvailability,
                    totalbooking: element.bookingsum,
                    netavailable: element.netavailable,
                    status: "Not Available"
                  }
                };
                this.eventLists.push(noavailableObj)
              } else {
               
                if(element.availability && element.availability.length > 0){
                  element.availability.forEach(workinghours => {
                  let totalAvailableobj = {
                    date: new Date(element.date),
                    allDay: false,
                      extendedProps: {
                        quantity: element.quantity,
                        availability: element.availability,
                        exceptionQuantity: element.exceptionQuantity,
                        exceptionAvailability: element.exceptionAvailability,
                        totalbooking: element.bookingsum,
                        netavailable: element.netavailable,
                        status: "totalQuantity"
                      }
                    };
                    
                    if (workinghours.starttime) {
                      totalAvailableobj['title'] = `${this.tConvert(workinghours.starttime)}-${this.tConvert(workinghours.endtime)}`
                    }
                    else {
                      totalAvailableobj['title'] = `${this.tConvert(this._loginUserBranch.workinghours.starttime)}-${this.tConvert(this._loginUserBranch.workinghours.endtime)}`
                    }                    
                    this.eventLists.push(totalAvailableobj)
                  });
                }
                if(element.breaktime && element.breaktime.length > 0){
                  element.breaktime.forEach(workinghours => {
                  let totalAvailableobj = {
                    title : `${this.tConvert(workinghours.starttime)}-${this.tConvert(workinghours.endtime)}`,
                    date: new Date(element.date),
                    allDay: false,
                    extendedProps: {
                      status: "breaktime"
                    }
                  };
                  this.eventLists.push(totalAvailableobj)
                  });
                }
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
        if (info.event.extendedProps.status === 'noavailable') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
        } else if (info.event.extendedProps.status === 'Exception') {
          // Change background color of row
          info.el.style.backgroundColor = 'yellow';
          info.el.style.color = 'black';
        } else if (info.event.extendedProps.status === 'Booked') {
          // Change background color of row
          info.el.style.backgroundColor = 'orange';
        } else if (info.event.extendedProps.status === 'Closed') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
        } else if (info.event.extendedProps.status === 'Not Available') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
        }else if (info.event.extendedProps.status === 'breaktime') {
          // Change background color of row
          info.el.style.backgroundColor = 'red';
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
        this.handleDateSelect2(selectionInfo); // Call custom code
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

  handleDateSelect2(selectionInfo: any){
    try{
    let date = moment(selectionInfo.start).date();
    let fnd = this.weekLists.find((w)=> {
      if(date >= w.start && date <= w.end)return w;
    });
    if(fnd){
        this.onSelectWeek(fnd);
        $("#myModalExceptionCalendarBtn").click();
    }
  }catch(e){
   console.log("e",e);   
  }
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
        this.weekLists = [];
        this.weekLists = this.countWeeks(this.selecteddate);
        this.startdate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth(), 1);
        this.enddate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth() + 1, 0);

        await this.getCalendarData();
        await this.initCalendar();
        this.onSelectWeek(this.weekLists[0]);
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
    try{
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

        // if(this.userDetails && this.userDetails.availability && this.userDetails.availability.days && this.userDetails.availability.days.length > 0 ) {
          let obj = {};
          obj["date"] = new Date(arr[i]).toDateString();
          obj["status"] = "Available";
          obj["edit"] = false;        
          obj["availability"] = [];
          obj["breaktime"] = [];
          
          var analyticsObj = this.availableLists.find(p=>new Date(p.date).toDateString() === new Date(arr[i]).toDateString());

          if(analyticsObj) {

            if(analyticsObj.availabilitycalendarid) {
              obj["id"] = analyticsObj.availabilitycalendarid;
              obj["availability"] = analyticsObj.availability;
              obj["breaktime"] = analyticsObj.breaktime;
              obj["status"] = "Custom";
              obj["quantity"] = analyticsObj.quantity;
             }

            if(analyticsObj.isClosed || analyticsObj.isHoliday) {
              obj["status"] = "Closed";
            } else if(analyticsObj.isnoavailable) {
              obj["status"] = "Not Available";
            }
          }
          //console.log("obj", obj)
          this.daysInRange.push(obj)
        // }
      }
    }
    // console.log('this.daysInRange',this.daysInRange);
  }catch(e){
    console.log('e',e);
  }
  }


  onSelectWeek(week : any){
    try{
      this.selectedWeek = week.week;
      const selecteddate = moment(this.selecteddate);
      let arr : any[] = [];
      
      this.daysInRange = [];
      for (let i = week.start; i <= week.end; i++) {
        arr.push(moment().set({ year : selecteddate.year() , month : selecteddate.month(), date : i }).toDate());
      }

    
       if(this.daysInRange) {
        for(var i=0;i<arr.length;i++) {

            let obj = {};
            obj["date"] = new Date(arr[i]).toDateString();
            obj["status"] = "Available";
            obj["edit"] = false;        
            obj["availability"] = [];
            obj["breaktime"] = [];
            
            var analyticsObj = this.availableLists.find(p=>new Date(p.date).toDateString() === new Date(arr[i]).toDateString());
            if(analyticsObj) {
              if(analyticsObj.availabilitycalendarid) {
                obj["id"] = analyticsObj.availabilitycalendarid;
                obj["availability"] = analyticsObj.availability;
                obj["breaktime"] = analyticsObj.breaktime;
                obj["status"] = "Custom";
                obj["quantity"] = analyticsObj.quantity;
               }
  
              if(analyticsObj.isClosed || analyticsObj.isHoliday) {
                obj["status"] = "Closed";
              } else if(analyticsObj.isnoavailable) {
                obj["status"] = "Not Available";
                obj["disabled"] = this.userDetails.availability && this.userDetails.availability.notavailibility ? moment.duration(moment(arr[i]).diff(moment(this.userDetails?.availability?.availibilitydate)),'milliseconds').asDays() >= 1 : false;              
              }
            }
            this.daysInRange.push(obj)
        }
      }
      // console.log('this.daysInRange',this.daysInRange);
    }catch(e){
      console.error('e',e);
    }
  }

  checkAvailability(status: any) {
    if(status == "Available" || status == "Custom") {
      return true
    } else {
      return false
    }
  }

  tConvert (time: string) {
    //console.log("time", time)
    return time;
  }

  editAva(item: any) {
    item.edit = true;
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj.status = "Custom" 
      daysInRangeObj["availability"] = [];
      daysInRangeObj["quantity"] = 1;
      // daysInRangeObj["availability"].push({ starttime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.starttime), endtime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.endtime)})
      daysInRangeObj["availability"].push({ starttime: this.userDetails.availability.starttime , endtime: this.userDetails.availability.endtime})
      
      daysInRangeObj["breaktime"] = [];
      daysInRangeObj["breaktime"].push({'starttime' : null, 'endtime' : null});
      
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

  addBr(item: any) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj["breaktime"].push({ starttime: null, endtime: null})
    }
  }

  removeBr(item: any, index: any) {
    var daysInRangeObj = this.daysInRange.find(p=> new Date(p.date).toDateString() === new Date(item.date).toDateString() )
    if(daysInRangeObj) {
      daysInRangeObj["breaktime"].splice(index, 1);
    }
  }
  
  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  checkWorkinghrs(time : string){
    return { hhmm : `${time.substring(0,2)}:${time.substring(3,5)}` , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }


  submit() {

    this.disablesubmit = true;
    var errorCount = 0;
    var calendarAvailability = [];

    
    let workingstart = this.checkWorkinghrs(this.userDetails.availability.starttime);
    let workingend = this.checkWorkinghrs(this.userDetails.availability.endtime);
    


    let cnt = 0;
    this.daysInRange.forEach(element => {

      if(element.status == "Custom" || element.status == "Not Available") {

        var availability = [],breaktime = [];
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

              let starttime = this.setTimers(ele.starttime);
              let endtime = this.setTimers(ele.endtime);
             
              if (workingstart.hh > workingend.hh) { // 11:00-08:00
                if ((starttime.hh < workingstart.hh) || (starttime.hh > workingend.hh)) cnt =1;
                else if (starttime.hh == workingstart.hh && starttime.mm >= workingstart.mm) cnt =2;
                else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt =3;
              } else {                              // 08:00-16:00
                if (starttime.hh > endtime.hh) cnt =4;
                else if (starttime.hh == endtime.hh && starttime.mm >= endtime.mm) cnt =5;
                else if (starttime.hh < workingstart.hh) cnt =6;
                else if (starttime.hh == workingstart.hh && starttime.mm < workingstart.mm) cnt =7;
                else if (endtime.hh > workingend.hh) cnt =8;
                else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt = 9;
              }
              
              availability.push({starttime : ele.starttime, endtime : ele.endtime});
            });
          }

          // if(element.breaktime && element.breaktime.length > 0) {
          //   element.breaktime.forEach(ele => {
          //     if(ele.starttime == "" || ele.starttime == null || ele.starttime == "NaN:NaN") {
          //       this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
          //       errorCount++;
          //       return;
          //     }
          //     if(ele.endtime == "" || ele.endtime == null || ele.endtime == "NaN:NaN") {
          //       this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
          //       errorCount++;
          //       return;
          //     }
          //     breaktime.push({starttime : ele.starttime, endtime : ele.endtime});
          //   });
          // }
          
        }

        var startdate = new Date(element.date);
        var enddate = new Date(element.date)
        enddate.setDate(enddate.getDate() + 1)
         
        
        let obj = {
          _id: element.id,
          onModel: "User",
          refid: this.userid,
          startdate: startdate,
          enddate:  enddate,
          availability: availability,
          breaktime: breaktime,
          quantity: element.quantity ? element.quantity : 0,// is custom than = 1
        }
        calendarAvailability.push(obj);
      }
    });

    if (cnt != 0) {
      super.showNotification("top", "right", "Enter valid availibility times !!", "danger");
      this.disablesubmit = false;
      return;
    }


    setTimeout(() => {
      
      if(errorCount == 0) {

        var url = "availabilitycalendars/usermassupdate";
        var method = "POST";
        var postData = {}
        postData["data"] = []
        postData["data"] = calendarAvailability;
        
        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then(async (data: any) => {
            
            if (data ) {
              await this.setUserAvail(calendarAvailability);
              this.disablesubmit = false;
              $("#close").click();
              // this.selecteddate = new Date();
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

    async setUserAvail(calendarAvailability : any[]){
      
        const url = "users/";
        const method = "PUT";
        let model = {};
        model = this.userDetails;
        if(!model['availability']) model['availability'] = {};
        model['availability']['notavailibility'] = true;
        let avail = calendarAvailability.filter(a=>a.availability && a.availability.length > 0);
        // console.log("this.userlastdate", this.userlastdate)
        // console.log("calendarAvailability", calendarAvailability)
        // console.log("avail", avail)
        if(avail.length > 0){
          let date = avail[avail.length -1]['startdate'];
          model['availability']['availibilitydate'] = date;
          
          if(this.userlastdate && moment(date).isBefore(moment(this.userlastdate))){
            return;
          };
          
          await this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, this.userDetails._id)
            .then((data: any) => {
                return data;
            }, (error) => {
              console.error(error);
              this.disablesubmit = false;
            });
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

        daysInRangeObj["breaktime"] = [];
        daysInRangeObj["breaktime"].push({'starttime' : null, 'endtime' : null});
        daysInRangeObj["quantity"] = 1;
      
      } else {
        daysInRangeObj.status = "Not Available";
        daysInRangeObj["availability"] = [];
        daysInRangeObj["breaktime"] = [];
        daysInRangeObj["quantity"] = 0; 
      }
    }

  }
}
