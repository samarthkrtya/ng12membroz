import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { CommonDataService } from '../../../../core/services/common/common-data.service';

declare var $: any;

@Component({
  selector: 'app-branch-detail',
  templateUrl: './branch-detail.component.html',
})
export class BranchDetailComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  dataContent: any;

  isLoadingData: boolean = true;
  itemVisbility: boolean = true;
  disableBtn: boolean = false;

  tabPermission: any[] = [];

  license: any = {};

  attachment: any;
  customeUploader: any;

  constructor(
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
    private cloudinary: Cloudinary
  ) {
    super();
    this.pagename = "app-branch-detail";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "59f2fc70bd4e4bb2fb0ed920";
      this.itemVisbility = false;
    });

  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      this.isLoadingData = true;
      await super.ngOnInit();
      await this.loadData();
      this.isLoadingData = false;
      this.imageConfigration();
    });

  }

  async loadData() {
    this.tabPermission = [];
    //console.log(this._loginUserRole);
    //console.log(this._formName);

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName);
      //console.log(paymentObj);

      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
    }
    if (this.formObj.viewaction && this.formObj.viewaction.length > 0) {
      this.formObj.viewaction.map((actn) => {
        actn.actionurl = actn.actionurl.replace(':_formid', this._formId);
        if (Object.keys(actn.quertparams).length > 0) {
          for (const key in actn.quertparams) {
            if (actn.quertparams[key] == ':_id') {
              actn.quertparams[key] = actn.quertparams[key].replace(':_id', this.bindId);
            }
          }
        }
      });
    }
    await this.getMembership();
  }

  async getMembership() {

    let url = "branches/filter/view";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.dataContent = data[0];
          this.license = {
            'users': this.dataContent.license && this.dataContent.license.users ? this.dataContent.license.users : 0,
            'members': this.dataContent.license && this.dataContent.license.members ? this.dataContent.license.members : 0,
          };
          this.itemVisbility = true;
        }
      })
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
      form.append('upload_preset', auth_upload_preset);
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


  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  getUpdatedUsers(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getUpdatedLeave(submittedData: any) {
    if (submittedData) {
      this.loadData();
    }
  }

  redirectUrl(submittedData: any) {
    if (submittedData) {
      this._commonDataService.isfilterDataForDynamicPages = true;
      this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = '';
      this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = `/pages/branch/profile/${this.bindId}/${this._formId}`;
      this._router.navigate([`/pages/dynamic-forms/form/${submittedData.formid}/${this._loginUserBranchId}/Branch`]);
    }
  }

  AddLicence() {

  }

  saveLicence() {
    let model = {
      'license': this.license
    };

    let url = "branches";
    let method = "PATCH";

    this.disableBtn = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data) => {
        this.disableBtn = false;
        super.showNotification("top", "right", "Information updated successfully !!", "success");
        $("#methodClose").click();
      }).catch((e) => {
        this.disableBtn = false;
        super.showNotification("top", "right", "Error Occured !!", "danger");
        $("#methodClose").click();
      });
  }

  upLoadFile(){
    console.log("this.attachment",this.attachment);
    console.log("this.bindId",this.bindId);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
