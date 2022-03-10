import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../core/services/common/common.service';

declare var $: any;
@Component({
  selector: 'app-user-availability',
  templateUrl: './user-availability.component.html'
})
export class UserAvailabiltyComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() bindId: any; 
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();

  btnDisable: boolean = false;
  displayedColumns: string[] = ["checked", "day", "starttime", "endtime"];

  daysList: any[] = [
    { day: "Monday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Tuesday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Wednesday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Thursday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Friday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Saturday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' },
    { day: "Sunday", checked: false, starttime: '', endtime: '', startdate: '', enddate: '' }
  ];

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-user-availability";
  }

  async ngOnInit() {
    super.ngOnInit();
    this.setData();
  }

  setData() {
    if (this.dataContent && this.dataContent.availability && this.dataContent.availability.length > 0) {
      this.dataContent.availability.forEach(avail => {
        var foundDay = this.daysList.find(a => a.day === avail.day);

        var sdhh, sdmm, sdate = new Date();
        sdhh = avail.starttime.split(':')[0];
        sdmm = avail.starttime.split(':')[1];
        sdate.setHours(sdhh);
        sdate.setMinutes(sdmm);

        var edhh, edmm, edate = new Date();
        edhh = avail.endtime.split(':')[0];
        edmm = avail.endtime.split(':')[1];
        edate.setHours(edhh);
        edate.setMinutes(edmm);

        foundDay.startdate = sdate;
        foundDay.enddate = edate;
        foundDay.starttime = avail.starttime;
        foundDay.endtime = avail.endtime;
        foundDay.checked = true;
      });
    }
  }



  async onSaveAvil() {
    var tempthis = this;
    this.daysList.map(function (val) {
      if (val.checked) {
        val.starttime = `${tempthis.setdigit(val.startdate.getHours())}:${tempthis.setdigit(val.startdate.getMinutes())}`
        val.endtime = `${tempthis.setdigit(val.enddate.getHours())}:${tempthis.setdigit(val.enddate.getMinutes())}`
      }
    });
    var daylist = this.daysList.filter(a => a.checked == true);
    var model = {};
    model['availability'] = [];
    model['availability'] = daylist;

    let url = "users";
    let method = "PATCH";

    try {
      this.btnDisable = true;
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
        .then((data: any) => {
          
          this.btnDisable = false;
          super.showNotification("top", "right", "Record updated !!", "success");
          // this.updateRecord.emit(res);
        });
    } catch (e) {
      this.btnDisable = false;
      super.showNotification("top", "right", "Something went wrong !!", "danger");
    }
  }


  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

}
