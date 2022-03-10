import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-staff-roaster',
  templateUrl: './staff-roaster.component.html',
  styles: [
    `.exception-text {
        font-weight: bold
    }`
  ]
})
export class StaffRoasterComponent extends BaseComponemntComponent implements OnInit {

  calendarVisibility: boolean = false;
  staffFormGroup: FormGroup;
  formId = "598998cb6bff2a0e50b3d793"
  selectedStaff: any[] = [];
  daysInRange: any[] = [];
  date = new Date();
  month = this.date.getMonth();
  year = this.date.getFullYear();
  range = new FormGroup({
    start: new FormControl(new Date(this.year, this.month, this.date.getDate())),
    end: new FormControl(new Date(this.year, this.month, this.date.getDate()))
  });
  startdate: Date;
  enddate: Date;
  userData: any[] = [];
  staffids: any[] = [];
  availableLists: any[] = [];
  eventLists: any[] = [];
  workinghours: String;
  breaktime: String;
  attendanceArrayWeek: any[] = [];
  constructor() {
    super();
    this.staffFormGroup = new FormGroup({
      staff: new FormControl([])
    })
   }

  async ngOnInit(){
    super.ngOnInit();
    await this.getUserData();
    await this.startDateSelection();
    await this.endDateSelection();
    this.staffFormGroup.valueChanges.subscribe(res => {
      this.selectedStaff = [];
      this.selectedStaff = res.staff;
      this.attendanceArrayWeek = [];
      this.getCalendarData()
    });
  }

