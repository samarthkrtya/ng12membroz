import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-week-schedule-profile',
  templateUrl: './week-schedule-profile.component.html',
  styles: [
  ]
})
export class WeekScheduleProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  dataContent: any = {};

  openState: boolean = false;

  _formId = ""

  search: any []= [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()
    this.pagename="app-week-schedule-profile";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"];
    })

  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.LoadData();
      } catch(err) {
        console.error(err);
      } finally {
      }
    })
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    this.contentVisibility = false;
    this.itemVisbility = false;
    this.openState = true;

    
    return;
  }

  async LoadData() {

    let method = "POST";
    let url = "weekschedules/filter/view";

    let postData =  {};
    postData["search"] = [];
    postData["formname"] =  this.formObj.formname;
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          this.dataContent = data[0];
          
          this.search = [];
          this.search.push({ searchfield: "status", searchvalue: "active", criteria: "eq", datatype: "text" })
          this.search.push({ searchfield: "formid", searchvalue: this.dataContent.formid._id, criteria: "eq", datatype: "ObjectId" });
          this.search.push({ searchfield: "memberid", searchvalue: false, criteria: "exists", datatype: "boolean" });

          this.contentVisibility = true;
          this.itemVisbility = true;
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  getSubmittedWeekScheduleData(submitData: any) {
    this.openState = false;
    this.ngOnInit();
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }
}
