import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize, tap, switchMap} from 'rxjs/operators';

import { BillModel } from '../../../../core/models/sale/bill';
import { BillPaymentModel } from '../../../../core/models/sale/billpayment';
import { BillService } from '../../../../core/services/sale/bill.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { BillCheckOutComponent } from '../../../../shared/bill-check-out/bill-check-out.component';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BasicValidators, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';
import * as moment from 'moment';


declare var $: any;
import swal from 'sweetalert2';


@Component({
  selector: 'app-manage-sales',
  templateUrl: 'manage-sales.component.html',
})

export class ManageSalesComponent extends BaseComponemntComponent implements OnInit, AfterViewInit, OnDestroy {

  form: FormGroup;
  bindId: any;
  billpayid: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  today : Date = new Date();

  @ViewChild('billcheckout', { static: false }) BillCheckOutCmp: BillCheckOutComponent;

  _billModel = new BillModel();
  _billPaymentModel = new BillPaymentModel(); 

  billItemList: any[] = [];
  billItemList2: any[] = [];
  billItemListGrp: any[] = [];
  cartItemList: any[] = [];

  giftCardList: any[] = [];
  giftCardList2: any[] = [];
  giftCardListGrp: any[] = [];

  giftCertificateList: any[] = [];
  giftCertificateList2: any[] = [];
  giftCertificateListGrp: any[] = [];

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;

  selectedCoupon: any = {};
  loadingprd: boolean = false;
  couponList: any[] = [];
  couponfilteredOptions: Observable<any[]>;
  
  subtotal: number = 0;
  discount: number = 0;
  taxamount: number = 0;
  taxdetail: any = {};
  grandtotal: number = 0;
  packagediscount: number = 0;
  balance: number = 0;
  paidamount: number = 0;
  outstandingamount: number = 0;
  status: string;

  searchMember: any;
  searchBox: any = {};
  selectedItem: any = {};

  isLoadingItems: boolean = false;
  isLoadingCart: boolean = false;
  isPaymentMode: boolean = false;
  isIOUMode: boolean = false;
  disableBtn: boolean = false;
  submitted: boolean;

  billform: FormGroup;
  isSubmitted : boolean = false;
  _propertyobjectModel : any;
  visible: boolean = false;

  memberControl = new FormControl();

