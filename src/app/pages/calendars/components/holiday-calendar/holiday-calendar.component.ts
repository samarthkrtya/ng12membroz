import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { UsersService } from '../../../../core/services/users/users.service';

declare var $:any;

@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
})
export class HolidayCalendarComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  calendarOptions: CalendarOptions;

  dataList: any[] = [];
  events: any[] = [];

  today: Date = new Date();

  isLoading: boolean = false;

  addUrl : string;

  wdoptions = [{day : "Sunday" , 'disabled' : true   , ind: 0},
               {day : "Monday" , 'disabled' : true   , ind: 1},
               {day :"Tuesday" , 'disabled' : true   , ind: 2},
               {day : "Wednesday", 'disabled' : true , ind: 3},
               {day : "Thursday", 'disabled' : true  , ind: 4},
               {day :  "Friday", 'disabled' : true   , ind: 5},
               {day : "Saturday", 'disabled' : true, ind: 6} ];

  constructor(
    private _usersService: UsersService,
  ) {
    super();

    this._formName = "holiday";
  }

  async ngOnInit() {
    await super.ngOnInit();

    if(this._loginUserRole.permissions.length > 0 ){
      var holiday = this._loginUserRole.permissions.find(a=>a.formname == this._formName);
      if(holiday.recordpermission && holiday.recordpermission.length > 0 && holiday.recordpermission.findIndex(b=>b.type == 'add') != -1){
        this.addUrl = '/'+ this.formObj.redirecturl + this.formObj._id;
      }
    }

    var workinghours = this._loginUser.branchid['workinghours'];
    if (workinghours.days && workinghours.days.length > 0) {
      this.wdoptions.map(day => {
        if(workinghours.days.includes(day.day)){
          day.disabled = false;
        }
      });
    }
    this.getCalendarData();
  }

  getCalendarData() {
    let postData = {};
    postData["search"] = [];
    // postData["search"].push({ "searchfield": "userid", "searchvalue": this._loginUserId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
    // postData["search"].push({ "searchfield": "userid", "searchvalue": false, "criteria": "exists", "datatype": "boolean", "cond": "or" });
    //postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.today.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.today.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });

    try {
      this.isLoading = true;
      this._commonService
        .viewcalendar(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any[]) => {
          this.events = [];
          this.dataList = [];
          this.dataList = data;

          this.dataList.forEach(element => {
            this.events.push({
              title: element.title,
              date: element.date,
              allDay: false,
              color: 'red',
              backgroundColor: 'red'
            })
          });
          this.isLoading = false;
          this.calenderInit();
        });
    } catch (e) {
      this.isLoading = false;
    }
  }

  calenderInit() {
    this.calendarOptions = {
      initialView: 'dayGridMonth', //resourceTimeGridDay
      weekends: true,
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.events,
      displayEventTime: false,
      dayMaxEvents : 3,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      allDaySlot: false,
      initialDate: this.today,
      editable : false,            // .fc-event{ cursor: pointer; }
      selectable: true,
      eventDisplay : 'block',
      businessHours : {
        daysOfWeek: this.wdoptions.filter((a)=>a.disabled == false).map(b=> b.ind),
      },
      eventDidMount: function(info) {
          info.el.style.textAlign = 'left';
      },
      eventMouseEnter:function(info) {
      },
      eventMouseLeave:function(info) {
      },
      datesSet: (dateInfo) => {
        // this.search(dateInfo); // Call custom code
      },
    };
  }

  search(dateInfo: any){
    try {
      console.log("dateInfo", dateInfo.view.currentEnd);
      var date : Date = dateInfo.view.currentEnd;
      this.today = new Date(date.getUTCFullYear() , date.getUTCMonth() +1 ,date.getUTCDate());
      this.getCalendarData();
      console.log("date", date);
    } catch(error) {
      console.log(error)
    } finally {
    }

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
