import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { AuthService } from '../../../../../../core/services/common/auth.service';
import { CommonService } from '../../../../../../core/services/common/common.service';

import swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-member-basic-details',
  templateUrl: './member-basic-details.component.html'
})
export class MemberBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  uploader: FileUploader;
  response: any [] = [];
  
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private cloudinary: Cloudinary,
    private authService: AuthService,
    private _commonService: CommonService
  ) { 
    super();
    this.pagename="app-member-basic-details";
  }

  async ngOnInit() {

    super.ngOnInit()

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
      form.append('upload_preset',  auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    
    const upsertResponse = fileItem => {
      $('#upload_status').show();
      this.response = fileItem;
      if (fileItem) {
        if(fileItem.status == 200) {

          this.dataContent.profilepic = fileItem.data.secure_url;

          let method = "PATCH";
          let url = "members/" + this.dataContent._id;

          let postData =  {};
          postData["profilepic"] = fileItem.data.secure_url;

          return this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData)
            .then(data=>{
              if(data) {
                this.showNotification('top', 'right', 'Profile picture has been changed successfully!!!', 'success');
                $('#upload_status').hide();
                return;
              }
            }, (error)=>{
              console.error(error);
          })
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


 deleteProfileImg(){
     this.dataContent['profilepic'] = null;

     let method = "POST";
     let url = "common/updatefields";
     
     let postData = {};
     postData['id'] = this.dataContent._id;
     postData['schemaname'] = "members";
     postData['updatedfields'] = [];
     postData['updatedfields'].push({ "fieldname" : "profilepic" , "fieldvalue" : null ,"datatype" : 'text' });
     
      this._commonService
       .commonServiceByUrlMethodData(url, method, postData)
       .pipe(takeUntil(this.destroy$))
       .subscribe(data=>{
         if(data) {
           this.showNotification('top', 'right', 'Profile picture removed successfully !!', 'success');
         }
       }, (error)=>{
         console.error(error);
     })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
