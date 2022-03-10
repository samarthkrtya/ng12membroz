import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';


declare var $: any;

@Component({
  selector: 'app-email-preview',
  templateUrl: './email-preview.component.html',
})

export class EmailPreviewComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  form: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();

  disableButton: Boolean = false;
  submitted: boolean;
  tempate: any;
  receivers: any;
  templateid: any;
  attachment: any;
  attachmentblob: any;
  customeUploader: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary
  ) {
    super();

    this.form = this.fb.group({
      'sendto': ['', Validators.required],
      'cc': [''],
      'subject': ['', Validators.required],
      'content': ['', Validators.required],
      'attachment': ['']
    });
    this.route.params.forEach(params => {
      this._formId = params["formid"];
      this.bindId = params["id"];
      this.templateid = params["templateid"];
      this.pagename = 'email-preview';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.isLoading = false;
    this.setContent();
    this.imageConfigration();
  }

  private imageConfigration() {
    
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
      ]
    };

    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      form.append('context', `photo=${"item_logo"}`);
      form.append('tags', 'item_logo');
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    const upsertResponse = fileItem => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.attachment) {
          this.attachment = {};
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
        this.attachment = fileInfo;

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
  }

  public removeImg() {
    this.attachment = null;
  }

  private setContent() {
    let api,method,postData;
    
    if(this.formObj.schemaname == 'packagebookings'){
      api = "packagebookings/generatehtml";
      method = "POST";
      postData = {
        id : this.bindId,
        type : "booking",
        formname : "packagebooking",
      };
    }else if(this.formObj.schemaname == 'tourpackages'){
      api = "packagebookings/generatehtml"; 
      method = "POST";
      postData = {
        id : this.bindId,
        type : "tourpackage",
        formname : "tourpackage",
      };
    }else{
      api = 'common/generatehtml';
      method = "POST";
      postData = {
        "formid": this._formId,
        schemaname: this.formObj.schemaname,
        templateid: this.templateid,
        formname: this.formObj.formname
      }
    }

    this.isLoading = true;
 
    this._commonService
      .commonServiceByUrlMethodData(api, method,postData ,this.bindId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        
        this.isLoading = false;
        if(data.to){
          var sendto = data.to.join(',');
          this.form.controls['sendto'].setValue(sendto);
        }
        if(data.to){
          var cc = data.cc?.join(',');
          this.form.controls['cc'].setValue(cc);
        }
        if(data.template){
          this.tempate = data.template;
        }
        if(data.receivers){
          this.receivers = data.receivers;
        }
        if(data.subject){
          this.form.controls['subject'].setValue(data.subject);
        }
        this.form.controls['content'].setValue(data.content);
        this.attachmentblob = data.attachmentblob;
      },(e)=>{
        this.isLoading = false;
        console.log("e",e);
      });
  }

  public onSubmit(value: any, valid: Boolean) {

    this.submitted = true;
    if (!valid || value.content === "") {
      this.showNotification('top', 'right', 'Validation failed!!', 'danger');
    } else {


      var sendto = [], sendtomdl = [];
      sendto = value.sendto.split(',');
      sendto.forEach((ele) => {
        sendtomdl.push(ele.match(/(?<=<).*?(?=>)/) ? ele.match(/(?<=<).*?(?=>)/)[0] : ele);
      });

      var cc = [], ccmdl = [];
      cc = value.cc?.split(',');
      cc?.forEach((ele) => {
        ccmdl.push(ele.match(/(?<=<).*?(?=>)/) ? ele.match(/(?<=<).*?(?=>)/)[0] : ele);
      });

      let model = {
        "message": {
          "to": sendtomdl,
          "cc": ccmdl,
          "subject": value.subject,
          "content": value.content,
          'attachmenturl': this.attachment ? this.attachment.attachment : '',
          'attachmentblob': this.attachmentblob, 
        },
        "messagetype": "EMAIL",
        "template": this.tempate,
        "receivers": this.receivers
      };


      this.disableButton = true;
      this._commonService
        .communicationsend(model)
        .then((data) => {
          if (data) {
            if(this.previousUrl){
              this._router.navigate([this.previousUrl]);  
            }else{
              this._router.navigate([`/pages/dynamic-list/list/${this.formObj.formname}`]);
            }
            this.showNotification('top', 'right', 'Email sent successfully !!', 'success');
            this.disableButton = false;
          }
        }).catch((e)=>{
          this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
          this.disableButton = false;
        });
    }
  }

  public downloadlink(link: any) {
    window.open(link.attachment, '_blank');
    return true;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
