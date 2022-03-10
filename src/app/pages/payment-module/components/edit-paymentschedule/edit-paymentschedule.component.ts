import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { OnlyPositiveNumberValidator } from 'src/app/shared/components/basicValidators';

import swal from 'sweetalert2';

@Component({
  selector: 'app-edit-paymentschedule',
  templateUrl: './edit-paymentschedule.component.html'
})
export class EditPaymentScheduleComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();
  contentData: any;

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;

  min: Date = new Date();
  receiptnumberprefix: any;


  splitVisibilty: boolean = false;


  duedates = [];


  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _commonService: CommonService,


  ) {
    super();

    this.form = fb.group({
      'memberid': [],
      'membershipend': [],
      'paymentterms': [],
      'paymentreceivedby': [],
      'discount': [],
      'paidamount': [],
      'balance': [],
      'taxamount': [],
      'amount': [],
      'totalamount': [],
      'adjustment': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'negativeadjustment': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'totaladjustment': [],
      'sendlink': [],
      'scheduledate': [],
      'noofschedules': [1],
      'status': [],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];

      this.isLoading = false;
    })
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.LoadData();
      this.isLoading = false;

      this.form.controls['noofschedules']
        .valueChanges
        .subscribe((no: number) => {
          this.duedates = [];
          for (let i: any = 0; i < no; i++) {
            this.duedates.push(new Date());
          }
        });

      this.form.controls['adjustment']
        .valueChanges
        .subscribe((adj: number) => {
          var balance = this.contentData.balance;
          balance += adj ? adj : 0;
          this.form.controls['balance'].setValue(balance);
        });

      this.form.controls['negativeadjustment']
        .valueChanges
        .subscribe((adj: number) => {
          var balance = this.contentData.balance;
          balance -= adj ? adj : 0;
          this.form.controls['balance'].setValue(balance);
        });
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

  async initializeVariables() {
    this.duedates = [];
    this.duedates.push(new Date());
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {

    let method = "POST";
    let url = "paymentschedules/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data && data[0]) {
          this.contentData = data[0];
          console.log("this.contentData", this.contentData);
          this.receiptnumberprefix = this.contentData.docnumber;
          if (this.contentData.memberid._id) {
            this.form.controls['memberid'].setValue(this.contentData.memberid._id);  //
            if (this.contentData.memberid.membershipend) {
              this.form.controls['membershipend'].setValue(this.contentData.memberid.membershipend);  //
            }
          }
          if (this.contentData.paymentterms._id) {
            this.form.controls['paymentterms'].setValue(this.contentData.paymentterms._id);  //
            if (this.contentData.paymentterms.discount) {
              this.form.controls['discount'].setValue(this.contentData.paymentterms.discount);  //
            }
          }

          this.form.controls['paidamount'].setValue(this.contentData.paidamount);
          this.form.controls['balance'].setValue(this.contentData.balance);
          this.form.controls['taxamount'].setValue(this.contentData.taxamount);
          this.form.controls['amount'].setValue(this.contentData.amount);
          this.form.controls['totalamount'].setValue(this.contentData.totalamount);
          this.form.controls['scheduledate'].setValue(this.contentData.scheduledate);  //
          this.form.controls['status'].setValue(this.contentData.status);

          this.form.controls['paidamount'].disable();
          this.form.controls['balance'].disable();

          if (this.contentData.adjustment) {
            this.form.controls['adjustment'].setValue(this.contentData.adjustment);
          }
          if (this.contentData.negativeadjustment) {
            this.form.controls['negativeadjustment'].setValue(this.contentData.negativeadjustment);
          }
          if (this.contentData.totaladjustment) {
            this.form.controls['totaladjustment'].setValue(this.contentData.totaladjustment);
          }
          if (this.contentData.sendlink) {
            this.form.controls['sendlink'].setValue(this.contentData.sendlink);
          }

        }
      }, (error) => {
        console.error(error);
        return;
      })
  }


  reset() {
    this.splitVisibilty = false;
    this.form.controls['noofschedules'].setValue(1);
    this.duedates = [];
    this.duedates.push(new Date());

    this.form.controls['adjustment'].setValue(0);
    this.form.controls['negativeadjustment'].setValue(0);
    this.form.controls['balance'].setValue(this.contentData.balance);
  }

  public async onSubmit(value: any, valid: boolean) {

    this.submitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }


    let method = "PUT";
    let url = "paymentschedules/updateschedules";

    var model = {};
    model = value;

    model['taxdetail'] = this.contentData.taxdetail;
    model['onModel'] = this.contentData.onModel;

    model['split'] = this.splitVisibilty;
    model['duedates'] = [];
    if (this.splitVisibilty) {
      this.duedates.forEach(date => {
        if (date._d) {
          model['duedates'].push(date._d);
        } else {
          model['duedates'].push(date);
        }
      });
    }

    //console.log("model", model);
    this.disableButton = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then(data => {
        if (data) {
          this.showNotification('top', 'right', 'Schedule updated successfully !!', 'success');
          this._router.navigate(['pages/dynamic-list/list/paymentschedule']);
          this.disableButton = false;
        }
      }).catch((error) => {
        console.error(error);
        this.disableButton = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      });
  }

  async delete() {
    if(this.contentData.status == 'Unpaid'){
    let method = "DELETE";
    let url = "paymentschedules/";

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
          .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindId)
          .then(data => {
            if (data) {
              this.showNotification('top', 'right', 'Schedule deleted successfully !!', 'success');
              this._router.navigate(['pages/dynamic-list/list/paymentschedule']);
              this.disableButton = false;
            }
          }).catch((error) => {
            console.error(error);
            this.disableButton = false;
            this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          });
      }
    });
  }else{
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
      if(result){
        this._router.navigate(['pages/payment-module/make-payment/'+this.contentData._id]);
      }
    });
  }
  }


}
