import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


declare var $: any;

@Component({
  selector: 'app-refund',
  templateUrl: './refund.component.html'
})
export class RefundComponent extends BaseLiteComponemntComponent implements OnInit , OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  contentData: any;

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;
  invoiceid: any;
  customerid: any;
  formname: string;

  invoiceList: any[] = [];
  previousRedundList: any[] = [];

  selectedCustomer: any;
  retrvObj: any;
  billObj: any;
  itemTbl: any;
  isLoadingInvoice: boolean = false;
 
  displayFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

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
  tempgrandtotal: number;
  previousrefundamount: number;

  taxList: any[] = [];

  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false; 

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonService: CommonService,
    private cloudinary: Cloudinary,
  ) {
    super();

    this.form = this.fb.group({
      'customerid': [''],
      'invoice': ['', Validators.required],
      'date': [new Date(), Validators.required],
      'reason': [],
      'notes': [],
      'attachment': [],
      'adjustment': [],
    });

    this._route.params.forEach((params) => {
      this.formname = params["formname"];
      this.customerid = params["customerid"];
      this.invoiceid = params["invoiceid"];
      this.bindId = params["id"];
      this.isLoading = false;
    });
  }

  async ngOnInit() {
    try {
      await this.fillfromParam();
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
    } else if(this.customerid){
      this.getDocNumber();
      await this.getCustomerById(this.customerid);
    } else {
      this.getDocNumber();
    }
    this.isLoading = false;
   return;
  }

  async initialzeVariable() {
    this.invoiceapi = "paymentschedules/filter";
    this.selectedCustomer = ""; 
    this.retrvObj = {};
    this.invoiceList = [];
    this.itemTbl = [];
    this.previousRedundList = [];
    this.discount = 0;
    this.grandtotal = 0;
    this.tempgrandtotal = 0;
    this.previousrefundamount = 0;
    this.taxamount = 0;
    this.imageConfigration();
    return;
  }

 async getCustomerById(id : any){
    try{
        let postData = {};
        postData['search'] = [{ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "ObjectId" }];
        this.customerList = [];
        let datas = await this._commonService.AsyncContactsFilter(postData) as [];
        this.customerList = datas;
        this.customerfilteredOptions = of(datas);
        this.selectedCustomer = this.customerList[0];
        this.inputModelChangeValue();
        this.form.controls['customerid'].setValue(this.selectedCustomer);
        this.form.controls['customerid'].disable();
    }catch(e){

    }
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

  private _customerfilter(value: string): string[] {
    if(typeof value == 'string'){
      let results = [];
      for (let i = 0; i < this.customerList.length; i++) {
        if (this.customerList[i].nickname.toLowerCase().indexOf((value).toLowerCase()) > -1) {
          results.push(this.customerList[i]);
        }
      }
      return results;
    }
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
        if (data && data.length > 0) {
          this.retrvObj = data[0];
          this.billObj = data[0].billid;
          this.docnumber = this.retrvObj.prefix + '-' + this.retrvObj.notesnumber;
          let customerid = this.retrvObj.customerid;
          this.invoiceid = this.retrvObj.billid._id; 
          customerid['selectedtype'] = this.retrvObj.onModel;
          customerid['nickname'] = `${customerid?.fullname} ${ customerid?.property?.mobile ?  ' | ' + customerid?.property?.mobile : ''} ${ customerid.membernumber ?  ' | ' + customerid.membernumber : ''}`;
          customerid['onModel'] = this.retrvObj.onModel;
          customerid['type'] = this.retrvObj.onModel == 'Prospect' ? 'C' : this.retrvObj.onModel == 'User'  ? 'U' : 'M';
          this.form.controls['customerid'].setValue(customerid);
          this.inputModelChangeValue();
          this.form.controls['date'].setValue(this.retrvObj.date);
          this.form.controls['notes'].setValue(this.retrvObj.notes);
          var adjst = this.retrvObj.adjustment ? this.retrvObj.adjustment : 0;
          this.form.controls['adjustment'].setValue(adjst);
          this.reason_fields.dbvalue = this.retrvObj.reason;
          this.formImageArray = this.retrvObj.attachments;
        }
      }, (error) => {
        console.error(error);
      });
  }


  async inputModelChangeValue() {
    let event = this.form.controls['customerid'].value;
    this.selectedCustomer = "";
    this.invoiceList = [];
    if (event) {
      this.selectedCustomer = event;
      this.selectedCustomer['selectedtype'] = event.type == 'C' ? 'Prospect' : event.type == 'U'  ? 'User' : 'Member';
    }
    if (this.selectedCustomer) {
      let postData = {};
      postData["search"] = [];
      postData["search"].push({ "searchfield": "status", "searchvalue": ["Paid", "Partial"],"criteria": "in","datatype": 'text' })
      postData["search"].push({ "searchfield": "memberid", "searchvalue": this.selectedCustomer._id, "criteria": "eq", "datatype": "ObjectId" });

      let method = "POST";
      this.isLoadingInvoice = true;
      
      await this._commonService
        .commonServiceByUrlMethodDataAsync(this.invoiceapi, method, postData)
        .then((data: []) => {
          this.isLoadingInvoice = false;
          if (data && data.length > 0) {
            this.invoiceList = data;
            this.invoiceList.map(a => a.docnumber = a.prefix + '-' + a.invoicenumber);
            if(this.invoiceid){
              let invoice = this.invoiceList.find(a => a._id == this.invoiceid);
              this.selectInvoice(invoice);
              this.form.controls['invoice'].setValue(invoice);
              //this.form.controls['invoice'].disable();
            }
            if (this.billObj && this.billObj._id) {
              var invoice = this.invoiceList.find(a => a._id == this.billObj._id);
              invoice.items = this.retrvObj.items;
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
      this.previousRedundList = [];
      this.previousrefundamount = 0;
     
      this.itemTbl = [];
      this.itemTbl = [invoice];

      this.discount = 0;
      this.subtotal = invoice.amount ? invoice.amount : 0;
      this.grandtotal = invoice.totalamount ? invoice.totalamount : 0;
      this.tempgrandtotal = invoice.totalamount ? invoice.totalamount : 0;
      this.taxamount = invoice.taxamount ? invoice.taxamount : 0;
    
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
        this.previousRedundList = [];
        this.previousrefundamount = 0;
        if(data && data.length > 0){
          this.previousRedundList = data;
          this.previousrefundamount = this.previousRedundList.map(a=>a.adjustment).reduce((a, b) =>  a + b);
        }
      },(e)=>{
        console.error("error==>",e);
      });
  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    value.adjustment = value.adjustment ? value.adjustment : 0;
    var availrefund = this.tempgrandtotal - this.previousrefundamount; 

    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }else if(value.adjustment > availrefund){
      this.showNotification("top", "right", "Refund amount invalid !!", "danger");
      return;
    }

    console.log('value =>', value);

    var model = {};
    model["customerid"] = this.selectedCustomer._id;
    model["onModel"] = this.selectedCustomer.selectedtype;

    if (value.date && value.date._d) {
      model["date"] = value.date._d;
    } else {
      model["date"] = value.date;
    }
    model["adjustment"] = value.adjustment ? value.adjustment : 0;
    model["billid"] = value.invoice._id;
    model["totalamount"] = 0;
    model["onModelBill"] = "Paymentschedule";
    model["totalamount"] = this.tempgrandtotal;
    model["amount"] = this.subtotal;
    model["taxamount"] = this.taxamount;
    model["balance"] = this.tempgrandtotal;
    model["discount"] = this.discount;
    model["type"] = 'membership';

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
      .then((data: any) => {

        if(this.bindId){
          this.showNotification("top", "right", "Refund updated successfully !!", "success");
        }
        else {
          this.showNotification("top", "right", "Refund addded successfully !!", "success");
        }
        this.disableButton = false;
        this._router.navigate(['/pages/dynamic-preview-list/' + this.formname + '/' + data._id]);
        // this.redirectUrl();
      }).catch((e) => {
        this.disableButton = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger");
      });
  }

  // redirectUrl(){
  //   if(this.customerid || this.invoiceid){
  //     this._router.navigate([this.previousUrl]);
  //   }else{
  //     this._router.navigate(['/pages/dynamic-list/list/'+ this.formname]);
  //   }
  // }
  
  async fillfromParam(){
    if(this.customerid){
       let postData = {};
       postData['search'] = [{ "searchfield": "_id", "searchvalue": this.customerid, "criteria": "eq", "datatype": "ObjectId" }];
  
       this.customerList = [];
       await this._commonService
       .AsyncContactsFilter(postData)
       .then((datas :any)=> {
         this.customerList = datas;
         this.customerfilteredOptions = of(datas); 
         this.form.controls['customerid'].setValue(datas[0]);
        });
      }
   }


}
