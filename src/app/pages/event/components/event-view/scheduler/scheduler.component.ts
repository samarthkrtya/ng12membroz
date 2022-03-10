import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { BaseLiteComponemntComponent } from "../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component";

import { CalendarOptions, DateSelectArg, EventClickArg, EventSourceInput } from '@fullcalendar/angular';
import { CommonService } from "src/app/core/services/common/common.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

declare var $: any;


@Component({
  selector: "app-scheduler",
  templateUrl: "./scheduler.component.html",
})
export class SchedulerComponent  extends BaseLiteComponemntComponent implements OnInit , OnChanges {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  calendarOptions: CalendarOptions;

  @Input() dataContent: any;
  @Input() reloadingStr: string;
  @Input() bindId: any;
  @Input() formName: any;
  @Output() submittedData = new EventEmitter();

  schedulerList : any[] = [];
  disableBtn : boolean = false;
  isLoading : boolean = false;

  selectedAppointment : any;
  
  wdoptions = [{day : "Sunday" , 'disabled' : true   , ind: 0},
               {day : "Monday" , 'disabled' : true   , ind: 1},
               {day :"Tuesday" , 'disabled' : true   , ind: 2},
               {day : "Wednesday", 'disabled' : true , ind: 3},
               {day : "Thursday", 'disabled' : true  , ind: 4},
               {day :  "Friday", 'disabled' : true   , ind: 5},
               {day : "Saturday", 'disabled' : true, ind: 6}];

  isOpen : boolean = false;
  retrieveData : any;

  constructor( private _commonService : CommonService ){
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

   await  this.getSchedulerData();
   this.getCalendarDatas(); 
  }


  
  

  async ngOnChanges() {
    /**********THIS FUNCTION WILL TRIGGER WHEN PARENT COMPONENT UPDATES 'someInput'**************/
    if(this.reloadingStr && this.reloadingStr == 'scheduler'){
      await  this.getSchedulerData();
      this.getCalendarDatas();
    }

  }

  async getSchedulerData(){
        this.schedulerList = [];
        let date : Date , spl; 

        this.dataContent.schedulers.forEach((element)=>{
          spl =  element.timeslot.starttime.split(':');
          date = new Date(element.appointmentdate);
          this.schedulerList.push({
              id: element._id,
              title: element.host.fullname,
              start: new Date(date.getFullYear(),date.getMonth(),date.getDate(),spl[0],spl[1]),
              end: new Date(date.getFullYear(),date.getMonth(),date.getDate(),spl[0],spl[1]),
              extendedProps: {
                department: element.docnumber
              },
              description: element.timeslot.starttime
          });
        });
  }

  getCalendarDatas() {
    this.calendarOptions = {
      initialView: "dayGridMonth",
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      dateClick: this.dateClick.bind(this),
      events: this.schedulerList,
      eventClick : this.eventClick.bind(this),
      businessHours: {
        daysOfWeek: this.wdoptions.filter((a)=>a.disabled == false).map(b=> b.ind),
      },
      displayEventTime: true,
      selectable: false,
      weekends: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimeGridDay, timeGridWeek, dayGridMonth'
      },
    };
  }

  eventClick(event : any){
    this.retrieveData = {};
    if(event && event.event && event.event.id){
      this.selectedAppointment  = this.dataContent.schedulers.find(a=>a._id == event.event.id);
      this.retrieveData['appointmentdate']  = this.selectedAppointment;
      $("#modlpp").click();
      // console.log("this.selectedAppointment",this.selectedAppointment);
    } else {
      this.isOpen = true;
      this.retrieveData['appointmentdate']  = event.date;
    }
  }

  dateClick(event: any) {
    this.isOpen = true;
    this.retrieveData = {};
    this.retrieveData['appointmentdate']  = event.date;
  }

  async getSubmitted(event) {
    if(event){
      setTimeout(() => {
        this.isOpen = !this.isOpen;
        this.submittedData.emit(event);
      }, 200);
    }
  }

  reschedule(){
    $("#appmodalclose").click();
    this.retrieveData = {};
    this.retrieveData = this.selectedAppointment;
    this.isOpen = true;
  }

 async cancel(){

    this.disableBtn = true;

    let postData = {
      schemaname: "appointments",
      ids: [this.selectedAppointment._id],
      value: "cancel",
    };
    this._commonService
      .updatestatus(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if(data){
          $("#appmodalclose").click();
          this.disableBtn = false;
          super.showNotification("top","right","Schedule cancelled successfully !!","success");
          setTimeout(() => {
            this.submittedData.emit("success");
          }, 200);
        }
      });
  }

  viewBill(){

  }
}