  provider_fields = {
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

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }
  displayCn(user: any): string {
    return user && user.couponcode ? user.couponcode : '';
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _billItemService: BillItemService,
    private _billService: BillService,
    private cdRef: ChangeDetectorRef,
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.billpayid = params["billpayid"];

      this.pagename = 'manage-sales';

      this._formName = "bill";
    });
    if (this.bindId || this.billpayid) {
      this.isPaymentMode = true;
    }

    this.searchBox = { default: "Item", value: '', index: 0 };

    this.form = this.fb.group({
      'fullname': ['', Validators.required],
      'mobile': ['', Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber])],
      'email': ['', Validators.compose([Validators.required, BasicValidators.email])],
    });
    this.billform = this.fb.group({});
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.onLoadData();

    this.memberControl
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
    
  }

  ngAfterViewInit(){
    this.cdRef.detectChanges();
  }

  async onLoadData() {
    this.isLoadingItems = true; 
    // await this.getCustomer();
    await this.getItems();
    if (this.bindId) {
      await this.getBillbyId(this.bindId);
    }
    // this.getCoupons();
    this.isLoadingItems = false;
    this.visible = true;
     
  }

  setNewPayment(){
    this.BillCheckOutCmp.setNewPayment();
  }

  getCoupons() {
    const url = "coupons/view/filter";
    const method = "POST"
    
    let postData = {};
    postData['search'] = [{ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" }];
    postData['viewname'] = "couponviews";

    this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            this.couponList = data;
            this.couponfilteredOptions = of(this.couponList);
        });
  }

  enterCoupon(event) {
    if (event.target.value) {
        this.couponfilteredOptions = of(this._couponfilter(event.target.value));
    } else {
        this.couponfilteredOptions = of(this.couponList);
    }
  }

  private _couponfilter(value: string): string[] {
      let results = [];
      for (let i = 0; i < this.couponList.length; i++) {
          if (this.couponList[i].couponcode.toLowerCase().indexOf((value).toLowerCase()) > -1) {
              results.push(this.couponList[i]);
          }
      }
      return results;
 }

 
  setTimers(time : string): object | undefined{
    if(!time) return undefined;
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  

  handleEmptyInput(event){
    if(event.target.value === '') {
      let item = this.cartItemList.find(a => a.itemid == this.selectedItem._id);
      item['couponcode'] = null;
      item['coupondiscount'] = null;
      this.selectedCoupon = null;
    }
  }

  checkCpn(){
    this.loadingprd = true;

    const url = "coupons/checkvalidity";
    const method = "POST"
    let postData = {};
    postData['_id'] = this.selectedItem._id;
    postData['type'] = this.selectedItem?.to ?  "giftcertificate" : this.selectedItem?.itemnumber ? "giftcard" : "product";
        
    this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
            
            this.couponList = data;
            this.couponfilteredOptions = of(this.couponList);
            this.loadingprd = false;
        });
  }

 async onCouponSelect(coupon : any){
   if(coupon._id){
      try {
        let discount = this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0;
        let totalcost = this.selectedItem?.sale?.rate - discount;
        
        const url = "coupons/applycoupon";
        const method = "POST";
        
        let postData = {};
        postData['search'] = [{ "searchfield": "couponcode", "searchvalue": this.selectedCoupon.couponcode, "criteria": "eq", "datatype": "text" }];
        postData['billamount'] = totalcost;
        this.selectedCoupon.disable = true;

        let cpnres = await this._commonService.commonServiceByUrlMethodDataAsync(url, method, postData) as any;
        
        this.selectedCoupon.disable = false;
        if (cpnres && cpnres.couponcode) {
            let couponamount = cpnres.value ? cpnres.value : 0;
            let appliedcpn = totalcost >= couponamount ? couponamount : totalcost;
            let item = this.cartItemList.find(a => a.itemid == this.selectedItem._id);
            item['couponcode'] = this.selectedCoupon;
            item['coupondiscount'] = appliedcpn;
            this.selectedCoupon['coupondiscount'] = appliedcpn;
            this.selectedCoupon['finaltotalcost'] = this.selectedItem['totalcost'] - (appliedcpn * this.selectedItem?.quantity) ;
        } else {
            super.showNotification("top", "right", "Coupon not available !!", "danger");
            this.selectedCoupon = null;
        }
      } catch (e) {
          console.log("e", e);
      }
    }
  }
    
 async onDonePrd(){
    this.disableBtn = true;
    let cartItem = this.cartItemList.find(a => a.itemid == this.selectedItem?._id);
    if(this.provider_fields?.modelValue && this.provider_fields?.modelValue['_id']){
      cartItem['seller'] = this.provider_fields?.modelValue;
    }
    cartItem['quantity'] = this.selectedItem['quantity'];
    cartItem['stock'] = this.selectedItem?.orginalstock - this.selectedItem?.quantity;
    this.makeModel();
    this.GetBillDetail(this._billModel);
    this.disableBtn = false;
    this.selectedCoupon = null;
    $("#closecn").click();
    // this.showNotification("top", "right", "Coupon applied successfully !!", "success");
  }

  async getBillbyId(id: any) {
    try {
      this.isLoadingCart = true;
      this.cartItemList = [];

      this._billModel._id = '';
      this._billModel.status = '';

      var billRes;
      billRes = await this._billService.AsyncGetById(id) as any;
      if (billRes['customerid'] && billRes['onModel']) {
        this.searchMember = billRes['customerid'];
        this.searchMember['email'] = billRes?.customerid?.property?.primaryemail;
        this.searchMember['mobile'] = billRes?.customerid?.property?.mobile;
        this.searchMember['type'] = "";
        if(billRes['onModel'] == 'Member'){
          this.searchMember.type = 'M';
        }else if(billRes['onModel'] == 'Prospect'){
          this.searchMember.type = 'C';
        }else{
          this.searchMember.type = 'U';
        }
      }
      this.getIOUAmount();

      this._billModel.docnumber = billRes['docnumber'];
      this._billModel._id = billRes['_id'];
      this._billModel.status = billRes['status'];
      this.status = billRes['status'];
      this._billModel.paidamount = billRes['paidamount'];
      this.balance = billRes['balance'];
      this.paidamount = billRes['paidamount'];
      
      if (billRes.property && billRes.property['packagediscount']) {
        this.packagediscount = billRes.property['packagediscount'];
      }
      
      this._propertyobjectModel = billRes.property;
      
      if (billRes['items'] && billRes['items'].length > 0) {
        billRes['items'].forEach(itm => {
          var billitem;
          if(itm.to){
            billitem = this.giftCertificateList.find(a => a._id == itm.item._id);
          }else if(itm.itemnumber){
            billitem = this.giftCardList.find(a => a._id == itm.item._id);
          }else{
            billitem = this.billItemList.find(a => a._id == itm.item._id);
          }
          if (billitem) {
            billitem['item'] = itm.item;
            billitem['itemid'] = itm.item._id;
            billitem['sale'] = itm.item.sale;
            billitem['quantity'] = itm.quantity;
            billitem['discount'] = billitem?.sale?.discounttype == 'Fixed' ?  billitem?.sale?.discount : billitem?.sale?.discounttype  ==  'Percentage' ? billitem?.sale?.discount : 0;
            billitem['couponcode'] = itm.couponcode;
            billitem['coupondiscount'] = itm.coupondiscount;
            billitem['seller'] = itm.seller;
            billitem['to'] = itm?.to;
            billitem['valid'] = itm?.valid;
            billitem['used'] = itm?.used;
            billitem['itemnumber'] = itm?.itemnumber;
            billitem['qrcode'] = itm?.qrcode;
            
            this.cartItemList.push(billitem);
          }
        });
      }

      setTimeout(() => {
        this.makeModel();
        this.subtotal = billRes.amount;
        this.discount = billRes.discount;
        this.grandtotal = billRes.totalamount;
        this.taxamount = billRes.taxamount;
        this.taxdetail = billRes.taxdetail;
        this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance , bill : billRes});
        this.isLoadingCart = false;
      }, 2000);
    } catch (e) {
      this.isLoadingCart = false;
    }
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

  enterCustomer(val) {
    if (typeof val == 'string') {
      this.customerfilteredOptions = of(this._customerfilter(val));
    }
  }

  private _customerfilter(value: string): string[] {
    let results = [];
    for (let i = 0; i < this.customerList.length; i++) {
      if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
        results.push(this.customerList[i]);
      }
    }
    return results;
  }

  async getItems() {
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this.billItemList = [];
    let datas = await this._billItemService.AsyncGetByFilterView(postData) as any[];
    
    this.billItemList = datas.filter(a=>a.categoryid != '61dbbd1c521c4f132099f87e' &&  a.categoryid != '621e0d61ad278f15ae6620b2');
    this.billItemList.map(itm => itm.originalstock = itm.stock ? itm.stock : 0);
    this.billItemList2 = this.billItemList;
    this.billItemListGrp = this.groupBy(this.billItemList, 'category');
    this.giftCardList = datas.filter(a=>a.categoryid == '61dbbd1c521c4f132099f87e');
    this.giftCardList2 = this.giftCardList;
    this.giftCardListGrp = this.groupBy(this.giftCardList, 'category');
    this.giftCertificateList = datas.filter(a=>a.categoryid == '621e0d61ad278f15ae6620b2');
    this.giftCertificateList2 = this.giftCertificateList;
    this.giftCertificateListGrp = this.groupBy(this.giftCertificateList, 'category');

    this.checkItem();
  }

  async generateQR(value : number){
    let postData = {};
    postData['value'] = value.toString();
    return this._commonService.commonServiceByUrlMethodDataAsync('common/generateqrcode',"POST",postData);
  }

  ondGiftCrtfAdd(){
    if(!this.selectedItem.quantity || !this.selectedItem.valid || !this.selectedItem.to){
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    this.selectedItem['stock'] -= this.selectedItem.quantity;
    let giftobj = {};
    giftobj["used"] = false;
    giftobj["valid"] = this.selectedItem.valid;
    giftobj["to"] = this.selectedItem.to;
    giftobj["qrcode"]  = this.selectedItem?.qrcode;
    giftobj['itemnumber'] = this.selectedItem?.itemnumber;
    let obj = { 'item': this.selectedItem, 'itemid': this.selectedItem._id, 'sale': this.selectedItem.sale, 'quantity': this.selectedItem['quantity'] , 'discount': this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0, ...giftobj };
    let ind = this.cartItemList.findIndex(a => a.itemid == this.selectedItem._id);
    
    if(ind < 0){
      this.cartItemList.push(obj);
    }else{
      this.cartItemList.splice(ind,1,obj);
    }
    $("#gctClose").click();
    this.makeModel();
    this.GetBillDetail(this._billModel);
  }
  
  onGiftCardAdd(){
     if(this.selectedItem.itemnumber.length < 6){
      super.showNotification("top", "right", "Gitcard should be upto 6 digit !!", "danger");
      return;
    }
    this.selectedItem['quantity'] = 1;
    this.selectedItem['stock'] -= 1;
    let giftobj = {}; 
    giftobj["itemnumber"] = this.selectedItem.itemnumber;
    giftobj["used"] = false;
    giftobj["valid"] = new Date().setDate(this.today.getDate() + parseInt(this.selectedItem.property.expires_after));
   
    this.cartItemList.push({ 'item': this.selectedItem, 'itemid': this.selectedItem._id, 'sale': this.selectedItem.sale, 'quantity': this.selectedItem['quantity'] , ...giftobj });
    
    $("#gcClose").click();
    this.makeModel();
    this.GetBillDetail(this._billModel);
  }

 async onAdd(billitem: any) {
    this.selectedItem = billitem;
    if (!this.searchMember) {
      super.showNotification("top", "right", "Please select customer !!", "danger");
      return;
    }else if(billitem.enableinventory && billitem.stock <= 0){
      super.showNotification("top", "right", "Item out of Stock !!", "danger");
      return;
    }
    if(billitem.categoryid  == "61dbbd1c521c4f132099f87e"){
      this.selectedItem['itemnumber'] = null;
      $("#giftcardmodal").click();
      return;
    }else if(billitem.categoryid  == "621e0d61ad278f15ae6620b2"){
      this.selectedItem['to'] = this.searchMember?.primaryemail;
      this.selectedItem['content'] = billitem?.property?.content;
      this.selectedItem["used"] = false;
      this.selectedItem["valid"] = moment().add(billitem?.property?.expires_after,'days');
      this.selectedItem['quantity'] = 1;
      this.selectedItem['itemnumber'] = Math.floor(Math.pow(10, 10) + Math.random() * 9 * Math.pow(10, 10)).toString();
      let qrcode  = await this.generateQR(this.selectedItem['itemnumber']);
      this.selectedItem["qrcode"] = qrcode;
      $("#giftcertficatemodal").click();
      return;
    }
    
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      if (!cartItem) {
        billitem['quantity'] = 1;
        billitem['stock'] -= 1;
       
        this.cartItemList.push({ 'item': billitem, 'itemid': billitem._id, 'sale': billitem.sale, 'quantity': billitem['quantity'] ,'discount': billitem?.sale?.discounttype == 'Fixed' ?  billitem?.sale?.discount : billitem?.sale?.discounttype  ==  'Percentage' ? billitem?.sale?.discount : 0  });
      } else {
        billitem['quantity'] = cartItem['quantity'];
        billitem['quantity'] += 1;
        billitem['stock'] -= 1;
        cartItem['quantity'] = billitem['quantity'];
        cartItem['stock'] = billitem['stock'];
      }
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  onSubtrct(billitem: any) {
    try {
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      billitem['quantity'] -= 1;
      billitem['stock'] += 1;
      cartItem['quantity'] = billitem['quantity'];
      cartItem['stock'] = billitem['stock'];
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }

 async onstaticqty(qty : number){
    if(qty <= 0) {
      this.selectedItem['quantity'] = 1;
      return;
    }
    let discount = this.selectedItem?.sale?.discounttype == 'Fixed' ?  this.selectedItem?.sale?.discount : this.selectedItem?.sale?.discounttype  ==  'Percentage' ? this.selectedItem?.sale?.discount : 0;
    let totalcost = (this.selectedItem?.sale?.rate - discount) * this.selectedItem?.quantity;
    this.selectedItem['totalcost'] = totalcost;
    if(this.selectedCoupon && this.selectedCoupon._id){
      await this.onCouponSelect(this.selectedCoupon);
    }
  }

  onEditPrd(items : any , modal : boolean){
    if(items?.quantity <= 0) {
      items.quantity = 1;
      return;
    }
    this.selectedCoupon = items?.couponcode;
    let discount = items?.item?.sale?.discounttype == 'Fixed' ?  items?.item?.sale?.discount : items?.item?.sale?.discounttype  ==  'Percentage' ? items?.item?.sale?.discount : 0;
    let totalcost = (items?.item?.sale?.rate - discount) * items?.quantity;
    if(this.selectedCoupon){
      this.selectedCoupon['coupondiscount'] = items?.coupondiscount ? items?.coupondiscount : 0;
      this.selectedCoupon['finaltotalcost'] = totalcost - (items?.coupondiscount ? (items?.coupondiscount * items?.quantity) : 0)
    }
    
    this.selectedItem = {...items.item , 'quantity' : items?.quantity , 'totalcost' : totalcost , 'discount' : discount , 'valid' : items?.valid , 'to' : items?.to , 'itemnumber' : items?.itemnumber , 'qrcode' : items?.qrcode };
    this.provider_fields.dbvalue = items?.seller?._id;
    
   if(!modal) return;
    if(items?.to){
      $("#giftcertficatemodal").click();
    }else if(items?.itemnumber){
      $("#giftcardmodal").click();
    }else{
      $("#productModal").click();
    }
    
  }
  
  onChangeQty(val : number ,billitem : any){
      var cartItem = this.cartItemList.find(a => a.itemid == billitem._id);
      if(billitem?.enableinventory && val > billitem?.stock){
        this.showNotification('top', 'right', `quantity should not be more than stocks(${billitem?.originalstock}) !!`, 'danger');
      }
      billitem['quantity'] = val;
      billitem['stock'] = billitem.originalstock;
      billitem['stock'] -= val;
      cartItem['quantity'] = billitem['quantity'];
      cartItem['stock'] = billitem['stock'];

      this.onEditPrd(cartItem, false);
      this.makeModel();
      this.GetBillDetail(this._billModel);
  }

  onRemove(billitem: any, items : any) {
    try {
      let ind = this.cartItemList.findIndex(a => a.itemid == billitem._id);
      this.cartItemList.splice(ind, 1);
      var item;
      if(items?.to){
        item = this.giftCertificateList.find(a => a._id == billitem._id);
      }else if(items?.itemnumber){
        item = this.giftCardList.find(a => a._id == billitem._id);
      }else{
        item = this.billItemList.find(a => a._id == billitem._id);
      }
      item['quantity'] = 0;
      item['stock'] = billitem.originalstock;
      this.makeModel();
      this.GetBillDetail(this._billModel);
    } catch (e) {
      return e;
    }
  }
  


  makeModel() {
    this.isLoadingCart = true;
    this._billModel.customerid = this.searchMember._id;
    if (this.searchMember.type == 'M') {
      this._billModel.onModel = "Member";
    } else if (this.searchMember.type == 'C') {
      this._billModel.onModel = "Prospect";
    } else if (this.searchMember.type == 'U') {
      this._billModel.onModel = "User";
    } else {
      this._billModel.onModel = "Member";
    }
    this._billModel.items = [];
    this._billModel.items = this.cartItemList;  
    
    this._billModel.services = [];
    this._billModel.packages = [];

    this._billModel.amount = this.subtotal;
    this._billModel.totalamount = this.grandtotal;
    this.isLoadingCart = false;
  }

  GetBillDetail(model: any) {
    this.isLoadingCart = true;
    try {
      this._billService
        .BillDetail(model)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.subtotal = data.billamount;
          this.discount = data.discount;
          this.grandtotal = data.grandtotal;
          this.taxamount = data.taxamount;
          this.packagediscount = data.membershipdiscount;
          this.taxdetail = data.taxdetail;
          this.isLoadingCart = false;
          this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance });
        });
    } catch (e) {
      this.isLoadingCart = false;
    }
  }

  checkItem() {
    if (this.cartItemList.length > 0)
      for (let i = 0; i < this.billItemList.length; i++) {
        for (let j = 0; j < this.cartItemList.length; j++) {
          if (this.billItemList[i]._id === this.cartItemList[j]._id) {
            this.billItemList.splice(i, 1, this.cartItemList[j]);
          }
        }
      }
      for (let i = 0; i < this.giftCardList.length; i++) {
        for (let j = 0; j < this.cartItemList.length; j++) {
          if (this.giftCardList[i]._id === this.cartItemList[j]._id) {
            this.giftCardList.splice(i, 1, this.cartItemList[j]);
          }
        }
      }
  }

  onSearchItem() {
    var searchItem = this.searchBox.value;
    if (searchItem && searchItem != '') {
      this.searchBox.index = 0;
      var temparray = [];
      for (let i = 0; i < this.billItemList2.length; i++) {
        if (this.billItemList2[i].itemname.toLowerCase().indexOf((searchItem).toLowerCase()) > -1) {
          temparray.push(this.billItemList2[i]);
        }
      }
      var barcodefilter = this.billItemList2.filter(a => a.barcode == searchItem);
      if (barcodefilter && barcodefilter.length > 0) {
        this.billItemList = barcodefilter
      } else {
        this.billItemList = temparray;
      }
    } else {
      this.billItemList = this.billItemList2;
    }
  }

  checkIOUMode() {
    this.isPaymentMode = true;
    this.isIOUMode = true;
  }

  onBackIOUMode() {
    this.isPaymentMode = false;
    this.isIOUMode = false;
    this.getIOUAmount();
  }

  redirecttoURL(event: any) {
    this._router.navigate(['/pages/sale-module/manage-sales/' + event._id]);
  }

  inputModelChangeValue() {
    this.searchMember = this.memberControl.value;
    this.clear();
    this.getIOUAmount();
  }

  getIOUAmount() {
    if (this.searchMember && this.searchMember._id) {
      let postData = {};
      postData['search'] = [{ "searchfield": "_id", "searchvalue": this.searchMember._id, "criteria": "eq", "datatype": "ObjectId" }];
      postData['pageNo'] = 1;
      postData['size'] = 10;
      
      this._billService
        .GetByIOU(this.searchMember._id, this.bindId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          if (data && data.length > 0 && data[0].balance) {
            this.outstandingamount = data[0].balance ? data[0].balance : 0;
          }else if (data && !Array.isArray(data)){
            this.outstandingamount = data.outstandingamount;
          }
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
            .AsyncDelete(this.bindId)
            .then((data: any) => {
              if(data){
                this.showNotification('top', 'right', 'Invoice deleted successfully !!', 'success');
                this._router.navigate(['/pages/dynamic-list/list/bill']);
              }
          });
        }
      });
    }

  onClear() {
    this.ngOnInit();
    this.clearData(); 
    this.searchMember = ""; 
    this.memberControl.setValue(null);
    this.bindId = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }

  clearMember(){
    this.searchMember = ""; 
    this.memberControl.setValue('');
    this.clear();
  }

  clear(){
    this.clearData();
    this.bindId = null;
    this.billpayid = null;
    this.outstandingamount = 0;
  }
  
  clearData() {
    this.cartItemList = [];

    this._billModel = new BillModel();
    this._billPaymentModel = new BillPaymentModel();

    this.billItemList.map(a => a.quantity = 0); 
    this.subtotal = 0;
    this.discount = 0;
    this.grandtotal = 0;
    this.paidamount = 0;
    this.taxamount = 0;
    this.packagediscount = 0;
    this.taxdetail = 0;
    this.status = null;
  }

  onMoreOption() {
    this.isPaymentMode = false;
    this.isIOUMode = false;
  }

  async onSaveBill() {
     if (this.cartItemList.length == 0) {
      super.showNotification("top", "right", "Cart is empty !!", "danger");
      return;
    }
    this.disableBtn = true;
    this._billModel.billdate = new Date();
    this._billModel.duedate = new Date();

    var discount = this.discount ? this.discount : 0;
    discount += this.packagediscount ? this.packagediscount : 0;
    this._billModel.amount = this.subtotal;
    this._billModel.taxamount = this.taxamount;
    this._billModel.discount = discount;
    this._billModel.totalamount = this.grandtotal;
    this._billModel.taxdetail = this.taxdetail;
    this._billModel.paidamount = 0;
    this._billModel.type = 'POS';

    var billform = this.billform.getRawValue();
    var valproperty = billform.property;
    if(!this._billModel.property){
      this._billModel.property = {};
    }
    for (const key in valproperty){
      if(!this._billModel.property[key]){
        this._billModel.property[key] = '';
      }
      this._billModel.property[key] = valproperty && valproperty[key] && valproperty[key]["autocomplete_id"] ? valproperty[key]["autocomplete_id"] : valproperty[key];
    }

    // console.log("this._billModel==>",this._billModel);
    try {
      var billRes;

      if (this._billModel._id) {
        billRes = await this._billService.AsyncUpdate(this._billModel._id, this._billModel);
      } else {
        billRes = await this._billService.AsyncAdd(this._billModel);
      }
      this.disableBtn = false;
      return billRes;
    } catch (e) {
      this.disableBtn = false;
      console.error(e);
      return e;
    }
  }

  async onCheckout() { 
    try {
      var billRes;
      billRes = await this.onSaveBill();
      if (billRes && billRes['_id']) {
        super.showNotification("top", "right", "bill added successfully !!", "success");
        this._billModel._id = billRes['_id'];
        this.balance = billRes['balance'];
        this.paidamount = billRes['paidamount'];
        this.status = billRes['status'];
        this._billService.AySubBilldetail.next({ customerid : this.searchMember ,onModel : this._billModel.onModel, subtotal : this.subtotal ,grandtotal : this.grandtotal , outstandingamount : this.outstandingamount , balance : this.balance , bill : billRes });
        if (billRes.property && billRes.property['packagediscount']) {
          this.packagediscount = billRes.property['packagediscount'];
        }
        this.isPaymentMode = true;
      }
    } catch (e) { 
      super.showNotification("top", "right", "Error Occured !!", "danger");
    }
  }

  async onSubmitProspect(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    this.disableBtn = true;
    let model = {};
    model['fullname'] = value.fullname;
    model['property'] = {};
    model['property']['fullname'] = value.fullname;
    model['property']['mobile'] = value.mobile;
    model['property']['primaryemail'] = value.email;
 
    try {
      let datas = await this._commonService.commonServiceByUrlMethodDataAsync('prospects', 'POST', model) as any;
      this.searchMember = datas;
      this.searchMember['email'] = datas?.property?.primaryemail;
      this.searchMember['mobile'] = datas?.property?.mobile;
      this.searchMember['type'] = "";
      this.searchMember['type'] = 'C';
      this.disableBtn = false;
      this.memberControl.reset();
      super.showNotification("top", "right", "Customer added successfully !!", "success");
      $("#close").click();
      this.form.reset();
    } catch (e) {
      this.disableBtn = false;
      super.showNotification("top", "right", "Error Occured !!", "danger");
      $("#close").click();
    }
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
