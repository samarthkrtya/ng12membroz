import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-creditdebit-note',
  templateUrl: './creditdebit-note.component.html'
})

export class CreditdebitNoteComponent extends BaseComponemntComponent implements OnInit , OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  contentData: any;

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;
  invoiceid: any;
  customerid: any;
  role: string;
  formname: string;

  invoiceList: any[] = [];

  selectedCustomer: any;
  retrvObj: any;
  billObj: any;
  isLoadingInvoice: boolean = false;

  itemTbl: any[] = [];
  serviceTbl: any[] = [];
  assetTbl: any[] = [];

  vendorfields = {
    "fieldname": "customerid",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "form": {
      "apiurl": "vendors/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "fullname", "value": 1 },
    ],
    "value": "",
    "dbvalue": ""
  };

  customerfields = {
    "fieldname": "customerid",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "form": {
      'apiurl' : "common/contacts/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "formname" : "contact",
    "value": "",
    "dbvalue": ""
  };

  reason_fields = {
    "fieldname": "reason",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "credit-debit-reason", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": ""
  };

  invoiceapi: string;
  docnumber: string;

  subtotal: number;
  discount: number;
  taxamount: number;
  grandtotal: number;
  paidamount: number;
  tempgrandtotal: number;
  previousrefundamount: number;

  taxList: any[] = [];
  previousRedundList: any[] = [];

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false; 

  refundmethod: string[] = [];

  today : Date;

  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }


  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary
  ) {
    super();
     
    this.form = this.fb.group({
      'customerid': [''],
      'vendorid': [''],
      'invoice': ['', Validators.required],
      'date': [new Date(), Validators.required],
      'reason': [],
      'notes': [],
      'method': [,Validators.required],
      'validdate': [],
      'attachment': [],
      'adjustment': [],
    });

    
     this._route.params.forEach((params) => {
      this.formname = params["formname"];
      this.customerid = params["customerid"];
      this.invoiceid = params["invoiceid"];
      this.bindId = params["id"];
      this._formName = this.formname.indexOf("bill") == -1 ?  'purchase-refund' : 'bill-refund';
      this.isLoading = false;
    });
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.LoadData();
    } catch (error) {
      console.error(error);
    }


    this.form.controls["adjustment"]
      .valueChanges
      .subscribe((adj) => {
        this.grandtotal = this.tempgrandtotal;
        this.grandtotal -= adj ? adj : 0;
      });

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
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    this.isLoading = true;
    await this.initialzeVariable();

    if (this.bindId) {
      await this.getCreditDebitById(this.bindId);
    }else if(this.customerid || this.invoiceid){
      await this.fillfromParam();
    } else {
      this.getDocNumber(); 
    }
    this.isLoading = false;
    return;
  }

  async initialzeVariable() {
    this.selectedCustomer = "";
    this.role = this.formname.indexOf("bill") == -1 ?  'purchaseinvoice' : 'bill';
    this.refundmethod = ["cash"];
    if (this.role == 'purchaseinvoice') {
      this.invoiceapi = "purchaseinvoices/filter";
      this.vendorfields.dbvalue = this.customerid;
      this.refundmethod.push("debitnotes");
    }else{
      this.invoiceapi = "bills/filter";
      this.customerfields.dbvalue = this.customerid;
      this.refundmethod.push("creditnotes");
    }

    this.today = new Date();
    
    this.retrvObj = {};
    this.invoiceList = [];
    this.itemTbl = [];
    this.serviceTbl = [];
    this.previousRedundList = [];
    this.assetTbl = [];
    this.discount = 0;
    this.grandtotal = 0;
    this.tempgrandtotal = 0;
    this.previousrefundamount = 0;
    this.taxamount = 0;
    // if(!this.globalfunctionpermissions.includes("Allow Order Refund"))
    // {
    //   this.disableButton = true;
    //   this.showNotification("top", "right", "You don't have permission !!", "danger");    
    // }
    this.imageConfigration();
    return;
  }

  getDocNumber() {

    let url = 'creditdebitnotes/view/cdnnumber/';
    let method = 'GET';

    this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: string) => {
        this.docnumber = data;
      });
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

 async fillfromParam(){
   if(this.customerid){
      let postData = {};
      postData['search'] = [{ "searchfield": "_id", "searchvalue": this.customerid, "criteria": "eq", "datatype": "ObjectId" }];
 
      this.customerList = [];
      await this._commonService
      .AsyncContactsFilter(postData)
      .then((datas :any)=>{
      
        this.customerList = datas;
        this.customerfilteredOptions = of(datas);

        this.customerfields.dbvalue = datas[0];
        this.form.controls['customerid'].setValue(datas[0]);
        this.inputModelChangeValue();
    
       });
       }
  }

  imageConfigration() {
    
    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ],
      // allowedFileType: element.allowedfiletype ? element.allowedfiletype : this.allowedFileType,
      //maxFileSize: element.maxfilesize ? element.maxfilesize : Number(this.maxFileSize)
    };
    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      form.append('context', `photo=${"attachment"}`);
      form.append('tags', "attachment");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = fileItem => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.formImageArray) {
          this.formImageArray = [];
        }
        let extension: any;
        if (fileItem.file) {
          extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
        }
        let fileInfo = {
          attachment: fileItem.data.secure_url,
          extension: extension,
          originalfilename: fileItem.data.original_filename
        };
        this.formImageArray.push(fileInfo);
        $('#' + fieldnameTags).val(fileItem.data.secure_url);
        $(".loading").hide();
      }
    };
    this.customeUploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );
    this.customeUploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress
        });
    this.customeUploader.onWhenAddingFileFailed = (item: any, filter: any) => {
      let message = '';
      switch (filter.name) {
        case 'fileSize':
          message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(Number(this.maxFileSize) * 1024 * 1024);
          this.showNotification("top", "right", message, "danger");
          break;
        default:
          message = 'Error trying to upload file ' + item.name;
          this.showNotification("top", "right", message, "danger");
          break;
      }
    };
  }


  removeImg(url: any) {
    this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
 
  async getCreditDebitById(id: any) {
    let postData = {};
    postData["formname"] = this.formname;
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" });

    let url = "creditdebitnotes/filter";
    let method = "POST";
    
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        // console.log("getCreditDebitById==>",data);
        if (data && data.length > 0) {
          this.retrvObj = data[0];
          this.billObj = data[0].billid;
          this.docnumber = this.retrvObj.prefix + '-' + this.retrvObj.notesnumber;
          this.invoiceid = this.billObj._id;
          let customerid = this.retrvObj.customerid;
          customerid['selectedtype'] = this.retrvObj.onModel;
          customerid['onModel'] = this.retrvObj.onModel;
          customerid['nickname'] = `${customerid?.fullname} ${ customerid?.property?.mobile ?  ' | ' + customerid?.property?.mobile : ''} ${ customerid.membernumber ?  ' | ' + customerid.membernumber : ''}`;
          customerid['type'] = this.retrvObj.onModel; this.retrvObj.onModel == 'Prospect' ? 'C' : this.retrvObj.onModel == 'User'  ? 'U' : 'M';
         
          if(data[0].type == "purchaseinvoice"){
            this.vendorfields.dbvalue = this.retrvObj.customerid;
          }else{
            this.customerfields.dbvalue = this.retrvObj.customerid;
            this.form.controls['customerid'].setValue(customerid);
            this.inputModelChangeValue();
          }
          this.form.controls['date'].setValue(this.retrvObj.date);
          this.form.controls['notes'].setValue(this.retrvObj.notes);
          var adjst = this.retrvObj.adjustment ? this.retrvObj.adjustment : 0;
          this.form.controls['adjustment'].setValue(adjst);
          this.reason_fields.dbvalue = this.retrvObj.reason;
          this.formImageArray = this.retrvObj.attachments;

          let method = 'cash';  
          if(this.retrvObj.creditdebitdetail && this.retrvObj.creditdebitdetail.method){
            method = this.retrvObj.creditdebitdetail.method;
            this.form.controls['method'].setValue(method);
          }
          if(this.retrvObj.creditdebitdetail && this.retrvObj.creditdebitdetail.validdate){
            this.form.controls['validdate'].setValue(this.retrvObj.creditdebitdetail.validdate);
            this.today = this.retrvObj.creditdebitdetail.validdate;
          }
          if(this.retrvObj.status == 'Paid'){
            this.showNotification("top", "right", "Document is already used !!", "danger");
            this.disableButton = true;
          }
        }
      }, (error) => {
        console.error(error);
      });
  }


  async inputModelChangeValue(event ?: any) {
    if (this.role != 'purchaseinvoice') {
      event =  this.form.controls['customerid'].value;  
    }
    this.selectedCustomer = "";
    this.invoiceList = [];
    if (event) {
      this.selectedCustomer = event;
      this.selectedCustomer['selectedtype'] = event.type == 'C' ? 'Prospect' : event.type == 'U'  ? 'User' : 'Member';
    }
    if (this.selectedCustomer) {
      let postData = {};
      postData["search"] = [];
      // postData["search"].push({ "searchfield": "status", "searchvalue": ["Paid", "Partial"],"criteria": "in","datatype": 'text' })

      if (this.role == 'purchaseinvoice') {
        postData["search"].push({ "searchfield": "vendorid", "searchvalue": this.selectedCustomer._id, "criteria": "eq", "datatype": "ObjectId" });
      } else {
        postData["search"].push({ "searchfield": "customerid", "searchvalue": this.selectedCustomer._id, "criteria": "eq", "datatype": "ObjectId" });
      }
      postData["sort"] = { "notesnumber" : 1};

      let method = "POST";
      this.isLoadingInvoice = true;
      
      await this._commonService
        .commonServiceByUrlMethodDataAsync(this.invoiceapi, method, postData)
        .then((data: []) => {
          this.isLoadingInvoice = false;
          if (data && data.length > 0) {
            this.invoiceList = data;
            if (this.role == 'purchaseinvoice') {
              this.invoiceList.map(a => a.docnumber = a.prefix + '-' + a.pinumber);
            }else{
              this.invoiceList.map(a => a.docnumber = a.prefix + '-' + a.billnumber);
            }
            if(this.invoiceid){
              let invoice = this.invoiceList.find(a => a._id == this.invoiceid);
              this.selectInvoice(invoice);
              this.form.controls['invoice'].setValue(invoice);
            }
            if (this.billObj && this.billObj._id) {
              var invoice = this.invoiceList.find(a => a._id == this.billObj._id);
              invoice.items = this.retrvObj.items;
              // invoice.services = this.retrvObj.services;
              // invoice.assets = this.retrvObj.assets;
              this.selectInvoice(invoice);
              this.form.controls['invoice'].setValue(invoice);
              var adjst = this.form.get('adjustment').value;
              setTimeout(() => {
                this.grandtotal = this.tempgrandtotal;
                this.grandtotal -= adjst ? adjst : 0;
              }, 1000);
            }
          }
        }, (error) => {
          console.error(error);
          this.isLoadingInvoice = false;
        });
    }
  }

  selectInvoice(invoice: any) {

    this.itemTbl = [];
    this.serviceTbl = [];
    this.assetTbl = [];
    this.previousRedundList = [];
    this.previousrefundamount = 0;
    
    this.paidamount = invoice.paidamount;

    if(invoice.items && invoice.items.length > 0){
      invoice.items.forEach((a)=>{
          a.billquantity = a.billquantity ? a.billquantity : a.quantity;
          a.itemid = a.item._id;
          a.enableinventory = a.item.enableinventory;
          a.sale = a.item.sale;
          a.purchase = a.item.purchase;
          a.type = 'billitems';

          if(a.giftcard && a.used) { this.paidamount -=a.totalcost;  return};
          this.itemTbl.push(a);
      });
    }

    if(invoice.services && invoice.services.length > 0){
      invoice.services.forEach(servc => {
          servc.type = 'services';
          servc.quantity = 1;
          servc.charges = servc.cost;
          
          this.serviceTbl.push(servc);
      });
    }

    if(invoice.assets && invoice.assets.length > 0){
      invoice.assets.forEach(servc => {
          servc.type = 'assets';
          servc.quantity = 1;
          servc.charges = servc.cost;
          
          this.assetTbl.push(servc);
      });
    } 
    
    this.countTotalItemCost();
    this.getPreviousRefund(invoice);
  }

  getPreviousRefund(id){
    let postData = {};
    postData["formname"] = this.formname;
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "Paid", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "billid", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" });
    if(this.bindId){
      postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "ne", "datatype": "ObjectId" });
    }
    let url = "creditdebitnotes/filter";
    let method = "POST";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log("data==>",data);
        this.previousRedundList = [];
        this.previousrefundamount = 0;
        if(data && data.length > 0){
          this.previousRedundList = data;
          this.previousrefundamount = this.previousRedundList.map(a=>a.adjustment).reduce((a, b) =>  a + b);
          console.log("this.previousrefundamount==>",this.previousrefundamount);
        }
      },(e)=>{
        console.error("error==>",e);
      });
  }

  changeTblQty(item: any) {
    this.form.controls['adjustment'].setValue(0);
    setTimeout(() => {
      this.countTotalItemCost();
    }, 500);
  }

  deleteTblItem(ind: any) {
    this.form.controls['adjustment'].setValue(0);
    this.itemTbl.splice(ind, 1);
    setTimeout(() => {
      this.countTotalItemCost();
    }, 100);
  }

  countTotalItemCost() {

    this.discount = 0;
    this.grandtotal = 0;
    this.tempgrandtotal = 0;
    this.taxamount = 0;

    let api = this.role == 'purchaseinvoice' ?  'purchaseinvoices/invoicedetail' :  'bills/billdetail/';
    let method = "POST";

    let model = {};
    model['items'] = [];
    model['items'] = this.itemTbl;
    model['services'] = this.serviceTbl;
    model['assets'] = this.assetTbl;

    this._commonService
      .commonServiceByUrlMethodData(api, method, model)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.subtotal = data.billamount;
        this.discount = data.discount;
        this.grandtotal = data.grandtotal;
        this.tempgrandtotal = data.grandtotal;
        this.taxamount = data.taxamount;
    });
  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    value.adjustment = value.adjustment ? value.adjustment : 0;
    // var availrefund = this.tempgrandtotal - this.previousrefundamount; 
    
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    } else if(value.adjustment > this.paidamount){
      this.showNotification("top", "right", "Refund amount should be less than paidamount !!", "danger");
      return;
    } else if(value.method != 'cash' && !value.validdate){
      this.showNotification("top", "right", "Please enter valid date !!", "danger");
      return;
    }

    let cnt = 0;
    this.itemTbl.forEach(itm => {
      if(itm.quantity > itm.billquantity){
        cnt++;
      }
    });
    if(cnt> 0){
      this.showNotification("top", "right", "Please enter valid return quantity !!", "danger");
      return;
    }

    
    
    // else if(value.adjustment > availrefund){
    //   this.showNotification("top", "right", "Refund amount invalid !!", "danger");
    //   return;
    // }

    var model = {};
    model["customerid"] = this.selectedCustomer._id;
    if(this.role == 'purchaseinvoice'){
      model["onModel"] = "Vendor";
    }else{
      model["onModel"] = this.selectedCustomer.selectedtype;
    }
    

    if (value.date && value.date._d) {
      model["date"] = value.date._d;
    } else {
      model["date"] = value.date;
    }
    model["billid"] = value.invoice._id;
    model["totalamount"] = 0;
    model["onModelBill"] = this.role == 'purchaseinvoice' ? 'Purchaseinvoice' :  'Bill';

    model["items"] = [];
    if (this.itemTbl && this.itemTbl.length > 0) {
      model["items"] = this.itemTbl;
    }

    // model["services"] = [];
    // if (this.serviceTbl && this.serviceTbl.length > 0) {
    //   model["services"] = this.serviceTbl;
    // }

    // model["assets"] = [];
    // if (this.assetTbl && this.assetTbl.length > 0) {
    //   model["assets"] = this.assetTbl;
    // }

    model["amount"] = this.subtotal;
    model["taxamount"] = this.taxamount;
    model["discount"] = this.discount;
    model["totalamount"] = this.grandtotal;
    model["balance"] = this.grandtotal;
    model["adjustment"] = value.adjustment ? value.adjustment : 0;
    model["type"] = this.role == 'purchaseinvoice' ? 'purchaseinvoice' : 'bill';

    model["creditdebitdetail"] = {};
    model["creditdebitdetail"]["method"] = value.method; 
    model["creditdebitdetail"]["validdate"] = value.validdate;


    if (value.reason && value.reason.code) {
      model["reason"] = value.reason.code;
    }
    model["notes"] = value.notes;
    model["attachments"] = this.formImageArray;

    let url = 'creditdebitnotes';
    let method = this.bindId ? 'PUT' : 'POST';

    // console.log("model==>",model);
    
    this.disableButton = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data) => {
        console.log("data",data);
        this.disableButton = false;
        this.showNotification("top", "right", "Refund addded successfully !!", "success");
        this.redirectUrl();
      }).catch((e) => {
        console.log("e==>",e);
        this.disableButton = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger");
      });
    }
    
  redirectUrl(){
    if((this.customerid || this.invoiceid ) && this.previousUrl){
      this._router.navigate([this.previousUrl]);
    }else{
      if(this.role == 'purchaseinvoice'){
        this._router.navigate(['/pages/dynamic-list/list/purchase-refund']);
      }else{
        this._router.navigate(['/pages/dynamic-list/list/bill-refund']);
      }
    }
  }
  
}
