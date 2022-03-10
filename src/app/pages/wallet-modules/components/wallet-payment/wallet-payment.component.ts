import { Component, OnInit } from '@angular/core';
import {  ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillModel } from '../../../../core/models/sale/bill';
import { BillPaymentModel } from '../../../../core/models/sale/billpayment';
import { BillService } from '../../../../core/services/sale/bill.service';

import { BillPaymentService } from '../../../../core/services/sale/billpayment.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-wallet-payment',
  templateUrl: './wallet-payment.component.html',
  styles: [
  ]
})
export class WalletPaymentComponent extends BaseLiteComponemntComponent implements OnInit  {
  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean; 
  disableBtn: boolean = false;
  bindid: any;

  today: Date = new Date();

  submitVisibility: boolean = false;

  _billModel = new BillModel();
  _billPaymentModel = new BillPaymentModel();

  paymentDate : Date;
  subtotal: number = 0;
  grandtotal: number = 0;
  packagediscount: number = 0;
  paidamount: number = 0;
  payamount: number = 0;
  totaltax: number = 0;
  
  cartItem : any[] = [];
  couponList : any[] = [];
  couponfilteredOptions : Observable<any[]>;

  searchMember : any;
  couponBox: any = {};

  currentRoleDetail: any;
  isMemberLogin: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _billpaymentService: BillPaymentService,
    private _billService: BillService, 
    private _commonService: CommonService, 
    
  ) {
    super();

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });
    this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.getDatabyId(this.bindid);
      this.getCoupons();

      if (this._authService.currentUser && this._authService.currentUser.role) {
        this.currentRoleDetail = this._authService.currentUser.role;
        if (this.currentRoleDetail) {
          if (this.currentRoleDetail.roletype) {
            if (this.currentRoleDetail.roletype == 'M') {
              this.isMemberLogin = true;
            } else {
              this.isMemberLogin = false;
            }
          }
        }
      }

      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  }
 
  async getDatabyId(id: any) {
   

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "billid", "searchvalue": id, "criteria": "eq", "datatype": 'ObjectId' });

    var billRes, billPaymentRes;
    billPaymentRes = await this._billpaymentService.AsyncGetByfilter(postData) as any;  // billPaymentRes

    if (billPaymentRes && billPaymentRes.length > 0) {
      this._billPaymentModel = billPaymentRes[0];
      billRes = billPaymentRes[0]['billid'] as any;
    } else {
      billRes = await this._billService.AsyncGetById(id) as any;                        // billRes
    }
   
    this._billModel = billRes;
    this.searchMember = billRes.customerid;
    this.subtotal = billRes['amount'];
    this.paymentDate = billRes['billdate'];
    this.paidamount = billRes['balance'];
    this.payamount = billRes['balance'];
    this.grandtotal = billRes['totalamount'];
    this.totaltax = billRes['taxamount'];
    
    
    if (billRes.property && billRes.property['packagediscount']) {
      this.packagediscount = billRes.property['packagediscount'];
    }
    // console.log("this._billModel",this._billModel);
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

    
  }

  getCoupons() {
    let postData = {};
    postData['search'] = [{ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" }];
    
    let url = "coupons/filter";
    let method = "POST";

    this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            this.couponList = data;
            this.couponfilteredOptions = of(this.couponList);
        }); 
}

 
  async applyCpn() {
    try {
        this.couponBox.disabled = true;
        this.couponBox.couponcode = this.couponBox.couponobject.couponcode;
        if(!this.couponBox.couponcode) return;

        let url = "coupons/applycoupon";
        let method = "POST";
        let postData = {};
        postData['search'] = [{ "searchfield": "couponcode", "searchvalue": this.couponBox.couponcode, "criteria": "eq", "datatype": "text" }];
        postData['billamount'] = this.grandtotal;

        var cpnres = await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData) as any;
        $("#close").click();
        if (cpnres && cpnres.couponcode) {

            let couponamount = cpnres.value ? cpnres.value : 0;
            let appliedcpn = this.payamount >= couponamount ? couponamount : this.payamount;
            if (appliedcpn >= this.payamount) {

                const varTemp = this;
                swal.fire({
                    title: 'Are you sure?',
                    text: 'Coupon amount is greater than pay amount !',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Use it!',
                    cancelButtonText: 'No',
                    customClass: {
                        confirmButton: "btn btn-success",
                        cancelButton: "btn btn-danger",
                    },
                    buttonsStyling: false
                }).then((result) => {
                    if (result.value) {
                        varTemp.couponBox.value = appliedcpn;
                        varTemp.payamount = varTemp.grandtotal - appliedcpn;
                        varTemp.showNotification("top", "right", "Coupon applied successfully !!", "success");
                    }
                });
            } else {
                this.couponBox.value = appliedcpn;
                this.payamount = this.grandtotal - appliedcpn;
                super.showNotification("top", "right", "Coupon applied successfully !!", "success");
            }
        } else {
            super.showNotification("top", "right", "Coupon not available !!", "danger");
        }
        this.couponBox.disabled = false;
    } catch (e) {
        this.couponBox.disabled = false;
    }
} 

  async onPay() {
    let bid = this._billPaymentModel._id;
    if (!this._billModel._id) {
        super.showNotification("top", "right", "Please make bill first !!", "danger");
        return;
    }
    if (this.paidamount != this.payamount) {
        super.showNotification("top", "right", "Enter valid amount !!", "danger");
        return;
    }

    this._billPaymentModel.bill = this._billModel;
    this._billPaymentModel.billid = this._billModel._id;
    this._billPaymentModel.paymentdate = new Date();
    this._billPaymentModel.customerid = this.searchMember._id;
    this._billPaymentModel.onModel = this._billModel.onModel;
    this._billPaymentModel.paidamount = this.paidamount;
    
    this._billPaymentModel.couponamount = this.couponBox.value;
    if(this.couponBox && this.couponBox.couponobject && this.couponBox.couponobject._id){
        this._billPaymentModel.couponcode = this.couponBox.couponobject._id;
    }

    this._billPaymentModel.property = {};
    this._billPaymentModel.property['payments'] = {};
    this._billPaymentModel.property['payments']['cash'] = this.paidamount;
     

    let url = "billpayments";
    let method = bid ? "PUT" : "POST";

    console.log("this._billPaymentModel", this._billPaymentModel);

    this.disableBtn = true;
    this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, this._billPaymentModel, bid)        
        .then((billPayRes) => {
            if (billPayRes) {
                super.showNotification("top", "right", "Payment made successfully !!", "success");
                if(this._billPaymentModel.onModel == 'Prospect'){
                  this._router.navigate([`/pages/customer-module/profile/${this.searchMember._id}`]);
                }else if(this._billPaymentModel.onModel == 'Member'){
                  this._router.navigate([`/pages/members/profile/${this.searchMember._id}`]);
                }else{
                  this._router.navigate(['/pages/dynamic-dashboard']);
                }
                this.disableBtn = false;
            }
            console.log("this._billPaymentModel", this._billPaymentModel)
        }).catch((e) => {
            this.disableBtn = false;
        });
}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  displayFn(user: any): string {
      return user && user.couponcode ? user.couponcode : '';
  }

  enterCoupon(event) {
      if (event.target.value) {
        this.couponfilteredOptions = of(this._customerfilter(event.target.value));
      } else {
        this.couponfilteredOptions = of(this.couponList);
      }
    }

    private _customerfilter(value: string): string[] {
      let results = [];
      for (let i = 0; i < this.couponList.length; i++) {
        if (this.couponList[i].couponcode.toLowerCase().indexOf((value).toLowerCase()) > -1) {
          results.push(this.couponList[i]);
        }
      }
      return results;
    }

    onRemoveCoupon() {
      this.payamount = this.grandtotal;
      this.couponBox.value = 0;
      this.couponBox.couponcode = null;
  }

  onlinePay(billid : any){
    var ishttps: boolean = false;
    if (location.protocol == "https:") {
    ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?billid=${billid}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
}

}
