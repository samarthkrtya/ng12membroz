import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators } from '../../../../shared/components/basicValidators';

@Component({
  selector: 'app-multiple-purchasepayment',
  templateUrl: './multiple-purchasepayment.component.html'
})

export class MultiplePurchasePaymentComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();
  paymentscheduleList: any[] = [];

  form: FormGroup;
  submitted: boolean;
  isLoading: boolean;
  pinvid: any;
  vendorId: any;

  paymentdate: Date = new Date();
  payableamount: number = 0;
  dataContent: Object;
  receiptnumberprefix: any

  isLoadingItems: boolean = false;

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
    "fieldname": "vendorid",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "form": {
      "apiurl": "vendors/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "value": "",
    "dbvalue": "",
  }

  _receiptnumberVisibility: boolean = false;
  _bankDetailsVisbility: boolean = false;
  _cardDetailsVisbility: boolean = false;
  submitVisibility: boolean = false;
  directMode: boolean = false;

  htmlContent: string =
    `<div class="row"><div class="col-md-12">
  <div class="border p-3 rounded alternative-light-blue">
    <div class="row">
      <div class="col-sm-4">
          <div class="media member-profile-item"><img  src='$[{profilepic}]' class="profile-avatar-img mr-2 rounded-circle" alt="">
          <div class="media-body"><div class="font-500 mb-1"> $[{fullname}] </div> <div class="@START[{membershipid.membershipname}]"><div class="d-flex"><div class="flex-grow-1">  $[{membershipid.membershipname}]</div> </div></div></div></div>
        </div>
        <div class="col-sm-4 @START[{property.address}]"">
            <div class="d-flex"><div class="mr-2"><img src="../assets/img/location-gray-icon.svg" alt=""></div><div> $[{property.address}]   <br>  $[{property.city}] </div></div>
        </div>
        <div class="col-sm-4">
        <div class="@START[{property.email}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/email-gray-icon.svg" alt=""></div><div>$[{property.email}]</div></div> </div>
        <div class="@START[{property.mobile}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/phone-gray-icon.svg" alt=""></div><div> $[{property.mobile}] </div></div> </div>
        </div>
    </div>
    </div></div>
  </div>`;

  constructor(
    private _route: ActivatedRoute,
    private _commonService: CommonService,
    private fb: FormBuilder,
  ) {
    super();


    this.form = this.fb.group({
      'mode': [, Validators.compose([Validators.required])],
      'vendorid': [, Validators.compose([Validators.required])],
      'paymentdate': [this.paymentdate, Validators.required],
      'paymentreceivedby': [''],
      'paidamount': [, Validators.compose([Validators.required, Validators.min(1)])],
      'chqnumber': [],
      'bankname': [''],
      'accountnumber': [],
      'chqdate': [],
      'chqstatus': [],
      'receiptnumber': [],
      'cardnumber': [],
      'tidnumber': [],

    }, {
      validator: this.validateCheque
    });

    this._route.params.forEach((params) => {
      this.pinvid = params["pivid"];
      this.vendorId = params["vid"];

      this.directMode = false;
      if (this.pinvid) {
        this.directMode = true;
      }
    })
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();

      if (this.pinvid) {
        let postData = {};
        postData["search"] = [];
        postData["search"].push({ "searchfield": "_id", "searchvalue": this.pinvid, "datatype": "ObjectId", "criteria": "eq" });
        postData["search"].push({ "searchfield": "status", "searchvalue": "Paid", "datatype": "text", "criteria": "ne" });
        await this.initializeVariables();
        await this.LoadData(postData);
      }

      this.getReceiptNumber();
      this.paymentreceivedby_fields.modelValue = this._loginUserId;
      this.isLoading = false;

      if (this.vendorId) {
        this.member_fields.dbvalue = this.vendorId
      }
    } catch (error) {
      this.isLoading = false;
      console.error(error);

    } finally {
    }
  }

  getReceiptNumber() {

    let method = "GET";
    let url = "purchaseinvoicepayments/view/ipnumber";
    let postData = "";

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.receiptnumberprefix = data;
          return;
        }
      }, (error) => {
        console.error(error);
        return;
      })


  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
      bankname.setValidators([Validators.required]);
    } else if (paymentModeFilter == "CASH") {
      cardnumber.setValidators([Validators.required]);
    } else if (paymentModeFilter == "NEFT") {
      bankname.setValidators([Validators.required]);
      neftnumber.setValidators([Validators.required]);
    } else if (paymentModeFilter == "NACH") {
      bankname.setValidators([Validators.required]);
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

    this.form.controls['paidamount'].setValue(0);
    this.paymentscheduleList = [];
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

  async inputModelChangeMember(value: any) {
    let postData = {};
    if (value && value._id) {
      postData["search"] = [];
      postData["search"].push({ "searchfield": "vendorid", "searchvalue": value._id, "datatype": "ObjectId", "criteria": "eq" });
      postData["search"].push({ "searchfield": "status", "searchvalue": "Paid", "datatype": "text", "criteria": "ne" });
      await this.LoadData(postData);
    }
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData(postData?: any) {

    if (this.directMode && this.paymentscheduleList.length > 0) return;

    this.paymentscheduleList = [];
    this.payableamount = 0;
    this.dataContent = {};

    let method = "POST";
    let url = "purchaseinvoices/filter";
    this.isLoadingItems = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data && data.length > 0) {
          this.paymentscheduleList = data;
          this.member_fields.dbvalue = data[0].vendorid._id;
          this.paymentscheduleList.map((schedule) => {
            schedule.checked = true;
            this.payableamount += schedule.balance;
          });
          this.form.controls['paidamount'].setValue(this.payableamount);
        }
        this.isLoadingItems = false;
      }, (error) => {
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
  }

  public async onSubmit(value: any, valid: boolean) {
    value = this.form.getRawValue();
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
    items = this.paymentscheduleList.filter(a => a.checked == true);
    if (items.length == 0) {
      this.showNotification("top", "right", "Select Purchase invoices !!", "danger");
      return;
    }
    let method = "POST";
    let url = "purchaseinvoicepayments";

    var model = {
      vendorid: value.vendorid._id,
      items: items,
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

    console.log("model", model);

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then(data => {
        console.log("data", data)
        if (data) {
          this.showNotification('top', 'right', 'Payment made successfully !!', 'success');
          if (this.previousUrl) {
            this._router.navigate([this.previousUrl]);
          } else {
            this._router.navigate(['/pages/dynamic-dashboard']);
          }
          this.submitVisibility = false;
        }
      }).catch((e) => {
        console.error(e);
        this.submitVisibility = false;
      });
  }


}