  async getUserData(){
    this.isLoading = true;
    let postData = {};
    postData["search"] = [];
    postData["select"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["sort"] = { "fullname": 1 };
    var url = "users/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        this.userData = [];
        this.userData = data;
        data.forEach(element => {
          this.staffids.push(element._id)
        });
        // this.getCalendarData();

        this.isLoading = false;
        return
      })
  }

  async getCalendarData() {
    this.attendanceArrayWeek=[];
    // this.enddate.setDate(this.enddate.getDate() + 1);

    var url = "analyticsreports/process";
    var method = "POST";
    let postData = {};
    postData['id'] = "619c87614220efd6edda0232"; // "616146248815964fe0e7ae6b";
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'staffids', "searchvalue": this.staffids, "criteria": "in", "datatype": "ObjectId" });
    postData['search'].push({ "searchfield": 'startdate', "searchvalue": this.startdate, "criteria": "eq", "datatype": "date", "locationtime": true });
    postData['search'].push({ "searchfield": 'enddate', "searchvalue": this.enddate, "criteria": "eq", "datatype": "date", "locationtime": true });

    // console.log("postData ===> ",postData)

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        // console.log("Data ===> ",data)
        if (data) {

          this.availableLists = [];
          this.eventLists = [];
          this.availableLists = data;
        
          if(this._loginUserBranch.workinghours.starttime && this._loginUserBranch.workinghours.endtime){
            this.workinghours = `${this.tConvert(this._loginUserBranch.workinghours.starttime)}-${this.tConvert(this._loginUserBranch.workinghours.endtime)}`
          }
          if(this._loginUserBranch.breaktime && this._loginUserBranch.breaktime.length > 0){
            this.breaktime = this._loginUserBranch.breaktime;
          }
          
          if(data[0]) {
            data.forEach(element => {

              if(element.isClosed) {

                let closeObj = {
                  userid:element._id,
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
                  userid:element._id,
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
                    userid:element._id,
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
                    userid:element._id,
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
          // console.log("Event list : ",this.eventLists)
          let weeklyAttendance: any[] = [];
          this.userData.forEach(userElement => {
            if(this.daysInRange){
              let availability = {
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
                workingHours: 0,
              }
                availability.id = userElement._id
                availability.fullname = userElement.fullname
                availability.designation = userElement?.designationid?.property?.title;
              availability.day1 = this.getDay(new Date(this.daysInRange[0].date), userElement)
              availability.day2 = this.getDay(new Date(this.daysInRange[1].date), userElement)
              availability.day3 = this.getDay(new Date(this.daysInRange[2].date), userElement)
              availability.day4 = this.getDay(new Date(this.daysInRange[3].date), userElement)
              availability.day5 = this.getDay(new Date(this.daysInRange[4].date), userElement)
              availability.day6 = this.getDay(new Date(this.daysInRange[5].date), userElement)
              availability.day7 = this.getDay(new Date(this.daysInRange[6].date), userElement)
              weeklyAttendance.push(availability)
            }
          })
          if(this.daysInRange){
            this.attendanceArrayWeek = [];
            this.selectedStaff.forEach(element => {
              this.attendanceArrayWeek.push(weeklyAttendance.find(x => x.id == element))
            })
          }
          // console.log("Week : ",this.attendanceArrayWeek)
          this.calendarVisibility = true;
          // return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  getDay(date, user){
    let availablityObj;
      let exception = this.eventLists.find(x => ( new Date(x.date).getDate() == new Date(date).getDate()) &&
      (new Date(x.date).getMonth() == new Date(date).getMonth()) &&
      (new Date(x.date).getFullYear() == new Date(date).getFullYear() ) && x.userid==user._id)
      // console.log("exception",exception)
      let exceptionBreak = this.eventLists.find(x => ( new Date(x.date).getDate() == new Date(date).getDate()) &&
      (new Date(x.date).getMonth() == new Date(date).getMonth()) &&
      (new Date(x.date).getFullYear() == new Date(date).getFullYear() )  && x.userid==user._id && x.extendedProps.status=="breaktime")
      if(exception){
        if(exception.title == 'Closed'){
          availablityObj = {
            date: date,
            title: exception.title,
            type: 'holiday'
          }
        }else if(exception.title == 'Not Available'){
          availablityObj = {
            date: date,
            title: exception.title,
            type: 'absentday'
          }
        }else{
          availablityObj = {
            date: date,
            workinghours: exception.title,
            type:'workingday',
            breaktime: exceptionBreak?.title,
            exception: true
          }
        }
      }
      else{
        availablityObj = {
          date: date,
          workinghours: this.workinghours,
          type:'workingday',
          breaktime: exceptionBreak?.title,
        }
      }
      return availablityObj;
  }

  onValChange(value){
    if(value == 'Previous'){
      this.startdate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(), this.startdate.getDate()-7, 0, 0, 0);
      this.enddate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(), this.startdate.getDate()+6, 23, 59, 59);
      this.getDaysInRange();
      this.getCalendarData()
      // this.setWeekData(this.startdate, this.enddate);
    }else if(value == 'Today'){
      this.startdate = new Date();
      this.startdate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(),this.startdate.getDate() - this.startdate.getDay(), 0, 0, 0);
      this.enddate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(), this.startdate.getDate() + 6, 23, 59, 59);
      this.getDaysInRange();
      this.getCalendarData()
      // this.setWeekData(this.startdate, this.enddate);
    }else if(value == 'Next'){
      this.startdate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(), this.startdate.getDate()+7, 0, 0, 0);
      this.enddate = new Date(this.startdate.getFullYear(), this.startdate.getMonth(), this.startdate.getDate()+6, 23, 59, 59);
     
      this.getDaysInRange();
      this.getCalendarData()
      // this.setWeekData(this.startdate, this.enddate);
    }

  }

  getDaysInRange(){
    this.daysInRange = [];
    var arr: any[] = [];
    var d = new Date(this.startdate);
    while (d <= this.enddate) {
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
  }

  tConvert (time: string) {
    //console.log("time", time)
    return time;
  }

  async startDateSelection() {
    let start = new Date(this.range.controls["start"].value);
    start.setDate(start.getDate() - start.getDay());
    this.startdate = start;
    this.range.controls["start"].setValue(start);
  }

  async endDateSelection() {
    let start = new Date(this.range.controls["start"].value);
    let end = new Date(start);
    end.setDate(start.getDate() + 6);
    this.enddate = end;
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
    this.getCalendarData();
  }


}
