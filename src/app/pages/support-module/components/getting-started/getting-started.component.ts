import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";

import { CommonService } from "src/app/core/services/common/common.service";
import { BaseLiteComponemntComponent } from "src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component";

import * as moment from 'moment';
declare var $: any;

@Component({
  selector: "app-getting-started",
  templateUrl: "./getting-started.component.html",
})

export class GettingStartedComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit ,OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindId : string;
  dataContent : any;

  isLoading : boolean;

  
  selectedTitle: string;
  vdourl: any;

  workingHours : any 
  selectedDate: Date;
  min : Date = new Date();
  wdoptions = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  availslots = [];
  disableBtn : boolean = false;

  constructor(
      private _route: ActivatedRoute,
      private _commonService: CommonService,
      private sanitizer: DomSanitizer,
      ) {
    super();

    this._route.params.forEach((param : any)=>{
      this.bindId = param['id'];
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.initVar();
    await this.getGeetingStarted(this.bindId);
  }

  ngAfterViewInit(){
  }
  
  async initVar(){
    this.workingHours = this._loginUserBranch['workinghours'];
    
    this.onDateChanged(new Date());
    return;
  }

  async getGeetingStarted(id : string){


    let url = "analyticsreports/process";
    let method = "POST";


    let postData = {};
    postData["id"] = id;
    postData["search"] = [];

    
    this.isLoading = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data.length > 0) {
          this.dataContent = {};
          this.dataContent = data[0];
          this.isLoading = false;
          // console.log("this.dataContent==>",this.dataContent);
        }
      }).catch((e)=>{
        this.isLoading = false;
      });
  }

  goToLink(url : string){
      window.open('//'+url, "_blank");
  } 

  

  watchVideo(title : string, url : string){
    
    this.selectedTitle =  title;
    this.vdourl =  this.sanitizer.bypassSecurityTrustResourceUrl(url);
    // console.log("this.videoDetail",this.videoDetail);
  }


  disableDate = (d: any | null): boolean => {
    if(this.workingHours && this.workingHours.days.length > 0){
        let date = moment(d._d) ? moment(d._d) : moment(d);
        return this.workingHours.days.includes(this.wdoptions[date.day()]);
    }else{
      return false;
    }
 }


  onDateChanged(date : any){
    this.selectedDate =  date && date._d ? date._d : date;
    this.availslots = [];
    this.availslots = this.generatingTS(this.workingHours.starttime,this.workingHours.endtime)
  }


  dayChecked(slot : any, event : any){
    this.availslots.map(a=>a.checked = false);
    if(event.checked){
      this.availslots.map(a=>a.checked = (a.starttime == slot.starttime));
    } 
  }

  generatingTS(starttime: string, endtime: string) {

    var timeslotList = [];
    var duration = 30; 
    var startmin = starttime.split(":");      // 08:00
    var timehr = parseInt(startmin[0]);       // 06
    var timemin = parseInt(startmin[1]);      // 00
    var totalstartmin = timehr * 60 + timemin;// 480 + 00

    var endmin = endtime.split(":");            // 14:00
    var endtimehr = parseInt(endmin[0]);        // 14
    var endtimemin = parseInt(endmin[1]);       // 00
    var totalendmin = endtimehr * 60 + endtimemin;// 1020 + 30

    for (var time = totalstartmin; time < totalendmin;) { //360

      timemin = Number(timemin);            //00
      var start;
      if (timemin <= 9) {
        start = timehr + ":" + "0" + timemin;  //06:00
      } else {
        start = timehr + ":" + timemin;
      }
      var end;
      if (duration <= 60) {
        timemin += duration;        //60
        if (timemin >= 60) {
          timehr += 1;                        //07
          timemin -= 60;                      //00
        }
        if (timemin <= 9) {
          end = timehr + ":" + "0" + timemin;
        } else {
          end = timehr + ":" + timemin;
        }
      } else {
        end = moment(timehr + ':' + timemin, 'HH:mm');
        end.add(duration, 'm');
        end = end.format("HH:mm");
        var tempstartmin = end.split(":");
        timehr = parseInt(tempstartmin[0]);
        timemin = parseInt(tempstartmin[1]);
      }

      var obj;
      obj = {
        "starttime": start,
        "endtime": end,
        "displaytext": start + " - " + end,
        "checked": false,
      }
      timeslotList.push(obj);
      time += duration;
    } 
    return timeslotList;
  }

  saveSchedule(){
   var slot = this.availslots.filter(a=>a.checked == true);
   
    if(slot.length == 0 || !this.selectedDate) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return ;
    }

    var model = {};
    model['stage'] = "Fresh";
    model['status'] = "active";
    model['fullname'] = this._loginUser.fullname;
    model['branchid'] = "5cab242dddf116783aaf9166";
    model['property'] = {};
    model['property']["fullname"] = this._loginUser.fullname;
    model['property']["bookedslot"] = slot[0].starttime;

    console.log("model",model);
    let url = "enquiries";
    let method = "POST";
 
    this.disableBtn = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then((billPayRes) => {
        if (billPayRes) {
          super.showNotification("top", "right", "Call Schedule successfully !!", "success");
          this.disableBtn = false;
          $("#closesclBtn").click();
        }
      }).catch((e) => {
        this.disableBtn = false;
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        $("#closesclBtn").click();
      });

  }

  ngOnDestroy() {

  }
}
