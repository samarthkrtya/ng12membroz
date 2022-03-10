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
  selector: 'app-lead-profile',
  templateUrl: './lead-profile.component.html',
  styles: [
    `

    .example-tree-invisible {
      display: none;
    }

    .example-tree ul,
    .example-tree li {
      margin-top: 0;
      margin-bottom: 0;
      list-style-type: none;
    }

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
export class LeadProfileComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  _formId: string;

  dataHtml: string;
  dataContent: any = {};

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  showdispForm = false;

  checktoallowParams: any;

  actionselected: any;

  profileVisibility: boolean = true;
  timelineVisibility: boolean = false;
  communicationVisibility: boolean = false;
  //activitylogVisibility: boolean = false;

  stageLists: any [] = [];
  currentStage: any;

  sendMessageVisibility: boolean = false;

  functionPermission: any[] = [];
  userLists: any[] = [];
  desginationWiseUser: any [] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {
    super()
    this.pagename="app-lead-profile";

    this._route.params.forEach((params) => {

      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "59f430a7bd4e4bb2fb72ec7d";
      this.contentVisibility = false;
      this.itemVisbility = false;

    })




  }

  async ngOnInit() {
    
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.loadStages()
        await this.LoadData();
        await this.LoadUser();
      } catch(err) {
        console.error(err);
      } finally {

      }
    })

    this._route.queryParams.subscribe(params => {

      if(params['tab'] && params['tab'] !== "") {

        setTimeout(() => {
          $("#activitylog-button").click()
        }, 2000);

      }
    });
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {

    this.dataContent = {};
    this.contentVisibility = false;


    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == this.formObj['formname'])
      
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }

    this.actionselected = "profile";

    this.profileVisibility = true;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    //this.activitylogVisibility = false;

    this.stageLists = [];
    this.currentStage = "";

    this.sendMessageVisibility = false;
    this.userLists = [];
    this.desginationWiseUser = [];

    return;
  }

  async LoadData() {

    this.contentVisibility = false;

    let method = "POST";
    let url = "enquiries/filter/view";
    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria":"eq" });

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{

        console.log("data", data);

        if(data) {

          this.dataContent = data[0];

          if(this.dataContent && this.dataContent.stage) this.currentStage = this.dataContent.stage;
          this.contentVisibility = true;
          this.itemVisbility = true;
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  async LoadUser() {

    let method = "POST";
    let url = "users/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{

        if(data && data[0]) {

          this.userLists = [];
          this.userLists = data;


          data.forEach(element => {

            if(element.designationid) {
              if(!this.desginationWiseUser[element.designationid._id]) {
                this.desginationWiseUser[element.designationid._id] = [];
                this.desginationWiseUser[element.designationid._id]['desginationid'] = {};
                this.desginationWiseUser[element.designationid._id]['userid'] = [];
                this.desginationWiseUser[element.designationid._id]['desginationid'] = element.designationid;
              }
      
              let obj: any;
              obj = this.desginationWiseUser[element.designationid._id]['userid'].find(p => p._id == element._id);
              
              if (!obj) {
                this.desginationWiseUser[element.designationid._id]['userid'].push(element);
              }
            }
          })

          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  buttonToggle(type: string) {
    if(type == "profile") {
      this.profileVisibility = true;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      //this.activitylogVisibility = false;
    } else if (type == "timeline") {
      this.profileVisibility = false;
      this.timelineVisibility = true;
      this.communicationVisibility = false;
      //this.activitylogVisibility = false;
    } else if (type == "communication") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = true;
      //this.activitylogVisibility = false;
     } 
    // else if (type == "activitylog") {
    //   this.profileVisibility = false;
    //   this.timelineVisibility = false;
    //   this.communicationVisibility = false;
    //   this.activitylogVisibility = true;
    // }
  }

  getSubmittedItemListsData(submitData: any) {
    if(submitData && submitData.bindData &&  submitData.bindData._id) this.bindId =  submitData.bindData._id;
    this.ngOnInit();
  }

  async sendMessage() {
    this.sendMessageVisibility = true;
  }

  getSubmittedCloseMessageData(submitData: any) {
    $("#closeform").click();
  }

  assignTo() {

    const varTemp = this;

    var string= '';
    for (var key in this.desginationWiseUser) {
      // code block to be executed
      if (this.desginationWiseUser.hasOwnProperty(key)) {
        var designation = this.desginationWiseUser[key]["desginationid"]["title"];
        string += '<optgroup label="' + designation + '">';
          if(this.desginationWiseUser[key]["userid"] && this.desginationWiseUser[key]["userid"].length > 0) {
            this.desginationWiseUser[key]["userid"].forEach(element => {
              
              var selected = "";
              
              if(this.dataContent.handler && this.dataContent.handler._id && this.dataContent.handler._id == element._id) {
                selected = "selected";
              }
              
              string += '<option value="'+ element._id +'"  '+ selected +'>'+ element.fullname +'</option>';
            });
          }
        string += '</optgroup>';
      }
    }

    swal.fire({
      title: 'Handler',
      html: '<div class="form-group">' +
              '<select id="input-field" class="form-control">'+ 
                '<option value="">None</option>'+
                ' "'+ string +'" '+
              '</select>'+
            '</div>',
      showCancelButton: true,
      customClass:{
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false
    }).then(function(result) {

      if (result.value) {

        var handlerid =$('#input-field').val();
        console.log("handelerid", handlerid)

        if(handlerid !== '') {
          let actionType = "handlerid";
          let actionValue = handlerid  
          varTemp.updateLead(actionType, actionValue, false)
        } 

      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Action is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
      
    });

  }

  salesWon() {

    const varTemp = this;

    swal.fire({
      title: `Are you sure want to Sales Won ?`,
      text: 'You will not be able to recover this Action !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Convert it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {

      if (result.value) {

        let method = "POST";

        let url = "prospects";

        let actionType = "status";
        let actionValue = "SALE WON"

        let postData =  {};
        postData["property"] = {};
        postData["property"] = varTemp.dataContent.property;
        postData["fullname"] = varTemp.dataContent.fullname;
        postData["stage"] = varTemp.dataContent.stage;
        postData["status"] = "SALE WON";
        postData["handlerid"] = varTemp.dataContent.handler._id ? varTemp.dataContent.handler._id : varTemp.dataContent.handler;
        postData["campaignid"] = varTemp.dataContent && varTemp.dataContent.campaign && varTemp.dataContent.campaign._id ? varTemp.dataContent.campaign._id : varTemp.dataContent.campaign;
        

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any)=>{
            if(data) {
              varTemp.updateLead(actionType, actionValue, false)
              varTemp._router.navigate(['/pages/customer-module/conversion/' + data._id]);
              return;
            }
          }, (error)=>{
            console.error(error);
        })


      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Action is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  convert(type: any) {

    const varTemp = this;

    swal.fire({
      title: `Are you sure want to convert to ${type} ?`,
      text: 'You will not be able to recover this Action !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Convert it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {

      if (result.value) {

        let method = "POST";
        let url = "prospects";
        let actionType = "prospectid";

        let postData =  {};
        postData["property"] = {};
        postData["property"] = varTemp.dataContent.property;
        postData["fullname"] = varTemp.dataContent.fullname;
        postData["stage"] = varTemp.dataContent.stage;
        

        if(type == "Member") {
          postData["role"] = "59c1fb52b985482b2c610cee";
          url = "members";
          actionType = "memberid";
        }

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then((data: any)=>{
            if(data) {
              varTemp.updateLead(actionType, data._id, false)
              if(type == "Member") {
                varTemp._router.navigate(['/pages/members/profile/' + data._id]);
              } else {
                varTemp._router.navigate(['/pages/customer-module/profile/' + data._id]);
              }
              return;
            }
          }, (error)=>{
            console.error(error);
        })


      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Action is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  async updateLead(type: any, value: any, isRefresh: boolean) {

    console.log("updateLead called");

    let method = "PATCH";
    let url = "enquiries/" + this.dataContent._id;

    let postData =  {};
    postData[type] = value;

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          
          console.log("data", data);

          if(isRefresh) {
            

            swal.fire({
              title: 'WON!',
              text: 'Your Action has been WON.',
              icon: 'success',
              customClass:{
                confirmButton: "btn btn-success",
              },
              buttonsStyling: false
            });

          } else {

            swal.fire({
              title: 'Success',
              text: 'Your data has been Updated Successfully!!!.',
              icon: 'success',
              customClass:{
                confirmButton: "btn btn-success",
              },
              buttonsStyling: false
            });

            this.ngOnInit()

          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  getSubmittedOpenActivityData(submitData: any) {

    if(submitData && submitData.panelOpenState && submitData.panelOpenState == true) {

      document.querySelector('.main-panel').scrollTop = 1000000;
    } else {
      this.ngOnInit();
    }


  }

  getSubmittedCloseActivityData(submitData: any) {
    if(submitData && submitData.panelOpenState && submitData.panelOpenState == true) {

      document.querySelector('.main-panel').scrollTop = 1000000;
    } else {
      this.ngOnInit();
    }
  }

  getSubmittedNotesData(submitData: any) {
    
    this.ngOnInit();
  }


  getSubmittedAttachmentData(event : any){ 
    this.ngOnInit();
  }









  async loadStages() {

    let method = "POST";
    let url = "lookups/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "enquirystage", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        if(data) {
          this.stageLists = data[0]['data'];
          if(this.stageLists && this.stageLists.length > 0) this.currentStage = this.stageLists[0]["name"];
          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  async stageClick(item: any) {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Chnage it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        varTemp.updateLead("stage", item.code, true);
      } else {
        swal.fire({
            title: 'Cancelled',
            text: 'Your Action is safe :)',
            icon: 'error',
            customClass:{
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
        });
      }
    })
  }

  onCloseResendData(submitData: any) {
    this.ngOnInit();
    setTimeout(() => {
      this.buttonToggle('communication')  
      this.actionselected = "communication"
    }, 1000);
  }

}
