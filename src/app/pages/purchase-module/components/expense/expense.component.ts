import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { FinanceService } from '../../../../core/services/finance/finance.service';
import { ExpenseService } from '../../../../core/services/purchase/expense.service';
import { ExpenseModel } from '../../../../core/models/purchase/expense.model';
import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html'
})

export class ExpenseComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  _expenseModel = new ExpenseModel();

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  today = new Date();
  epData: string;

  expenseaccountList: any[] = [];
  paidthroughList: any[] = [];
  _groupexpenseList: any[] = [];
  _grouppaidList: any[] = [];

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


  mode_fields = {
    "fieldname": "paymentmode",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "payment methods", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    "value": "",
    "dbvalue": "",

  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _expenseService: ExpenseService,
    private _financeService: FinanceService,
    private cloudinary: Cloudinary,
  ) {
    super();
    this.form = this.fb.group({
      'expenseaccount': ['', Validators.required],
      'paidthrough': ['', Validators.required],
      //'vendorid': ['', Validators.required],
      'amount': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'date': [this.today],
      'paymentmode': [],
      'subtitle': [],
      'notes': [],
    });
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'expense';
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

  displayFn(user: any): string {
    return user && user.headname ? user.headname : '';
  }

  async LoadData() {
    await this.getEAList();
    if (this.bindId) {
      await this.getExpenseById(this.bindId);
    } else {
      await this.getEAList();
      this.getExpNumber();
      this.isLoading = false;
    }



  }

  private getExpNumber() {
    this._expenseService
      .GetNumber()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.epData = data;
      });
  }


  async getEAList() {
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData['sort'] = { 'headname': 1 };

    await this._financeService
      .AsyncGetAccountHeadByFilter(postData)
      .then((data: []) => {
        if (data && data.length != 0) {
          let cnt = 0;
          let len = data.length;
          this.expenseaccountList = [];
          this.paidthroughList = [];
          data.forEach((element: any) => {
            if (element.accounttype === "Expense") {
              this.expenseaccountList.push(element);
            } else {
              this.paidthroughList.push(element);
            }
            cnt++
          });
          if (len == cnt) {
            this._groupexpenseList = [];
            this._groupexpenseList = this.groupBy(this.expenseaccountList, 'accounttype');
            this._grouppaidList = [];
            this._grouppaidList = this.groupBy(this.paidthroughList, 'accounttype');
          }
        }
      });
  }

  private async getExpenseById(id: any) {
    this.isLoading = true;
    await this._expenseService
      .AsyncGetById(id)
      .then((data: any) => {
        console.log("data==>",data)
        this.epData = data.docnumber;
        this.form.controls['expenseaccount'].setValue(data.expenseaccount._id);
        this.form.controls['paidthrough'].setValue(data.paidthrough._id);
        this.form.controls['amount'].setValue(data.amount);
        this.form.controls['date'].setValue(data.date);
        this.form.controls['subtitle'].setValue(data.property.subtitle);
        this.form.controls['paymentmode'].setValue(data.property.paymentmode);
        this.mode_fields.dbvalue = data.property.paymentmode;

        this.formImageArray = data.attachments;
        if (data.property && data.property['notes']) {
          this.form.controls['notes'].setValue(data.property['notes']);
        }
        //this.vendorfields.dbvalue = data.vendorid;
        this.isLoading = false;
      })
      .catch((e) => {
        console.log("e==>",e)
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
    this._expenseModel = value;
    if (value.paidthrough && value.paidthrough._id) {
      this._expenseModel.paidthrough = value.paidthrough._id;
    }
    if (value.expenseaccount && value.expenseaccount._id) {
      this._expenseModel.expenseaccount = value.expenseaccount._id;
    }
    // if (value.vendorid && value.vendorid._id) {
    //   this._expenseModel.vendorid = value.vendorid._id;
    // }
    this._expenseModel.property = {};
    this._expenseModel.property['notes'] = value.notes;
    this._expenseModel.property['subtitle'] = value.subtitle;
    if(value.paymentmode && value.paymentmode.autocomplete_id){
      this._expenseModel.property['paymentmode'] = value.paymentmode.autocomplete_id;
    }
    this._expenseModel.attachments = this.formImageArray;


    this.disableButton = true;
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this._expenseModel);
        super.showNotification("top", "right", "Expense added successfully !!", "success");
      } else {
        res = await this.Update(this.bindId, this._expenseModel);
        super.showNotification("top", "right", "Expense updated successfully !!", "success");
      }
      this._router.navigate([`/pages/dynamic-preview-list/expenses/` + res._id]);      
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  async Save(model?: any) {
    return await this._expenseService.AsyncAdd(model);
  }

  async Update(id?: any, model?: any) {
    return await this._expenseService.AsyncUpdate(id, model);
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

  Delete() { }
  ActionCall() { }

  public onItemAdded(itemToBeAdded: any) {

  }

}
