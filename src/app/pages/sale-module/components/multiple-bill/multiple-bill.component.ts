import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { Configuration } from '../../../../app.constants';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators } from 'src/app/shared/components/basicValidators';


@Component({
  selector: 'app-multiple-bill',
  templateUrl: './multiple-bill.component.html'
})
export class MultipleBillComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();
  paymentscheduleList: any[] = [];

  form: FormGroup;
  submitted: boolean;
  isLoading: boolean;

  memberid: any;
  billid: any;
  formname: any;

  paymentsceduleid: any;

  paymentdate: Date = new Date();
  payableamount: number = 0;

  viewOnlineBtn: boolean = false;
  isLoadingItems: boolean = false;

  dataContent: Object;

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false; 

  mode_fields = {
    "fieldname": "mode",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "payment methods", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": ""
  }

  bankname_fields = {
    "fieldname": "bankname",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "bank", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": ""
  }

  chequestatus_fields = {
    "fieldname": "chqstatus",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "cheque status", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": ""
  }

  paymentreceivedby_fields = {
    "fieldname": "paymentreceivedby",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "property", "value": 1 },
      { "fieldname": "fullname", "value": 1 }
    ],
    "form": {
      "apiurl": "users/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "modelValue": "",
  }


  member_fields = {
    "fieldname": "customerid",
    "fieldtype": "form",
    "search": [
      // { "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq" , "datatype": "ObjectId" },
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" }
    ],
    "form": { 
      "apiurl": "common/contacts/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "formname": "contact",
    "dbvalue": "",
  }

  htmlContent : string = `<div class="row"> <div class="col-md-12">
  <div class="border p-3 rounded alternative-light-blue">
    <div class="row">
      <div class="col-sm-4">
          <div class="media member-profile-item"><img  src='$[{profilepic}]' class="profile-avatar-img mr-2 rounded-circle" alt="">
          <div class="media-body"><div class="font-500 mb-1"> $[{fullname}] </div> <div class="@START[{membershipid.membershipname}]"> <div class="d-flex"><div class="flex-grow-1">  $[{membershipid.membershipname}]</div> </div> </div></div> </div>
        </div>
        <div class="col-sm-4 @START[{property.address}]">
            <div class="d-flex"><div class="mr-2"><img src="../assets/img/location-gray-icon.svg" alt=""></div><div> $[{property.address}]   <br>  $[{property.city}] </div></div>
        </div>
        <div class="col-sm-4">
           <div class="@START[{primaryemail}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/email-gray-icon.svg" alt=""></div><div>$[{primaryemail}]</div></div> </div>
           <div class="@START[{mobile}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/phone-gray-icon.svg" alt=""></div><div> $[{mobile}] </div></div> </div>
        </div>
    </div>
    </div>
    </div>
  </div>`;

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  _receiptnumberVisibility: boolean = false;
  _bankDetailsVisbility: boolean = false;
  _cardDetailsVisbility: boolean = false;
  submitVisibility: boolean = false;
  directMode: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _commonService: CommonService,
    private fb: FormBuilder,
    private configuration: Configuration
  ) {
    super();

    this.form = fb.group({
      'mode': ['',Validators.compose([Validators.required ])],
      'customerid': [,Validators.compose([Validators.required])],
      'paymentdate': [this.paymentdate, Validators.required],
      'paymentreceivedby': [''  ],
      'paidamount': [, Validators.compose([Validators.required, Validators.min(1)])],
      'chqnumber': [],
      'bankname': [''  ],
      'accountnumber': [],
      'chqdate': [],
      'chqstatus': [ ],
      'receiptnumber': [],
      'cardnumber': [],
      'tidnumber': [],

    }, {
      validator: this.validateCheque
    });

    this._route.params.forEach((params) => {
      this.memberid = params["mid"];
      this.formname = params["formname"];
      this.billid = params["billid"];
      this.directMode = false;
      if (this.memberid || this.billid) {
        this.directMode = true;
      }
     // console.log("this.memberid", this.memberid)
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      if (this.memberid) {        
        await this.getCustomerById(this.memberid);
        await this.LoadData();
        if(!this.memberid && this.paymentscheduleList.length > 0){
          this.memberid = this.paymentscheduleList[0].customerid && this.paymentscheduleList[0].customerid._id  ? this.paymentscheduleList[0].customerid._id : null;
        }
        this.member_fields.dbvalue = this.memberid;        
      }
      else if (this.billid){
        await this.LoadData();
      }
      this.isLoading = false;

      var loadingDone = true;

      // this.form.controls['customerid']
      // .valueChanges
      // .pipe(debounceTime(500))
      // .subscribe((value)=>{
      //   if(loadingDone){
      //     this.getCustomer();
      //     loadingDone = false;
      //   }else{
      //     this.customerfilteredOptions =  of(this._customerfilter(value));
      //   }
      // });

      this.form.controls['customerid']
      .valueChanges
      .pipe(
        debounceTime(500),
        tap((item)=>{
          this.customerList = [];
          if(item.length == 0) {
            this.customerisLoadingBox = false;
          } else {
            this.customerisLoadingBox = true;
          }
        }),
        switchMap((value) => 
          value.length > 2
          ? this._commonService.searchContact(value, 1)
            .pipe(
              finalize(() => {
                this.customerisLoadingBox = false
              }),
            )
          : []
        )
      )
      .subscribe((data : any) => {
        this.customerList = [];
        this.customerList = data;
        this.customerfilteredOptions = of(data);
      });
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    } finally {
    }
  }

  async getCustomerById(id : any){
    try{
        let postData = {};
        postData['search'] = [{ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" }];
        this.customerList = [];
        let datas = await this._commonService.AsyncContactsFilter(postData) as any[];
        this.customerList = datas;
        this.customerfilteredOptions = of(datas);
        this.form.controls['customerid'].setValue(datas[0]);
        this.form.controls['customerid'].disable();
    }catch(e){

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async getCustomer() {
    try{
      this.customerisLoadingBox = true
      let postData = {};
      postData['search'] = [{ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" }];
      this.customerList = [];
      var datas = await this._commonService.AsyncContactsFilter(postData) as [];
      this.customerList = datas;
      this.customerfilteredOptions = of(datas);
      this.customerisLoadingBox = false;
    }catch(e){
      this.customerisLoadingBox = false;
    }
  }
  

  private _customerfilter(value: string): string[] {
    if(typeof value == 'string'){
      let results = [];
      for (let i = 0; i < this.customerList.length; i++) {
        if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
          results.push(this.customerList[i]);
        }
      }
      return results;
    }
  }

  validateCheque(group: FormGroup) {
    let paymentMode = group.get('mode').value;
    let paymentModeFilter: any;

    let chqnumber = group.get('chqnumber');
    let bankname = group.get('bankname');
    let accountnumber = group.get('accountnumber'); 
    let cardnumber = group.get('cardnumber');
    let neftnumber = group.get('neftnumber');

    if (paymentMode && paymentMode.autocomplete_id) {
      paymentModeFilter = paymentMode.autocomplete_id;
    }

    if (paymentModeFilter == "CHEQUE") {
      chqnumber.setValidators([Validators.required]);
      bankname.setValidators([Validators.required ]);
    } else if (paymentModeFilter == "CASH") {
      cardnumber.setValidators([Validators.required]); 
    } else if (paymentModeFilter == "NEFT") {
      bankname.setValidators([Validators.required ]);
      neftnumber.setValidators([Validators.required]);
    } else if (paymentModeFilter == "NACH") {
      bankname.setValidators([Validators.required ]);
      accountnumber.setValidators([Validators.required]);
    } else {
      group.controls['cardnumber'].setValidators(null);
      group.controls['chqnumber'].setValidators(null);
      group.controls['bankname'].setValidators(null);
    }
  }

  async initializeVariables() {

    this._bankDetailsVisbility = false;
    this._cardDetailsVisbility = false;
    this._receiptnumberVisibility = false;

    this.payableamount = 0;
    this.viewOnlineBtn = false;

    this.form.controls['paidamount'].setValue(0);
    this.paymentscheduleList = [];
    this.paymentreceivedby_fields.modelValue = this._loginUserId;
    return;
  }

  inputModelChangeValue(value: any) {

    this._bankDetailsVisbility = false;
    this._cardDetailsVisbility = false;
    this._receiptnumberVisibility = false;

    if (value.autocomplete_id) {
      let valCheck = value.autocomplete_id;
      if (valCheck.toLowerCase() == 'cheque') {
        this._bankDetailsVisbility = true;
        this._cardDetailsVisbility = false;
        this._receiptnumberVisibility = false;
      } else if (valCheck.toLowerCase() == 'card') {
        this._bankDetailsVisbility = false;
        this._cardDetailsVisbility = true;
        this._receiptnumberVisibility = false;
      } else if (valCheck.toLowerCase() == 'cash') {
        this._receiptnumberVisibility = true;
      } else {
        this._cardDetailsVisbility = false;
        this._bankDetailsVisbility = false;
      }
    }
  }

  async inputModelChangeMember() {
    let value = this.form.controls['customerid'].value;
    if (value && value._id) {
      this.memberid = value._id;
      await this.initializeVariables();
      await this.LoadData();
    }

  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    let method = "POST";
    let url = "bills/filter";

    let postData = {};
    postData["search"] = [];
    if (this.memberid) {
      postData["search"].push({ "searchfield": "customerid", "searchvalue": this.memberid, "datatype": "ObjectId", "criteria": "eq" });
      postData["search"].push({ "searchfield": "status", "searchvalue": "Paid", "datatype": "text", "criteria": "ne" });
    } else if (this.billid) {
      postData["formname"] = this.formname;
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.billid, "datatype": "ObjectId", "criteria": "eq" });
    }

    this.payableamount = 0;
    this.paymentscheduleList = [];
    this.dataContent = {};
    this.isLoadingItems = true;
    this.viewOnlineBtn = false;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: []) => {
        
        if (data && data.length > 0) {
          this.paymentscheduleList = data;
          this.paymentscheduleList.map((schedule) => {
            schedule.checked = true;
            this.payableamount += schedule.balance;
          });
          this.form.controls['paidamount'].setValue(this.payableamount);
          var i = 0;
          this.paymentscheduleList.forEach(ps => {
            if (ps.checked) {
              i += 1;
              this.paymentsceduleid = ps._id;
            }
          });
          if (i === 1) this.viewOnlineBtn = true;
        }
        this.isLoadingItems = false;
      }, (error) => {
        console.error(error);
        this.isLoadingItems = false;
      })
  }

  changeEvent(event: any, item: any) {
    if (event.checked) {
      this.payableamount += item.balance;
    } else {
      this.payableamount -= item.balance;
    }
    this.form.controls['paidamount'].setValue(this.payableamount);

    this.viewOnlineBtn = false;
    var i = 0;
    this.paymentscheduleList.forEach(ps => {
      if (ps.checked) {
        i += 1;
        this.paymentsceduleid = ps._id;
      }
    });
    if (i === 1) this.viewOnlineBtn = true;
  }

  public async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    if (this.payableamount && value.paidamount > this.payableamount) {
      this.showNotification('top', 'right', '​Amount​ ​to​ ​be​ net payable ​cannot​ ​be​ ​more​ ​than balance​ ​amount.!!', 'danger');
      return;
    } else if (value.paidamount == 0) {
      this.showNotification('top', 'right', '​Amount​ ​cannot​ ​be​ 0!!', 'danger');
      return;
    }
    var items = [];
    items = this.paymentscheduleList.filter(a => a.checked == true)
    if (items.length == 0) {
      this.showNotification("top", "right", "Select payments !!", "danger");
      return;
    }
    let method = "POST";
    let url = "billpayments/multiple";

    var model = {
      customerid: items[0].customerid._id,
      onModel: items[0].onModel,
      items: items.map(a => a._id),
      paidamount: value.paidamount,
      mode: value.mode.autocomplete_id,
      receivedby: value.paymentreceivedby.autocomplete_id,
      paymentdate: value.paymentdate._d ? value.paymentdate._d : value.paymentdate,
      property: {
        receiptnumber: value && value.receiptnumber ? value.receiptnumber : undefined,
        chqnumber: value && value.chqnumber ? value.chqnumber : undefined,
        bankname: value && value.bankname && value.bankname.autocomplete_id ? value.bankname.autocomplete_id : undefined,
        chqdate: value && value.chqdate ? value.chqdate : undefined,
        chqstatus: value && value.chqstatus && value.chqstatus.autocomplete_id ? value.chqstatus.autocomplete_id : undefined,
        cardnumber: value && value.cardnumber ? value.cardnumber : undefined,
        tidnumber: value && value.tidnumber ? value.tidnumber : undefined,
      }
    }
    this.submitVisibility = true;
    console.log("model",model);
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then(data => {
        // console.log("res",data);
        if (data) {
          this.showNotification('top', 'right', 'Bill paid successfully !!', 'success');
          this._router.navigate(['/pages/dynamic-list/list/billpayment']);
          this.submitVisibility = false;
        }
      }).catch((e) => {
        console.error(e);
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
        this.submitVisibility = false;
      });
  }

  actionlistRecord(psid: any) {

    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?billid=${psid}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }

  onPayOnline() {
    //http://localhost:4210/#/payment?memberid=5e7edb85ba04dbc32a4b56f1&paymentscheduleid=5e7edc6bba04dbc32a4b56
    //fa&mode=pymentschedule&total=1000.0&youpay=1000.0&https=false&domain=localhost:3001

    // http://pay.membroz.com/#/payment-prev?paymentscheduleid=60700afafb3e765a64b827bb&https=false&domain=erp.fhiit.lk

    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?billid=${this.paymentsceduleid}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }


}
