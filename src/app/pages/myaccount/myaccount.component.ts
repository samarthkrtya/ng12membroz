import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { OnlyNumberValidator, OnlyPositiveNumberValidator } from 'src/app/shared/components/basicValidators';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
})

export class MyAccountComponent extends BaseLiteComponemntComponent implements OnInit {

  isLoadingData: boolean;
  btnDisable: boolean;

  dataContent: any;

  usercount: object;
  membercount: object;

  sms: any[];
  email: any[];

  cardForm: FormGroup
  branchForm: FormGroup

  today = new Date();
  submitted: boolean;

  invoices: any[] = [];
  cardDetail: any[] = [];

  country_fields = {
    fieldname: "country",
    fieldtype: "lookup",
    formfield: "code",
    displayvalue: "name",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "lookup", searchvalue: "country", criteria: "eq" }
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "data", value: 1 },
    ],
    modelValue: {},
    dbvalue: {},
    visibility: true
  };

  cards = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    rupay: /^6[0-9]{15}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/
  };

  @ViewChild(MatDatepicker) picker;

  constructor(
    protected _commonService: CommonService,
    protected fb: FormBuilder,
  ) {
    super();

    this.cardForm = fb.group({
      'cctype': ['', Validators.required],
      'number': ['', Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber, OnlyNumberValidator.insertonlycardnumber, Validators.required])],
      'expiry': [, Validators.required],
      'csv': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber, OnlyNumberValidator.insertonlythreenumber, Validators.required])],
      'holdername': ['', Validators.required],
      'terms': [false],
      'default': [false],
      'status': ['valid'],
    });


    this.cardForm
      .get('number')
      .valueChanges.subscribe((num) => {
        this.cardForm.controls['cctype'].setValue(null);
        for (var card in this.cards) {
          if (this.cards[card].test(num)) {
            this.cardForm.controls['cctype'].setValue(card);
          }
        }
      });

    this.branchForm = fb.group({
      'contactperson': ['', Validators.required],
      'branchname': ['', Validators.required],
      'billingemail': ['', Validators.required],
      'address': ['', Validators.required],
      'postcode': [, Validators.compose([OnlyPositiveNumberValidator.insertonlypositivenumber, Validators.required])],
      'city': ['', Validators.required],
      'country': ['', Validators.required],
      'gstnumber': [''],
    });

  }

  async ngOnInit() {
    try {
      super.ngOnInit();
      await this.initVariable();
      await this.LoadData();
    } catch (error) {
    } finally {
    }
  }

  async initVariable() {
    this.dataContent = null;
    this.btnDisable = false;
    this.usercount = {
      'remaininguser': 0,
      'remaininguserinper': 0,
    }
    this.membercount = {
      'remainingmember': 0,
      'remainingmemberinper': 0,
    }

    this.sms = [
      { limit: 1000, cost: 100 },
      { limit: 10000, cost: 1000 },
    ];
    this.email = [
      { limit: 1000, cost: 100 },
      { limit: 10000, cost: 1000 },
    ];
    return;
  }

  async LoadData() {

    this.isLoadingData = true;

    let method = "POST";
    let url = "/branches/membrozsubscription";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data : any) => {

        // console.log("data",data);

        if (data && data.length > 0) {
          
          this.dataContent = data[0];
          
          if(this.dataContent && this.dataContent.license){
            this.usercount = {
              remaininguser: this.dataContent.license.users - this.dataContent.totalusers,
              remaininguserinper: (this.dataContent.totalusers * 100) / this.dataContent.license.users,
            }

            this.membercount = {
              remainingmember: this.dataContent.license.members - this.dataContent.totalmembers,
              remainingmemberinper: (this.dataContent.totalmembers * 100) / this.dataContent.license.members,
            }
          }


          this.dataContent.upgrademembership.map(a => a.desc = a.property['default-info'])

          this.branchForm.controls['branchname'].setValue(this.dataContent.branchname);
          this.branchForm.controls['contactperson'].setValue(this.dataContent.contactperson);
          this.branchForm.controls['billingemail'].setValue(this.dataContent.billingemail);
          this.branchForm.controls['address'].setValue(this.dataContent.address);
          this.branchForm.controls['city'].setValue(this.dataContent.city);
          this.branchForm.controls['postcode'].setValue(this.dataContent.postcode);
          this.branchForm.controls['gstnumber'].setValue(this.dataContent.gstnumber);
          if (this.dataContent.country) {
            this.country_fields.dbvalue = { code: this.dataContent.country, name: this.dataContent.country };
          }

          this.invoices = [];
          this.invoices = this.dataContent.invoices;

          this.cardDetail = [];
          this.cardDetail = this.dataContent.paymentmethods;
          this.cardDetail.map(function (cc) {
            var str = Number(cc.number).toString();
            str = str.replace(/\w(?=\w{4})/g, "*");
            cc.cardnumber = str;
          });
        }
        
        this.isLoadingData = false;
      }).catch((error) => {
        console.error(error);
        this.isLoadingData = false;
      })
  }

  onSubmitMethod(value: any, valid: boolean) {

    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    } else if (!value['terms']) {
      super.showNotification("top", "right", "Accept terms & conditions !!", "danger");
      return;
    }
    value['expiry'] = value['expiry'] && value['expiry']['_d'] ? value['expiry']['_d'] : value['expiry'];
    let model = {};

    if (value.default) {
      this.cardDetail.map(a => a.default = false);
    }
    model['paymentmethods'] = this.cardDetail;
    model['paymentmethods'].push(value);


    let url = "branches";
    let method = "PATCH";

    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this._loginUserBranchId)
      .then((data: any) => {
        this.cardDetail = [];
        this.cardDetail = data.paymentmethods;
        this.cardDetail.map(function (cc) {
          var str = Number(cc.number).toString();
          str = str.replace(/\w(?=\w{4})/g, "*");
          cc.cardnumber = str;
        });
        this.btnDisable = false;
        super.showNotification("top", "right", "Card Detail added successfully !!", "success");
        $("#methodClose").click();
        this.cardForm.reset();
      }).catch((e) => {
        this.btnDisable = false;
        super.showNotification("top", "right", "Error Occured !!", "danger");
        $("#methodClose").click();
      });
  }

  updateCard(item: any, type: string, event: any) {

    var i = this.cardDetail.findIndex(a => a._id == item._id)
    var txt = "";

    if (type == 'delete') {
      txt = "You want to delete ?"
    } else {
      txt = "By set 'Default', other methods is unset to Default ?"
    }

    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: txt,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result && result.value) {
        console.log("result", result);
        if (type == 'delete') {
          varTemp.cardDetail.splice(i, 1);
        } else {
          varTemp.cardDetail.map((itm, ind) => {
            itm.default = false;
            if (ind == i) { itm.default = true }
          });
        }

        let model = {};
        model['paymentmethods'] = varTemp.cardDetail;

        let url = "branches";
        let method = "PATCH";

        varTemp.btnDisable = true;
        varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, varTemp._loginUserBranchId)
          .then((data: any) => {
            varTemp.cardDetail = [];
            varTemp.cardDetail = data.paymentmethods;
            varTemp.cardDetail.map(function (cc) {
              var str = Number(cc.number).toString();
              str = str.replace(/\w(?=\w{4})/g, "*");
              cc.cardnumber = str;
            });
            varTemp.btnDisable = false;
            varTemp.showNotification("top", "right", "Payment method updated successfully !!", "success");
          }).catch((e) => {
            varTemp.btnDisable = false;
          });
      } else {

        if (type != 'delete') {
          varTemp.cardDetail.map((itm, ind) => {
            if (ind == i) { itm.default = false }
          });
        }
      }
    });

  }



  onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    value['country'] = value['country'] && value['country']['code'] ? value['country']['code'] : value['country'];
    let model = value;
    let url = "branches";
    let method = "PATCH";

    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this._loginUserBranchId)
      .then((data) => {
        this.btnDisable = false;
        super.showNotification("top", "right", "Information updated successfully !!", "success");
      }).catch((e) => {
        this.btnDisable = false;
        super.showNotification("top", "right", "Error Occured !!", "danger");
      });

  }


  monthSelected(params) {
    var date = params._d ? params._d : params;
    this.cardForm.controls['expiry'].setValue(date);
    this.picker.close();
  }

  downloadInv() {
    console.log("downloadInv clicked");
  }


  upgradePlan(plan: any) {
    let url = "bills/razorpay/subscription";
    let method = "POST";
    let model = {
      "customerid": this._loginUserId,
      "onModel": this._loginroletype == 'M' ? 'Member' : this._loginroletype == 'C' ? 'Promotion' : this._loginroletype == 'A' ? "User" : "User",
      "paymentdate": new Date(),
      "membershipid": plan._id
    }
    // console.log("model==>", model);
    this.btnDisable = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then((data: any) => {
        this.btnDisable = false;
        if (data && data.short_url) {
          var url = data.short_url;
          window.open(url, '_blank');
        }else{
          super.showNotification("top", "right", "Something went wrong !!", "danger");
        }
      }).catch((e) => {
        this.btnDisable = false;
        super.showNotification("top", "right", "Error Occured !!", "danger");
      });


  }


}


