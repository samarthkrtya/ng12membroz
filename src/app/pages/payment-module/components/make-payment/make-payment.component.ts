import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { BasicValidators } from 'src/app/shared/components/basicValidators';

import swal from 'sweetalert2';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';


@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html'
})
export class MakePaymentComponent extends BaseComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();
  contentData: any;

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;
  paymentId: any;

  paymentdate: Date = new Date();
  receiptnumberprefix: any;
  paidamount: any;

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
    "value": "",
    "dbvalue": "",

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
    "value": "",
    "dbvalue": ""

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
    "value": "",
    "dbvalue": ""
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
    "visible": false,
    "dbvalue": "",
  }

  _receiptnumberVisibility: boolean = false;
  _bankDetailsVisbility: boolean = false;
  _cardDetailsVisbility: boolean = false;
  submitVisibility: boolean = true;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    super();

    this.form = fb.group({
      'mode': [, Validators.compose([Validators.required ])],
      'paymentdate': [this.paymentdate, Validators.required],
      'paymentreceivedby': ['' ],
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
      this.bindId = params["id"];
      this.paymentId = params["pid"];

      this.isLoading = false;
    })
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      if (this.bindId) {
        await this.LoadData()
        await this.getReceiptNumber();
      } else if (this.paymentId) {
        await this.LoadPayment();
      }


    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
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

    this.paymentdate = new Date();

    this._bankDetailsVisbility = false;
    this._cardDetailsVisbility = false;
    this._receiptnumberVisibility = false;


    // this.paymentreceivedby_fields["dbvalue"] = {};
    // this.paymentreceivedby_fields["dbvalue"]["autocomplete_id"] = this._loginUserId;
    // this.paymentreceivedby_fields["dbvalue"]["autocomplete_displayname"] = this._loginUser.fullname;

    this.paymentreceivedby_fields["dbvalue"] = this._loginUserId;

    this.paymentreceivedby_fields.visible = true;
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

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    this.isLoading = true;

    let method = "POST";
    let url = "paymentschedules/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });



    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        
        if (data && data[0]) {
          this.contentData = data[0];


          this.form.controls['paidamount'].setValue(this.contentData.balance);

          this.isLoading = false;
          return;
        }
      }, (error) => {
        console.error(error);
        return;
      })
  }

  async LoadPayment() {
    this.isLoading = true;

    let method = "POST";
    let url = "payments/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.paymentId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data && data[0]) {
          this.contentData = data[0];
          // console.log("this.contentData", this.contentData);
          this.contentData.paymentterms = this.contentData.item.paymentterms;

          var balance = this.contentData.item.balance;
          this.contentData.balance = balance;
          this.paidamount = this.contentData.paidamount + balance;

          this.form.controls['paymentdate'].setValue(this.contentData.paymentdate);
          this.form.controls['paidamount'].setValue(this.contentData.paidamount);

          if (this.contentData.receiptnumber) {
            this.form.controls['receiptnumber'].setValue(this.contentData.receiptnumber);
          }
          this.paymentreceivedby_fields.dbvalue = this.contentData.receivedby;
          this.mode_fields.dbvalue = this.contentData.mode;

          if (this.contentData.property && this.contentData.property.bankname) {
            this.bankname_fields.dbvalue = this.contentData.property.bankname;
          }
          if (this.contentData.property && this.contentData.property.chqstatus) {
            this.chequestatus_fields.dbvalue = this.contentData.property.chqstatus;
          }
          if (this.contentData.property && this.contentData.property.cardnumber) {
            this.form.controls['cardnumber'].setValue(this.contentData.property.cardnumber);
          }
          if (this.contentData.property && this.contentData.property.tidnumber) {
            this.form.controls['tidnumber'].setValue(this.contentData.property.tidnumber);
          }

          this.receiptnumberprefix = this.contentData.docnumber;
          this.isLoading = false;
        }
      }, (error) => {
        console.error(error);
        return;
      })
  }

  async getReceiptNumber() {

    let method = "GET";
    let url = "payments/view/receiptnumber";
    let postData = "";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.receiptnumberprefix = data;
          return;
        }
      }, (error) => {
        console.error(error);
        return;
      })


  }

  public async onSubmit(value: any, valid: boolean) {
    
    this.submitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    this.submitVisibility = false;
    if (this.bindId) {
      if (this.contentData.balance && value.paidamount > this.contentData.balance) {
        this.showNotification('top', 'right', '​Amount​ ​to​ ​be​ net payable ​cannot​ ​be​ ​more​ ​than balance​ ​amount.!!', 'danger');
        this.submitVisibility = true;
        return;
      }
      else if (value.paidamount == 0) {
        this.showNotification('top', 'right', '​Amount​ ​cannot​ ​be​ 0!!', 'danger');
        this.submitVisibility = true;
        return;
      }
    } else if (this.paymentId) {
      if (value.paidamount > this.paidamount) {
        this.showNotification('top', 'right', '​Amount​ ​to​ ​be​ net payable ​cannot​ ​be​ ​more​ ​than paid​ amount.!!', 'danger');
        this.submitVisibility = true;
        return;
      }
    }

    let method = this.paymentId ? "PUT" : "POST";
    let url = "payments";

    var postData = {
      memberid: this.contentData.memberid._id,
      item: this.bindId ? this.bindId : this.paymentId ? this.paymentId : '',
      amount: this.contentData.totalamount ? this.contentData.totalamount : 0,
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

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData, this.paymentId)
      .then(data => {
        if (data) {
          this.showNotification('top', 'right', 'Payment has been updated successfully!!!', 'success');
          this._router.navigate(['pages/dynamic-preview-list/payment/' + data["_id"]]);
          this.isLoading = false;
          return;
        }
      }, (error) => {
        console.error(error);
      })


  }

  onPayOnline() {
    //http://localhost:4210/#/payment?memberid=5e7edb85ba04dbc32a4b56f1&paymentscheduleid=5e7edc6bba04dbc32a4b56
    //fa&mode=pymentschedule&total=1000.0&youpay=1000.0&https=false&domain=localhost:3001

    // http://pay.membroz.com/#/payment-prev?paymentscheduleid=60700afafb3e765a64b827bb&https=false&domain=erp.fhiit.lk

    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?paymentscheduleid=${this.bindId}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }


  public async delete() {

    let method = "DELETE";
    let url = this.paymentId ?  "payments/" : "paymentschedules/";
    let id = this.paymentId ? this.paymentId : this.bindId;

    swal.fire({
      title: 'Are you sure?',
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
          .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
          .then(data => {
            if (data) {
              this.showNotification('top', 'right', 'Payment deleted successfully !!', 'success');
              this._router.navigate(['pages/dynamic-list/list/payment']);
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
