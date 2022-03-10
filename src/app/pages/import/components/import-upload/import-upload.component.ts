import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ImportService } from '../../../../core/services/import/import.service';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { AuthService } from '../../../../core/services/common/auth.service';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-import-upload',
  templateUrl: './import-upload.component.html',
})
export class ImportUploadComponent extends BaseLiteComponemntComponent implements OnInit {

  selectedFile: any;
  selectedFileExtension: any;
  uploader: FileUploader;
  response: any [] = [];
  importFields: any [] = [];
  original_filename: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _importService: ImportService,
    private cloudinary: Cloudinary,
    private authService: AuthService,
  ) { 

    super();

    this.selectedFile = '';
    this.selectedFileExtension = '';
  }
  
  @Input('importUrl') importUrlValue: any;
  @Input('importFields') importFieldsValue: any;
  @Input('returnUrl') returnUrlValue: any;
  @Input('formId') formId: any;
  @Input('sampleCsvPath') sampleCsvPath: any;
  
  @Output() childSubmitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeSubmitData: EventEmitter<any> = new EventEmitter<any>();
  
  
  async ngOnInit() {

    super.ngOnInit()

    if(this.importUrlValue) {
      this.selectedFile = this.importUrlValue;
      this.selectedFileExtension = this.selectedFile.substring(this.selectedFile.lastIndexOf(".")+1);
    }

    if(this.importFieldsValue) {
      this.importFields = [];
      this.importFields = this.importFieldsValue;
    }

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    
    const uploaderOptions: FileUploaderOptions = {
    
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
    };
  
    this.uploader = new FileUploader(uploaderOptions);
  
    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    
    const upsertResponse = fileItem => {
      $('#upload_status').show();
      this.response = fileItem;
      if (fileItem) {
        if(fileItem.status == 200) {
          this.selectedFile = fileItem.data.secure_url;
          this.selectedFileExtension = this.selectedFile.substring(this.selectedFile.lastIndexOf(".")+1);
          this.original_filename = fileItem.data.original_filename;
          let uploadData = { filename: fileItem.data.secure_url, formid: this.formId };
          this._importService
            .getHeadings(uploadData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any)=>{
              if(data) {
                
                console.log("data", data);

                this.importFields = data;
                let postData = {
                  data: this.importFields,
                  url: fileItem.data.secure_url,
                  original_filename: this.original_filename,
                  selectedFileExtension: this.selectedFileExtension
                }
                this.childSubmitData.emit(postData);
                this.showNotification('top', 'right', 'File has been uploaded successfully!!!', 'success');
              }
          },(err) =>{
            console.error("err", err);
          });
        }
      }
    };
  
    this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
          file: item.file,
          status,
          data: JSON.parse(response)
    });
      
    this.uploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse( {
          file: fileItem.file,
          progress,
          data: {}
    });
       
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  onUpload() {
    let postData = {
      data: this.importFields,
      url: this.importUrlValue
    }
    this.childSubmitData.emit(postData);
  }

  removeUpload() {
    let postData = "remove";
    this.removeSubmitData.emit(postData);
  }

  getFileName(selectedFile: any) {
    if(selectedFile) {
      var string = selectedFile;
      var length = 20;
      return string.length > length ? string.substring(0, length - 3) + "..." : string;
    } else {
      return ""
    }
    
  }

  

}
