import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormControl, ValidatorFn, Validators, } from '@angular/forms';

import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { InspectionFormbuilderComponent } from './inspection-formbuilder/inspection-formbuilder.component';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import swal from 'sweetalert2';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


declare var $: any;


function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

function autocompleteStringValidator(validOptions: Array<string>): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null  /* valid option selected */
    }
    return { 'invalidAutocompleteString': { value: control.value } }
  }
}


@Component({
  selector: 'app-inspection-page',
  templateUrl: './inspection-page.component.html',
  styles: [
    `
      /* Loading Stuff Start */

/* Absolute Center Spinner */
.loading {
    position: fixed;
    z-index: 999;
    height: 2em;
    width: 2em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  
  /* Transparent Overlay */
  .loading:before {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
      background: radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0, .8));
  
    background: -webkit-radial-gradient(rgba(20, 20, 20,.8), rgba(0, 0, 0,.8));
  }
  
  /* :not(:required) hides these rules from IE9 and below */
  .loading:not(:required) {
    /* hide "loading..." text */
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
  }
  
  .loading:not(:required):after {
    content: '';
    display: block;
    font-size: 10px;
    width: 1em;
    height: 1em;
    margin-top: -0.5em;
    -webkit-animation: spinner 1500ms infinite linear;
    -moz-animation: spinner 1500ms infinite linear;
    -ms-animation: spinner 1500ms infinite linear;
    -o-animation: spinner 1500ms infinite linear;
    animation: spinner 1500ms infinite linear;
    border-radius: 0.5em;
    -webkit-box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  box-shadow: rgba(255,255,255, 0.75) 1.5em 0 0 0, rgba(255,255,255, 0.75) 1.1em 1.1em 0 0, rgba(255,255,255, 0.75) 0 1.5em 0 0, rgba(255,255,255, 0.75) -1.1em 1.1em 0 0, rgba(255,255,255, 0.75) -1.5em 0 0 0, rgba(255,255,255, 0.75) -1.1em -1.1em 0 0, rgba(255,255,255, 0.75) 0 -1.5em 0 0, rgba(255,255,255, 0.75) 1.1em -1.1em 0 0;
  }
  
  /* Animation */
  
  @-webkit-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-moz-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @-o-keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes spinner {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  /* Loading Stuff End */


  .right-aligned-header > .mat-content {
    justify-content: space-between;
}

.mat-content > mat-panel-title, .mat-content > mat-panel-description {
  flex: 0 0 auto;
}

    `
  ]
})
export class InspectionPageComponent extends BaseComponemntComponent implements OnInit {

  submitted: boolean;

  disableButton: boolean = false;

  assetControl = new FormControl('', { validators: [autocompleteObjectValidator(), Validators.required] });
  assetLists: any[] = [];
  assetFilteredOptions: Observable<string[]>;

  templateControl = new FormControl('', { validators: [autocompleteObjectValidator(), Validators.required] });
  templateLists: any[] = [];
  templateFilteredOptions: Observable<string[]>;

  selectedTemplate: any;

  memberLists: any[] = [];
  allfields: any[] = [];
  userLists: any[] = [];

  inspectionBy: any = {};

  formBuilderVisible: boolean = false;
  remark: any;
  date: Date;
  inspectionbyid: any;

  bindid: any;
  inspectionDetails: any;
  appointmentDetails: any;

  disableBtn: boolean = false;

  appointmentid: any;
  quotationid: any;
  joborderid: any;
  inspectionid: any;

  quotationDisableButton: boolean = false;
  joborderDisableButton: boolean = false;

  isEmptyTemplate: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(InspectionFormbuilderComponent) private subCompnt: InspectionFormbuilderComponent;


