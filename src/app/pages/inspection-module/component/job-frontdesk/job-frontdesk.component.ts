import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import { AddCustomNotesComponent } from '../../../../shared/custom-notes/components/add-custom-notes/add-custom-notes.component';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {map, startWith} from 'rxjs/operators';

declare var $: any;
import swal from 'sweetalert2';
import { DefaultValueAccessor, FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-job-frontdesk',
  templateUrl: './job-frontdesk.component.html',
  
  styles: [
  ]
})
export class JobFrontdeskComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit, AfterViewInit  {

  @ViewChild('customnotes', { static: false }) CustomNotescmp: AddCustomNotesComponent;

  destroy$: Subject<boolean> = new Subject<boolean>();

  ishidemorebutton: boolean = false;

  joborderLists: any [] = [];

  statusPopupActive: boolean = false;

  selectedJoborder: any = {};

  filteredItems: any [] = [];

  search: any;
  status: any;
  

  statusList: any[] = [
    { code: 'completed', value: "Completed" },
    { code: 'inprogress', value: "In Progress" },
    { code: 'active', value: "Not Started" },
    { code: 'onhold', value: "On Hold" },
  ];

  range = new FormGroup({ start: new FormControl(), end: new FormControl() });


  constructor() { 
    super()
  }

  async ngOnInit() {

    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
      await this.assignCopy();//when you fetch collection from server.
    } catch(error) {
      console.error(error)
    } finally {
    }
  }

  ngAfterViewInit() {
    
  }

  statusFilterChange(value: any) {
    this.search = value;
    this.applyFilter()
  }
  applyFilter() {

    
    if((this.search == '') && ((this.range.value.start == null) || (this.range.value.end == null))){
      this.assignCopy();
      
    } else {

      if(this.range.value.start !== null && this.range.value.end !== null) {

        var fromDate = new Date(this.range.value.start);
        var toDate = new Date(this.range.value.end);
  
      
        this.filteredItems = Object.assign([], this.joborderLists).filter(
          item => (
            (
              (item.docnumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
              (item.customername.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
              (item.assetname.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
              (item.status.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
              (item.vehiclenumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
              (item.customernumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1)) && 
              (new Date(item.date).getTime() >= fromDate.getTime() && new Date(item.date).getTime() <= toDate.getTime()) 
            )
        )
  
      } else {
  
        this.filteredItems = Object.assign([], this.joborderLists).filter(
          item => (
            (item.docnumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
            (item.customername.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
            (item.assetname.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
            (item.status.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
            (item.vehiclenumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1) || 
            (item.customernumber.toLowerCase().indexOf(this.search.toLowerCase()) > -1))
        )
      }
    }

    

  }

  async assignCopy() {
    this.filteredItems = Object.assign([], this.joborderLists);
  }

  
  Save(){}
  Update(){}
  Delete(){}
  ActionCall(){}

  async initializeVariables() {
    this.joborderLists = [];
    this.statusPopupActive = false;
    this.selectedJoborder = {};
    this.filteredItems = [];
    this.search = "";
    return;
  }

  async LoadData(){

    
    var url = "joborders/filter/view"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    //postData["search"].push({"searchfield": "status", "searchvalue": "deleted", "criteria": "ne"});
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {

        if(data && data[0]) {
          this.joborderLists = [];
          this.joborderLists = data;
          this.joborderLists.forEach(ele => {

            if(ele && ele.services && ele.services.length > 0) {
              ele.services.forEach(element => {
                element.selectedAssignee = element && element.assignee && element.assignee._id ? element.assignee._id : null;


                var activity = ele.activities.find(p=>p.serviceid == element.refid._id)
                if(activity) {
                  element.activity = activity;
                  element.taskStatus = false;
                  if(element.activity.status == 'completed') {
                    element.taskStatus = true;
                  } 
                }
              });
            }

            ele.docnumber = ele.prefix + '-' + ele.jobnumber;
            ele.customername = ele?.customerid?.fullname;
            ele.assetname = ele?.assetid?.title;

            
            ele.vehiclenumber = ele && ele.assetid && ele.assetid.property && ele.assetid.property.license_plate ? ele.assetid.property.license_plate : "";
            ele.customernumber = ele && ele.customerid && ele.customerid.property && ele.customerid.property.mobile ? ele.customerid.property.mobile : "";

            var activitesTemp = ele.activities.filter(p=>p.status == "completed");
            var activityLength = activitesTemp.length;
            var serviceLength = ele.services ? ele.services.length : 0;

            ele.getcompletionPercent = 0;
            ele.getcompletionPercent = ((activityLength/serviceLength) * 100).toFixed(3);

            ele.dueStatus = this.getNumberOfDays(new Date(), new Date(ele.dueby))

          });
          
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  

  getCompleteTasksCount(activities: any) {
    var activitesTemp = activities.filter(p=>p.status == "completed");
    return activitesTemp.length;
  }

  assignTasks(joborder: any) {

    this.statusPopupActive = false;

    setTimeout(() => {
      this.selectedJoborder = {};
      this.selectedJoborder = joborder;
      this.statusPopupActive = true;
    });
    
  }

  getNumberOfDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);

    return diffInDays;
}

  getSubmittedData(submit: any) {
    this.ngOnInit();
  }

  statusChange(item: any, type: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${type} it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        if(type == 'completed' && item.services.length > 0) {
          varTemp.assignTasks(item);
        } else {

          let method = "PATCH";
          let url = "joborders/";

          var model = { 'status' : type };

          return varTemp._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, item._id)
            .then((data: any) => {
              if (data) {
                varTemp.ngOnInit();
                return;
              }
            }, (error) => {
              console.error(error);
            })
        }
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your event is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  parentCount() {
    return  0;
  }

  getSubmittedCounter(data: any) {
    console.log("getSubmittedCounter cakked", data);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
