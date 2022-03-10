import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventoryTableComponent } from '../../../../shared/inventory-table/inventory-table.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

declare var $: any;

@Component({
  selector: 'purchase-request',
  templateUrl: './purchase-request.component.html'
})

export class PurchaseRequestComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  @ViewChild('inventorytable', { static: false }) inventorytable: InventoryTableComponent;
  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: boolean;
  isLoading: boolean = true;
  bindId: any;

  today = new Date();
  prData: string;

  notes: string;
  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  constructor(
    private _route: ActivatedRoute,
    private _commonService: CommonService,
    private cloudinary: Cloudinary,
  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'purchase-request';
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
      await this.getPRById(this.bindId);
    } else {
      this.GetPRNumber();
      this.isLoading = false;
    }
  }

  private GetPRNumber() {
    let method = "GET";
    let url = "purchaserequests/view/prnumber";

    this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.prData = data;
      });
  }

  private async getPRById(id: any) {

    let method = "POST";
    let url = "purchaserequests/filter";
    this.isLoading = true;

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "active", "criteria": "eq" });
    postData['search'].push({ "searchfield": '_id', "searchvalue": id, "criteria": "eq" });

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((resdata: any) => {
        if (resdata && resdata.length > 0) {
          var data = resdata[0];
          this.prData = data.docnumber;
          this.formImageArray = data.attachments;
          this.today = data.date;
          if (data.property && data.property['notes']) {
            this.notes = data.property['notes'];
          }
          setTimeout(() => {
            this.inventorytable.setTableWithItem(data.items);
          });
        }
        this.isLoading = false;
      }).catch((e) => {
        this.isLoading = false;
      });
  }

  public async onSubmit() {
    var itemList = this.inventorytable.setitemsList.filter(a => a.itemid);
    if (!itemList || itemList.length == 0) {
      super.showNotification("top", "right", "Please choose products !!", "danger");
      return;
    }
    let model = {};
    if (this.notes) {
      model['property'] = {};
      model['property']['notes'] = this.notes;
    }
    model['attachments'] = this.formImageArray;
    model['date'] = this.today;
    model['totalamount'] = this.inventorytable.grandtotal;

    model['items'] = [];
    model['items'] = itemList;

    model['amount'] = this.inventorytable.subtotal;
    model['taxamount'] = this.inventorytable.taxamount;
    model['totalamount'] = this.inventorytable.grandtotal;

    this.disableButton = true;

    let method = this.bindId ? "PUT" : "POST";
    let url = "purchaserequests";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((responsedata: any) => {
        this._router.navigate([`/pages/dynamic-preview-list/purchaserequest/${responsedata._id}`]);
        super.showNotification("top", "right", "Purchase request made successfully !!", "success");
        this.disableButton = false;
      }).catch((e) => {
        super.showNotification("top", "right", "Error Occured !!", "danger");
        this.disableButton = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
