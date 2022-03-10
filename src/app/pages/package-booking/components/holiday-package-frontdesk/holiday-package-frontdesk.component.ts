import { Component,  OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { CommonDataService } from '../../../../core/services/common/common-data.service';

import * as moment from 'moment';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-holiday-package-frontdesk',
  templateUrl: './holiday-package-frontdesk.component.html'
})
export class HolidayPackageFrontdeskComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  packageList : any[] = [];

  packageGrpList : any[] = [];
  openpackageGrpList : any[] = [];
  runningpackageGrpList : any[] = [];
  closepackageGrpList : any[] = [];

  isLoadingdata : boolean = false;
  disableBtn : boolean = false;

  today : Date = new Date();
 
  constructor(
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }
 
  async ngOnInit() {
    try{
      this.isLoadingdata = true;
      await this.getPackageById();
      this.isLoadingdata = false;
    }catch(e){
      console.error(e);
    }
  }
  
  async getPackageById(){
    
    var url = "tourpackages/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": ["active", "publish"], "criteria": "in", "datatype": "text" });
    
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          var allPackages = [];
          allPackages = data;
          allPackages.map((a=>{
            a.sortduration = `${a.duration.split("/")[0].substr(0,1)}D/${a.duration.split("/")[1].substr(0,1)}N`
          }))
          this.packageList = [];
          this.packageGrpList = [];

          this.packageList = allPackages.filter(a=>a.status == 'active');
          var todaydate = new Date(this.today.getFullYear(),this.today.getMonth(),this.today.getDate());
          var opnpublishPacakge = allPackages.filter((a)=>{  // 17/7/2017  > 10/7/2017
            if(!a.traveldate)return;
             let date = moment(new Date(a.traveldate));
             return a.status == 'publish' && date.isAfter(moment(todaydate))
          });
          
          var runningpublishPacakge = allPackages.filter((a)=>{   // 17/7/2017  == 17/7/2017
            if(!a.traveldate)return;
            let date = moment(new Date(a.traveldate));
              return  a.status == 'publish' && date.isSame(moment(todaydate))
          });
          
          var closepublishPacakge = allPackages.filter((a)=>{   //17/7/2017  < 20/7/2017
            if(!a.traveldate)return;
              let date = moment(new Date(a.traveldate));
             return a.status == 'publish' && date.isBefore(moment(todaydate))
          });
          
          this.packageGrpList = this.groupBy(this.packageList,'packagetype');
          this.openpackageGrpList = this.groupBy(opnpublishPacakge,'packagetype');
          this.runningpackageGrpList = this.groupBy(runningpublishPacakge,'packagetype');
          this.closepackageGrpList = this.groupBy(closepublishPacakge,'packagetype');
        }
      });
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

  viewBookings(id : any){
    
    this._commonDataService.isfilterDataForGlobalSearch = true;
    this._commonDataService.filterDataForGlobalSearchparams = {};
    this._commonDataService.filterDataForGlobalSearchparams['search'] = [];
    this._commonDataService.filterDataForGlobalSearchparams['search'].push({ "searchfield": "package", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" });

    this._router.navigate(['/pages/dynamic-list/list/packagebooking']);
  }


  cancelTP(scheduletp : any){
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancelled it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async (result) => {
      if (result.value) {
        if(scheduletp.bookedcapacity > 0){
          this.showNotification('top', 'right', 'Please cancel booking first !!', 'danger');
        }else{
            
        var url = "common/updatestatus";
        var method = "POST";

        let model = {
          'ids' : [scheduletp._id],
          'schemaname' : "tourpackages",
          'value' : "cancelled",
        };

        await this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model)
          .then((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'Schedule package cancelled successfully !!', 'success');
              this.ngOnInit();
            }
          });
        }
      }
    }); 
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }    
}