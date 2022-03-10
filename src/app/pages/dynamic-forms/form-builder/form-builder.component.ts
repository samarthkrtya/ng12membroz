
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, AfterViewChecked, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SafeHtml } from "@angular/platform-browser";

import { CommonService } from '../../../core/services/common/common.service';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../../../shared/components/basicValidators';

import { overEighteen } from '../../../shared/components/over-eighteen.validator';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { BaseLiteComponemntComponent } from '../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

declare var $: any;
import swal from 'sweetalert2';

import { NgxSignaturePadComponent, SignaturePadOptions } from "@o.krucheniuk/ngx-signature-pad";

@Component({
  moduleId: module.id,
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styles: [
    `
    ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
      border: 2px solid !important;
    }


    mat-radio-group {
      display: block;
      position: relative;
      flex: auto;
      min-width: 0;

    }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit, AfterViewChecked {

  _sectionLists: any[] = [];
  permission: any;

  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  _labelSubmit: string;

  uploader: FileUploader;
  response: any[] = [];
  customeUploader: any[] = [];

  formImageArray: any[] = [];

  ishidedeletebutton = false;

  _loginUserRole: any;
  wfpermission: any;

  _wfpermissionlabelSubmit: any;
  isdisablesavebutton: boolean = false;
  reason: any;

  form: FormGroup;
  arr: FormArray;
  submitted: boolean;

  recprdEligibilityForWfPermission: boolean = false;

  _loginUserId: any;

  minDate: Date;
  maxDate: Date;

  allowedFileType = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv", "pdf", "jpg", "jpeg", "gif", "png", "tif", "tiff"]
  maxFileSize = 5 * 1024 * 1024;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  startDate: Date;

  currentcounter: number = 0;

  quickfromstyle = "single";
  quickformschemaname = "users";

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {
    super();

    this.form = fb.group({
      'reason': [this.reason, Validators.required],
    });
  }

  @Input('tabData') tabDataValue: any[] = [];
  @Input('wfstatus') wfstatus: string;
  @Input('formsModel') formsModelValue: any = {};
  @Input('bindIdData') bindIdDataValue: any = {};
  @Input('langResource') langResourceValue: any[] = [];
  @Input('isdisablesavebutton') isdisablesavebuttonValue: any = false;
  @Input('_formName') formName: string;
  @Input('bindId') bindId: any;



  @Output() childSubmitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() childbackLink: EventEmitter<any> = new EventEmitter<any>();
  @Output() disabledDirtyForm: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("testPadTest", { static: false }) signaturePadElement: NgxSignaturePadComponent;

  config: SignaturePadOptions = {
    minWidth: 1,
    maxWidth: 10,
    penColor: "blue"
  };

  async ngOnInit() {

    await super.ngOnInit();

    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 100, 0, 1);
    this.maxDate = new Date(currentYear + 100, 11, 31);

    this.getRoleDetail();

    this.recprdEligibilityForWfPermission = false;

    if (this.bindIdDataValue) {

      if (this.formsModelValue['dispalySubmitBtn'] && this.formsModelValue['dispalySubmitBtn'] !== '') {
        this._labelSubmit = this.langResourceValue[this.formsModelValue['dispalySubmitBtn']] ? this.langResourceValue[this.formsModelValue['dispalySubmitBtn']] : this.formsModelValue['dispalySubmitBtn'];
      } else {
        this._labelSubmit = this.langResourceValue['submit'] ? this.langResourceValue['submit'] : 'Submit';
      }

      if (this.formsModelValue['ishidedeletebutton'] != undefined && this.formsModelValue['ishidedeletebutton'] !== '') {
        this.ishidedeletebutton = this.langResourceValue[this.formsModelValue['ishidedeletebutton']] ? this.langResourceValue[this.formsModelValue['ishidedeletebutton']] : this.formsModelValue['dispalySubmitBtn'];
      }

    } else {
      this.ishidedeletebutton = true;
      this._labelSubmit = this.langResourceValue['save'] ? this.langResourceValue['save'] : 'Save';
    }

    this._sectionLists = this.tabDataValue;
    this.permission = this._loginUserRole.permissions.find(a => a.formname == this.formName)

    this._sectionLists.forEach(ele => {
      ele.forEach(element => {

        if (element.fieldtype == "image" || element.fieldtype == "multi_image" || element.fieldtype == "attachment" || element.fieldtype == "gallery") {
          if (!this.formImageArray[element.fieldname]) {
            this.formImageArray[element.fieldname] = [];
          }
          if (this.bindIdDataValue) {

            if (this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname].length !== 0) {
              if (!this.formImageArray[element.fieldname]) {
                this.formImageArray[element.fieldname] = [];
              }
              this.formImageArray[element.fieldname] = this.bindIdDataValue['property'][element.fieldname];
            }

          }
        } else if (element.fieldtype == "datepicker") {
          if (element.validationData && element.validationData == "dateOfBirthVal") {
            element.maxDate = new Date();
          }
        } else if (element.fieldtype == "group") {
          if(element.fields && element.fields.length > 0) {
            element.fields.forEach(eleGroup => {
              if (eleGroup.fieldtype == "image" || eleGroup.fieldtype == "multi_image" || eleGroup.fieldtype == "attachment" || eleGroup.fieldtype == "gallery") {
                if (!this.formImageArray[element.fieldname]) {
                  this.formImageArray[element.fieldname] = [];
                }
                if (this.bindIdDataValue &&  this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname].length > 0) {
                  for(var imgcnt = 0; imgcnt < this.bindIdDataValue['property'][element.fieldname].length; imgcnt++) {
                    if(!this.formImageArray[element.fieldname][imgcnt]) {
                      this.formImageArray[element.fieldname][imgcnt] = [];
                    }
                    if(!this.formImageArray[element.fieldname][imgcnt][eleGroup.fieldname]) {
                      this.formImageArray[element.fieldname][imgcnt][eleGroup.fieldname] = [];
                    }
                    this.formImageArray[element.fieldname][imgcnt][eleGroup.fieldname] = this.bindIdDataValue['property'][element.fieldname][imgcnt][eleGroup.fieldname];
                  }
                }
              }
            });
          }
        }
      });
    });

    await this.makeForm();

    setTimeout(async () => {
      await this.imageConfigration();
    }, 1000);


    this.isdisablesavebutton = false;
  }

  public getLang(key: string, value: string) {
    return this.langResourceValue[key] ? this.langResourceValue[key] : value;
  }

  ngAfterViewInit() {
    this.isdisablesavebuttonValue = this.bindId && !this.bindIdDataValue.branchid;
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getRoleDetail() {

    if (this._loginUserRole && this._loginUserRole['permissions'] && this._loginUserRole['permissions'].length !== 0) {
      let cnt = 0;

      this._loginUserRole['permissions'].forEach(element => {

        if (element.formname == this.formsModelValue['formname'] && element.wfpermission) {
          this.wfpermission = element.wfpermission;
          if (this.wfpermission == "approver") {
            this._wfpermissionlabelSubmit = "Approved";
          } else {
            this._wfpermissionlabelSubmit = "Reviewed";
          }
        }
      });
    }

    if (this.bindIdDataValue && this.bindIdDataValue['wfstatus']) {
      this.recprdEligibilityForWfPermission = false;

      if (this.bindIdDataValue && this.bindIdDataValue['wfuserid'] && this.bindIdDataValue['wfuserid'].length !== 0) {
        var wfuseridObj = this.bindIdDataValue['wfuserid'].find(p => p == this._loginUserId);

        if (wfuseridObj) {
          if (this.wfpermission == "approver") {
            if (this.bindIdDataValue['wfstatus'] == "Pending" || this.bindIdDataValue['wfstatus'] == "reviewed") {
              this.recprdEligibilityForWfPermission = true;
            }
          } else if (this.wfpermission == "reviewer") {
            if (this.bindIdDataValue['wfstatus'] == "reviewer") {
              this.recprdEligibilityForWfPermission = true;
            }
          }
        }
      }
    }
  }

  async imageConfigration() {
    this._sectionLists.forEach(ele => {
      ele.forEach(element => {

        if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == "attachment" || element.fieldtype == "gallery") {

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

          if (element.fieldtype == 'gallery') {
            uploaderOptions.allowedFileType = ['image']
          }

          let fieldname = element.fieldname;
          this.customeUploader[fieldname] = new FileUploader(uploaderOptions);

          this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {

            form.append('upload_preset', auth_upload_preset);
            form.append('context', `photo=${element.fieldname}`);
            form.append('tags', element.fieldname);
            form.append('file', fileItem);

            fileItem.withCredentials = false;
            return { fileItem, form };
          };

          const upsertResponse = fileItem => {

            $(".loading_" + element.fieldname).show();

            if (fileItem && fileItem.status == 200) {


              let fieldnameTags = fileItem.data.tags[0];

              if (!this.formImageArray[fieldnameTags]) {
                this.formImageArray[fieldnameTags] = [];
              }

              if (!element.value) {
                element.value = "";
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

              if (element.multiselect == false) {
                this.formImageArray[fieldnameTags] = [];
              }

              this.formImageArray[fieldnameTags].push(fileInfo);
              element.value = fileItem.data.secure_url;
              $('#' + fieldnameTags).val(fileItem.data.secure_url);
              this.dynamicForm.controls[element.fieldname].setValue(fileItem.data.secure_url);
              $(".loading_" + element.fieldname).hide();
          }
        };
          this.customeUploader[fieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
            upsertResponse(
              {
                file: item.file,
                status,
                data: JSON.parse(response)
              }
            );

          this.customeUploader[fieldname].onProgressItem = (fileItem: any, progress: any) =>
            upsertResponse(
              {
                file: fileItem.file,
                progress
              });

          this.customeUploader[fieldname].onWhenAddingFileFailed = (item: any, filter: any) => {
            let message = '';
            switch (filter.name) {
              case 'fileSize':
                message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(element.maxfilesize ? element.maxfilesize : (Number(this.maxFileSize) * 1024 * 1024));
                this.showNotification("top", "right", message, "danger");
                break;
              default:
                //message = 'Error trying to upload file '+item.name;
                message = 'Please upload image file only.';
                this.showNotification("top", "right", message, "danger");
                break;
            }
          };
        } else if (element.fieldtype == 'group') {

          var controlLength = this.dynamicForm.get([element.fieldname])['controls'].length > 0 ? this.dynamicForm.get([element.fieldname])['controls'].length : 1;

          for(var i = 0; i <= controlLength; i++) {

            element.fields.forEach(elementGroup => {


              if (elementGroup.fieldtype == 'image' || elementGroup.fieldtype == 'multi_image' || elementGroup.fieldtype == "attachment" || elementGroup.fieldtype == "gallery") {

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
                  additionalParameter: { uploaderparams: i },
                };

                if (elementGroup.fieldtype == 'gallery') {
                  uploaderOptions.allowedFileType = ['image']
                }

                let fieldname = element.fieldname;
                let groupfieldname = elementGroup.fieldname;


                if(!this.customeUploader[fieldname]) {
                  this.customeUploader[fieldname] = [];
                }

                if(!this.customeUploader[fieldname][i]) {
                  this.customeUploader[fieldname][i] = [];
                }

                if(!this.customeUploader[fieldname][i][groupfieldname]) {
                  this.customeUploader[fieldname][i][groupfieldname] = [];
                }


                this.customeUploader[fieldname][i][groupfieldname] = new FileUploader(uploaderOptions);

                this.customeUploader[fieldname][i][groupfieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {

                  this.currentcounter = Number(fileItem.options.additionalParameter.uploaderparams);

                  form.append('upload_preset', auth_upload_preset);
                  form.append('context', `type=group|index=${this.currentcounter}`);
                  form.append('tags', elementGroup.fieldname);
                  form.append('file', fileItem);

                  fileItem.withCredentials = false;
                  return { fileItem, form };
                };

                const upsertResponse = fileItem => {

                  $(".loading_" + elementGroup.fieldname + "_" + this.currentcounter).show();

                  if (fileItem && fileItem.status == 200) {

                    let fieldnameTags = fileItem.data.tags[0];


                    if (!elementGroup.value) {
                      elementGroup.value = "";
                    }

                    let extension: any;
                    if (fileItem.file) {
                      extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
                    }

                    let fileInfo = {
                      attachment: fileItem.data.secure_url,
                      extension: extension,
                      originalfilename: fileItem.data.original_filename,
                    };


                    if(!this.formImageArray[fieldname]) {
                      this.formImageArray[fieldname] = [];
                    }

                    if(!this.formImageArray[fieldname][this.currentcounter]) {
                      this.formImageArray[fieldname][this.currentcounter] = [];
                    }

                    if(!this.formImageArray[fieldname][this.currentcounter][groupfieldname]) {
                      this.formImageArray[fieldname][this.currentcounter][groupfieldname] = [];
                    }

                    this.formImageArray[fieldname][this.currentcounter][groupfieldname].push(fileInfo);

                    console.log('this.formImageArray[fieldname][this.currentcounter][groupfieldname]', this.formImageArray[fieldname][this.currentcounter][groupfieldname])

                    elementGroup.value = fileItem.data.secure_url;

                    $('#' + fieldnameTags).val(fileItem.data.secure_url);
                    $(".loading_" + elementGroup.fieldname+ "_" + this.currentcounter).hide();

                  }

                };

                this.customeUploader[fieldname][i][groupfieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
                  upsertResponse({
                    file: item.file,
                    status,
                    data: JSON.parse(response)
                });

                this.customeUploader[fieldname][i][groupfieldname].onProgressItem = (fileItem: any, progress: any) =>
                upsertResponse({
                  file: fileItem.file,
                  progress
                });

                this.customeUploader[fieldname][i][groupfieldname].onWhenAddingFileFailed = (item: any, filter: any) => {
                  let message = '';
                  switch (filter.name) {
                    case 'fileSize':
                      message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(elementGroup.maxfilesize ? elementGroup.maxfilesize : (Number(this.maxFileSize) * 1024 * 1024));
                      this.showNotification("top", "right", message, "danger");
                      break;
                    default:
                      //message = 'Error trying to upload file '+item.name;
                      message = 'Please upload image file only.';
                      this.showNotification("top", "right", message, "danger");
                      break;
                  }
                };
              }

            });
          }

        }

      });
    });

    return;
  }

  formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async makeForm() {

    const group: any = {};
    if (this.permission && this.permission.fieldpermission) {
      var viewfields = this.permission.fieldpermission.find(a => a.type == 'view');
    }
    this._sectionLists.forEach(ele => {
      ele.forEach(element => {
        
        if (element.fieldtype == 'group') {

          
          if (this.bindIdDataValue) {
            if (this.bindIdDataValue && this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname].length > 0) {
              group[element.fieldname] = this.fb.array([])

              //console.log("group[element.fieldname]", group[element.fieldname])

            } else {
              group[element.fieldname] = this.fb.array([this.createItem(element.fields)])
            }
          } else {
            group[element.fieldname] = this.fb.array([this.createItem(element.fields)])
          }
        } else if (element.fieldtype == 'checkbox') {
          group[element.fieldname] = new FormControl([])
        } else if (element.fieldtype == 'readonly') {
          group[element.fieldname] = new FormControl(element.defaultvalue);
        } else if (element.fieldtype == 'mobile' || element.fieldtype == 'alternatenumber') {
          if (element.required) {
            if(element.min && element.max){
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, Validators.minLength(element.min), Validators.maxLength(element.max)]));
            }else{
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
            }
          } else {
            if(element.min && element.max){
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.minLength(element.min), Validators.maxLength(element.max)]));
            }else{
              group[element.fieldname] = new FormControl(null, Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
            }
          }
        } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
          if (element.required) {
            group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
          } else {
            group[element.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
          }
        } else if (element.fieldtype == 'number') {

          if (element.required) {
            if(element.min && element.max){
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, Validators.min(element.min), Validators.max(element.max)]));
            } else {
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
            }
          } else {
            if(element.min && element.max){
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.min(element.min), Validators.max(element.max)]));
            } else {
              group[element.fieldname] = new FormControl(null);
            }
            
          }
        } else {
          if (element.required && element.fieldtype == "slide_toggle") {
            group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
          } else if (element.required) {
            group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
          } else {
            group[element.fieldname] = new FormControl(null);
          }
        }
      });
    });

    this.dynamicForm = this.fb.group(group);

    setTimeout(() => {
      this._sectionLists.forEach(ele => {
        ele.forEach(element => {

          if (this.bindIdDataValue && this.bindIdDataValue['property'] && (this.bindIdDataValue['property'][element.fieldname] ||  this.bindIdDataValue['property'][element.fieldname] == "0" ) && element.fieldname) {
            if (element.fieldtype !== "group") {
              if(element.fieldtype == 'datetime'){
                var date = new Date(this.bindIdDataValue['property'][element.fieldname]);
                this.dynamicForm.controls[element.fieldname].setValue(`${this.setTime(date.getHours())}:${this.setTime(date.getMinutes())}`);
              } else {
                this.dynamicForm.controls[element.fieldname].setValue(this.bindIdDataValue['property'][element.fieldname]);
              }
            } else if (element.fieldtype == "group") {

              let control = <FormArray>this.dynamicForm.controls[element.fieldname];
              this.bindIdDataValue['property'][element.fieldname].forEach(x => {
                control.push(this.fb.group(x));
              })
            }
          }

          if (element.fieldtype == "hidden" || element.fieldtype == "readonly") {
            this.dynamicForm.controls[element.fieldname].setValue(element.defaultvalue);
          }

          if (viewfields && viewfields.fields.includes(element.fieldname)) {
            this.dynamicForm.controls[element.fieldname].disable();
            if (!this.bindId) {
              element.fieldtype = "hidden";
            }
          }
        });
      });
      return;
    }, 500);

    // if (this.wfstatus && this.wfstatus != 'approver') {
    //   this.isdisablesavebuttonValue = true;
    // }

    // console.log("this.dynamicForm",this.dynamicForm);
  }

  setTime(num: any){
    return num <= 9 ? `0${num}` : `${num}`;
  }

  editItem(element: any) {
    const group: any = {};
    let control = <FormArray>this.dynamicForm.controls[element.fieldname];
    this.bindIdDataValue['property'][element.fieldname].map((item, index) => {
      element.fields.forEach(elementFields => {
        if (item[elementFields.fieldname]) {
          if (elementFields.fieldtype == 'checkbox') {
            group[elementFields.fieldname] = new FormControl([item[elementFields.fieldname]])
          } else if (elementFields.fieldtype == 'readonly') {
            group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname]);
          } else if (elementFields.fieldtype == 'mobile' || elementFields.fieldtype == 'alternatenumber') {
           if (elementFields.required) {
              if(elementFields.min && elementFields.max){
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required, Validators.minLength(elementFields.min), Validators.maxLength(elementFields.max)]));  
              }else{
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
              }
            } else {
              if(elementFields.min && elementFields.max){
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.minLength(elementFields.min), Validators.maxLength(elementFields.max)]));
              }else{
                group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
              }
            }
          } else if (elementFields.fieldtype == 'primaryemail' || elementFields.fieldtype == 'secondaryemail') {
            if (elementFields.required) {
              group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required, BasicValidators.email]));
            } else {
              group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([BasicValidators.email]));
            }
          } else {
            if (elementFields.required && element.fieldtype == "slide_toggle") {
              group[elementFields.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
            } else if (elementFields.required) {
              group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname], Validators.compose([Validators.required]));
            } else {
              group[elementFields.fieldname] = new FormControl(item[elementFields.fieldname]);
            }
          }
          control.push(this.fb.group(group));
        }
      });
    })
  }

  deleteGroupItem(fields: any, index: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this!',
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

        (varTemp.dynamicForm.get(fields.fieldname) as FormArray).removeAt(index);

        swal.fire({
          title: 'Deleted!',
          text: 'Your Information has been deleted.',
          icon: 'success',
          customClass: {
            confirmButton: "btn btn-success",
          },
          buttonsStyling: false
        });
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Information is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })


  }

  createItem(fields: any) {
    const group: any = {};
    fields.forEach(element => {
      
      if (element.fieldtype == 'checkbox') {
        group[element.fieldname] = new FormControl([])
      } else if (element.fieldtype == 'readonly') {
        group[element.fieldname] = new FormControl(element.defaultvalue);
      } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
        if (element.required) {
          group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, BasicValidators.email]));
        } else {
          group[element.fieldname] = new FormControl(null, Validators.compose([BasicValidators.email]));
        }
      } else {
        if (element.required && element.fieldtype == "slide_toggle") {
          group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
        } else if (element.required) {
          group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
        } else {
          group[element.fieldname] = new FormControl(null);
        }
      }
    });
    return this.fb.group(group);
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

  addItem(fields: any) {
    this.arr = this.dynamicForm.get([fields.fieldname]) as FormArray;
    this.arr.push(this.createItem(fields.fields));
    //this.imageGroup(fields);
    this.imageConfigration();

  }

  onDynamicFormSubmit(value: any, isValid: boolean) {
    this.dynamicSubmitted = true;
    this.isdisablesavebuttonValue = true;
    if (!isValid) {
      this.isdisablesavebuttonValue = false;
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {
      
      this._sectionLists.forEach(ele => {
        ele.forEach(ele2 => {
          if (ele2.fieldtype == 'lookup' || ele2.fieldtype == 'ondemandform' || ele2.fieldtype == 'form' || ele2.fieldtype == 'formdata') {

            if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname]['autocomplete_id']) {
              this.dynamicForm.value[ele2.fieldname] = this.dynamicForm.value[ele2.fieldname]['autocomplete_id'];
            }

          } else if(ele2.fieldtype == 'datetime'){
              var today = new Date();
              if (this.dynamicForm.value[ele2.fieldname]) {
                var splt = this.dynamicForm.value[ele2.fieldname].split(":");
                this.dynamicForm.value[ele2.fieldname] = new Date(today.getFullYear() ,today.getMonth() , today.getDate() , +splt[0] , +splt[1], 0);
              }
          } else if (ele2.fieldtype == 'image' || ele2.fieldtype == 'multi_image' || ele2.fieldtype == 'attachment' || ele2.fieldtype == 'gallery') {
            for (let key in this.formImageArray) {
              if (key == ele2.fieldname) {
                this.dynamicForm.value[ele2.fieldname] = this.formImageArray[key];
              }
            }
          } else if (ele2.fieldtype == 'signaturepad') {
            if(!this.signaturePadElement.isEmpty()) {
              
              this.dynamicForm.value[ele2.fieldname] = this.signaturePadElement.toDataURL();
              
            } else {
              
              for (let key in this.formImageArray) {
                if (key == ele2.fieldname) {
                  var last = this.formImageArray[key].length - 1;
                  this.dynamicForm.value[ele2.fieldname] = this.formImageArray[key][last]['attachment'];
                }
              }
            }
          } else if (ele2.fieldtype == "group") {
            ele2.fields.forEach(elementGroup => {
              if (elementGroup.fieldtype == 'lookup' || elementGroup.fieldtype == 'ondemandform' || elementGroup.fieldtype == 'form' || elementGroup.fieldtype == 'formdata') {

                if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {

                  this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                    if (elementGroupValue && elementGroupValue[elementGroup.fieldname] && elementGroupValue[elementGroup.fieldname]['autocomplete_id']) {
                      elementGroupValue[elementGroup.fieldname] = elementGroupValue[elementGroup.fieldname]['autocomplete_id']
                    }
                  });

                }

              } else if(elementGroup.fieldtype == 'datetime'){
                var today = new Date();
                if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {
                  this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                    if (elementGroupValue && elementGroupValue[elementGroup.fieldname]) {
                      var splt = elementGroupValue[elementGroup.fieldname].split(":");
                      elementGroupValue[elementGroup.fieldname] = new Date(today.getFullYear() ,today.getMonth() , today.getDate() , +splt[0] , +splt[1], 0);
                    }
                  });
                }
              } else if (elementGroup.fieldtype == 'image' || elementGroup.fieldtype == 'multi_image' || elementGroup.fieldtype == 'attachment' || elementGroup.fieldtype == 'gallery') {
                for (let key in this.formImageArray) {
                  if (key == ele2.fieldname) {
                    if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {
                      for(var imgcounter = 0; imgcounter < this.dynamicForm.value[ele2.fieldname].length; imgcounter++) {
                        if(this.dynamicForm.value[ele2.fieldname][imgcounter][elementGroup.fieldname] !== undefined) {
                          if(this.formImageArray && this.formImageArray[ele2.fieldname] && this.formImageArray[ele2.fieldname][imgcounter]) {
                            this.dynamicForm.value[ele2.fieldname][imgcounter][elementGroup.fieldname] = this.formImageArray[ele2.fieldname][imgcounter][elementGroup.fieldname];
                          }
                        }
                      }
                    }
                  }
                }
              } else if (elementGroup.fieldtype == 'signaturepad') {
                if(!this.signaturePadElement.isEmpty()) {

                  if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {

                    this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {

                      if (elementGroupValue && elementGroupValue[elementGroup.fieldname]) {
                        elementGroupValue[elementGroup.fieldname] = this.signaturePadElement.toDataURL();
                      }

                    });
                  }
                  
                } else {
                  
                  for (let key in this.formImageArray) {
                    if (key == elementGroup.fieldname) {
                      var last = this.formImageArray[key].length - 1;

                      if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {

                        this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                          if (elementGroupValue && elementGroupValue[elementGroup.fieldname]) {
                            elementGroupValue[elementGroup.fieldname] = this.formImageArray[key][last]['attachment'];
                          }
                        });
                      }

                    }
                  }
                }
              }
            });
          }
        });
      });
      //console.log("this.dynamicForm.value", this.dynamicForm.value);
      this.childSubmitData.emit(this.dynamicForm.value);
    }
  }

  removeImg(url: any, filedname: any) {

    for (const i in this.dynamicForm.value[filedname]) {
      if (this.dynamicForm.value[filedname][i] == url['attachment']) {
        this.dynamicForm.value[filedname].splice(i, 1);
      }
    }

    for (const key in this.formImageArray) {
      if (key == filedname) {
        this.formImageArray[key].forEach(element => {
          if (element == url) {
            this.formImageArray[key].splice(element, 1);
          }
        });

      }
    }

    this._sectionLists.forEach(ele => {
      ele.forEach(element => {
        if (element.fieldname == filedname) {
          if (this.formImageArray[filedname].length == 0) {
            element.value = "";
          }
        }
      });
    });




  }

  removeGroupImg(url: any, filedname: any, count: any, groupfieldname: any) {


    // console.log("formImageArray", this.formImageArray);
    // console.log("url", url);
    // console.log("formImageArray", this.formImageArray[filedname][count][groupfieldname]);

    // for (const i in this.dynamicForm.value[filedname]) {
    //   if (this.dynamicForm.value[filedname][i] == url['attachment']) {
    //     this.dynamicForm.value[filedname].splice(i, 1);
    //   }
    // }


    if (this.formImageArray && this.formImageArray[filedname] && this.formImageArray[filedname][count] && this.formImageArray[filedname][count][groupfieldname] && this.formImageArray[filedname][count][groupfieldname].length > 0 ) {
      let i = 0;
      this.formImageArray[filedname][count][groupfieldname].forEach(element => {
        if (element.attachment == url.attachment) {
          this.formImageArray[filedname][count][groupfieldname].splice(i, 1);
        }
        i++;
      });
    }

    this._sectionLists.forEach(ele => {
      ele.forEach(element => {
        if (element.fieldname == filedname) {
          if(element.value && element.value[count] && element.value[count][groupfieldname]) {
            let i = 0;
            element.value[count][groupfieldname].forEach(elementGroup => {
              if (elementGroup.attachment == url.attachment) {
                elementGroup.value[count][groupfieldname].splice(i, 1);
              }
              i++;
            });
          }
        }
      });
    });
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  wfapprovalprocess() {

    this.isdisablesavebutton = true;

    if (this.wfpermission == "approver") {
      this.bindIdDataValue.wfstatus = "Approved";
    } else {
      this.bindIdDataValue.wfstatus = "Reviewed";
    }

    this.bindIdDataValue.role = this.bindIdDataValue.role['_id'] ? this.bindIdDataValue.role['_id'] : this.bindIdDataValue.role;

    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
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
        let url = varTemp.formsModelValue.editurl['url'].replace(':_id', '');
        let method = varTemp.formsModelValue.editurl['method'];

        varTemp._commonService
          .commonServiceByUrlMethodData(url, method, varTemp.bindIdDataValue[0], varTemp.bindIdDataValue[0]['_id'])
          .subscribe(data => {
            if (data) {

              varTemp.isdisablesavebutton = false;
              varTemp.showNotification('top', 'right', 'Records has been Updated Successfully!!!', 'success');
              varTemp._router.navigate(['/pages/admins/automation/workflow/approval-lists']);
            }
          }, (err) => {
            console.error("err", err);
          });
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      return false;
    } else {

      this.isdisablesavebutton = true;
      this.bindIdDataValue.wfstatus = "decline";
      if (!this.bindIdDataValue['property']) {
        this.bindIdDataValue['property'] = {};
      }
      this.bindIdDataValue['property']['wfreason'] = this.reason;

      this.bindIdDataValue.role = this.bindIdDataValue.role['_id'] ? this.bindIdDataValue.role['_id'] : this.bindIdDataValue.role;


      const varTemp = this;


      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this imaginary file!',
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
          let url = varTemp.formsModelValue.editurl['url'].replace(':_id', '');
          let method = varTemp.formsModelValue.editurl['method'];

          varTemp._commonService
            .commonServiceByUrlMethodData(url, method, varTemp.bindIdDataValue[0], varTemp.bindIdDataValue[0]['_id'])
            .subscribe(data => {
              if (data) {

                varTemp.isdisablesavebutton = false;
                varTemp.showNotification('top', 'right', 'Records has been Updated Successfully!!!', 'success');
                varTemp._router.navigate(['/pages/admins/automation/workflow/approval-lists']);
              }
            }, (err) => {
              console.error("err", err);
            });
        } else {
          swal.fire({
            title: 'Cancelled',
            text: 'Your imaginary file is safe :)',
            icon: 'error',
            customClass: {
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
          });
        }
      })
    }
  }

  closePopup() {
    this.form.reset();
  }

  onItemAdded(itemToBeAdded: any) {
  }

  getSubmittedData(submit_data: any) {
    
    // console.log("submit_data", submit_data);

    this._sectionLists.forEach(element123 => {
      var fieldObj = element123.find(p=>p._id == submit_data.id);
      if(fieldObj) {
        fieldObj.autocomplete = false;
        fieldObj.value = submit_data.value;
        setTimeout(() => {
          fieldObj.autocomplete = true;
        });
      }
    });
  }

  back() {
    this.childbackLink.emit();
  }
}
