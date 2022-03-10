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
  selector: 'app-campaign-profile',
  templateUrl: './campaign-profile.component.html',
  styles: [
  ]
})
export class CampaignProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  _formId: string;

  dataContent: any = {};

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  profileVisibility: boolean = true;
  timelineVisibility: boolean = false;
  
  actionselected: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  _promotionformId = "59f430a7bd4e4bb2fb72ec7d";

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) { 
    super()
    this.pagename="app-campaign-profile";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "5b03b38e0f6ecd0d28ea062b";
      this.contentVisibility = false;
      this.itemVisbility = false;
      
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
    this.dataContent = {};
    this.contentVisibility = false;
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.actionselected = "profile";
    return;
  }

  async LoadData() {
    this.contentVisibility = false;
    
    let method = "POST";
    let url = "campaigns/filter/view";
    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria":"eq" });

    

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {

          

          this.dataContent = data[0];
          
          this.contentVisibility = true;
          this.itemVisbility = true;

          this.profileVisibility = true;
          this.timelineVisibility = false;

          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  getSubmittedItemListsData(submitData: any) {
    if(submitData && submitData.bindData &&  submitData.bindData._id) this.bindId =  submitData.bindData._id;
    this.ngOnInit();
  }

  getSubmittedLeadData(submitData: any) {
    this.ngOnInit();
  }

  buttonToggle(type: string) {
    if(type == "profile") {
      this.profileVisibility = true;
      this.timelineVisibility = false;
    } else if (type == "timeline") {
      this.profileVisibility = false;
      this.timelineVisibility = true;
    } 
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }
}
