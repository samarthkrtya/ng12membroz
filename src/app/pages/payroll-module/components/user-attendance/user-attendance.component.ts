import { Component, ElementRef, OnChanges, OnInit, ViewChild, ɵɵqueryRefresh } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { CommonService } from 'src/app/core/services/common/common.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { Utilities } from 'src/app/utilities/utilities';
import { Moment } from 'moment';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';
import moment from 'moment';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AttendanceCalendarComponent } from 'src/app/pages/calendars/components/attendance-calendar/attendance-calendar.component';

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
  selector: 'app-user-attendance',
  templateUrl: './user-attendance.component.html',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  // styleUrls : ['./user-attendance.component.css']
})

export class UserAttendanceComponent extends BaseComponemntComponent implements OnInit {

  calendarVisibility: boolean = false
  date = new Date()
  date1 = new FormControl(moment())
  userData: any[] = [];
  attendanceList: any;
  attendanceArray: any[] = [];
  userAttendanceArray: any[] = [];
  attendanceArrayWeek: any[] = [];
  designationData: any[] = [];
  yearSelected: number;
  monthSelected: number;
  daysInMonth: any[];
  daysInRange: any[];
  holidayArray: any[] = []
  attendanceListData: any[] = []
  month = this.date.getMonth();
  year = this.date.getFullYear();
  selectedUser: any;

  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });
  attendanceData: any[] = [];
  totalPresent: number = 0;
  totalWorkHours: any;
  totalAbsent: number = 0;
  modalDate: any;
  modaldate: Date;
  checkinTime: any;
  checkoutTime: any;
  attendanceID: any
  membrozid: any
  totalWeeklyTime: any
  total: any
  displayCheckbox: boolean = false;

  //pagination
  pager: any = {};
  pager1: any = {};
  pagedItems: any[];
  pagedItem1: any[];
  selectedPageSize: number;
  totalPages = 0;
  disableBtn: boolean
  selected: string = "Week";
  myControl = new FormControl();
  myControl1 = new FormControl()
  myControl2 = new FormControl()

  filteredOptions: Observable<string[]>;
  filteredOptions1: Observable<string[]>;
  selectid = []
  selectedvalue = []
  allselected: boolean = false;
  selectall: boolean;
  startDate: Date;
  endDate: Date;
  displayOnCheck: boolean = false;
  displayOnDeleteCheck: boolean = false;
  displayDeleteButton: boolean = false;
  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild('closeBtn1') closeBtn1: ElementRef;
  deleteButton: Boolean = false;
  addButton: Boolean = false;
  staffFormGroup: FormGroup;
  staffMonthlyFormGroup: FormGroup;
  selectedStaff: any[] = [];
  selectedStaffMonthly: any[] = [];
  weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  isPermission: boolean = false;
  constructor(public _commonService: CommonService,
    private _pagerService: PagerService,
    private _utilities: Utilities,
    private fb: FormBuilder) {
    super();
    this.staffFormGroup = new FormGroup({
      staff: new FormControl([])
    })
    this.staffMonthlyFormGroup = new FormGroup({
      staff: new FormControl([])
    })
  }

  async ngOnInit() {
    try {

      this.listen().subscribe((m: any) => {
        this.getAttendanceList(this.startDate, this.endDate);
      })
      await super.ngOnInit();
      let attendancePermissoin = this._loginUserRole['permissions'].find(x => x.formname == 'attendance')
      let permission = attendancePermissoin.recordpermission.find(x => x.type == "add")
      this.isPermission = permission.datapermission == "My" ? false : true;
      await this.getUserData();
      this.staffFormGroup.valueChanges.subscribe(res => {
        this.selectedStaff = [];
        this.selectedStaff = res.staff;
        this.attendanceArrayWeek = [];
        this.getAttendanceList(this.startDate, this.endDate)
      });

      this.staffMonthlyFormGroup.valueChanges.subscribe(res => {
        this.selectedStaffMonthly = [];
        this.selectedStaffMonthly = res.staff;
        this.attendanceArray = [];
        this.getAttendanceList(this.startDate, this.endDate)
      });
      await this.getDesignation();
      await this.getInitialData();
      await this.startDateSelection()
      await this.endDateSelection()
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
    this.filteredOptions1 = this.myControl2.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.fullname),
        map(option => option ? this.filter(option) : this.userData.slice())
      );
  }

  async getInitialData() {
    let start = new Date();
    start.setDate(start.getDate() - start.getDay());
    let end = new Date(start);
    end.setDate(start.getDate() + 6);
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
        })
      }
    }
    await this.getAttendanceData(start, end);
    await this.getAttendanceList(start, end);
    return
  }

  onValChange(value) {

    this.calendarVisibility = false;
    this.displayCheckbox = false;
    this.displayOnCheck = false;
    this.selected = value;
    if (value == "Month") {
      this.userData.forEach(element => {
        this.selectedStaffMonthly.push(element._id)
      })
      this.yearSelected = new Date().getFullYear();
      this.monthSelected = new Date().getMonth() + 1;

      var arr: any[] = [];
      var startDate = new Date(this.yearSelected, this.monthSelected - 1, 1, 0, 0, 0);
      var endDate = new Date(this.yearSelected, this.monthSelected, 0, 23, 59, 59);
      var date = new Date(startDate);
      while (date <= endDate) {
        arr.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
      this.daysInMonth = [];
      for (var i = 0; i < arr.length; i++) {
        this.daysInMonth.push({
          dateFormat: new Date(arr[i]),
          date: this.weekday[new Date(arr[i]).getDay()] + " " + new Date(arr[i]).getDate(),
          checkin: "",
          checkout: "",
          day: i
        })
      }
      this.getAttendanceList(startDate, endDate);
    }
    else if (value == "Week") {
      this.userData.forEach(element => {
        this.selectedStaff.push(element._id)
      })
      this.getInitialData()
    }
  }

  async getUserData() {
    this.isLoading = true;
    let postData = {};
    postData["search"] = [];
    postData["select"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
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

  async getAttendanceData(startDate, endDate) {
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    let startDateTime = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate(), 0, 0, 0)
    let endDateTime = new Date(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate(), 23, 59, 59)
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "checkin", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date", "cond": "and" },
      { "searchfield": "checkin", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date", "cond": "and" });

    var url = "attendances/filter"
    var method = "POST"

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.attendanceData = [];
        this.attendanceData = data;
      })
  }

  async getAttendanceList(startDate, endDate) {

    this.startDate = startDate;
    this.endDate = endDate;
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
    postData["search"].push({ "searchfield": "date", "searchvalue": startDateTime, "criteria": "gte", "datatype": "Date", "cond": "and" },
      { "searchfield": "date", "searchvalue": endDateTime, "criteria": "lte", "datatype": "Date", "cond": "and" });

    var url = "users/viewattendance/filter"
    var method = "POST"

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        this.attendanceList = [];
        this.userAttendanceArray = [];
        this.attendanceList = data;
        this.userData.forEach(userElement => {
          let user = {
            fullname: "",
            _id: ""
          }
          user.fullname = userElement.fullname;
          user._id = userElement._id
          this.userAttendanceArray.push(user)
        })

        // this.setPage(1);
        this.calendarVisibility = true;
      });

    this.getAttendanceDayWise();
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
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
    this.attendanceListData = [];
    this.attendanceList.forEach(element => {
      if (element.type == 'holiday') {
        this.holidayArray.push(element)
      } else {
        this.attendanceListData.push(element)
      }
    });
    let weeklyAttendance: any[] = [], monthlyAttendance: any[] = [], groupedAttendanceList = [];
    // let groupedAttendanceList = this._utilities.groupBy(this.attendanceListData, a => a.fullname)
    groupedAttendanceList = this.groupBy(this.attendanceListData, '_id')

    this.attendanceArray = [];
    this.attendanceArrayWeek = [];
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
          attendance.designation = attendanceElement[0].designation ? attendanceElement[0].designation : (this.userData.find(x => x._id == attendanceElement[0]._id)?.designationid?.title)
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
        weeklyAttendance.push(attendance)
      }

      //Monthly Attendance
      if (this.daysInMonth) {
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
          day8: {},
          day9: {},
          day10: {},
          day11: {},
          day12: {},
          day13: {},
          day14: {},
          day15: {},
          day16: {},
          day17: {},
          day18: {},
          day19: {},
          day20: {},
          day21: {},
          day22: {},
          day23: {},
          day24: {},
          day25: {},
          day26: {},
          day27: {},
          day28: {},
          day29: {},
          day30: {},
          day31: {},
          totalPresent: 0,
          workingHours: 0,
          absentDays: 0
        }
        if (attendanceElement.length > 0) {
          attendance.id = attendanceElement[0]._id
          attendance.fullname = attendanceElement[0].fullname
          attendance.designation = attendanceElement[0].designation ? attendanceElement[0].designation : (this.userData.find(x => x._id == attendanceElement[0]._id)?.designationid?.title)
        }

        this.totalPresent = 0;
        this.totalWorkHours = 0;
        this.totalAbsent = 0;
        attendance.day1 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 1), attendanceElement)
        attendance.day2 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 2), attendanceElement)
        attendance.day3 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 3), attendanceElement)
        attendance.day4 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 4), attendanceElement)
        attendance.day5 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 5), attendanceElement)
        attendance.day6 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 6), attendanceElement)
        attendance.day7 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 7), attendanceElement)
        attendance.day8 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 8), attendanceElement)
        attendance.day9 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 9), attendanceElement)
        attendance.day10 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 10), attendanceElement)
        attendance.day11 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 11), attendanceElement)
        attendance.day12 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 12), attendanceElement)
        attendance.day13 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 13), attendanceElement)
        attendance.day14 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 14), attendanceElement)
        attendance.day15 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 15), attendanceElement)
        attendance.day16 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 16), attendanceElement)
        attendance.day17 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 17), attendanceElement)
        attendance.day18 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 18), attendanceElement)
        attendance.day19 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 19), attendanceElement)
        attendance.day20 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 20), attendanceElement)
        attendance.day21 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 21), attendanceElement)
        attendance.day22 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 22), attendanceElement)
        attendance.day23 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 23), attendanceElement)
        attendance.day24 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 24), attendanceElement)
        attendance.day25 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 25), attendanceElement)
        attendance.day26 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 26), attendanceElement)
        attendance.day27 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 27), attendanceElement)
        attendance.day28 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 28), attendanceElement)
        if (this.daysInMonth.length >= 29) {
          attendance.day29 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 29), attendanceElement)
          if (this.daysInMonth.length >= 30) {
            attendance.day30 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 30), attendanceElement)
            if (this.daysInMonth.length == 31) {
              attendance.day31 = this.getDay(new Date(this.yearSelected, this.monthSelected - 1, 31), attendanceElement)
            }
          }
        }
        attendance.totalPresent = this.totalPresent
        attendance.workingHours = this.totalWorkHours
        attendance.absentDays = this.totalAbsent;
        monthlyAttendance.push(attendance)
      }
    });
    if (this.daysInRange) {
      this.selectedStaff.forEach(element => {
        this.attendanceArrayWeek.push(weeklyAttendance.find(x => x.id == element))
      })
    }
    if (this.daysInMonth) {
      this.attendanceArray = [];
      this.selectedStaffMonthly.forEach(element => {
        this.attendanceArray.push(monthlyAttendance.find(x => x.id == element))
      })
    }
  }

  valueChanged(value, days) {
    if (value) {
      let date: Date;
      days.forEach(element => {
        date = new Date(element.date)

        if (date.getFullYear() == this.date.getFullYear() && date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
          this.calculateTotalTime(this.checkinTime, this.checkoutTime);
          element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M"
          this.total = element.totalHours;
        }
      });
    }
  }

  valueChanged1(value, days) {
    if (value) {
      let date: Date;
      days.forEach(element => {
        date = new Date(element.date)
        // element.date == this.date
        if (date.getFullYear() == this.date.getFullYear() && date.getMonth() == this.date.getMonth() && date.getDate() == this.date.getDate()) {
          element.checkout = new Date(value).getHours() + ":" + new Date(value).getMinutes()
          this.calculateTotalTime(element.checkin, element.checkout)
          element.totalHours = this.totalWeeklyTime ? this.totalWeeklyTime : "00 H : 00 M"
          this.total = element.totalHours
        }
      });
    }
  }

  getDay(date: Date, groupedAttendanceList: any[]) {

    let startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    let endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    let foundAttendance = groupedAttendanceList.find(x => new Date(x.date) > startTime && new Date(x.date) < endTime)
    if (foundAttendance) {
      this.totalPresent++;
      let attendance = {
        date: date,
        checkin: foundAttendance['checkin'],
        checkout: foundAttendance['checkout'],
        workhours: this.calculateTotalTime(foundAttendance['checkin'], foundAttendance['checkout']),
        type: ((foundAttendance.type) ? foundAttendance.type : 'workingday'),
        attendanceid: foundAttendance['attendanceid']
      }
      this.totalWorkHours = (Number(this.totalWorkHours) + Number((Math.round(foundAttendance.workhours * 100) / 100).toFixed(2))).toFixed(2)
      return attendance;
    } else {
      let day = date.getDay();
      let holiday = this.holidayArray.find(x => (new Date(x.date).getDate() == date.getDate()) &&
        (new Date(x.date).getMonth() == date.getMonth()) && (new Date(x.date).getFullYear() && date.getFullYear()))
      if (this._loginUserBranch.workinghours.days.length == 6 && day == 0) {
        let attendance = {
          date: date,
          checkin: "",
          checkout: "",
          workhours: "",
          type: "Holiday"
        }
        return attendance;
      } else if (holiday) {
        let attendance = {
          date: date,
          checkin: "",
          checkout: "",
          workhours: "",
          type: "Holiday"
        }
        return attendance;
      }
      else {
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
  }

  calculateTotalTime(start, end) {
    var startTime = moment(start, "HH:mm:ss a");
    var endTime = moment(end, "HH:mm:ss a");
    var duration = moment.duration(endTime.diff(startTime));
    var h = duration.asHours().toString();
    var hour = h.split(".")
    var minutes = (Number(duration.asMinutes()) % 60).toFixed(0);
    let totalWeeklyTime = hour[0] + " H : " + minutes + " M"
    return totalWeeklyTime
  }

  setPage(page: number) {

    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this._pagerService.getPager(this.attendanceArray.length, page, this.selectedPageSize);
    this.pagedItems = this.attendanceArray.slice(this.pager.startIndex, this.pager.endIndex + 1);
    this.pager1 = this._pagerService.getPager(this.attendanceArrayWeek.length, page, this.selectedPageSize);
    this.pagedItem1 = this.attendanceArrayWeek.slice(this.pager1.startIndex, this.pager1.endIndex + 1);
    this.calendarVisibility = true

  }

  chosenYearHandler(year: any, normalizedYear: Moment) {
    const ctrlValue = this.date1.value;
    ctrlValue.year(normalizedYear.year());
    this.date1.setValue(ctrlValue);
    this.yearSelected = new Date(year).getFullYear();
  }

  chosenMonthHandler(month: any, normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date1.value;
    this.monthSelected = ctrlValue._d.getMonth() - 1;
    ctrlValue.month(normalizedMonth.month());
    this.date1.setValue(ctrlValue);
    this.monthSelected = new Date(month).getMonth() + 1;

    var arr: any[] = [];
    var startDate = new Date(this.yearSelected, this.monthSelected - 1, 1, 0, 0, 0);
    var endDate = new Date(this.yearSelected, this.monthSelected, 0, 23, 59, 59);
    var date = new Date(startDate);
    while (date <= endDate) {
      arr.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    this.daysInMonth = [];
    for (var i = 0; i < arr.length; i++) {
      this.daysInMonth.push({
        date: this.weekday[new Date(arr[i]).getDay()] + " " + new Date(arr[i]).getDate(),
        checkin: "",
        checkout: "",
        day: i
      })
    }
    datepicker.close();
    this.getAttendanceList(startDate, endDate);
  }

  getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  startDateSelection() {
    this.calendarVisibility = false
    let start = new Date(this.range.controls["start"].value);
    start.setDate(start.getDate() - start.getDay());
    this.range.controls["start"].setValue(start);
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
        })
      }
    }
    this.getAttendanceList(new Date(start), new Date(end));
  }

  onSelectValue(name) {
    this.attendanceArray = this.attendanceArray.filter(x => x.fullname === name)
    this.setPage(1);
    this.getAttendanceDayWise()
  }

  onSelectValueWeek(name) {
    this.attendanceArrayWeek = []
    this.getAttendanceDayWise()
    this.attendanceArrayWeek = this.attendanceArrayWeek.filter(x => x.fullname === name)
  }

  onSelectDesignation(degn) {
    this.attendanceArray = this.attendanceArray.filter(x => x.designation === degn)
    this.setPage(1)
    this.getAttendanceDayWise()
  }

  onSelectDesignationWeek(designation) {
    this.attendanceArrayWeek = []
    this.getAttendanceDayWise()
    this.attendanceArrayWeek = this.attendanceArrayWeek.filter(x => x.designation === designation)
  }

  onClick(id, name, day) {
    let user = this.userData.find(x => x._id == id)
    this.selectedUser = user;
    this.disableBtn = true

    this.checkinTime = day.checkin;
    this.checkoutTime = day.checkout;
    this.total = day.totalHours

    this.membrozid = id
    this.modaldate = day.date;
    this.modalDate = day.date;

    if (!day.checkin && !day.checkout) {
      this.checkinTime = `09:00`;
      this.checkoutTime = `18:00`;
    }

    let postData = {}
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membrozid", "searchvalue": id, "criteria": "eq" });

    var url = "attendances/filter"
    var method = "POST"
    this.attendanceID = ""

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        let attendanceList = []
        attendanceList = data;
        attendanceList.forEach(element => {
          let date = new Date(element.checkin);
          if (date.getFullYear() == this.modaldate.getFullYear() && date.getMonth() == this.modaldate.getMonth() && date.getDate() == this.modaldate.getDate()) {
            this.attendanceID = element._id;
          }
        });
      })
  }

  onUpdate(date: Date, checkinTime, checkoutTime) {
    var inspl = checkinTime.split(':');
    var outspl = checkoutTime.split(':');
    this.disableBtn = false
    let checkInDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), inspl[0], inspl[1], 0);
    let checkOutDateTime: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), outspl[0], outspl[1], 0);

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
        .commonServiceByUrlMethodDataAsync(url, method, checkTimeobj)
        .then(async (data) => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance updated successfully', 'success');
            this.closeBtn.nativeElement.click();
            // this.filter1("Attendance updated successfully")
            await this.getInitialData()
          }
        })
    } else {
      var url = "attendances"
      var method = "POST"
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, checkTimeobj)
        .then(async (data) => {
          this.showNotification('top', 'right', 'Attendance Added successfully', 'success');
          this.closeBtn.nativeElement.click();
          await this.getInitialData()
          // this.filter1("Attendance Added successfully")
        })
    }
  }

  onClickMassAttendance() {
    this.displayCheckbox = true;
    this.deleteButton = true;
  }

  onClickDeleteAttendance() {
    this.displayDeleteButton = true;
    this.addButton = true
  }

  onCancelMassAttendance() {
    this.displayCheckbox = false;
    this.displayOnCheck = false;
  }

  onCancelDeleteAttendance() {
    this.displayDeleteButton = false;
    this.displayOnDeleteCheck = false;
  }

  onAddMassAttendance(checkinTime, checkoutTime) {
    this.disableBtn = true;
    if (this.selected == 'Month') {
      var finalArray = [];
      this.attendanceArray.forEach(element => {
        this.daysInMonth.forEach(ele => {
          if (element[`day${ele.day + 1}`]?.checked) {
            var inspl = checkinTime.split(':');
            var outspl = checkoutTime.split(':');
            this.disableBtn = false
            let checkInDateTime: Date = new Date(new Date(element[`day${ele.day + 1}`].date).getFullYear(), new Date(element[`day${ele.day + 1}`].date).getMonth(), new Date(element[`day${ele.day + 1}`].date).getDate(), inspl[0], inspl[1], 0);
            let checkOutDateTime: Date = new Date(new Date(element[`day${ele.day + 1}`].date).getFullYear(), new Date(element[`day${ele.day + 1}`].date).getMonth(), new Date(element[`day${ele.day + 1}`].date).getDate(), outspl[0], outspl[1], 0);
            let checkTimeobj = {
              checkin: checkInDateTime,
              checkout: checkOutDateTime,
              membrozid: element.id,
              onModel: "User",
              property: null,
            }
            finalArray.push(checkTimeobj);
          }
        });
      });
      var url = "attendances/insertmultiple"
      var method = "POST"

      var modal = {};
      modal['attendances'] = [];
      modal['attendances'] = finalArray;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance Added successfully', 'success');
            this.closeBtn1.nativeElement.click();
            this.displayOnCheck = false
            this.displayCheckbox = false;
            this.deleteButton = false;
            this.filter1("Attendance Added successfully")
          }
        })
    } else if (this.selected == 'Week') {
      var finalArray = [];
      let arr: any[] = [1, 2, 3, 4, 5, 6, 7]
      this.attendanceArrayWeek.forEach(element => {
        arr.forEach(ele => {
          if (element[`day${ele}`].checked) {
            var inspl = checkinTime.split(':');
            var outspl = checkoutTime.split(':');
            this.disableBtn = false
            let checkInDateTime: Date = new Date(new Date(element[`day${ele}`].date).getFullYear(), new Date(element[`day${ele}`].date).getMonth(), new Date(element[`day${ele}`].date).getDate(), inspl[0], inspl[1], 0);
            let checkOutDateTime: Date = new Date(new Date(element[`day${ele}`].date).getFullYear(), new Date(element[`day${ele}`].date).getMonth(), new Date(element[`day${ele}`].date).getDate(), outspl[0], outspl[1], 0);
            let checkTimeobj = {
              checkin: checkInDateTime,
              checkout: checkOutDateTime,
              membrozid: element.id,
              onModel: "User",
              property: null,
            }
            finalArray.push(checkTimeobj);
          }
        });
      });
      var url = "attendances/insertmultiple"
      var method = "POST"

      var modal = {};
      modal['attendances'] = [];
      modal['attendances'] = finalArray;

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance Added successfully', 'success');
            this.closeBtn1.nativeElement.click();
            this.displayOnCheck = false
            this.displayCheckbox = false;
            this.deleteButton = false;
            this.filter1("Attendance Added successfully")
          }
        })
    }
  }

  onDeleteMassAttendance(checkinTime, checkoutTime) {
    this.disableBtn = true;
    if (this.selected == 'Month') {
      var finalArray = [];
      this.attendanceArray.forEach(element => {
        this.daysInMonth.forEach(ele => {
          if (element[`day${ele.day + 1}`]?.delete) {
            let att = this.attendanceData.find(x => x._id == element[`day${ele.day + 1}`].attendanceid)
            finalArray.push(att);
          }
        });
      });
      var url = "attendances/insertmultiple"
      var method = "POST"

      var modal = {};
      modal['attendances'] = [];
      modal['attendances'] = finalArray;
      var url = "attendances/deletemultiple"
      var method = "POST"

      var modal = {};
      modal['attendances'] = [];
      modal['attendances'] = finalArray;
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance has been deleted successfully!!', 'success');
            this.displayDeleteButton = false
            this.displayOnDeleteCheck = false;
            this.addButton= false;
            this.filter1("Attendance deleted successfully")

          }
        })
    } else if (this.selected == 'Week') {
      var finalArray = [];
      let arr: any[] = [1, 2, 3, 4, 5, 6, 7]
      this.attendanceArrayWeek.forEach(element => {
        arr.forEach(ele => {
          if (element[`day${ele}`].delete) {
            let att = this.attendanceData.find(x => x._id == element[`day${ele}`].attendanceid)
            finalArray.push(att);
          }
        });
      });
      var url = "attendances/deletemultiple"
      var method = "POST"

      var modal = {};
      modal['attendances'] = [];
      modal['attendances'] = finalArray;
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, modal)
        .then(data => {
          if (data) {
            this.showNotification('top', 'right', 'Attendance has been deleted successfully!!', 'success');
            this.displayDeleteButton = false
            this.displayOnDeleteCheck = false;
            this.addButton= false;
            this.filter1("Attendance deleted successfully")

          }
        })
    }
  }

  onChecked(user) {
    user.checked = user.checked ? !user.checked : true;
    this.displayOnCheck = true;
    this.checkinTime = `09:00`;
    this.checkoutTime = `18:00`;
  }

  onDelete(user) {
    user.delete = user.delete ? !user.delete : true;
    this.displayOnDeleteCheck = true;
    this.checkinTime = `09:00`;
    this.checkoutTime = `18:00`;
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
    this.attendanceArrayWeek = []
    this.getAttendanceDayWise()
    this.attendanceArrayWeek = this.attendanceArrayWeek.filter(x => x.fullname === this.myControl1.value)
    this.myControl1.setValue(option.value);
  }

  handleEmptyInput(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
    }
  }

  displayFn(user: any): string {
    // return user && user.fullname ? user.fullname : '';
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
    this.attendanceArrayWeek = user
    return displayValue;
  }

  optionSelected1(option: any) {
    this.attendanceArray = []
    this.getAttendanceDayWise()
    this.attendanceArray = this.attendanceArray.filter(x => x.fullname === option.value)
    this.myControl2.setValue(option.value);
    this.setPage(1);
  }

  handleEmptyInput1(event: any) {
    if (event.target.value === '') {
      this.myControl.setValue("");
    }
  }

  displayFn1(user: any): string {
    // return user && user.fullname ? user.fullname : '';
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
    this.attendanceArray = user
    return displayValue;
  }

  preloaddata() {
    if (this.userData && this.userData.length == 0) {
      this.getUserData()
    }
  }

  enter() {
    const controlValue = this.myControl1.value;
    this.myControl1.setValue(controlValue);
  }

  enter1() {
    const controlValue = this.myControl2.value;
    this.myControl2.setValue(controlValue);
  }

  private _listeners = new Subject<any>();
  listen(): Observable<any> {
    return this._listeners.asObservable();
  }

  filter1(filterBy: String) {
    this._listeners.next(filterBy);
  }

}
