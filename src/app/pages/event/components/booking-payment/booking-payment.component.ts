import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AsyncSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BillModel } from '../../../../core/models/sale/bill';
import { BillPaymentModel } from '../../../../core/models/sale/billpayment';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';

@Component({
  selector: 'app-booking-payment',
  templateUrl: './booking-payment.component.html'
})

export class BookingPaymentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  submitted: boolean;
  isLoading: boolean;
  bindid: any;
  billpid: any;

  today: Date = new Date();

  submitVisibility: boolean = false;

  _billModel = new BillModel();
  _billPaymentModel = new BillPaymentModel();

  subtotal: number = 0;
  discount: number = 0;
  grandtotal: number = 0;
  packagediscount: number = 0;
  payamount: number = 0;
  balance: number = 0;
  outstandingamount: number = 0;
  taxamount: number = 0;
  taxdetail: any = {};

  cartItem : any[] = [];

  formname : string;
  payformname : string;
  paidamount: number = 0;;
  status: string;

  searchMember : any;

  asncSubjct : AsyncSubject<any>;

  constructor(
    private _route: ActivatedRoute,
    private _billpaymentService: BillPaymentService,
    private _billService: BillService,
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
      this.billpid = params["pid"];
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      this._billService.AySubBilldetail.next(null);
      await this.getDatabyId(this.bindid);
      this.getIOUAmount();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  }

  async getDatabyId(id: any) {

    var billRes;
    billRes = await this._billService.AsyncGetById(id) as any;

    this._billModel = billRes;
    this.searchMember = billRes.customerid;
    this.balance = billRes['balance'];
    this.paidamount = billRes['paidamount'];
    this.status = billRes['status'];

    if (billRes.property && billRes.property['packagediscount']) {
      this.packagediscount = billRes.property['packagediscount'];
    }
    // await this.GetBillDetail(this._billModel);

    this.subtotal = billRes?.amount;
    this.discount = billRes?.discount;
    this.grandtotal = billRes?.totalamount;
    this.taxamount = billRes?.taxamount;
    this.taxdetail = billRes?.taxdetail;


    this.cartItem = [];
    this._billModel.items.forEach(itm => {
      itm.itemName = itm.item.itemname;
      this.cartItem.push(itm);
    });
    this._billModel.assets.forEach(itm => {
      itm.itemName = itm.refid.title;
      this.cartItem.push(itm);
    });
    this._billModel.services.forEach(itm => {
      itm.itemName = itm.refid.title;
      this.cartItem.push(itm);
    });
    this.formname = "bill";
    this.payformname = "billpayment";
  }

 async GetBillDetail(model: any) {

    model.services.map((asset)=>{
      asset.refid = asset.refid._id;
      asset.charges = asset.cost;
    });

    model.assets.map((asset)=>{
      asset.refid = asset.refid._id;
      asset.charges = asset.cost;
    });

    model.items.map((ele)=>{
      ele.sale = ele.item.sale;
      ele.charges = ele.cost;
    });

    console.log("model",model);

    await this._billService
        .AsyncBillDetail(model)
        .then((data: any) => {
          console.log("data",data);
          this.subtotal = data.billamount;
          this.discount = data.discount;
          this.grandtotal = data.grandtotal;
          this.taxamount = data.taxamount;
          this.packagediscount = data.membershipdiscount;
          this.taxdetail = data.taxdetail;
        });
  }

  getIOUAmount() {
    if (this.searchMember && this.searchMember._id) {
      let postData = {};
      postData['search'] = [{ "searchfield": "_id", "searchvalue": this.searchMember._id, "criteria": "eq", "datatype": "ObjectId" }];
      postData['pageNo'] = 1;
      postData['size'] = 10;

      this._billService
        .GetByIOU(this.searchMember._id, this.bindid)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {

          if (data && data.length > 0 && data[0].balance) {
            this.outstandingamount = data[0].balance ? data[0].balance : 0;
          }else if (data && !Array.isArray(data)) {
            this.outstandingamount = data.outstandingamount ? data.outstandingamount : 0
          }

          this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance });
        });
    }
  }


  onDelete(){
    if(this.paidamount > 0){
      this.showNotification('top', 'right', 'Please delete payment first !!', 'danger');
      return;
    }

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
        await this._billService
          .AsyncDelete(this.bindid)
          .then((data: any) => {
            if(data){
              this.showNotification('top', 'right', 'Invoice deleted successfully !!', 'danger');
              this._router.navigate([`/pages/dynamic-preview-list/${this.formname}/${this.bindid}`]);
            }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
