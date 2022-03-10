import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { SelectionModel } from '@angular/cdk/collections';

import { Subject } from 'rxjs';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';

import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-customer-conversion',
  templateUrl: './customer-conversion.component.html',
  styles: [
  ]
})
export class CustomerConversionComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface  {

  @ViewChild(MatAccordion) accordion: MatAccordion;


  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;
  
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
  
  sendMessageVisibility: boolean = false;
  stageLists: any [] = [];
  currentStage: any;

  functionPermission : any[] = [];
  
  _tableCtrl: FormControl = new FormControl();
  sel = new SelectionModel<number>(true, []);

  
  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
  ) {

    super();

    this.pagename="app-customer-conversion";

    this._route.params.forEach((params) => {

      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "6172808bfcb7a637f2c973ce";
      this.contentVisibility = false;
      this.itemVisbility = false;
    })


    this.form = this.fb.group({
      otherdetails: this.fb.group({
        campaign: [''],
        salesmanager: [''],
        salesperson: [''],
        //salesbranch:  [''],
        channel:  [''],
      }),
      productdetails: this.fb.group({
        membershipid: ['', Validators.required],
        membershipstart: ['', Validators.required],
        membershipend: ['', Validators.required]
      }),
      // paymentdetails: this.fb.group({
      //   mode: [, Validators.required],
      //   paymentdate: ['', Validators.required],
      //   paymentreceivedby: ['' ],
      //   paidamount: [, Validators.compose([Validators.required, Validators.min(1)])],
      //   chqnumber: [],
      //   bankname: [''  ],
      //   accountnumber: [],
      //   chqdate: [],
      //   chqstatus: [ ],
      //   receiptnumber: [],
      //   cardnumber: [],
      //   tidnumber: [],

      // }, {
      //   validator: this.validateCheque
      // }),
    })
   }

   validateCheque(group: FormGroup) {

    let paymentMode = group.get('mode').value;
    let paymentModeFilter: any;

    let chqnumber = group.get('chqnumber');
    let bankname = group.get('bankname');
    let cardnumber = group.get('cardnumber');
    

    // if (paymentMode && paymentMode.autocomplete_id) {
    //   paymentModeFilter = paymentMode.autocomplete_id;
    // }

    // if (paymentModeFilter == "CHEQUE") {
    //   chqnumber.setValidators([Validators.required]);
    //   bankname.setValidators([Validators.required]); 
    // } else if (paymentModeFilter == "CASH") {
    //   cardnumber.setValidators([Validators.required]); 
    // } else if (paymentModeFilter == "NEFT") {
    //   bankname.setValidators([Validators.required ]);
    // } else if (paymentModeFilter == "NACH") {
    //   bankname.setValidators([Validators.required ]);
    // } else {
    //   cardnumber.setValidators(null);
    //   chqnumber.setValidators(null); 
    //   bankname.setValidators(null); 
    // }

    // cardnumber.updateValueAndValidity();
    // chqnumber.updateValueAndValidity();
    // bankname.updateValueAndValidity();
    
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
    this.actionselected = "profile";

    this.profileVisibility = true;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    
    this.sendMessageVisibility = false;
    this.stageLists = [];
    this.currentStage = "";

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == "prospect")
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }
    return;
  }

  async LoadData() {

    this.contentVisibility = false;

    let method = "POST";
    let url = "prospects/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria":"eq" });
    // postData["search"].push({ "searchfield": "status", "searchvalue": "SALE WON", "criteria":"eq" });

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data=>{
        
        console.log("data", data);

        if(data) {

          this.dataContent = data[0];
          console.log("dataContent", this.dataContent);
          if(this.dataContent && this.dataContent.stage) this.currentStage = this.dataContent.stage;
          this.contentVisibility = true;
          this.itemVisbility = true;
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

  async sendMessage() {
    this.sendMessageVisibility = true;
  }

  buttonToggle(type: string) {
    if(type == "profile") {
      this.profileVisibility = true;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      
    } else if (type == "timeline") {
      this.profileVisibility = false;
      this.timelineVisibility = true;
      this.communicationVisibility = false;
      
    } else if (type == "communication") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = true;
    }
  }

  async onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {
      
      var amount = 0;
      if (this._tableCtrl.value == null || this._tableCtrl.value.length == 0) {
        this.showNotification('top', 'right', 'Please select payment terms!!!', 'danger');
        return;
      } else {
        amount = this._tableCtrl.value.map(item => item.totalamount).reduce((prev, next) => prev + next);
      }

      // if (value.paymentdetails.paidamount == 0) {
      //   this.showNotification('top', 'right', '​Amount​ ​cannot​ ​be​ 0!!', 'danger');
      //   return;
      // }

      // if(value.paymentdetails.paidamount > amount) {
      //   this.showNotification('top', 'right', '​Amount​ ​to​ ​be​ net payable ​cannot​ ​be​ ​more​ ​than paid​ amount.!!', 'danger');
      //   return;
      // }

      this.disableBtn = true;

      // convert autocomplete object into single value
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          for (var k in value[key]) {
            if (value[key].hasOwnProperty(k)) {
              value[key][k] = value && value[key] && value[key][k] && value[key][k]['autocomplete_id'] ? value[key][k]['autocomplete_id'] : value[key][k]; 
            }
          }
        }
      }

      var paymentterm = this._tableCtrl.value.map(value => value._id);
      value.productdetails.paymentterm = [];
      value.productdetails.paymentterm = paymentterm;
    
      console.log("value", value);

      let postData = {};

      postData["membershipid"] = value.productdetails.membershipid;
      postData["membershipstart"] = value.productdetails.membershipstart;
      postData["membershipend"] = value.productdetails.membermembershipend;
      postData["fullname"] = this.dataContent.fullname;
      postData["paymentterms"] = [];
      postData["paymentterms"] = paymentterm;
      postData["property"] = {};
      postData["property"] = this.dataContent.property;
      postData["campaignid"] = this.dataContent && this.dataContent.campaignid && this.dataContent.campaignid._id ? this.dataContent.campaignid._id : this.dataContent.campaignid ? this.dataContent.campaignid : null;
      postData["handlerid"] = this.dataContent && this.dataContent.handlerid && this.dataContent.handlerid._id ? this.dataContent.handlerid._id : this.dataContent.handlerid ? this.dataContent.handlerid : null;
      postData["addedby"] = this.dataContent.addedby;

      postData["property"]["otherdetails"] = {};
      postData["property"]["otherdetails"] = value.otherdetails;

      postData["property"]["productdetails"] = {};
      postData["property"]["productdetails"] = value.productdetails;

      // postData["property"]["paymentdetails"] = {};
      // postData["property"]["paymentdetails"] = value.paymentdetails;

      console.log("postData", postData);

      let method = "PUT";
      let url = "members/converttomember/" + this.dataContent._id;

      

      return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {
          console.log("data", data);
          this._router.navigate(['/pages/payment-module/multiple-payment/' + data.memberid]);
          this.disableBtn = false;
          this.showNotification("top", "right", "Member has been added successfully!!!", "success");
          return;
        }
      }, (error)=>{
        this.disableBtn = false;
        console.error(error);
    })

    }
  }

  getSubmittedCloseMessageData(submitData: any) {
    $("#closeform").click();
  }

}
