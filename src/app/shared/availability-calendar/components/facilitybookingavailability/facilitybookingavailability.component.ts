
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
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

declare var $: any;

@Component({
  selector: 'app-facilitybookingavailability',
  templateUrl: './facilitybookingavailability.component.html',
  styles: [
    `
      ::ng-deep .fc-daygrid-event-dot {
        display: none !important
      }

      ::ng-deep .fc-event-title {
          margin-left: 10px !important;
      }
    `
  ]
})
export class FacilitybookingavailabilityComponent extends BaseLiteComponemntComponent implements OnInit  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: boolean;
  isLoadingData: boolean = true;

  calendarOptions: CalendarOptions;
  userDetails: any = {};

  height: any;

  selecteddate = new Date();

  startdate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth(), 1);
  enddate = new Date(this.selecteddate.getFullYear(), this.selecteddate.getMonth() + 1, 0);

  eventLists: any [] = [];
  availableLists: any [] = [];
  customExeceptionData: any [] = [];
  notAvailableExeceptionData: any [] = [];

  disablesubmit: boolean = false;



  date = new Date()
  month = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });

  daysInRange: any[] = [];
  counter = 0;

  @Input() assetid: any;

  form: FormGroup;
  submitted: boolean;
  disablebulksubmit: boolean = false;

  bulkRange = new FormGroup({
    bulkstart: new FormControl(),
    bulkend: new FormControl()
  });
  quantity: any;
  asset: any;

  allExceptionData: any [] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonService: CommonService
  ) {
    super()

    this.form = fb.group({
      'asset': [this.asset, Validators.required],
      bulkRange: this.fb.group({
        bulkstart: ['', Validators.required],
        bulkend: ['', Validators.required],
      }),
      'quantity': [this.quantity, Validators.required],
    });

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
    this.allExceptionData = [];
    return;
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

          var analyticsObj = this.availableLists.find(p=>new Date(p.date).toDateString() === new Date(arr[i]).toDateString());
          // console.log("analyticsObj", analyticsObj)

          if(analyticsObj) {
            obj["bookedquantity"] = analyticsObj.bookingsum ? analyticsObj.bookingsum : 0;
            obj["exceptionQuantity"] = analyticsObj.exceptionQuantity ? analyticsObj.exceptionQuantity : 0;

          }

          if(existDay) {
            obj["totalquantity"] = this.userDetails && this.userDetails.quantity ? this.userDetails.quantity : 0;
            obj["quantity"] = this.userDetails && this.userDetails.quantity ? this.userDetails.quantity - obj['bookedquantity'] : 0;
            // obj["availability"].push({ starttime: this.dateTimeConvert(arr[i], this.userDetails.availability.starttime), endtime: this.dateTimeConvert(arr[i], this.userDetails.availability.endtime)})
            obj["availability"].push({ starttime: this.userDetails.availability.starttime, endtime: this.userDetails.availability.endtime})

            var customExeceptionDataObj = this.customExeceptionData.filter(p=> new Date(p.date).toDateString() === new Date(arr[i]).toDateString() )
            if(customExeceptionDataObj && customExeceptionDataObj.length > 0) {

              obj["status"] = "Custom";

              obj["availability"] = []
              customExeceptionDataObj.forEach(element => {
                obj["id"] = element.id;
                obj["quantity"] = element.quantity;
                // obj["availability"].push({ starttime: this.dateTimeConvert(arr[i], element.starttime), endtime: this.dateTimeConvert(arr[i], element.endtime)})
                obj["availability"].push({ starttime: element.starttime, endtime: element.endtime })
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

          //console.log("obj", obj)
          this.daysInRange.push(obj)
        }
      }
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

  async LoadData() {

    var url = "assets/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.assetid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data[0]) {
          this.userDetails = data[0];
          this.asset = this.userDetails.title;
          this.form.get("asset").setValue(this.asset);
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

  async getExeceptionCalendarData() {

    var url = "availabilitycalendars/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": 'refid', "searchvalue":  this.assetid, "criteria": "eq" });
    postData['search'].push({ "searchfield": 'onModel', "searchvalue": "Asset", "criteria": "eq" });

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

    var url = "analyticsreports/process";
    var method = "POST";

    let postData = {};
    postData['id'] = "60ec24f8c9eab5c545c50bf3";
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'facilityid', "searchvalue": this.assetid, "criteria": "eq", "datatype": "ObjectId" });
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": this.startdate, "criteria": "eq", "datatype": "date" });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": this.enddate, "criteria": "eq", "datatype": "date" });


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          console.log("data", data);

          this.availableLists = [];
          this.eventLists = [];
          this.availableLists = data;

          if(data[0]) {
            data.forEach(element => {

              // console.log("element.date", element.date);
              // console.log("new Date(element.date)", new Date(element.date));


              if(element.isClosed || element.isHoliday) {

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

                let totalAvailableobj = {
                  title: `${element.netavailable > 0 ? element.netavailable : 0}/${element.availableQuantity} Available`, 
                  //title: `${element.netavailable > 0 ? element.netavailable : 0} Available`, 
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
                this.eventLists.push(totalAvailableobj)
  
                // if(element.exceptionQuantity > 0) {
                //   let exceptionAvailableobj = {
                //     title: `${element.exceptionQuantity} Exception`, 
                //     date: new Date(element.date),
                //     allDay: false, 
                //     extendedProps: {
                //       quantity: element.quantity,
                //       availability: element.availability,
                //       exceptionQuantity: element.exceptionQuantity,
                //       exceptionAvailability: element.exceptionAvailability,
                //       totalbooking: element.bookingsum,
                //       netavailable: element.netavailable,
                //       status: "Exception"
                //     } 
                //   };
                //   this.eventLists.push(exceptionAvailableobj)
                // }
  
                if(element.bookingsum > 0 ) {
                  let bookingAvailableobj = {
                    title: `${element.bookingsum} Booked`,
                    date: new Date(element.date),
                    allDay: false,
                    extendedProps: {
                      quantity: element.quantity,
                      availability: element.availability,
                      exceptionQuantity: element.exceptionQuantity,
                      exceptionAvailability: element.exceptionAvailability,
                      totalbooking: element.bookingsum,
                      netavailable: element.netavailable,
                      status: "Booked"
                    }
                  };
                  this.eventLists.push(bookingAvailableobj)
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
        var startdate = new Date(element.date)
        // Add a day
        startdate.setDate(enddate.getDate() + 1)

        // Create new Date instance
        var enddate = new Date(element.date)
        // Add a day
        enddate.setDate(enddate.getDate() + 2)

        let obj = {
          _id: element.id,
          onModel: "Asset",
          refid: this.assetid,
          startdate: startdate,
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
        // daysInRangeObj["availability"].push({ starttime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.starttime), endtime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.endtime)})
        daysInRangeObj["availability"].push({ starttime: this.userDetails.availability.starttime, endtime: this.userDetails.availability.endtime })

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
      // daysInRangeObj["availability"].push({ starttime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.starttime), endtime: this.dateTimeConvert(daysInRangeObj.date, this.userDetails.availability.endtime)})
      daysInRangeObj["availability"].push({ starttime: this.userDetails.availability.starttime , endtime: this.userDetails.availability.endtime})
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

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      this.disablebulksubmit = true;

      let startdate = value.bulkRange.bulkstart;
      let enddate = value.bulkRange.bulkend;

      var url = "analyticsreports/process";
      var method = "POST";

      let postData = {};
      postData['id'] = "60ec24f8c9eab5c545c50bf3";
      postData['search'] = [];
      postData['search'].push({ "searchfield": 'facilityid', "searchvalue": this.assetid, "criteria": "eq", "datatype": "ObjectId" });
      postData['search'].push({ "searchfield": 'startdate', "searchvalue": startdate, "criteria": "eq", "datatype": "date" });
      postData['search'].push({ "searchfield": 'enddate', "searchvalue": enddate, "criteria": "eq", "datatype": "date" });


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          console.log("data", data);

          let bookingAvailable: boolean = true;
          var calendarAvailability = [];
          if(data && data.length > 0) {
            data.forEach(element => {
              //console.log("element", element)
              if(element.availability == false || element.isClosed == true || element.isnoavailable == true || value.quantity > element.netavailable) {
                bookingAvailable = false
              }

            });
          }

          if(bookingAvailable == true) {

            data.forEach(element => {

              var exceptionObj = this.allExceptionData.find(p=> new Date(p.startdate).toDateString() === new Date(element.date).toDateString() )

              var id = "";

              if(exceptionObj) {
                id = exceptionObj._id;
              }

              // Create new Date instance
              var enddate = new Date(element.date)
              // Add a day
              enddate.setDate(enddate.getDate() + 1)

              let obj = {
                _id: id,
                onModel: "Asset",
                refid: this.assetid,
                startdate: new Date(element.date),
                enddate: enddate,
                availability: [],
                quantity: Number(this.userDetails.quantity)  - Number(value.quantity)
              }
              calendarAvailability.push(obj);
            });


            var url = "availabilitycalendars/massupdate";
            var method = "POST";
            var postData = {}
            postData["data"] = []
            postData["data"] = calendarAvailability;


            console.log("url", url);
            console.log("method", method);
            console.log("postData", postData);

            return this._commonService
              .commonServiceByUrlMethodDataAsync(url, method, postData)
              .then((data: any) => {
                if (data ) {
                  this.disablebulksubmit = false;
                  $("#bulkclose").click();
                  this.selecteddate = new Date()
                  this.ngOnInit();
                  return;
                }
              }, (error) => {
                console.error(error);
                this.disablesubmit = false;
              });

          } else {
            super.showNotification("top", "right", "Available cannot more then total quantity", "danger");
            this.disablebulksubmit = false;
            return;
          }

          return;
        }
      }, (error) => {
        console.error(error);
        this.disablebulksubmit = false;
      });
    }

  }

  dateStartChange(event: MatDatepickerInputEvent<Date>) {
    if(event.value) {
      this.form.get('bulkRange')['controls'].bulkstart.setValue(new Date(event.value));
    }
  }

  dateEndChange(event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.form.get('bulkRange')['controls'].bulkend.setValue(new Date(event.value));
    }
  }
}
