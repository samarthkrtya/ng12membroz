import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { CommonDataService } from '../../../../core/services/common/common-data.service';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-asset-profile',
  templateUrl: './asset-profile.component.html',
  styles: [
  ]
})
export class AssetProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  dataContent: any = {};

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  tabPermission: any[] = [];  
  functionPermission: any[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
  ) {

    super();

    this.pagename = "app-asset-profile";

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "5feea434ebb5252eb8510cd7";
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
      } catch (err) {
        console.error(err);
      } finally {
      }
    })
  }

  async initializeVariables() {
    this.dataContent = {};
    this.contentVisibility = false;    
    this.tabPermission = [];

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var assetObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      console.log("assetObj", assetObj)
      if (assetObj && assetObj.tabpermission) {
        this.tabPermission = assetObj.tabpermission;
      }

      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    this.contentVisibility = false;

    let method = "POST";
    let url = "assets/view/filter";

    let postData = {};
    postData["search"] = [];
    postData["formname"] =  this.formObj.formname;
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          
          this.dataContent = data[0];

          this.contentVisibility = true;
          this.itemVisbility = true;
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  ngAfterViewInit() {
    
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async getAvailabilityConfigurationData(submitData: any) {
    this.ngOnInit();
  }

}
