import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PurchaseInvoiceModel } from '../../../../core/models/purchase/purchaseinvoice.model';
import { InventoryTableComponent } from '../../../../shared/inventory-table/inventory-table.component';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'purchase-invoice',
  templateUrl: './purchase-invoice.component.html'
})

export class PurchaseInvoiceComponent extends BaseComponemntComponent implements OnInit , OnDestroy {

  @ViewChild('inventorytable', { static: false }) inventorytable: InventoryTableComponent;
  purchaseInvoiceModel = new PurchaseInvoiceModel();
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  today = new Date();
  piData: string;

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  htmlContent2 : string;
  htmlContent : string = `<div class="row"> <div class="col-md-12">
  <div class="border p-3 rounded alternative-light-blue">
    <div class="row">
      <div class="col-sm-4">
          <div class="media member-profile-item"><img  src='$[{profilepic}]' class="profile-avatar-img mr-2 rounded-circle" alt="">
          <div class="media-body"><div class="font-500 mb-1"> $[{fullname}] </div> <div class="@START[{membershipid.membershipname}]"> <div class="d-flex"><div class="flex-grow-1">  $[{membershipid.membershipname}]</div> </div> </div></div> </div>
        </div>
        <div class="col-sm-4 @START[{property.address}]">
            <div class="d-flex"><div class="mr-2"><img src="../assets/img/location-gray-icon.svg" alt=""></div><div> $[{property.address}]   <br>  $[{property.city}] </div></div>
        </div>
        <div class="col-sm-4">
           <div class="@START[{property.email}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/email-gray-icon.svg" alt=""></div><div>$[{property.email}]</div></div> </div>
           <div class="@START[{property.mobile}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/phone-gray-icon.svg" alt=""></div><div> $[{property.mobile}] </div></div> </div>
        </div>
    </div>
    </div>
    </div>
  </div>`;

  vendorfields = {
    "fieldname": "vendorid",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "form": {
      "apiurl": "vendors/filter",
      "formfield": "_id",
      "displayvalue": "fullname",
    },
    "value": "",
    "dbvalue": "",
    "autocomplete" : true,
  };

  bindIdData: any = {};
  visible: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    //private _commonService: CommonService,
  ) {
    super();
    this.form = this.fb.group({
      'vendorid': [, Validators.required],
      'billingaddress': [],
      'invoicedate': [this.today ,Validators.required],
      'duedate': [this.today ,Validators.required],
      'notes': [],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'purchase-invoice';
    });

    this._formName = "purchaseinvoice";
  }

  async ngOnInit() {
    try{
      await super.ngOnInit();
      await this.LoadData();
      this.imageConfigration();
    } catch(error) {
      console.log("error", error)
    } finally {
      
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

  formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }


  removeImg(url: any) {
    this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  async LoadData() {
    if (this.bindId) {
      this.visible = false;
      await this.getPOById(this.bindId);
    } else {
      this.getPINumber();
      this.isLoading = false;
      this.visible = true;
    }
  }

  private getPINumber() {

    let method = "GET";
    let url = "purchaseinvoices/view/pinumber";

    this._commonService
      .commonServiceByUrlMethodIdOrData(url, method , '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.piData = data;
      });
  }

  private async getPOById(id: any) {
 
    this.isLoading = true;

    let method = "POST";
    let url = "purchaseinvoices/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": '_id', "searchvalue": id, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((responsedata: any) => {        
        if (responsedata && responsedata[0]) {
          var data = responsedata[0];
          
          this.piData = data.docnumber;
          this.form.controls['invoicedate'].setValue(data.invoicedate);
          this.form.controls['duedate'].setValue(data.duedate);
          this.form.controls['billingaddress'].setValue(data.billingaddress);
          this.formImageArray = data.attachments;

          if (data.property && data.property) {
            this.bindIdData = {};
            this.bindIdData = data.property;
          }

          if (data.property && data.property['notes']) {
            this.form.controls['notes'].setValue(data.property['notes']);
          }
          this.vendorfields.dbvalue = data.vendorid;
          setTimeout(() => {
            this.inventorytable.setTableWithItem(data.items);
          });
          this.isLoading = false;
          this.visible = true;
          return;
        }
        this.visible = true;
        
      }, (error) => {
        console.error(error);
      })
  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    var itemList = this.inventorytable.setitemsList.filter(a => a.itemid);
    if (!itemList || itemList.length == 0) {
      super.showNotification("top", "right", "Please choose products !!", "danger");
      return;
    }

    this.purchaseInvoiceModel = value;
  if (value.vendorid && value.vendorid._id) {
      this.purchaseInvoiceModel.vendorid = value.vendorid._id;
    }
    if (value.notes && value.notes) {
      if (!this.purchaseInvoiceModel.property) {
        this.purchaseInvoiceModel.property = {};
      }
      this.purchaseInvoiceModel.property['notes'] = value.notes;
    }
    this.purchaseInvoiceModel.attachments = this.formImageArray;
    this.purchaseInvoiceModel.items = [];
    this.purchaseInvoiceModel.items = itemList;

    this.purchaseInvoiceModel.amount = this.inventorytable.subtotal;
    this.purchaseInvoiceModel.taxamount = this.inventorytable.taxamount;
    this.purchaseInvoiceModel.totalamount = this.inventorytable.grandtotal;
    this.purchaseInvoiceModel.paidamount = 0;
    this.disableButton = true;

    let method = this.bindId ? "PUT" : "POST";
    let url = "purchaseinvoices";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.purchaseInvoiceModel, this.bindId)
      .then((responsedata: any) => {
        this._router.navigate([`/pages/dynamic-preview-list/purchaseinvoice/${responsedata._id}`]);
        super.showNotification("top", "right", "Purchase invoice made successfully !!", "success");
        this.disableButton = false;
      }).catch((e) => {
        super.showNotification("top", "right", "Error Occured !!", "danger");
        this.disableButton = false;
      });
  }

  getSubmittedData(submit_data: any) {
    this.vendorfields.autocomplete = false;
    this.vendorfields.dbvalue = submit_data.value;
    setTimeout(() => {
      this.vendorfields.autocomplete = true;
    });
  }

  getSubmittedDataVendor(submit_data){
    if(!submit_data || submit_data == ''){
      this.htmlContent2 = null;
    }
    
  }

  getSubmittedData2(submit_data: any){
  
    this.htmlContent2 = submit_data;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