  constructor(
    private _route: ActivatedRoute,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this._formName = "inspection";
    })
  }

  public validation_msgs = {

    'assetControl': [
      // { type: 'invalidAutocompleteString', message: 'Asset not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Asset is required.' }
    ],
    'templateControl': [
      //{ type: 'invalidAutocompleteString', message: 'Template not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Inspection Template is required.' }
    ]
  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      try {
        if (this.bindid) {
          this.disableBtn = true
        }
        await super.ngOnInit();

        await this.initializeVariables()
        await this.getAssets()
        await this.getMembers()
        await this.getChecklists()
        await this.getformfields()
        await this.getuserLists()
      } catch (error) {
        console.error("errr", error)
      } finally {

        if (this.bindid) {
          await this.getvehicleDetails(this.bindid);
          await this.getBookingDetails(this.bindid);
          await this.getInspectionData(this.bindid);
          await this.getCustomerDetails(this.bindId);
        }



        this.assetFilteredOptions = this.assetControl.valueChanges
          .pipe(
            startWith(''),
            map(option => typeof option === 'string' ? option : ''),
            map(option => option ? this._assetFilter(option) : this.assetLists.slice())
          );

        this.templateFilteredOptions = this.templateControl.valueChanges
          .pipe(
            startWith(''),
            map(option => typeof option === 'string' ? option : ''),
            map(option => option ? this._templateFilter(option) : this.templateLists.slice())
          );
      }
    })
  }

  async initializeVariables() {

    if (!this.bindid)
      this.disableBtn = false;

    this.memberLists = [];
    this.assetLists = [];
    this.templateLists = [];

    this.selectedTemplate = {};

    this.allfields = [];
    this.userLists = [];
    this.formBuilderVisible = false;
    this.remark = "";
    this.date = new Date();
    this.inspectionbyid = "";
    this.inspectionBy = {
      required: true,
      fieldname: "inspectionby",
      fieldtype: "form",
      search: [
        { searchfield: "status", searchvalue: "active", criteria: "eq" },
      ],
      modelValue: "inspectionby",
      form: {
        "formfield": "_id",
        "displayvalue": "fullname",
        "apiurl": "users/filter",
      },
      formname: "user",
      dbvalue: "",
      visible: true
    }
    this.inspectionDetails = {};
    this.appointmentDetails = {};

    this.disableButton = false;

    this.appointmentid = "";
    this.quotationid = "";
    this.joborderid = "";
    this.inspectionid = "";


    this.quotationDisableButton = false;
    this.joborderDisableButton = false;

    this.isEmptyTemplate = false;

    return;
  }

  async getMembers() {

    var url = "prospects/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.memberLists = [];
          this.memberLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getAssets() {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          console.log("asset data", data);
          this.assetLists = [];
          this.assetLists = data;
          this.assetLists.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getChecklists() {

    var url = "forms/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "formtype", "searchvalue": "inspection", "criteria": "eq" });
    postData["search"].push({ "searchfield": "formname", "searchvalue": "inspection", "criteria": "ne" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.templateLists = [];
          this.templateLists = data;

          if (this.templateLists.length == 0) {
            this.isEmptyTemplate = true;
          }

          this.templateLists.forEach(element => {
            element.dispalyformname = element.dispalyformname ? element.dispalyformname : element.formname
          });
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getuserLists() {

    var url = "users/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.userLists = [];
          this.userLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getvehicleDetails(id: any) {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {
          this.assetControl.setValue(data[0]);
          this.disableBtn = false;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async getBookingDetails(id: any) {

    var url = "appointments/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {

          this.appointmentDetails = {};
          this.appointmentDetails = data[0];

          this.appointmentid = this.appointmentDetails?._id;

          if (this.appointmentDetails && this.appointmentDetails.attendee) {
            this.assetControl.setValue(this.appointmentDetails.attendee)
          }

          this.disableBtn = false;

          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  async getInspectionData(id: any) {

    var url = "formdatas/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {

          this.inspectionDetails = {};
          this.inspectionDetails = data && data[0] && data[0][0] ? data[0][0] : data[0];

          this.inspectionid = this.inspectionDetails._id;

          if (this.inspectionDetails && this.inspectionDetails.contextid.customerid && (!this.inspectionDetails.contextid.customerid.fullname)) {
            var customerObj = this.memberLists.find(p => p._id == this.inspectionDetails.contextid.customerid);
            if (customerObj) {
              this.inspectionDetails.contextid.customerid = customerObj;
            }
          }

          if (this.inspectionDetails && this.inspectionDetails.contextid) {
            this.assetControl.setValue(this.inspectionDetails.contextid)
          }

          if (this.inspectionDetails && this.inspectionDetails.formid) {

            var templateObj = this.templateLists.find(p => p._id == this.inspectionDetails.formid._id);
            if (templateObj) {
              this.templateControl.setValue(templateObj)
            }
          }

          this.inspectionBy.visible = false;
          setTimeout(() => {
            this.inspectionBy.dbvalue = this.inspectionDetails.addedby;
            this.inspectionBy.visible = true;
          });

          this.date = this.inspectionDetails?.property?.date;
          this.remark = this.inspectionDetails?.property?.remark;

          this.selectedTemplate = this.inspectionDetails.formid;

          var fields = this.allfields.filter(p => (p.formid && p.formid == this.selectedTemplate._id))
          this.selectedTemplate.fields = [];
          this.selectedTemplate.fields = fields;
          this.formBuilderVisible = true;

          this.appointmentid = this.inspectionDetails?.property?.appointmentid;
          this.quotationid = this.inspectionDetails?.property?.quotationid;
          this.joborderid = this.inspectionDetails?.property?.joborderid;

          if (this.quotationid) {
            this.quotationDisableButton = true;
          }

          if (this.joborderid) {
            this.quotationDisableButton = true;
            this.joborderDisableButton = true;
          }


          this.disableBtn = false;


          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async onDelete() {
    
    if (!this.bindid) {
      swal.fire({
        title: 'Not able to delete ',
        text: 'Delete payment first !',
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Got it!',
        customClass: {
          confirmButton: "btn btn-success",
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result) {
          this._router.navigate(['pages/inspection-module/inspection']);
        }
      });
    } 
    else {
      let method = "DELETE";
      let url = "formdatas/";

      swal.fire({
        title: 'Are you sure ?',
        text: 'You will not be able to revert this !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete it!',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
      }).then(async (result) => {
        if (result.value) {

          this.disableButton = true;
          await this._commonService
            .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindid)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Schedule deleted successfully !!', 'success');
                this._router.navigate(['pages/dynamic-list/list/inspection']);
                this.disableButton = false;
              }
            }).catch((error) => {
              console.error(error);
              this.disableButton = false;
              this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
            });
        }
      });
      
    }
  }

  async getCustomerDetails(id: any) {
    var assetObj = this.assetLists.find(p => p.customerid._id == this.bindid);
    if (assetObj) {
      this.assetControl.setValue(assetObj);
      this.disableBtn = false;
    }
    //console.log("assetObj", assetObj)

    return;
  }

  private _assetFilter(value: string): string[] {
    let results;
    if (value) {
      results = this.assetLists
        .filter(option => {
          if (option.title && option.customerid && option.customerid.fullname) {
            return (option.title.toLowerCase().indexOf(value.toLowerCase()) > -1) || (option.customerid.fullname.toLowerCase().indexOf(value.toLowerCase()) > -1)
          } else if (option.title) {
            return option.title.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.assetLists.slice();
    }
    return results;
  }

  assetDisplayFn(asset: any): string {
    return asset && asset.title ? asset.title : '';
  }

  assetSelected(option: any) {
    this.assetControl.setValue(option.value);
  }

  enterAsset() {
    const controlValue = this.assetControl.value;
    this.assetControl.setValue(controlValue);
  }

  preloadAsset() {
    if (this.assetLists && this.assetLists.length == 0) {
      this.getAssets()
    }
  }

  handleEmptyAssetInput(event: any) {
    if (event.target.value === '') {
      this.assetControl.setValue("");
      this.assetLists = [];
      this.assetLists = [];
    }
  }

  private _templateFilter(value: string): string[] {
    let results;
    if (value) {
      results = this.templateLists.filter(option => {
        if (option.dispalyformname) {
          return option.dispalyformname.toLowerCase().indexOf(value.toLowerCase()) === 0
        } else {
          return;
        }
      });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.templateLists.slice();
    }
    return results;
  }

  templateDisplayFn(template: any): string {
    return template && template.dispalyformname ? template.dispalyformname : '';
  }

  templateSelected(option: any) {
    this.templateControl.setValue(option.value);

    this.formBuilderVisible = false;


    this.selectedTemplate = {};
    this.selectedTemplate = this.templateControl.value;

    var fields = this.allfields.filter(p => (p.formid && p.formid == this.selectedTemplate._id))

    this.selectedTemplate.fields = [];
    this.selectedTemplate.fields = fields;

    setTimeout(() => {
      this.formBuilderVisible = true;
    }, 500);

  }

  enterTemplate() {
    const controlValue = this.templateControl.value;
    this.templateControl.setValue(controlValue);
  }

  preloadTemplate() {
    if (this.templateLists && this.templateLists.length == 0) {
      this.getChecklists()
    }
  }

  handleEmptyTemplateInput(event: any) {
    if (event.target.value === '') {
      this.templateControl.setValue("");
      this.templateLists = [];
    }
  }

  getformfields() {

    var url = "formfields/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["sort"] = { "formorder": -1 };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.allfields = [];
          this.allfields = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  getSubmittedData(submit_data: any) {

    this.disableButton = true;

    var url = "formdatas";
    var method = "POST";
    let postData = {};

    if (this.appointmentid) {
      postData["appointmentid"] = this.appointmentid ? this.appointmentid : undefined;
    }

    if (this.inspectionid) {
      postData["inspectionid"] = this.inspectionid;
      postData["appointmentid"] = this.inspectionDetails && this.inspectionDetails.property && this.inspectionDetails.property.appointmentid ? this.inspectionDetails.property.appointmentid : undefined;
      postData["quotationid"] = this.inspectionDetails && this.inspectionDetails.property && this.inspectionDetails.property.quotationid ? this.inspectionDetails.property.quotationid : undefined;
      postData["joborderid"] = this.inspectionDetails && this.inspectionDetails.property && this.inspectionDetails.property.joborderid ? this.inspectionDetails.property.joborderid : undefined;
    }

    if (this.subCompnt.conversion == true && (this.subCompnt.conversionType == 'estimate' || this.subCompnt.conversionType == 'joborder')) {


      postData["convert"] = true;
      postData["customerid"] = this.assetControl.value.customerid._id;
      postData["convertModel"] = "Prospect";
      postData["convertdate"] = this.date;
      postData["advisorid"] = this.inspectionBy?.modelValue?._id;

      //inspection
      postData["contextid"] = this.assetControl.value._id;
      postData["onModel"] = "Asset";
      postData["formid"] = this.selectedTemplate._id;
      postData["addedby"] = this.inspectionBy?.modelValue?._id;
      postData["property"] = {};
      postData["property"] = submit_data;
      postData["property"]["date"] = this.date;
      postData["property"]["remark"] = this.remark;

      var redirectUrl = "";

      if (this.subCompnt.conversionType == "estimate") {
        url = "formdatas/converttoquotation/" + this.bindid;
        postData['type'] = "service";


      } else if (this.subCompnt.conversionType == "joborder") {
        url = "formdatas/converttojoborder/" + this.bindid;
      }

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {
          if (data) {
            this.disableButton = false;


            if (this.subCompnt.conversionType == "estimate" && data && data["property.quotationid"]) {
              var quotationid = data["property.quotationid"];
              var redirectUrl = "pages/inspection-module/estimation/" + quotationid;
              this._router.navigate([redirectUrl]);
            } else if (this.subCompnt.conversionType == "joborder" && data && data["property.joborderid"]) {
              var joborderid = data["property.joborderid"];
              var redirectUrl = "/pages/inspection-module/job-order/" + joborderid;
              this._router.navigate([redirectUrl]);
            } else {
              this._router.navigate([`/pages/dynamic-list/list/inspection/`]);
            }


            return;
          }
        }, (error) => {
          console.error(error);
        });

    } else {

      if (this.inspectionDetails && this.inspectionDetails._id) {

        url = "formdatas/" + this.bindid
        method = "PATCH";


        postData["addedby"] = this.inspectionBy?.modelValue?._id;
        postData["property"] = {};
        postData["property"] = submit_data;
        postData["property"]["date"] = this.date;
        postData["property"]["remark"] = this.remark;

      } else {
        postData["convert"] = true;
        postData["contextid"] = this.assetControl.value._id;
        postData["onModel"] = "Asset";
        postData["formid"] = this.selectedTemplate._id;
        postData["addedby"] = this.inspectionBy?.modelValue?._id;
        postData["property"] = {};
        postData["property"] = submit_data;
        postData["property"]["date"] = this.date;
        postData["property"]["remark"] = this.remark;
      }

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(async (data: any) => {
          if (data) {

            if (this.appointmentid) {
              await this.updateAppointment();
              this.inspectionid = data._id;
            }
            this.disableButton = false;

            console.log("data", data);

            var inspectionid = "";
            if (this.inspectionDetails && this.inspectionDetails._id) {
              inspectionid = this.inspectionDetails._id
            } else if (data && data["property.inspectionid"]) {
              inspectionid = data["property.inspectionid"]
            }

            if (this.formObj && this.formObj.redirecturl && inspectionid) {
              var url = this.formObj.redirecturl.replace(":_id", inspectionid);
              this._router.navigate([url]);
            } else {
              this._router.navigate([`/pages/dynamic-list/list/inspection/`]);
            }

            return;
          }
        }, (error) => {
          console.error(error);
        });

    }
  }

  submit() {
    this.submitted = true;
    this.disableButton = true;
    if (this.assetControl.value._id && this.templateControl.value._id) {
      setTimeout(() => {
        this.subCompnt.submitFormDynamically();
      }, 1000);
    }

  }

  convert(type: any) {
    this.submitted = true;
    this.disableButton = true;
    if (this.assetControl.value._id && this.templateControl.value._id) {
      setTimeout(() => {
        this.subCompnt.conversion = true;
        this.subCompnt.conversionType = type;
        this.subCompnt.submitFormDynamically();
      }, 1000);
    }

  }

  updateAppointment() {

    let method = "PATCH";
    let url = "appointments/";

    var model = { 'status': "confirmed" };

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.appointmentid)
      .then((data: any) => {
        if (data) {
          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
