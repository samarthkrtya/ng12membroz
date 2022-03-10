import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CompanySettingService } from '../../../../core/services/admin/company-setting.service';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { OrganizationModel } from 'src/app/core/models/organization/organization.model';
import { Subject } from 'rxjs';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from './../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
})
export class OrganizationSettingsComponent extends BaseLiteComponemntComponent implements OnInit {
  databsetype: string[] = ['Branchwise', 'Staffwise'];
  //databsetype: string[] = ['Branchwise','Organization'];
  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean = false;
  _organizaionModel = new OrganizationModel();
  isstupdn: boolean = true;
  bindId: any;
  organizationdata: any
  autologout: boolean = false;
  editPermission: boolean = false;
  btnDisable: boolean = false;
  checked: boolean = true;
  checked1: boolean = false;





  //image
  uploader: FileUploader;
  uploader1: FileUploader;
  uploader2: FileUploader;

  response: any[] = [];
  response1: any[] = [];
  response2: any[] = [];

  organizationalSettingsForm: FormGroup
  defaultlogo: string = "";
  organizationsetting: any;
  isbdetailload: boolean = false;
  isbdetailload1: boolean = false;
  isbdetailload2: boolean = false;



  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _organizationSettings: CompanySettingService,
  ) {
    super();
    this.isbdetailload = true;
    this.isbdetailload1 = true;
    this.isbdetailload2 = true;

    this.isbdetailload = true;
    this.isbdetailload1 = true;
    this.isbdetailload2 = true;



  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.getOrganizationDetails();
    await this.initImageUpload();
    await this.initImageUpload1();
    await this.initImageUpload2();


  }

  initImageUpload() {

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
        if (fileItem.status == 200) {
          $("#branch_picture").attr("src", fileItem.data.secure_url);
          this._organizaionModel.logo = fileItem.data.secure_url;
          //this.bindId = this._authService.auth_user.branchid._id;
          setTimeout(() => {
            $('#upload_status').hide();
          }, 1000);
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
      upsertResponse({
        file: fileItem.file,
        progress,
        data: {}
      });
  }


  initImageUpload1() {

    
    var auth_cloud_name1 = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset1 = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name1}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
    };

    this.uploader1 = new FileUploader(uploaderOptions);

    this.uploader1.onBuildItemForm = (fileItem1: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset1);
      fileItem1.withCredentials = false;
      return { fileItem1, form };
    };

    const upsertResponse = fileItem1 => {
      $('#upload_status1').show();
      this.response1 = fileItem1;
      if (fileItem1) {
        if (fileItem1.status == 200) {
          $("#branch_picture1").attr("src", fileItem1.data.secure_url);
          this._organizaionModel.adminloginimage = fileItem1.data.secure_url;
          //this.bindId = this._authService.auth_user.branchid._id;
          setTimeout(() => {
            $('#upload_status1').hide();
          }, 1000);
        }
      }
    };

    this.uploader1.onCompleteItem = (item: any, response1: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response1)
      });

    this.uploader1.onProgressItem = (fileItem1: any, progress: any) =>
      upsertResponse({
        file: fileItem1.file,
        progress,
        data: {}
      });
  }


  initImageUpload2() {

    var auth_cloud_name2= this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset2 = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name2}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
    };

    this.uploader2 = new FileUploader(uploaderOptions);

    this.uploader2.onBuildItemForm = (fileItem2: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset2);
      fileItem2.withCredentials = false;
      return { fileItem2, form };
    };

    const upsertResponse = fileItem2 => {
      $('#upload_status2').show();
      this.response2 = fileItem2;
      if (fileItem2) {
        if (fileItem2.status == 200) {
          $("#branch_picture2").attr("src", fileItem2.data.secure_url);
          this._organizaionModel.memberloginimage = fileItem2.data.secure_url;
          //this.bindId = this._authService.auth_user.branchid._id;
          setTimeout(() => {
            $('#upload_status2').hide();
          }, 1000);
        }
      }
    };

    this.uploader2.onCompleteItem = (item: any, response2: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response2)
      });

    this.uploader2.onProgressItem = (fileItem2: any, progress: any) =>
      upsertResponse({
        file: fileItem2.file,
        progress,
        data: {}
      });
  }



  async getOrganizationDetails() {
    this.isbdetailload = true;
    this.isbdetailload1 = true;
    this.isbdetailload2 = true;
    return this._organizationSettings
      .GetAll()
      .subscribe(data => {
        if (data) {
          console.log(data);

          //this._organizaionModel  = data
          this.organizationdata = data
          this._organizaionModel = this.organizationdata[0]

          this.bindId = this.organizationdata[0]._id
          if (this._organizaionModel.logo == undefined) {
            this._organizaionModel.logo = this.defaultlogo;
          }
          this.isbdetailload = false;
          this.isbdetailload1 = false;
          this.isbdetailload2 = false;

        }


      })
  }

  onSubmitorganization() {
    this.btnDisable = true;
    console.log(this._organizaionModel);

    if (this._organizaionModel.databasetype == undefined || this._organizaionModel.databasetype == '') {
      this._organizaionModel.databasetype = 'Branchwise'
    }
    if(this._organizaionModel.allowmemberlogin == true)
    {
      this.checked = true
    }
    else {
      this.checked = false
    }

    if (this._organizaionModel.autologout == false) {
      this.checked1 = false
    }
    else {
      this.checked1 = true;
      }

     this._organizationSettings.Update(this.bindId,this._organizaionModel).subscribe(data =>{
      if(data)
         {
        console.log("final data=>",data);
        this.showNotification('top', 'right', 'Organization detail updated successfully!!!', 'success');
        this.updatimg();
        this.btnDisable = false;
        this.ngOnInit()

      }
    }, data => {
      if (data.status == 500) {
        this.showNotification('top', 'right', 'Server error, Cannot update details.', 'danger');
        this.btnDisable = false;
      }

    })

  }

  updatimg() {
    this._authService.updData.emit('img');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
