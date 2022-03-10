import { Component, OnDestroy, OnInit } from '@angular/core';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UsersService } from 'src/app/core/services/users/users.service';
import { MemberService } from 'src/app/core/services/member/member.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styles: [
    `.card-calendar table td {
        text-align: left !important;
      }`],
})
export class MyCalendarComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  calendarOptions: CalendarOptions;

  dataList: any[] = [];
  events: any[] = [];

  today: Date = new Date();

  isLoading: boolean = false;

  wdoptions = [{day : "Sunday" , 'disabled' : true   , ind: 0},
               {day : "Monday" , 'disabled' : true   , ind: 1},
               {day :"Tuesday" , 'disabled' : true   , ind: 2},
               {day : "Wednesday", 'disabled' : true , ind: 3},
               {day : "Thursday", 'disabled' : true  , ind: 4},
               {day :  "Friday", 'disabled' : true   , ind: 5},
               {day : "Saturday", 'disabled' : true, ind: 6} ];

  constructor(
    private _usersService: UsersService,
    private _memberService: MemberService,
  ) {
    super();
  }

  async ngOnInit() {
    await super.ngOnInit();
    
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
    postData["search"].push({ "searchfield": "userid", "searchvalue": this._loginUserId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
    postData["search"].push({ "searchfield": "userid", "searchvalue": false, "criteria": "exists", "datatype": "boolean", "cond": "or" });
    //postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.today.getFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": new Date(this.today.getFullYear() + 1, 0, 1), "criteria": "lte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "deleted", "criteria": "ne", "datatype": "text" });
    //postData["search"].push({ "searchfield": "type", "searchvalue": "holiday", "criteria": "eq", "datatype": "text" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": '2020-09-01', "criteria": "gte", "datatype": "Date", "cond": "and" });
    // postData["search"].push({ "searchfield": "date", "searchvalue": '2020-09-31', "criteria": "lte", "datatype": "Date", "cond": "and" });


    try {

      var roletype = this._authService.currentUser.roletype;
      this.isLoading = true;

      if (roletype != undefined && roletype == 'M') {

        this._memberService
        .ViewCalendarFilter(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any[]) => {
          this.events = [];
          this.dataList = [];
          this.dataList = data;
          this.dataList.forEach(element => {
            

            let Obj = {
              title: element.title,
              id : element._id,
              date: element.date,
              allDay: false,
              color: element.type && element.type ==  "holiday" ?  'red' : 'green',
              backgroundColor: element.type && element.type ==  "holiday" ? 'red' :  'green',
              extendedProps: {
                timeslot: element.timeslot
              }
            }

            if(element && element.property && element.property.onlinemeet && element.property.onlinemeet == true && element.property.onlinemeeturl !== "") {
              Obj["url"]= element.property.onlinemeeturl;
            }
            this.events.push(Obj)
          });
          this.isLoading = false;
          this.afterinitCal();
        });
      } else {

        this._usersService
        .ViewCalendarFilter(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any[]) => {
         
          this.events = [];
          this.dataList = [];
          this.dataList = data;
          this.dataList.forEach(element => {
            let Obj = {
              title: element.title ,
              id : element._id,
              discription : "this is discription of record",
              date: element.date,
              allDay: false,
              color: element.type && element.type ==  "holiday" ?  'red' : 'green',
              backgroundColor: element.type && element.type ==  "holiday" ? 'red' :  'green',
              extendedProps: {
                timeslot: element.timeslot
              }
            }

            if(element && element.property && element.property.onlinemeet && element.property.onlinemeet == true && element.property.onlinemeeturl !== "") {
              Obj["url"]= element.property.onlinemeeturl;
            }

            this.events.push(Obj)
          });
          this.isLoading = false;
          this.afterinitCal();
        });

      }

    } catch (e) {
      this.isLoading = false;
    }
  }

 

  afterinitCal() {
    
    this.calendarOptions = {
      initialView: 'dayGridMonth', //resourceTimeGridDay
      weekends: true,
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.events,
      editable : false,            // .fc-event{ cursor: pointer; }
      eventDisplay : 'block', 
      eventDidMount: function(info) {
        
        info.el.style.textAlign = 'left';
        var customTitleForMonth = info.event.title;
        if(info.event.url) {
          var timeslot = "";
          if(info && info.event && info.event.extendedProps && info.event.extendedProps.timeslot && info.event.extendedProps.timeslot.starttime &&  info.event.extendedProps.timeslot.endtime) {

            var starttime = info.event.extendedProps.timeslot.starttime.split(':');
            var endtime = info.event.extendedProps.timeslot.endtime.split(':');

            var starthours = starttime[0];
            var startminutes = starttime[1];

            var endhours = endtime[0];
            var endminutes = endtime[1];

            var ampm = starthours >= 12 ? 'pm' : 'am';
            starthours = starthours % 12;
            starthours = starthours ? starthours : 12; // the hour '0' should be '12'
            startminutes = startminutes < 10 ? '0'+startminutes : startminutes;
            var strTime = starthours + ':' + startminutes + ' ' + ampm;


            var ampm = endhours >= 12 ? 'pm' : 'am';
            endhours = endhours % 12;
            endhours = endhours ? endhours : 12; // the hour '0' should be '12'
            endminutes = endminutes < 10 ? '0'+endminutes : endminutes;
            var endTime = endhours + ':' + endminutes + ' ' + ampm;

            var timeslot = strTime + " - " + endTime ;
          }
          $(info.el).find(".fc-sticky").html("<span>"+ customTitleForMonth +"</span><br><br><span> "+ timeslot +"</span><br><br><button> JOIN NOW </button>");
        }
      },
      eventMouseEnter:function(info) {
      },  
      eventMouseLeave:function(info) {
      },
      businessHours : {
        daysOfWeek: this.wdoptions.filter((a)=>a.disabled == false).map(b=> b.ind),
      },
      dayMaxEvents : 3,
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      height: 1350,
      allDaySlot: false,
      initialDate: this.today,
      displayEventTime: false,
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
    };
  }
 

  handleEventClick(clickInfo: EventClickArg) {

    clickInfo.jsEvent.preventDefault(); 
    var selectItem =  this.dataList.find(a=>a._id == clickInfo.event.id);

    if (clickInfo.event.url) {
      window.open(clickInfo.event.url, '_blank');
    } else if(selectItem) {

      if(selectItem.type && selectItem.type == 'task'){
        this._router.navigate(['/pages/admins/activity-view/'+selectItem._id]);
      }
    }
  }
  handleDateSelect(selectInfo: DateSelectArg){
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  
}
