import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../core/services/common/common.service';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../components/basicValidators';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { AuthService } from '../../core/services/common/auth.service';

import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-dynamic-dispositionform',
  templateUrl: './dynamic-dispositionform.component.html',
  styles: [
    `
        .example-tree-invisible {
  display: none;
}

.example-tree ul,
.example-tree li {
  margin-top: 0;
  margin-bottom: 0;
  list-style-type: none;
}
`
  ]
})
export class DynamicDispositionformComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChild('picker') picker: any;

  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  uploader: FileUploader;
  response: any[] = [];
  private title: string;
  customeUploader: any[] = [];
  formImageArray: any[] = [];

  reSchedule: boolean = false;
  isdisablesavebutton: boolean = false;

  desginationWiseUser: any[] = [];

  public formGroup = new FormGroup({
    date: new FormControl(null, [Validators.required]),
    date2: new FormControl(null, [Validators.required])
  })
  public dateControl = new FormControl(new Date(2021,9,4,5,6,7));
  public dateControlMinMax = new FormControl(new Date());

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private authService: AuthService,
    private cloudinary: Cloudinary,
    private _commonService: CommonService,
  ) {
    super()
   }

  @Input('fields') fieldLists: any;
  @Input('isfollowup') isfollowup: any;
  @Input('saleschannelteams') saleschannelteams: any;
  
  @Input('type') type: any;
  @Output() onAddUpdateHistoryData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit()
      if(this.fieldLists && this.fieldLists.length > 0) {
        await this.attachmentConfiguration()
        await this.makeForm()
        if(this.saleschannelteams) {
          this.saleschannelteamHierarchy(this.saleschannelteams);
        } else {
          this.getAllUserLists();
        }
      }
      
    } catch(error) {
      console.log(error);
    }
    
  }

  async makeForm() {
    const group: any = {};
    this.fieldLists.forEach(element => {
      if (element.validationData) {
        if (element.validationData === 'requiredVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
            } else {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
            }
          }
        } else if (element.validationData === 'emailVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
            }
          }
        } else if (element.validationData === 'urlVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidUrlValidator.insertonlyvalidurl]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([ValidUrlValidator.insertonlyvalidurl]));
            }
          }
        } else if (element.validationData === 'onlyNumberVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, OnlyNumberValidator.insertonlynumber]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([OnlyNumberValidator.insertonlynumber]));
            }
          }
        } else if (element.validationData === 'mobileNumberVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
            }
          }
        } else if (element.validationData === 'onlyNumberOrDecimalVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, OnlyNumberOrDecimalValidator.insertonlynumberordecimal]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([OnlyNumberOrDecimalValidator.insertonlynumberordecimal]));
            }
          }
        } else if (element.validationData === 'validPercentVal') {
          if (element.fieldtype == 'image' || element.fieldtype == 'multi_image') {
            group[element.fieldname] = new FormControl(null);
          } else {
            if (element.isMandatory == "yes") {
              element.isAsterisk = true;
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidPercValidator.insertonlyvalidperc]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([ValidPercValidator.insertonlyvalidperc]));
            }
          }
        } else {
          group[element.fieldname] = new FormControl(null);
        }
      } else {
        if (element.isMandatory == "yes") {
          element.isAsterisk = true;
          group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
        } else {
          group[element.fieldname] = new FormControl(null);
        }
      }
    });
    this.dynamicForm = this.fb.group(group);


    if(this.isfollowup) {

      var today = new Date();
      
      var year = today.getFullYear();
      var month = today.getMonth();
      var day = today.getDate();
      var h = today.getHours();
      var m = today.getMinutes();
      var s = today.getSeconds();

      this.dynamicForm.addControl('followup', new FormControl(''));
      this.dynamicForm.addControl('followupdate', new FormControl(new Date(year, month, day, h, m, s), [Validators.required]));
      this.dynamicForm.addControl('assignto', new FormControl('', [Validators.required]));
      this.dynamicForm.controls['assignto'].setValue(this._loginUserId);

      console.log("dynamicForm", this.dynamicForm);
    }
  }

  async attachmentConfiguration() {
    this.fieldLists.forEach(element => {
      if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment') {
        
        var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
        var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

        const uploaderOptions: FileUploaderOptions = {
          url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
          autoUpload: true,
          isHTML5: true,
          removeAfterUpload: true,
          headers: [{ name: 'X-Requested-With', value: 'XMLHttpRequest' }]
        };
        let fieldname = element.fieldname;
        this.customeUploader[fieldname] = new FileUploader(uploaderOptions);
        this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {
          form.append('upload_preset',  auth_upload_preset);
          let tags = element.fieldname;
          if (this.title) {
            form.append('context', `photo=${element.fieldname}`);
            tags = element.fieldname;
          }
          form.append('tags', tags);
          form.append('file', fileItem);

          fileItem.withCredentials = false;
          return { fileItem, form };
        };

        const upsertResponse = fileItem => {
          $(".loading").show();
          if (fileItem && fileItem.status == 200) {

            let fieldnameTags = fileItem.data.tags[0];
            if (!this.formImageArray[fieldnameTags]) {
                this.formImageArray[fieldnameTags] = [];
            }

            if (!element.value) {
                element.value = [];
            }

            let extension: any;
            if (fileItem.file) {
                extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
            }

            let fileInfo = {
                attachment: fileItem.data.secure_url,
                extension: extension
            };

            this.formImageArray[fieldnameTags].push(fileInfo);
            element.value.push(fileItem.data.secure_url);

            $('#' + fieldnameTags).val(fileItem.data.secure_url);
            $(".loading").hide();
          }
        };

        this.customeUploader[fieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
          upsertResponse({file: item.file, status, data: JSON.parse(response)});

        this.customeUploader[fieldname].onProgressItem = (fileItem: any, progress: any) =>
          upsertResponse({ file: fileItem.file, progress });
        }
    });
    return;
  }

  onDynamicFormSubmit(value: any, isValid: boolean) {
    this.dynamicSubmitted = true;
    this.isdisablesavebutton = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Validation failed!!', 'danger');
      this.isdisablesavebutton = false;
      return false;
    } else {
      var postData = {
        value: value,
        reSchedule: this.reSchedule

      }
      console.log("postData", postData);
      this.onAddUpdateHistoryData.emit(postData);
      this.isdisablesavebutton = false;
      this.dynamicForm.get("followup").setValue(false);
    }
  }

  submit(type: any) {
    this.isdisablesavebutton = true;
    if(type == "reschedule") {
      this.reSchedule = true;
    }  else {
      this.reSchedule = false;
    }
    $("#submit").click();
  }

  saleschannelteamHierarchy(id: any) {

    let method = "POST";
    let url = "saleschannelteams/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "datatype": "ObjectId", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {

          this.desginationWiseUser = [];
          
          if (data[0] && data[0].channels && data[0].channels.length > 0) {

            data[0].channels.forEach(element => {
              if (element.designationid) {
                if (!this.desginationWiseUser[element.designationid._id]) {
                  this.desginationWiseUser[element.designationid._id] = [];
                  this.desginationWiseUser[element.designationid._id]['desginationid'] = {};
                  this.desginationWiseUser[element.designationid._id]['userid'] = [];
                  this.desginationWiseUser[element.designationid._id]['desginationid'] = element.designationid;
                }
                let obj: any;
                obj = this.desginationWiseUser[element.designationid._id]['userid'].find(p => p._id == element.userid._id);
                if (!obj) {
                  this.desginationWiseUser[element.designationid._id]['userid'].push(element.userid);
                }
              }
            });
          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  getAllUserLists() {

    let method = "POST";
    let url = "users/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria":"eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data) {

          console.log("data", data);

          this.desginationWiseUser = [];
          
          if (data[0]) {

            data.forEach(element => {
              if (element.designationid) {
                if (!this.desginationWiseUser[element.designationid._id]) {
                  this.desginationWiseUser[element.designationid._id] = [];
                  this.desginationWiseUser[element.designationid._id]['desginationid'] = {};
                  this.desginationWiseUser[element.designationid._id]['userid'] = [];
                  this.desginationWiseUser[element.designationid._id]['desginationid'] = element.designationid;
                }
                let obj: any;
                obj = this.desginationWiseUser[element.designationid._id]['userid'].find(p => p &&  p._id == element._id);
                if (!obj) {
                  this.desginationWiseUser[element.designationid._id]['userid'].push(element);
                }
              }
            });
          }
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

}
