import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';
import { Location } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { any } from 'joi';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-customer-notifications',
  templateUrl: './customer-notifications.component.html',
  styles: []
})
export class CustomerNotificationsComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  workflowslist: any[] = [];

  disableBtn: boolean;
  isLoadingData: boolean;
  formdataLists: any[] = [];

  constructor(
    private location: Location,
    private _route: ActivatedRoute,
    public _commonService: CommonService,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    })
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getWorkflowsList();
      await this.getFormdatas();
      await this.workfloeWiseRoles();
    } catch (error) {
      console.error(error);
      this.isLoadingData = false;
    } finally {
      this.isLoadingData = false;
    }
  }

  async initializeVariables() {
    this.formdataLists = [];
    return;
  }

  async getWorkflowsList() {
    let method = "POST";
    let url = "workflows/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "property.workflowtype", "searchvalue": "external", "criteria": "eq" });
    postData["search"].push({ "searchfield": "solutiontype", "searchvalue": this._loginUser.branchid.solutiontype, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.workflowslist = data.filter(p => p.solutiontype.includes(this._loginUser.branchid.solutiontype));
          this.workflowslist.map((wfl) => {
            wfl.communicationid = wfl.action.email[0]._id;
          })
        }
      }, (error) => {
        console.error(error);
      })
  }

  getFormdatas() {
    let method = "POST";
    let url = "formdatas/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": ["active", "deleted", "inactive"], "criteria": "in" });
    postData["search"].push({ "searchfield": "formid", "searchvalue": "622c81e045a25d0ff86b3f22", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.formdataLists = [];
          this.formdataLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async workfloeWiseRoles() {

    if (this.workflowslist && this.workflowslist.length > 0) {

      for (let i = 0; i < this.workflowslist.length; i++) {

        var element = this.workflowslist[i];
        if (this.formdataLists && this.formdataLists.length > 0) {

          var formdataObj = this.formdataLists.find(p => p?.property?.workflowid == element._id);
          if (formdataObj) {
            element.checked = true;
          }
        }
      }
    }
    return;
  }

  async onToggle(event: any, item: any) {
    var url = "formdatas";
    var method = "POST";

    if (this.formdataLists && this.formdataLists.length > 0) {
      var formdataObj = this.formdataLists.find(p => p?.property?.workflowid == item._id);
      if (formdataObj) {
        var url = "formdatas/" + formdataObj._id;
        var method = "PATCH";
      }
    }

    if (event.checked) {

      let obj = {};
      obj["onModel"] = "User";
      obj["onModelAddedby"] = "User";
      obj["formid"] = "622c81e045a25d0ff86b3f22";
      obj["property"] = {};
      obj["property"]["workflowid"] = item._id;
      obj["contextid"] = item.action.email[0]._id;
      obj["status"] = "active";

      await this.saveData(url, method, obj);

    } else {

      let obj = {};
      obj["property"] = {};
      obj["property"]["workflowid"] = item._id;
      obj["contextid"] = item.action.email[0]._id;
      obj["status"] = "inactive";

      await this.saveData(url, method, obj);
    }
  }

  async saveData(url: any, method: any, postData: any) {
    this.disableBtn = true;
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.disableBtn = false;
        if (data) {
          this.showNotification('top', 'right', 'Customer Notification has been updated successfully', 'success');
          this.ngOnInit();
        }
      }, (error) => {
        this.disableBtn = false;
        console.error(error);
      });
  }

  cancel() {
    this.location.back();
  }

}

