import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PurchaseOrderModel } from '../../../../core/models/purchase/purchaseorder.model';
import { InventoryTableComponent } from '../../../../shared/inventory-table/inventory-table.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

declare var $: any;

@Component({
  selector: 'purchase-order',
  templateUrl: './purchase-order.component.html'
})

export class PurchaseOrderComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChild('inventorytable', { static: false }) inventorytable: InventoryTableComponent;
  purchaseOrderModel = new PurchaseOrderModel();
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  today = new Date();
  poData: string;

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

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
    "dbvalue": ""
  };

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

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonService: CommonService,
    private cloudinary: Cloudinary,
  ) {
    super();
    this.form = this.fb.group({
      'vendorid': ['', Validators.required],
      'billingaddress': [],
      'shippingaddress': [],
      'orderdate': [this.today],
      'shippingdate': [],
      'receivedate': [],
      'notes': [],
    });
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'purchase-order';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.LoadData();
    this.imageConfigration();
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

  async LoadData() {
    if (this.bindId) {
      await this.getPOById(this.bindId);
    } else {
      this.getPONumber();
      this.isLoading = false;
    }
  }

  private getPONumber() {

    let method = "GET";
    let url = "purchaseorders/view/ponumber";

    this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.poData = data;
      });
  }

  private async getPOById(id: any) {
    this.isLoading = true;

    let method = "POST";
    let url = "purchaseorders/filter";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": id, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((responsedata: any) => {
        if (responsedata && responsedata[0]) {
          var data = responsedata[0];

          this.poData = data.docnumber;
          this.form.controls['orderdate'].setValue(data.orderdate);
          this.form.controls['shippingdate'].setValue(data.shippingdate);
          this.form.controls['receivedate'].setValue(data.receivedate);
          this.form.controls['billingaddress'].setValue(data.billingaddress);
          this.form.controls['shippingaddress'].setValue(data.shippingaddress);
          this.formImageArray = data.attachments;
          if (data.property && data.property['notes']) {
            this.form.controls['notes'].setValue(data.property['notes']);
          }
          this.vendorfields.dbvalue = data.vendorid;
          setTimeout(() => {
            this.inventorytable.setTableWithItem(data.items);
          });
        }
        this.isLoading = false;
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }

  public checkUncheckEvent(event: any) {
    if (event && event.checked) {
      this.form.controls['shippingaddress'].setValue(this.form.get('billingaddress').value);
    } else {
      this.form.get('shippingaddress').setValue("");
    }
  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    if (this.bindId && !value.receivedate) {
      super.showNotification("top", "right", "Select receive date !!", "danger");
      return;
    }
    var itemList = this.inventorytable.setitemsList.filter(a => a.itemid);
    if (!itemList || itemList.length == 0) {
      super.showNotification("top", "right", "Please choose products !!", "danger");
      return;
    }
    this.purchaseOrderModel = value;
    if (value.vendorid && value.vendorid._id) {
      this.purchaseOrderModel.vendorid = value.vendorid._id;
    }
    if (value.notes && value.notes) {
      this.purchaseOrderModel.property = {};
      this.purchaseOrderModel.property['notes'] = value.notes;
    }
    this.purchaseOrderModel.attachments = this.formImageArray;
    this.purchaseOrderModel.items = [];
    this.purchaseOrderModel.items = itemList;
    
    this.purchaseOrderModel.amount = this.inventorytable.subtotal;
    this.purchaseOrderModel.taxamount = this.inventorytable.taxamount;
    this.purchaseOrderModel.totalamount = this.inventorytable.grandtotal;
    
    let method = this.bindId ? "PUT" : "POST";
    let url = "purchaseorders";

    this.disableButton = true;
    // console.log("this.purchaseOrderModel",this.purchaseOrderModel);
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.purchaseOrderModel, this.bindId)
      .then((responsedata: any) => {
        this._router.navigate([`/pages/dynamic-preview-list/purchaseorder/${responsedata._id}`]);
        super.showNotification("top", "right", "Purchase order made successfully !!", "success");
        this.disableButton = false;
      }).catch((e) => {
        super.showNotification("top", "right", "Error Occured !!", "danger");
        this.disableButton = false;
      });
  }
 
}
