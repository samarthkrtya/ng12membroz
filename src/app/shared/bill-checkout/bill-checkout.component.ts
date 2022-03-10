import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { CommonService } from '../../core/services/common/common.service';
import { BillModel } from '../../core/models/sale/bill';
import { BillPaymentModel } from '../../core/models/sale/billpayment';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';

@Component({
    selector: 'app-bill-checkout',
    templateUrl: './bill-checkout.component.html',
})

export class BillCheckoutComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit {

    destroy$: Subject<boolean> = new Subject<boolean>();

    @Input() isLoadingCart: any;

    @Input() searchMember: any; 
    
    @Input() billModel = new BillModel();
    @Input() billPaymentInp = new BillPaymentModel();
    @Input() grandtotal: number = 0;
    @Input() customeroutstandingamount: number = 0;
    @Input() payamount: number = 0;

    @Input() formname: string;
    @Input() payformname: string;
    

    paidamount: number = 0;
    outstandingamount: number = 0;
    balancepaid: number = 0;

    disableBtn: boolean = false;
    
    paymentDate: Date;

    couponList : any[] = [];
    couponfilteredOptions : Observable<any[]>;

    couponBox: any = {};
    walletDetail: any = {};
    cashPayment: any = { checked: false, mode: 'Cash', cashamount: 0 };
    chaquePayment: any = { checked: false, mode: 'Cheque', chaquenumber: '', chaquedate: '', chaqueamount: null };
    cardPayment: any = { checked: false, mode: 'Card', cardnumber: '', tidnumber: '', cardamount: null };

    _billPaymentModel = new BillPaymentModel();

    iouChecked : boolean = false;
    currentRoleDetail: any;
    isMemberLogin: boolean = false;
 
    constructor(
        private _commonService: CommonService
    ) {
        super();
        this.pagename = 'bill-checkout';

        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail = { checked: false, disabled: false, value: 0, used: 0 };
    }

    async ngOnInit() {
        await super.ngOnInit();
        this.getWalletDetail();
        this.getCoupons();
        if (this.billPaymentInp && this.billPaymentInp._id) {
            await this.setDatas(this.billPaymentInp);
        }else{
            this.payamount = this.grandtotal;
        }
        
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
        // console.log("this.billModel",this.billModel);
    }

    ngAfterViewInit() {
      
    }

    async setDatas(data: any) {
      
        this.paidamount = data.billid.paidamount;
        this.payamount = data.billid.balance;
        this.balancepaid = this.paidamount + this.payamount;
        this.paymentDate = data.paymentdate;
        if (data.couponamount && data.couponamount > 0) {
            this.couponBox.disabled = true;
            this.couponBox.disableDelete = true;
            this.couponBox.value = data.couponamount;
        }
        if(data.billid && data.billid.couponcode){
            this.couponBox.object = data.billid.couponcode;
        }
        if (data.walletamount && data.walletamount > 0) {
            this.walletDetail.used = data.walletamount;
            this.walletDetail.disabled = true;
        }

        if (data.property && data.property.payments) {
            if (data.property.payments['cash']) {
                this.cashPayment.checked = true;
                this.cashPayment.cashamount = data.property.payments['cash'];
            }
            if (data.property.payments['chaque']) {
                this.chaquePayment.checked = true;
                this.chaquePayment.chaqueamount = data.property.payments['chaque'];
            }
            if (data.property.payments['card']) {
                this.cardPayment.checked = true;
                this.cardPayment.chaqueamount = data.property.payments['card'];
            }
            
            
        }
        return;
    }

    getWalletDetail() {
        if (this.searchMember && this.searchMember._id) {
            let postData = {};
            postData['search'] = [{ "searchfield": "_id", "searchvalue": this.searchMember._id, "criteria": "eq", "datatype": "ObjectId" }];
            postData['pageNo'] = 1;
            postData['size'] = 10;

            let url = "members/filter/wallet/view";
            let method = "POST";

            this._commonService
                .commonServiceByUrlMethodData(url, method, postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                    if (data && data.length > 0 && data[0].wallet && data[0].wallet.balance) {
                        this.walletDetail['value'] = data[0].wallet.balance;
                    }
                    // this.walletDetail['value'] = 120;
                });
        }
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

