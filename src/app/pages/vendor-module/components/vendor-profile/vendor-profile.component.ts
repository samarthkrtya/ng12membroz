import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styles: [
    `
      /* Global CSS, you probably don't need that */

.clearfix:after {
    clear: both;
    content: "";
    display: block;
    height: 0;
}

.container {
	font-family: 'Lato', sans-serif;
	width: 1000px;
	margin: 0 auto;
}

.wrapper {
	display: table-cell;
	height: 400px;
	vertical-align: middle;
}

.nav {
	margin-top: 40px;
}

.pull-right {
	float: right;
}

a, a:active {
	color: #333;
	text-decoration: none;
}

a:hover {   
	color: #999;
}

/* Breadcrups CSS */

.arrow-steps .step {
	font-size: 14px;
	text-align: center;
	color: #666;
	cursor: default;
	margin: 0 3px;
	padding: 10px 10px 10px 30px;
	min-width: 180px;
	float: left;
	position: relative;
	background-color: #d9e3f7;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
  transition: background-color 0.2s ease;
}

.arrow-steps .step:after,
.arrow-steps .step:before {
	content: " ";
	position: absolute;
	top: 0;
	right: -17px;
	width: 0;
	height: 0;
	border-top: 19px solid transparent;
	border-bottom: 17px solid transparent;
	border-left: 17px solid #d9e3f7;
	z-index: 2;
  transition: border-color 0.2s ease;
}

.arrow-steps .step:before {
	right: auto;
	left: 0;
	border-left: 17px solid #fff;
	z-index: 0;
}

.arrow-steps .step:first-child:before {
	border: none;
}

.arrow-steps .step:first-child {
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
}

.arrow-steps .step span {
	position: relative;
}

.arrow-steps .step span:before {
	opacity: 0;
	content: "✔";
	position: absolute;
	top: -2px;
	left: -20px;
}

.arrow-steps .step.done span:before {
	opacity: 1;
	-webkit-transition: opacity 0.3s ease 0.5s;
	-moz-transition: opacity 0.3s ease 0.5s;
	-ms-transition: opacity 0.3s ease 0.5s;
	transition: opacity 0.3s ease 0.5s;
}

.arrow-steps .step.current {
	color: #fff;
	background-color: #23468c;
}

.arrow-steps .step.current:after {
	border-left: 17px solid #23468c;
}
    `
  ]
})
export class VendorProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  _formId: string;

  dataHtml: string;
  dataContent: any = {};

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  actionselected: any;

  profileVisibility: boolean = true;
  timelineVisibility: boolean = false;
  communicationVisibility: boolean = false;
  activitylogVisibility: boolean = false;
  walletVisibility: boolean = false;

  stageLists: any[] = [];
  currentStage: any;

  sendMessageVisibility: boolean = false;

  panelOpenState: boolean = false;

  tabPermission: any[] = [];
  functionPermission: any[] = [];

  reloadingStr: string = "";
  bindId: string

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()
    this.pagename = "app-vendor-profile";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "5ce627413ed3261df443e37b";
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

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async initializeVariables() {

    this.dataContent = {};
    this.contentVisibility = false;
    this.actionselected = "profile";

    this.profileVisibility = true;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = false;


    this.stageLists = [];
    this.currentStage = "";

    this.sendMessageVisibility = false;

    this.panelOpenState = false;

    this.tabPermission = [];

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == "vendor")
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == "vendor")
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }

    return;
  }

  buttonToggle(type: string) {
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = false;
    if (type == "profile") {
      this.profileVisibility = true;
    } else if (type == "timeline") {
      this.timelineVisibility = true;
    } else if (type == "communication") {
      this.communicationVisibility = true;
    } else if (type == "activitylog") {
      this.activitylogVisibility = true;
    } else if (type == "wallettxn") {
      this.walletVisibility = true;
    }
  }

  async LoadData() {
    let method = "POST";
    let url = "vendors/view/filter";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {

        if (data) {
          this.dataContent = data[0];
          if (this.dataContent && this.dataContent.stage) this.currentStage = this.dataContent.stage;
          this.contentVisibility = true;
          this.itemVisbility = true;
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  getSubmittedOpenActivityData(submitData: any) {

    if (submitData && submitData.panelOpenState && submitData.panelOpenState == true) {
      if (this.panelOpenState) {
        this.panelOpenState = false;
      }
      setTimeout(() => {
        this.panelOpenState = true;
        this.actionselected = "activitylog";
        this.buttonToggle('activitylog')
      });
    } else {
      this.ngOnInit();
    }
  }

  getSubmittedCloseActivityData(submitData: any) {

    if (submitData && submitData.panelOpenState && submitData.panelOpenState == true) {
      if (this.panelOpenState) {
        this.panelOpenState = false;
      }
      setTimeout(() => {
        this.panelOpenState = true;
      });
    } else {
      this.ngOnInit();
    }
  }


  getSubmittedData(submitData: any) {

    this._router.navigate([`/pages/payment-module/multiple-payment/${submitData.memberid}/${submitData.membershipid}`]);
    // this.ngOnInit();
  }

  getSubmittedDynamicData(submitData: any) {

    if (submitData) {
      this.reloadingStr = submitData.tabStr;
      this.LoadData();
    }
  }


  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id)
      this.bindId = submitData.bindData._id;

    this.ngOnInit();
  }

  async sendMessage() {
    this.sendMessageVisibility = true;
  }

  getSubmittedCloseMessageData(submitData: any) {
    $("#closeform").click();
  }

  updateVendor(type: any, value: any, isRefresh: boolean) {

    let method = "PATCH";
    let url = "vendors/" + this.dataContent._id;

    let postData = {};
    postData[type] = value;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          if (isRefresh) {
            this.ngOnInit()

            swal.fire({
              title: 'Changed!',
              text: 'Your Action has been changed.',
              icon: 'success',
              customClass: {
                confirmButton: "btn btn-success",
              },
              buttonsStyling: false
            });

          }

          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  stageClick(item: any) {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Chnage it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        varTemp.updateVendor("stage", item.code, true);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Action is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  async getSubmittedAssetData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedNotesData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedAttachmentData(submitData: any) {
    this.ngOnInit();
  }

  onCloseResendData(submitData: any) {
    this.ngOnInit();
    setTimeout(() => {
      this.buttonToggle('communication')
      this.actionselected = "communication"
    }, 1000);
  }

}
