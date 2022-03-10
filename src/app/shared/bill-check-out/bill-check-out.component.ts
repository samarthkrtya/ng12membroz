import { Component, Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

import { CommonService } from '../../core/services/common/common.service';
import { BillPaymentModel } from '../../core/models/sale/billpayment';
import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BillService } from '../../core/services/sale/bill.service';

declare var $: any;
import swal from 'sweetalert2';


@Component({
    selector: 'app-bill-check-out',
    templateUrl: './bill-check-out.component.html',
})

export class BillCheckOutComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {
 
    public giftcardChanged: Subject<string> = new Subject<string>();

    destroy$: Subject<boolean> = new Subject<boolean>();

    @Input() billid: string;
    @Input() billpayid: string;

    @Input() formname: string;
    @Input() payformname: string;

    paidamount: number = 0;
    outstandingamount: number = 0;
    usedoutstandingamount: number = 0;
    tips : number;
    customer: any;
    onModel: string;

    selectedbillpayment: any;

    disableBtn: boolean = false;
    isLoadingPage: boolean = false;
    paymentDate: Date = new Date();
 
    billpaymentList: any[] = [];
    displayList: boolean = false;

    couponList: any[] = [];
    couponfilteredOptions: Observable<any[]>;

    couponBox: any = {};
    walletDetail: any = {};
    cashPayment: any = { checked: false, mode: 'Cash', cashamount: 0, receiptnumber: null };
    chequePayment: any = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
    cardPayment: any = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
    creditnotes: any = { checked: false, mode: 'Credit Notes' , creditnotes: null , creditnotesid: null , creditnotesamount: null };
    _billPaymentModel = new BillPaymentModel();
    visibility : any = {};
    
    gcChecked : boolean = false;
    gifts : any[] = [];

    iouChecked: boolean = false;
    currentRoleDetail: any;
    isMemberLogin: boolean = false;

    billstatus : string;
    billdate: Date;
    billdetails: any;
    subtotal: number = 0;
    grandtotal: number = 0;
    payamount: number = 0;
    deposit: number = 0;
    mainpayamount: number = 0;
    mainbalance: number = 0;
    
    displayVoid : boolean = false;
    functionPermission: string[] = [];

    deletedItem : any = {};

