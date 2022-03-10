import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import { LookupsService } from '../../../../core/services/lookups/lookup.service';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
})
export class CreateTicketComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;

  categoryList: any[] = [];
  docnumber: string;
  bindId: string;

  userData: any;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,

    private _lookupsService: LookupsService,
    private _commonService: CommonService,

  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'expense';
    });

    this.form = this.fb.group({
      'subject': ['', Validators.required],
      'category': [''],
      'content': ['', Validators.required],
      'attachments': [],
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
    await this.getSupportRole();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  async LoadData() {
    this.isLoading = true;
    await this.getCategory();
    if (this.bindId) {
      await  this.getById();
    } else {
      this.getTicketNumber();
    }
    this.imageConfigration();
    this.isLoading = false;
  }

  async getSupportRole(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    var url = "users/filter";
    var method = "POST";

    this._commonService.commonServiceByUrlMethodDataAsync(url,method,postData)
    .then(data => {
      console.log("Data : ",data)
      this.userData = data
    })
  }

  getTicketNumber() {

    var url = "supports/view/spnumber";
    var method = "GET";

    this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((doc: any) => {
        this.docnumber = doc;
        
      });
  }

  async getById() {
    var url = "supports/";
    var method = "GET";

    await this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindId)
      .then((data: any) => {
        
        this.docnumber = data.prefix + '-' + data.spnumber;
        this.form.controls['subject'].setValue(data.subject);
        this.form.controls['category'].setValue(data.category);
        this.form.controls['content'].setValue(data.content);
        this.formImageArray = data.attachments;
      });
  }


  async getCategory() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": "ticketcategory", "criteria": "eq", "datatype": "string" });

    await this._lookupsService
      .GetByfilterLookupNameAsync(postData)
      .then((lookupData: any[]) => {
        this.categoryList = [];
        this.categoryList = lookupData[0]["data"];
      });
  }

  protected imageConfigration() {

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

  protected formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  protected removeImg(url: any) {
    this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
  }

  protected downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  showSwal(url: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this image file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
      }
    })
  }

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      { name: "quote", class: "quote" },
      { name: 'redText', class: 'redText' },
      { name: "titleText", class: "titleText", tag: "h1" },
    ]
  };



  public onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }

    var url = "supports/";
    var method = "POST";
    if (this.bindId) {
      method = "PUT";
    }
    var supportRole = this.userData.filter(a => a.checked == true);
    
    var model = {};
    model = value;
    model['customerid'] = this._loginUserId;
    model['onModel'] =  this._loginroletype == 'M' ? 'Member' : this._loginroletype == 'C' ? 'Promotion' : this._loginroletype == 'A' ? "User" : "User";
    model['attachments'] = this.formImageArray;
    model['supportrole'] = supportRole.map(a => a._id);

    console.log("Model : ",model)

    this.disableButton = true;
    try {
      this._commonService
        .commonServiceByUrlMethodData(url, method, model, this.bindId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          
          if (data) {
            this._router.navigate([`/pages/dynamic-list/list/support`]);
            this.disableButton = false;
            this.showNotification("top", "right", "Ticket created successfully !!", "success");
          }
        });
    } catch (e) {
      this.disableButton = false;
      this.showNotification("top", "right", "something went wrong !!", "danger");
    }
  }
}