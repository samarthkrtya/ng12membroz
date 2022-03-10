import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;

@Component({
  selector: 'app-inspection-job-status-change',
  templateUrl: './inspection-job-status-change.component.html',
  styles: [
  ]
})
export class InspectionJobStatusChangeComponent extends BaseLiteComponemntComponent implements OnInit   {

  destroy$: Subject<boolean> = new Subject<boolean>();

  joborder: any;
  isLoading: boolean = false;

  constructor(
    private _commonService: CommonService
  ) {
    super()
  }

  @Input() joborderid: any;
  @Input() bindId: any;
  @Output() onStatusChangeData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.loadData()
    } catch(error) {
      console.error(error)
    } finally {
    }
  }


  async initializeVariables() {
    this.isLoading = false;
    this.joborder = {};
    return;
  }

  async loadData() {

    var url = "joborders/filter/view"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "_id", "searchvalue": this.joborderid, "criteria": "eq"});
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data && data[0]){

          this.joborder = {};
          this.joborder = data[0];
          
          this.joborder.services.forEach(element => {

            element.selectedAssignee = element && element.assignee && element.assignee._id ? element.assignee._id : null;

            var activity = this.joborder.activities.find(p=>p.serviceid == element.refid._id)
            if(activity) {
              element.activity = activity;
              element.taskStatus = false;
              if(element.activity.status == 'completed') {
                element.taskStatus = true;
              } 
            }
          });

          $("#statusChangeBtn").click()

          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  setValue(i: any, e: any){
    var serviceObj = this.joborder.services.find(p=>p._id == i._id);
    if(serviceObj){
      if(e.checked){
        serviceObj.taskStatus = true;
      } else {
        serviceObj.taskStatus = false;
      }
    } 
  }

  save() {
    if(this.joborder && this.joborder.services && this.joborder.services.length > 0) {

      this.isLoading = true;

      this.joborder.services.forEach(element => {
        if(element.selectedAssignee) {
          element.assignee = element.selectedAssignee
        }
        element.refid = element.refid._id;

        this.updateActivity(element.activity, element.taskStatus)
      });

      var url = "joborders"
      var method = "PATCH";

      var model = {};
      model["services"] = [];
      model["services"] = this.joborder.services;
      if(this.joborder.status == "completed") {
        model["status"] = this.joborder.status;
      }

      console.log("model", model);
  
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.joborder._id)
        .then( (data: any) => {
          if(data){
            this.showNotification('top', 'right', 'Job Order has been updated Successfully!!!', 'success');
            $("#statusCloseBtn").click();
            this.isLoading = false;
            setTimeout(() => {
              this.onStatusChangeData.emit();
            }, 1000);
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  saveAndCompleted() {
    
    if(this.joborder && this.joborder.services && this.joborder.services.length > 0) {
      
      this.isLoading = true;

      var valid = true;
      this.joborder.services.forEach(element => {
        if(element.taskStatus == false) {
          valid = false;
        }
      });

      if(valid == true) {
        this.joborder.status = "completed"
        this.save()
      } else {
        this.isLoading = false;
        this.showNotification('top', 'right', 'Validation failed!!', 'danger');
        return;
        
      }
    }
  }

  updateActivity(obj: any, status: any) {

    if(status) {

      var url = "activities"
      var method = "PATCH";

      var model = {};
      model["status"] = "completed";
  
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, obj._id)
        .then( (data: any) => {
          if(data){
            

            return;
          }
      }, (error) =>{
        console.error(error);
      });

    }
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
