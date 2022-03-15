import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';
import { Location } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-internal-notifications',
  templateUrl: './internal-notifications.component.html',
  styles: []
})
export class InternalNotificationsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  workflowslist: any[] = [];
  roleList: any;
  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean;
  isLoadingData: boolean = false;
  formdataLists: any[] = [];

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {
    super();
  }

  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getWorkflowsList();
      await this.getRoleList();
      await this.getFormdatas()
      await this.workfloeWiseRoles();
      this.isLoadingData = false;

    } catch (error) {
      console.error(error);
      this.isLoadingData = false;
    } finally {
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
    postData["search"].push({ "searchfield": "property.workflowtype", "searchvalue": "internal", "criteria": "eq" });
    postData["search"].push({ "searchfield": "solutiontype", "searchvalue": this._loginUser.branchid.solutiontype, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.isLoadingData = true;
          this.workflowslist = data.filter(p => p.solutiontype.includes(this._loginUser.branchid.solutiontype));
          this.isLoadingData = false;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async getRoleList() {
    let method = "POST";
    let url = "roles/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "solutiontype", "searchvalue": this._loginUser.branchid.solutiontype, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.roleList = data;
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
    postData["search"].push({ "searchfield": "status", "searchvalue": ["active", "deleted"], "criteria": "in" });
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
    const group: any = {};

    if (this.workflowslist && this.workflowslist.length > 0) {

      for (let i = 0; i < this.workflowslist.length; i++) {

        var element = this.workflowslist[i];
        var id = '';
        var roles = [];
        var status: boolean = true;

        if (this.formdataLists && this.formdataLists.length > 0) {
          var formdataObj = this.formdataLists.find(p => p?.property?.workflowid == element._id);
          if (formdataObj) {
            id = formdataObj._id;
            roles = formdataObj.property.roles;
            if (formdataObj.status == "deleted") {
              status = false;
            }
          }
        }

        group[element._id] = this.fb.group({
          'id': [id],
          'toggle': new FormControl(status),
          'roles': [roles],
          'workflowid': [element._id]
        })

      }
      this.form = this.fb.group(group);
    }
    return;
  }

  async onSubmit(value: any, isValid: boolean) {

    this.submitted = true;

    if (!isValid) {
      return false;
    } else {

      if (this.workflowslist && this.workflowslist.length > 0) {

        for (let i = 0; i < this.workflowslist.length; i++) {

          var element = this.workflowslist[i];
          if (this.form.controls[element._id].value.toggle == true) {

            let obj = {};
            obj["onModel"] = "User";
            obj["onModelAddedby"] = "User";
            obj["formid"] = "622c81e045a25d0ff86b3f22";
            obj["property"] = {};
            obj["property"]["roles"] = this.form.controls[element._id].value.roles;
            obj["property"]["workflowid"] = element._id;
            obj["contextid"] = element.action.email[0]._id;
            obj["status"] = "active";

            if (this.form.controls[element._id].value.id == '') {
              var url = "formdatas"
              var method = "POST";
            } else {
              var url = "formdatas/" + this.form.controls[element._id].value.id;
              var method = "PUT";
            }
            await this.saveData(url, method, obj);
          } else {

            if (this.form.controls[element._id].value.id !== '') {

              var url = "formdatas/" + this.form.controls[element._id].value.id;
              var method = "PATCH";

              let obj = {};
              obj["property"] = {};
              obj["property"]["roles"] = [];
              obj["property"]["workflowid"] = element._id;
              obj["contextid"] = element.action.email[0]._id;
              obj["status"] = "deleted";

              await this.saveData(url, method, obj);
            }
          }
        }
        this.showNotification('top', 'right', 'Internal Notification has been updated successfully', 'success');
        this.ngOnInit();
      }
      return;
    }
  }

  async saveData(url: any, method: any, postData: any) {
    this.disableBtn = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.disableBtn = false;
        if (data) {
          this.getFormdatas();
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