    sellby_fields = {
        "fieldname": "sellby",
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
        "dbvalue": "",
        "visible": true,
        "modelValue": {},
    };

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
        "dbvalue": "",
        "visible": true,
        "modelValue": {},
    };

    cardname_fields = {
        "fieldname": "cardname",
        "fieldtype": "lookup",
        "search": [
            { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
            { "searchfield": "lookup", "searchvalue": "cardtype", "criteria": "eq" }
        ],
        "select": [
            { "fieldname": "_id", "value": 1 },
            { "fieldname": "data", "value": 1 },
        ],
        "value": "",
        "dbvalue": "",
    };

    chequebankname_fields = {
        "fieldname": "chequebankname",
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
        "dbvalue": "",
    };

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
        "dbvalue": "",
    }


    constructor(
        private _commonService: CommonService,
        private _billService: BillService, 
    ) {
        super();
        this.pagename = 'bill-check-out';

        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail = { checked: false, disabled: false, value: 0, used: 0 };
    }

    async ngOnInit() {

        this.isLoadingPage = true; 
        await super.ngOnInit();
        await this.initializeVariable();
        await this.getBillPayment();
        this.getCoupons();        

        this._billService
            .AySubBilldetail
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (data: any) => {
                if (data) {
                    // console.log("data==>",data);
                    this.billdate = data?.bill?.billdate;
                    this.billstatus =  data?.bill?.status;
                    this.billdetails =  data?.bill;
                    this.subtotal = data.billamount;
                    this.grandtotal = data.grandtotal;
                    this.customer = data.customerid;
                    this.onModel = data.onModel;
                    this.outstandingamount = data.outstandingamount;
                    this.mainpayamount = data.balance;
                    this.deposit = data?.bill?.deposit ? data?.bill?.deposit : 0;  // will change it with real data; 
                    this.payamount = data?.bill == 'Unpaid' ?  data.balance - this.deposit : data.balance;
                    // this.payamount = data.balance// BEFORE CODE
                    this.getWalletDetail();

                    this.mainbalance = this.paidamount + this.payamount;

                    if(data.balance > 0){
                        this.cashPayment.checked = true;
                        this.cashPayment.cashamount = this.payamount;
                        this.onChangePA();
                    }
                    const billdate =  new Date(this.billdetails?.createdAt); //  need to update it
                    const today = new Date();
                    this.displayVoid = billdate.getDate() == today.getDate() && billdate.getMonth() == today.getMonth() && billdate.getFullYear() == today.getFullYear();    
                }
            });
        this.isLoadingPage = false;

       
    
    }

    methodChecked(event : any , method : string){
         if(!event.checked){
            if(method == 'cash')  {
                this.cashPayment = { checked: false, mode: 'Cash', cashamount: 0, receiptnumber: null };
            }else if(method == 'cheque'){
                 this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };             
            }else if(method == 'card'){
                 this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
            }
            this.onChangePA();
        }
    }

    checkcreditnote(value : any){
        let url = "creditdebitnotes/findvalidcreditnotes";
        let method = "POST";
        
        let postData = {};
        postData['customerid'] = this.customer._id;
        postData['document'] = value;

        this.disableBtn = true; 

        this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                if(data && data._id){
                    this.creditnotes.creditnotesamount = data.adjustment;
                    this.creditnotes.creditnotesid = data._id;
                    this.creditnotes.creditnotes = data.giftcard; // need to verify
                    this.payamount = this.grandtotal - this.additionalamount();
                    this.mainbalance = this.payamount;

                    this.paidamount = this.payamount;
                    this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
                    this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
                    this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
                    this.showNotification("top", "right", "Credit Notes applied successfully !!", "success");
                
                } else {
                    this.creditnotes.creditnotesamount = null;
                    this.creditnotes.creditnotesid = null;
                    this.creditnotes.creditnotes = null;
                    this.showNotification("top", "right", "Credit Notes not available !!", "danger");
                }
                this.disableBtn = false;
            });
    }

    deletecreditnotes(){
        if(this.selectedbillpayment && this.selectedbillpayment._id){
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
                    this.deletedItem = {...this.creditnotes};
                    this.creditnotes.creditnotes = null;
                    this.creditnotes.creditnotesid = null;
                    this.creditnotes.creditnotesamount = null;
                    this.onPay();
                }
            });
        }else{
            this.creditnotes.creditnotes = null;
            this.creditnotes.creditnotesid = null;
            this.creditnotes.creditnotesamount = null;
            this.showNotification("top", "right", "Credit removed !!", "success");

            this.payamount = this.grandtotal + this.additionalamount();
            this.mainbalance = this.payamount;
        }
    }


    async initializeVariable() {
        this.functionPermission = [];
        this.subtotal = 0;
        this.grandtotal = 0;
        this.customer = null;
        this.onModel = null;
        this.deletedItem = null;
        this.outstandingamount = 0;
        this.usedoutstandingamount = 0;
       
        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail = { checked: false, disabled: true, value: 0, used: 0 };
        this.paymentreceivedby_fields.dbvalue = this._loginUserId;
        // this.sellby_fields.dbvalue = this._loginUserId;        
        if(this._loginUserBranch?.paymentsetting){
            this.visibility['cash'] =  this._loginUserBranch?.paymentsetting?.acceptcash == 'Yes';
            this.visibility['cheques'] =  this._loginUserBranch?.paymentsetting?.acceptchecks == 'Yes';
            this.visibility['creditcards'] =  this._loginUserBranch?.paymentsetting?.acceptcreditcard == 'Yes';
            this.visibility['giftcards'] =  this._loginUserBranch?.paymentsetting?.acceptgiftcards == 'Yes';
            this.visibility['creditnotes'] =  this._loginUserBranch?.paymentsetting?.creditnotes == 'Yes';
            // enableservicecharge
        }
        // console.log("this.visibility",this.visibility);

        return;
    }

    getWalletDetail() {
        if (this.customer && this.customer._id) {
            let postData = {};
            postData['search'] = [{ "searchfield": "_id", "searchvalue": this.customer._id, "criteria": "eq", "datatype": "ObjectId" }];
            postData['pageNo'] = 1;
            postData['size'] = 10;
            let onModel =  `${this.onModel.slice().toLowerCase()}s`;
            let url = onModel+"/filter/wallet/view";
            let method = "POST";
            this._commonService
                .commonServiceByUrlMethodData(url, method, postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {

                    if (data && data.length > 0 && data[0].wallet && data[0].wallet.balance && data[0].wallet.balance > 0) {
                        this.walletDetail['value'] = data[0].wallet.balance;
                        this.walletDetail['disabled'] = false;
                    }
                    // this.walletDetail['value'] = 100;
                });
        }
    }

    getCoupons() {
        const url = "coupons/view/filter";
        const method = "POST";

        let postData = {};
        postData['search'] = [];
        postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
        postData['search'].push({ "searchfield": "property.applyonbill", "searchvalue": true, "criteria": "eq", "datatype": 'boolean' });
        postData['search'].push({ "searchfield": "availcoupon", "searchvalue": 0, "criteria": "gt", "datatype": 'number' });
        
        postData['viewname'] = "couponviews";

        this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                this.couponList = data;
                this.couponfilteredOptions = of(this.couponList);
            });
    }


    async getBillPayment() {
        let url = "billpayments/filter";
        let method = "POST";

        let postData = {};
        postData['search'] = [];
        postData['search'].push({ "searchfield": "billid", "searchvalue": this.billid, "criteria": "eq", "datatype": "ObjectId" });
        postData['search'].push({ "searchfield": "property.deposits", "searchvalue": false, "criteria": "eq", "datatype": "boolean", "cond": "or"  });
        postData['search'].push({ "searchfield": "property.deposits", "searchvalue": false, "criteria": "exists", "datatype": "boolean", "cond": "or" });

        await this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData)
            .then((data: any) => {
                console.log('data =>', data);
                if (data && data.length > 0) { 
                    this.billpaymentList = [];
                    this.billpaymentList = data;
                    if (this.billpayid) {
                        this.selectedbillpayment = this.billpaymentList.find(a => a._id == this.billpayid);
                    } else {
                        this.selectedbillpayment = this.billpaymentList[0];
                    }
                    this.onBillPaymentChange(this.selectedbillpayment);
                    this.displayList = true;
                }
            });
    }


    onBillPaymentChange(value: any) { 
        this.paymentDate = value.paymentdate;
        this.paidamount = value.paidamount;
       
        this.paymentreceivedby_fields.visible  =  false;
        // this.sellby_fields['visible']  =  false;
        setTimeout(() => {
            this.paymentreceivedby_fields.dbvalue  =  value?.receivedby?._id;
            this.paymentreceivedby_fields.visible  =  true;

            // this.sellby_fields['dbvalue']  =  value?.sellby?._id;
            // this.sellby_fields['visible']  =  true;
        });

        if (value.couponamount && value.couponamount > 0 && value.couponcode && value.couponcode._id) {
            this.couponBox.disabled = true;
            this.couponBox.disableDelete = true;
            this.couponBox.value = value.couponamount;
            this.couponBox.couponcode = value.couponcode.couponcode;

            this.paidamount -= value.couponamount;            
        }

        if (value.billid && value.billid.couponcode) {
            this.couponBox.object = value.billid.couponcode;
        }
        if (value.walletamount && value.walletamount > 0) {
            this.walletDetail.used = value.walletamount;
            this.walletDetail.disabled = true;

            this.paidamount -= value.walletamount;  
        }

        if (value.property && value.property.payments) {
            if (value.property.payments['cash']) {
                this.cashPayment.checked = true;
                this.cashPayment.cashamount = value.property.payments['cash'];
                this.cashPayment.receiptnumber = value.property.payments['receiptnumber'];
            }
            if (value.property.payments['cheque']) {
                this.chequePayment.checked = true;
                this.chequePayment.chequeamount = value.property.payments['cheque'];
                this.chequePayment.chequenumber = value.property.payments['chequenumber'];
                this.chequePayment.chequedate = value.property.payments['chequedate'];
                this.chequestatus_fields.dbvalue = value.property.payments['chequestatus'];
                this.chequebankname_fields.dbvalue = value.property.payments['chequebankname'];
            }
            if (value.property.payments['card']) {
                this.cardPayment.checked = true;
                this.cardPayment.cardamount = value.property.payments['card'];
                this.cardPayment.cardnumber = value.property.payments['cardnumber'];
                this.cardPayment.tidnumber = value.property.payments['tidnumber'];
                this.cardname_fields.dbvalue = value.property.payments['cardname'];
            }
        }
        if (value.property && value.property.gifts && value.property.gifts.length > 0) {
            this.gcChecked = true;
            this.gifts = value.property.gifts;
            this.paidamount -= this.gifts.map(a=>a.giftamount).reduce((a,b)=> a+b); 
        }
        if (value.property && value.property.creditnotes && value.property.creditnotes.creditnotesid) {
            this.creditnotes.checked = true;
            this.creditnotes.creditnotes = value.property.creditnotes.document;
            this.creditnotes.creditnotesid = value.property.creditnotes.creditnotesid;
            this.creditnotes.creditnotesamount = value.property.creditnotes.creditnotesamount;
            this.paidamount -= value.property.creditnotes.creditnotesamount; 
        }
        if (value.property && value.property.tips){
            this.tips = value.property.tips;
        }
        this.deletedItem = null;
        const billdate = new Date(this.billdetails?.createdAt); //  need to update it
        const today = new Date();
        this.displayVoid = billdate.getDate() == today.getDate() && billdate.getMonth() == today.getMonth() && billdate.getFullYear() == today.getFullYear();
        this.mainbalance = value.paidamount + this.payamount;
    }

    onlinePay(billid: any) {
        var ishttps: boolean = false;
        if (location.protocol == "https:") {
            ishttps = true;
        }
        var url = `http://pay.membroz.com/#/payment-prev?billid=${billid}&https=${ishttps}&domain=${location.hostname}`;
        window.open(url, '_blank');
    }

    async applyCpn() {
        
        try {
            let startdate = moment(this.couponBox.couponobject.property.start_date);
            let enddate = moment(this.couponBox.couponobject.property.end_date);

            let today = moment(new Date());
            this.couponBox.couponcode = this.couponBox.couponobject.couponcode;
            if (!this.couponBox.couponcode) {
                super.showNotification("top", "right", "Please select coupons !!", "danger");
                return;
            }else if(this.couponBox.availcoupon <= 0){
                super.showNotification("top", "right", "Coupon is max used !!", "danger");
                return;
            }

            if (today.isAfter(startdate) && today.isBefore(enddate)) {
                this.couponBox.disabled = true;
                let url = "coupons/applycoupon";
                let method = "POST";
                let postData = {};
                postData['search'] = [{ "searchfield": "couponcode", "searchvalue": this.couponBox.couponcode, "criteria": "eq", "datatype": "text" }];
                postData['billamount'] = this.grandtotal;

                var cpnres = await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData) as any;
                // console.log("cpnres", cpnres);
                $("#close").click();
                if (cpnres && cpnres.couponcode) {
                       // this.payamount = this.mainbalance;
                        let couponamount = cpnres.value ? cpnres.value : 0;
                        let appliedcpn = this.payamount >= couponamount ? couponamount : this.payamount;
                        let appliedwalt = this.walletDetail.used;
                        if (appliedcpn > this.payamount) {

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
                                    setTimeout(() => {
                                        varTemp.payamount = varTemp.grandtotal - this.additionalamount();
                                        this.mainbalance = varTemp.payamount;

                                        this.paidamount = this.payamount;
                                        this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
                                        this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
                                        this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
                                        
                                        varTemp.showNotification("top", "right", "Coupon applied successfully !!", "success");
                                    });
                                } else {
                                    this.onRemoveCoupon();
                                }
                            });
                        } else {
                            this.couponBox.value = appliedcpn; 
                            this.payamount = this.grandtotal - this.additionalamount();
                            this.mainbalance = this.payamount;
                            this.paidamount = this.payamount;
                            this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
                            this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
                            this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
                            
                            super.showNotification("top", "right", "Coupon applied successfully !!", "success");
                        }
                    
                } else {
                    super.showNotification("top", "right", "Coupon not available !!", "danger");
                }
            } else {
                super.showNotification("top", "right", "Coupon not available for today !!", "danger");
                return;
            }
            this.couponBox.disabled = false;
        } catch (e) {
            console.log("e", e);
            this.couponBox.disabled = false;
        }
    }

    checkIOU(event) {
        this.iouChecked = false;
        var amount = this.outstandingamount;
        if (event.checked == true) {
            this.payamount = this.mainpayamount;
            this.payamount += amount;
            this.usedoutstandingamount = amount;
            if (amount > 0) this.iouChecked = true;
        } else {
            this.payamount -= amount;
            this.usedoutstandingamount = 0;
        }
        this.mainbalance = this.payamount;

        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail["checked"] = false;
        this.walletDetail["disabled"] = this.walletDetail["value"] == 0;
        this.walletDetail["used"] = 0;
    }

    onRemoveCoupon() { /// doubt
        this.couponBox.value = 0;
        this.couponBox.couponcode = null;
        this.payamount = this.grandtotal - this.additionalamount();
        this.mainbalance = this.payamount;

        this.paidamount = this.payamount;
        this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
        this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
        this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
        
    }

    checkWallet(event) {
        this.walletDetail.checked = event.checked;
        let walletamount = this.walletDetail.value ? this.walletDetail.value : 0;
        let appliedwlt = this.payamount >= walletamount ? walletamount : this.payamount;
        if (event.checked == true) {
            this.walletDetail.used = appliedwlt;
        } else {
            this.walletDetail.used = 0;
        }
        this.payamount = this.grandtotal - this.additionalamount();
        this.mainbalance = this.payamount;

        this.paidamount = this.payamount;
        this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
        this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
        this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
        
    }

    cleargiftcard(){
        this.gifts = [{billid: null , itemnumber: null ,giftamount: null }];
    }

    addgiftcard(){
        this.gifts.push({ billid : null , itemnumber : null , giftamount : null })
    }

    deletegift(i : number , gift : any){
        if(this.selectedbillpayment && this.selectedbillpayment._id){
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
            }).then((result) => {
                if (result.value) {
                    this.deletedItem = gift;
                    setTimeout(() => {
                        this.gifts.splice(i,1);
                        this.onPay();
                    }, 200);
                }
            });
            
        }else{
            this.gifts.splice(i,1)
            this.showNotification("top", "right", "Redeemed removed !!", "success");
            this.payamount = this.grandtotal - this.additionalamount();
            this.mainbalance = this.payamount;
            this.paidamount = this.payamount;
            this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
            this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
            this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
            
            this.gcChecked = !(this.gifts.length == 0);
        }
    }

    checkgiftcard(value : any, i : number){
        let url = "bills/findvalidgc";
        let method = "POST";
        
        let postData = {};
        postData['itemnumber'] = value;

        this.disableBtn = true;
        this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
                console.log("data",data);
                if(data && data._id){
                    let str =  data.items.to ? "Gift Certificate" : "Gift Card";
                    var fnd = this.gifts.find(a=>a.itemnumber == value && a.billid == data._id);
                    if(fnd){
                        this.showNotification("top", "right", str+" is already redeemed !!", "danger");
                        this.disableBtn = false;
                        return;
                    }
                    this.gifts.splice(i,1,{billid : data._id, giftamount : data.items.cost, itemnumber : data.items.itemnumber})
                     
                    this.payamount = this.grandtotal - this.additionalamount();
                    this.mainbalance = this.payamount;
                    this.paidamount = this.payamount;
                    this.cashPayment = { checked: true, mode: 'Cash', cashamount: this.payamount, receiptnumber: null };
                    this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
                    this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
                    
                    this.showNotification("top", "right", str + " applied successfully !!", "success");
                } else {
                    this.gifts.splice(i,1,{billid : null, giftamount : null, itemnumber : null});
                    this.showNotification("top", "right", "Gift Not Found !!", "danger");
                }
                this.disableBtn = false;
            });
    }

    additionalamount() : number {
        let amount = 0;
        if(this.gifts.length > 0){
            amount +=  this.gifts.map(a=>a.giftamount).reduce((a,b) => a+b);
        }
        if(this.creditnotes.creditnotesamount)
        {
            amount += this.creditnotes.creditnotesamount;
        }
        if(this.couponBox.value)
        {
            amount += this.couponBox.value;
        }
        if(this.walletDetail.used)
        {
            amount += this.walletDetail.used;
        }
        return amount;
    }
    
    setNewPayment() {
        this.selectedbillpayment = null;
        this.couponBox = { couponcode: '', disabled: false, couponobject: null, value: 0, disableDelete: false };
        this.walletDetail = { checked: false, disabled: false, value: 0, used: 0 };
        this.paidamount = 0;

        this.cashPayment = { checked: false, mode: 'Cash', cashamount: 0, receiptnumber: null };
        this.chequePayment = { checked: false, mode: 'Cheque', chequeamount: 0, chequenumber: null, chequebankname: null, chequedate: null, chequestatus: null };
        this.cardPayment = { checked: false, mode: 'Card', cardamount: 0, cardname: null, cardnumber: null, tidnumber: null };
    
        this.displayList = false;
        this.paymentDate = null;
        this.mainbalance = this.payamount;
    }

    clearData() {
        this.displayList = true;
        this.selectedbillpayment = this.billpaymentList[0];
        this.onBillPaymentChange(this.selectedbillpayment);
    }

    onChangePA() {
        this.paidamount = 0;
        if (this.cashPayment.checked) {
            this.paidamount += this.cashPayment.cashamount >= 0 ? this.cashPayment.cashamount : 0;
        }
        if (this.chequePayment.checked) {
            this.paidamount += this.chequePayment.chequeamount >= 0 ? this.chequePayment.chequeamount : 0;
        }
        if (this.cardPayment.checked) {
            this.paidamount += this.cardPayment.cardamount >= 0 ? this.cardPayment.cardamount : 0;
        }
    }

    async onPay() {
        let bid = this.selectedbillpayment && this.selectedbillpayment._id ? this.selectedbillpayment._id : null;
        let recvby = this.paymentreceivedby_fields.modelValue && this.paymentreceivedby_fields.modelValue['_id'] ? this.paymentreceivedby_fields.modelValue['_id'] : null;
        // let sellby = this.sellby_fields['modelValue'] && this.sellby_fields['modelValue']['_id'] ? this.sellby_fields['modelValue']['_id'] : null;
    
        if (!this.billid) {
            super.showNotification("top", "right", "Please make bill first !!", "danger");
            return;
        } else if (!this.paymentDate) {
            super.showNotification("top", "right", "Select payment date !!", "danger");
            return;
        } else if (!this.cashPayment.checked && !this.cardPayment.checked && !this.chequePayment.checked) {
            super.showNotification("top", "right", "Select one payment !!", "danger");
            return;
        } else if (!recvby) {
            super.showNotification("top", "right", "Please enter received by !!", "danger");
            return;
        }
                
        if (this.payamount > 0) {
            if (!this.walletDetail.checked && this.couponBox.value <= 0) {
                if (this.paidamount <= 0) {
                    super.showNotification("top", "right", "Please enter amount !!", "danger");
                    return;
                }
            }
        }
        if (this.paidamount > this.mainbalance) {
            super.showNotification("top", "right", "Enter valid amount !!", "danger");
            return;
        }
        

        this._billPaymentModel.property = {};
        this._billPaymentModel.property['payments'] = {};
        if (this.cashPayment.checked) {                     
            this._billPaymentModel['property']['mode'] = "CASH";
            this._billPaymentModel.property['payments']['cash'] = this.cashPayment.cashamount;
            this._billPaymentModel.property['payments']['receiptnumber'] = this.cashPayment.receiptnumber;
        }
        if (this.chequePayment.checked) {                                
            this._billPaymentModel['property']['mode'] = "CHEQUE";
            this._billPaymentModel.property['payments']['cheque'] = this.chequePayment.chequeamount;
            this._billPaymentModel.property['payments']['chequenumber'] = this.chequePayment.chequenumber;
            this._billPaymentModel.property['payments']['chequedate'] = this.chequePayment.chequedate && this.chequePayment.chequedate._d ? this.chequePayment.chequedate._d : this.chequePayment.chequedate;
            this._billPaymentModel.property['payments']['chequebankname'] = this.chequePayment.chequebankname && this.chequePayment.chequebankname['code'] ? this.chequePayment.chequebankname['code'] : null;
            this._billPaymentModel.property['payments']['chequestatus'] = this.chequePayment.chequestatus && this.chequePayment.chequestatus['code'] ? this.chequePayment.chequestatus['code'] : null;
        }
        if (this.cardPayment.checked) {                                 
            this._billPaymentModel['property']['mode'] = "CARD";
            this._billPaymentModel.property['payments']['card'] = this.cardPayment.cardamount;
            this._billPaymentModel.property['payments']['cardname'] = this.cardPayment.cardname && this.cardPayment.cardname['code'] ? this.cardPayment.cardname['code'] : null;
            this._billPaymentModel.property['payments']['cardnumber'] = this.cardPayment.cardnumber;
            this._billPaymentModel.property['payments']['tidnumber'] = this.cardPayment.tidnumber;
        }
        if(this.gcChecked && this.gifts.length > 0) {
            this._billPaymentModel.property['gifts'] = this.gifts.filter(a=>a.billid != null);
            this.paidamount += this.gifts.map(a=>a.giftamount).reduce((a,b)=> a+b);
        }
        if(this.creditnotes.checked && this.creditnotes.creditnotesid) {
            this._billPaymentModel.property['creditnotes'] = {};
            this._billPaymentModel.property['creditnotes']['creditnotesid'] = this.creditnotes.creditnotesid;
            this._billPaymentModel.property['creditnotes']['document'] = this.creditnotes.creditnotes;
            this._billPaymentModel.property['creditnotes']['creditnotesamount'] = this.creditnotes.creditnotesamount;
            this.paidamount += this.creditnotes.creditnotesamount;
        }
        if(this.tips){
            this._billPaymentModel['property']['tips'] = this.tips;            
        }
        
        this._billPaymentModel.billid = this.billid;
        this._billPaymentModel.paymentdate = this.paymentDate;
        this._billPaymentModel.customerid = this.customer._id;
        this._billPaymentModel.onModel = this.onModel;
        this._billPaymentModel.paidamount = this.paidamount;
        this._billPaymentModel.outstandingamount = this.usedoutstandingamount;
        this._billPaymentModel.couponamount = this.couponBox.value;
        this._billPaymentModel.receivedby = recvby;
        // this._billPaymentModel.sellby = sellby;

        if (this.couponBox && this.couponBox.couponobject && this.couponBox.couponobject._id) {
            this._billPaymentModel.couponcode = this.couponBox.couponobject._id;
        }
        if (this.walletDetail.checked) {
            this._billPaymentModel.walletamount = this.walletDetail.used;
        }


        //additional
        if(this.deletedItem && this.deletedItem.billid){ 
            this._billPaymentModel.gifts = this.deletedItem;
        }else if(this.deletedItem && this.deletedItem.creditnotesid){
            this._billPaymentModel.creditnotes = this.deletedItem;
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
                    this.disableBtn = false;
                }
            }).catch((e) => {
                this.disableBtn = false;
                super.showNotification("top", "right", "Something went wrong !!", "danger");
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

    returnOrder(){
        this._router.navigateByUrl('/pages/payment-module/creditdebit-note/mode/bill/'+this.customer._id + "/"+ this.billid);    
    }

    voidOrder(){
        swal.fire({
            title: 'Are you sure?',
            text: 'Voiding a transaction should ONLY take place if you have NOT collected the money (via cash or card) from the customer, for whatever reason. If you have received payment from the customer, please use the REFUND option to cancel a transaction. !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Void it!',
            cancelButtonText: 'No',
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger",
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {

                let url = 'bills/void';
                let method = "PUT"; 

                this.disableBtn = true;
                this._commonService
                    .commonServiceByUrlMethodDataAsync(url, method,{},this.billid)
                    .then((billPayRes) => {
                        console.log("billPayRes==>",billPayRes)
                        super.showNotification("top", "right", "Payment void successfully !!", "success");
                        this._router.navigate([`/pages/dynamic-list/list/bill`]);
                        this.disableBtn = false;
                    }).catch((e) => {
                        this.disableBtn = false;
                    });
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

}