    onlinePay(billid : any){
        var ishttps: boolean = false;
        if (location.protocol == "https:") {
        ishttps = true;
        }
        var url = `http://pay.membroz.com/#/payment-prev?billid=${billid}&https=${ishttps}&domain=${location.hostname}`;
        // console.log("url", url);
        window.open(url, '_blank');
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
                let appliedwalt = this.walletDetail.used;
                let outstandingamount = this.outstandingamount ? this.outstandingamount : 0;
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
                            varTemp.payamount = varTemp.grandtotal - appliedcpn - appliedwalt + outstandingamount;
                            varTemp.showNotification("top", "right", "Coupon applied successfully !!", "success");
                        }
                    });
                } else {
                    this.couponBox.value = appliedcpn;
                    this.payamount = this.grandtotal - appliedcpn - appliedwalt + outstandingamount;
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

    checkIOU(event) {
        this.iouChecked = false;
        var amount = this.customeroutstandingamount;
        if (event.checked == true) {
            this.outstandingamount = amount ? amount : 0;
            this.payamount += this.outstandingamount;
            if (amount > 0) this.iouChecked = true;
        } else {
            this.outstandingamount = 0;
            this.payamount -= amount ? amount : 0;
        }
        this.balancepaid += this.outstandingamount;
        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail = { checked: false, disabled: false, used: 0 };
    }

    checkWallet(event) {
        this.walletDetail.checked = event.checked;
        let walletamount = this.walletDetail.value ? this.walletDetail.value : 0;
        let appliedwlt = this.payamount >= walletamount ? walletamount : this.payamount;
        let appliedcpn = this.couponBox.value;
        let outstandingamount = this.outstandingamount ? this.outstandingamount : 0;
        if (event.checked == true) {
            this.walletDetail.used = appliedwlt;
            this.payamount = this.grandtotal - appliedwlt - appliedcpn + outstandingamount;
        } else {
            this.walletDetail.used = 0;
            this.payamount = this.grandtotal - appliedcpn + outstandingamount;
        }
    }

    onRemoveCoupon() {
        let walletamount = this.walletDetail.used ? this.walletDetail.used : 0;
        let outstandingamount = this.outstandingamount ? this.outstandingamount : 0;
        this.payamount = this.grandtotal - walletamount + outstandingamount;
        this.couponBox.value = 0;
        this.couponBox.couponcode = null; 
    }

    onChangePA() {
        this.paidamount = 0;
        if (this.cashPayment.checked) {
            this.paidamount += this.cashPayment.cashamount >= 0 ? this.cashPayment.cashamount : 0;
        }
        if (this.chaquePayment.checked) {
            this.paidamount += this.chaquePayment.chaqueamount >= 0 ? this.chaquePayment.chaqueamount : 0;
        }
        if (this.cardPayment.checked) {
            this.paidamount += this.cardPayment.cardamount >= 0 ? this.cardPayment.cardamount : 0;
        }
    }

    async onPay() {
        let bid = this.billPaymentInp._id;
        if (!this.billModel._id) {
            super.showNotification("top", "right", "Please make bill first !!", "danger");
            return;
        }
        if (!this.cashPayment.checked && !this.cardPayment.checked && !this.chaquePayment.checked) {
            super.showNotification("top", "right", "Select one payment !!", "danger");
            return;
        }
        if(this.payamount > 0){
            if(!this.walletDetail.checked && this.couponBox.value <= 0){
                if(this.paidamount <= 0){
                    super.showNotification("top", "right", "Please enter amount !!", "danger");
                    return;
                }
            }
        }
        if (bid) {
            if (this.paidamount > this.balancepaid) {
                super.showNotification("top", "right", "Enter valid amount !!", "danger");
                return;
            }
        } else {
            if (this.paidamount > this.payamount) {
                super.showNotification("top", "right", "Enter valid amount !!", "danger");
                return;
            }
        }

      

        // else if (this.paidamount == 0) {
        //     super.showNotification("top", "right", "Enter min amount !!", "danger");
        //     return;
        // }

        // else if (this.cardPayment.checked && (!this.cardPayment.cardnumber || !this.cardPayment.tidnumber)) {
        //     super.showNotification("top", "right", "Enter required fields !!", "danger");
        //     return;
        // } else if (this.chaquePayment.checked && (!this.chaquePayment.chaquenumber || !this.chaquePayment.chaquedate)) {
        //     super.showNotification("top", "right", "Enter required fields !!", "danger");
        //     return;
        // }
        this._billPaymentModel.bill = this.billModel;
        this._billPaymentModel.billid = this.billModel._id;
        this._billPaymentModel.paymentdate = new Date();
        this._billPaymentModel.customerid = this.searchMember._id;
        if (this.searchMember.type == 'M') {
            this._billPaymentModel.onModel = "Member";
        } else if (this.searchMember.type == 'C') {
            this._billPaymentModel.onModel = "Prospect";
        } else if (this.searchMember.type == 'U') {
            this._billPaymentModel.onModel = "User";
        } else {
            this._billPaymentModel.onModel = this.billModel.onModel;
        }
        this._billPaymentModel.paidamount = this.paidamount;
        this._billPaymentModel.outstandingamount = this.outstandingamount;
        this._billPaymentModel.couponamount = this.couponBox.value;
        if(this.couponBox && this.couponBox.couponobject && this.couponBox.couponobject._id){
            this._billPaymentModel.couponcode = this.couponBox.couponobject._id;
        }
        if (this.walletDetail.checked) {
            this._billPaymentModel.walletamount = this.walletDetail.used;
        }
        this._billPaymentModel.property = {};
        this._billPaymentModel.property['payments'] = {};
        if (this.cashPayment.checked) {
            this._billPaymentModel.property['payments']['cash'] = this.cashPayment.cashamount;
        }
        if (this.chaquePayment.checked) {
            this._billPaymentModel.property['payments']['chaque'] = this.chaquePayment.chaqueamount;
            // this._billPaymentModel.property['payments'].push({ mode: 'chaque', chaquenumber: this.chaquePayment.chaquenumber, chaquedate: this.chaquePayment.chaquedate, amount: this.chaquePayment.chaqueamount });
        }
        if (this.cardPayment.checked) {
            this._billPaymentModel.property['payments']['card'] = this.cardPayment.cardamount;
            // this._billPaymentModel.property['payments'].push({ mode: 'card', cardnumber: this.cardPayment.cardnumber, tidnumber: this.cardPayment.tidnumber, amount: this.cardPayment.cardamount });
        }


        let url = "billpayments";
        let method = bid ? "PUT" : "POST";

        console.log("this._billPaymentModel", this._billPaymentModel);

        this.disableBtn = true;
        this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, this._billPaymentModel, bid)
            .then((billPayRes) => {
                if (billPayRes) {
                    super.showNotification("top", "right", "Payment made successfully !!", "success");
                    this._router.navigate([`/pages/dynamic-preview-list/${this.payformname}/${billPayRes["_id"]}`]); // billpayment
                    // this._router.navigate([`/pages/dynamic-preview-list/${this.formname}/${this.billModel._id}`]);
                    this.disableBtn = false;
                }
            }).catch((e) => {
                this.disableBtn = false;
            });
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
    

}
