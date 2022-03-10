import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg } from '@fullcalendar/core';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
declare var $:any;
@Component({
  selector: 'app-attendance-calendar',
  templateUrl: './attendance-calendar.component.html'
})
export class AttendanceCalendarComponent extends BaseComponemntComponent implements OnInit {

  
  myControl = new FormControl();
  myControl1 = new FormControl()
  userData: any[] = [];
  filteredOptions: Observable<string[]>;
  selectid = []
  selectedvalue :any
  allselected:boolean = false;
  selectall: boolean;
  attendanceList: any[] = []
  currtoday: Date = new Date();
  
  startDate = moment().clone().startOf('month').format('YYYY-MM-DD');
  endDate = moment().clone().endOf('month').format('YYYY-MM-DD');
  today = moment().format('YYYY-MM-DD');
  currentMonth = moment().clone().startOf('month').format('M');
  
  absentList:any[]
  renderList:any[];
  calendarOptions: CalendarOptions;
  month:any;
  
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  constructor() {
    super()
   }

  async ngOnInit(){
    try {
      await super.ngOnInit();
      await this.getUserData();
    }
    catch (error) {
      console.error(error)
    } finally {

    }
    this.filteredOptions = this.myControl1.valueChanges
    .pipe(
      startWith(''),
      map(option => typeof option === 'string' ? option : option.fullname),
      map(option => option ? this.filter(option) : this.userData.slice())
    );
  }

  async getUserData() {
    this.isLoading = true;
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
        this.isLoading = false;
        return
      })
  }

  getAttendanceDataOnCalendar()
  {
    let url = "attendances/filter";
    let method = "POST"
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": this.selectedvalue._id, "criteria": "eq","datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "checkin", "searchvalue": new Date(this.currtoday.getUTCFullYear(), 0, 1), "criteria": "gte", "datatype": "Date", "cond": "and" });
    postData["search"].push({ "searchfield": "checkout", "searchvalue": new Date(this.currtoday.getUTCFullYear(), 11, 31),"criteria": "lte", "datatype": "Date", "cond": "and" });

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any[]) => {
        if (data && data.length > 0) {
          this.attendanceList = data;
          this.renderCalendar();
      }
    })
  }

  async renderCalendar() {
    var dateArray = await this.getDateRange(this.startDate, this.endDate)
    let combineArray = [];

    await this.attendanceList.forEach(element => {
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
    await this.attendanceList.forEach(element => {
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

  someMethod() {
    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.getDate();
    this.month = currentDate.getMonth()+1
    this.onChangeMonth(this.month)
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    //console.log("hi")
  }

  calculateTotalTime(start, end){
    var startTime = moment(start, "HH:mm:ss a");
    var endTime = moment(end, "HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));
    var h = duration.asHours().toString();
    var hour = h.split(".")
    var minutes = (Number(duration.asMinutes()) % 60).toFixed(0);
    let totalWeeklyTime = hour[0] + " H : " + minutes + " M"
    return totalWeeklyTime
  }

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

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.userData
        .filter(option => {
          if (option.fullname) {
            return option.fullname.toLowerCase().includes(value.toLowerCase())
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.userData.slice();
    }
    return results;
  }

  optionSelected(option: any) {
    option.selected = !option.selected;
    if (option.selected) {
      this.selectedvalue = option;
      this.selectid.push(option._id)
    } else {
      const i = this.selectedvalue.findIndex(value => value === option);
      this.selectedvalue.splice(i, 1);
    }
    this.myControl1.setValue(this.selectedvalue.fullname);
    this.getAttendanceDataOnCalendar()
  }

   handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
    }
  }

  displayFn(user: any): string {
    let displayValue: string;
    if (Array.isArray(user)) {
      user.forEach((user, index) => {
        if (index === 0) {
          displayValue = user.fullname;
        } else {
          displayValue += ', ' + user.fullname;
        }
      });
    } else {
      displayValue = user;
    }
    return displayValue;
  }
 
  preloaddata() {
    if (this.userData && this.userData.length == 0) {
      this.getUserData()
    }
  }

  enter() {
    var controlValue = this.myControl.value;
    // controlValue['selectedAction'] = this.selectedAction;
    this.myControl.setValue(controlValue);
    // this.onSelectOption.emit(controlValue);
    // this.getRedirect(this.myControl.value._id)
  }
}
