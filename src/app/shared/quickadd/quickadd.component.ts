import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from './../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../core/services/common/common.service';
import { FormsService } from '../../core/services/forms/forms.service';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords } from '../components/basicValidators';

declare const $: any;
@Component({
  selector: 'app-quickadd',
  templateUrl: './quickadd.component.html',
  styles: [
    `
      /* Dropdown Button */
      .dropbtn {
        background-color: #04AA6D;
        color: white;
        padding: 16px;
        font-size: 16px;
        border: none;
      }

      /* The container <div> - needed to position the dropdown content */
      .dropdown {
        position: relative;
        display: inline-block;
      }

      /* Dropdown Content (Hidden by Default) */
      .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f1f1f1;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
      }

      /* Links inside the dropdown */
      .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
      }

      /* Change color of dropdown links on hover */
      .dropdown-content a:hover {background-color: #ddd;}

      /* Show the dropdown menu on hover */
       .dropdown:hover .dropdown-content {display: block;}

      /* Change the background color of the dropdown button when the dropdown content is shown */
      .dropdown:hover .dropbtn {background-color: #3e8e41;}
    `
  ]
})
export class QuickaddComponent extends BaseLiteComponemntComponent implements OnInit {

  @ViewChild('formtext', { static: false }) inputEl:ElementRef;

  destroy$: Subject<boolean> = new Subject<boolean>();

  _quickAddLists: any [] = [];
  roleBasedPermission: any [] = [];

  formVisible: boolean;
  formDisplay: boolean = false;
  isLoadFrms: boolean = false;
  noPermission: boolean = false;
  _selectedformSchemaFormName: any;
  fieldLists: any [] = [];
  formsModel: any;

  dynamicForm: FormGroup;

  uploader: FileUploader;
  response: any[] = [];
  customeUploader: any[] = [];
  private title: string;
  formImageArray: any[] = [];

  dynamicSubmitted: boolean;
  _needToSave: any = {};

  allowedFileType = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv", "pdf", "jpg", "jpeg", "gif", "png", "tif", "tiff"]
  maxFileSize = 5 * 1024 * 1024;

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private cloudinary: Cloudinary,
    private _formsService: FormsService,
  ) {
    
    super()
  }

  @Input('id') id: any;
  @Input('quickfromstyle') quickfromstyleValue: string;
  @Input('quickformschemaname') quickformschemanameValue: string;
  @Input('quickdisplayname') quickdisplaynameValue: string;
  @Input('params') paramsValue: any [] = [];
  @Output() childSubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {

    try{
      await super.ngOnInit()
      await this.initializeVariables()
      await this.getAllQuickForm()
      await this.formDetails();
    } catch(error) {
      console.error("error", error)
    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this._quickAddLists = [];
    this.roleBasedPermission = [];
    if(this._authService && this._authService.auth_role && this._authService.auth_role['permissions']) {
      this.roleBasedPermission = [];
      this.roleBasedPermission = this._authService.auth_role['permissions'];
    }

    this.formVisible = false;
    this.isLoadFrms = false;
    this.noPermission = false;
    this.formsModel = {};
    this.fieldLists = [];

    this.dynamicSubmitted = false;
    this._needToSave = {};

    return;
  }

  async getAllQuickForm() {

    let method = "POST";
    let url = "quickforms/filter";

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "linktype", "searchvalue": "quickadd", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any)=>{
        if(data && data[0] && this.roleBasedPermission.length > 0) {

          data.forEach(element => {

            this.roleBasedPermission.forEach(ele => {
              if(element.formname == ele.formname) {
                if(ele.recordpermission && ele.recordpermission.length !== 0) {
                  ele.recordpermission.forEach(e => {
                    if(e.type == "add") {
                      this._quickAddLists.push(element);
                    }
                  });
                }
              }
            });


          });

        return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  async formDetails() {

    let postData =  {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any)=>{
        if(data && data[0]) {

          data.forEach(element => {
            if(this._quickAddLists.length > 0){
              this._quickAddLists.forEach( ele48 => {
                if(ele48.formname == element.formname){
                  let tmpstr: string = ele48.url;
                  if(tmpstr.includes(':formid')){
                    ele48.url = tmpstr.replace(':formid', element._id);
                  }
                }
              });
            }
          });

          return;
        }
      }, (error)=>{
        console.error(error);
    })
  }

  async menuClick() {

    this.isLoadFrms = true;

    if(this.quickfromstyleValue !== 'multi') {
      this._selectedformSchemaFormName = this.quickformschemanameValue;
    }

    await this.checkPermission(this._selectedformSchemaFormName);
  }

  async checkPermission(formname: any) {

    this.noPermission = false;
    var permission = false;
    
    if(this.roleBasedPermission && this.roleBasedPermission.length > 0) {
      for (let i = 0; i < this.roleBasedPermission.length; i++) {
        if(this.roleBasedPermission[i]["formname"] == formname) {
          if(this.roleBasedPermission[i] && this.roleBasedPermission[i]["recordpermission"] && this.roleBasedPermission[i]["recordpermission"].length > 0) {
            for (let j = 0; j < this.roleBasedPermission[i]["recordpermission"].length; j++) {
              if(this.roleBasedPermission[i]["recordpermission"][j]["type"] == "add") {
                await this.loadForm();
                permission = true;
              }
            }
          }
        }
      }
    } else {
      this.noPermission = true;
    }

    setTimeout(() => {
      if(!permission) {
        this.noPermission = true;
      }
    }, 1000);
  }

  async loadForm() {

    await this.getFromDetailsBySchema(this._selectedformSchemaFormName);

    let method = "GET";
    let url = "quickforms/getquickformschema/" + this._selectedformSchemaFormName;
    let postData = ""

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any)=>{
        if(data) {

          this.fieldLists = [];
          if(this.paramsValue.length !== 0) {
            data.forEach(element => {
              if(element.fieldname !== this.paramsValue[0]['fieldfilter']) {
                this.fieldLists.push(element);
              } else {
                element.fieldtype = "hidden";
                element.value = this.paramsValue[0]['fieldfiltervalue'];
                this.fieldLists.push(element);
              }
            });
          } else {
            data.forEach(element => {
              
              if (element.required == true && element.formname == this._selectedformSchemaFormName) {
                if (element.displayname) element.fielddisplaytext = element.displayname;
                this.fieldLists.push(element);
              }
            });
          }
          let cnt = 0;
          if(this.fieldLists.length !== 0) {
            this.fieldLists.forEach(element => {

              element.fieldtype = element.fieldtype.trim();

              if(element.fieldtype == "ObjectId") {

                let refcollection: any;
                let reffieldname: any;
                let refschema: any;
                refcollection = element.option.ref;
                refschema = element.option.refschema;
                reffieldname = element.option.reffieldname;
                let postData = {};
                postData['refcollection'] = refcollection;
                postData['refschema'] = refschema;
                postData['refselect'] = reffieldname;

                  this._commonService
                    .GetByCollection(postData)
                    .subscribe((data: any) => {
                      if (data) {
                        
                        cnt = 0;
                        for (var i in data[0]) {
                          if (cnt == 1) {
                            element.refkey = i;
                          }
                          cnt++;
                        }
                        element.valueLists = [];
                        data.forEach(eleref => {
                          let obj = { id: eleref._id, name: eleref[element.refkey] }
                          element.valueLists.push(obj);
                        });


                      }
                  });

              } else if ((element.fieldtype == "form_multiselect") || (element.fieldtype == "form" && element.multiselect)) {

                element.readonly = false;

                let postData = {};
                postData["search"] = [];
                if (element && element["form"] && element["form"]["fieldfilter"]) {
                  let res = element["form"]["fieldfilter"].split(".");
                  if (res[0]) {
                    element["form"]["fieldfilter"] = res[0];
                  }
                  postData["search"].push({ searchfield: element["form"]["fieldfilter"], searchvalue: element["form"]["fieldfiltervalue"], criteria: element["form"]["criteria"] ? element["form"]["criteria"] : "eq" });
                  postData["select"] = [];
                  postData["select"].push({ fieldname: element["form"]["formfield"], value: 1 });
                  postData["select"].push({ fieldname: element["form"]["displayvalue"], value: 1 });
                  postData["sort"] = element["form"]["displayvalue"];
                }

                element.formfieldfilterValue = [];
                let url = element["form"]["apiurl"];
                let method = element["form"]["method"] ? element["form"]["method"] : "POST";

                this._commonService
                  .commonServiceByUrlMethodData(url, method, postData)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe((data: any) => {
                    if (data) {
                      if (data.length !== 0) {
                        data.forEach((ele) => {
                          let val: any;
                          let displayvalue: any;
                          if (element["form"]["displayvalue"].indexOf(".") !== -1) {
                            let stringValue = element["form"]["displayvalue"].split(".");
                            let str1 = stringValue[0];
                            let str2 = stringValue[1];
                            val = ele[str1][str2];
                          } else {
                            displayvalue = element["form"]["displayvalue"];
                            val = ele[displayvalue];
                          }

                          let formfield = element["form"]["formfield"];
                          let key = ele[formfield];
                          let obj = { id: key, itemName: val };
                          element.formfieldfilterValue.push(obj);

                        });
                      }
                    }
                  }, (err) => {
                    console.error("err", err);
                  });
              }
            });
            await this.makeForm();
          } else {
            //this.showNotification('top', 'right', 'Something Went Wrong!!!', 'danger');
          }

          await this.imageConfigration();
          return;
        }
      }, (error)=>{
        console.error(error);
    })


  }

  async getFromDetailsBySchema(formname: any) {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "formname", "searchvalue": formname, "criteria": "eq"});

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any)=>{
        if(data && data[0]) {
          this.formsModel = {};
          this.formsModel = data[0];
          return;
        }
      }, (error)=>{
        console.error(error);
    })

  }

  async imageConfigration() {

    this.fieldLists.forEach(element => {
      if (element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == "attachment") {

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

            form.append('upload_preset',  auth_upload_preset);
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

      }
    });
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
    let cnt = 0;
    let len = this.fieldLists.length;

    this.fieldLists.forEach(element => {
      element.isAsterisk = true;
      if (element.fieldtype === 'Number') {
        group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, OnlyNumberValidator.insertonlynumber]));
      }else if (element.fieldtype === 'hidden') {
        group[element.fieldname] = new FormControl(element.defaultvalue, Validators.compose([Validators.required]));
      } else {
        group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
      }
      cnt++;

      if(cnt == len) {
        this.dynamicForm = this.fb.group(group);
      }
    });

    this.formVisible = true;

    setTimeout(()=> {

      this.isLoadFrms = false;

      if(this.inputEl != undefined) {
        if(this.inputEl.nativeElement[0] != undefined){
          this.inputEl.nativeElement[0].focus();
          if(this.inputEl.nativeElement[0].autofocus != undefined){
            this.inputEl.nativeElement[0].autofocus = true;
          }
        }
      }
    }, 500);

  }

  menuLink(item: any) {
    if(item && item.url)
      this._router.navigate([item.url]);
  }

  onDynamicFormSubmit(value: any, isValid: boolean) {
    this.dynamicSubmitted = true;


    if (!isValid) {
      this.showNotification('top', 'right', 'Validation failed!!!', 'danger');
      return false;
    } else {


        let cnt = 0;
        let len = this.fieldLists.length;
        this.fieldLists.forEach(element => {

            if( element.fieldtype == 'ObjectId') {

              if (this.dynamicForm.value[element.fieldname] && this.dynamicForm.value[element.fieldname]['id']) {
                this.dynamicForm.value[element.fieldname] = this.dynamicForm.value[element.fieldname]['id'];
              }

            } else if( element.fieldtype == 'lookup' || element.fieldtype == 'form') {

              if (this.dynamicForm.value[element.fieldname] && this.dynamicForm.value[element.fieldname]['autocomplete_id']) {
                this.dynamicForm.value[element.fieldname] = this.dynamicForm.value[element.fieldname]['autocomplete_id'];
              }



            } else if( element.fieldtype == 'image' || element.fieldtype == 'multi_image' || element.fieldtype == 'attachment') {

              for (let key in this.formImageArray) {
                if (key == element.fieldname) {
                  this.dynamicForm.value[element.fieldname] = this.formImageArray[key];
                }
              }


            }
            cnt++;
            if(cnt == len) {
                this.saveData();
            }
        });
    }
  }

  saveData() {
      this._needToSave = {};
      let cnt = 0;
      this.fieldLists.forEach(element => {
        var nameSplit = '';
        nameSplit = element.fieldname.split(".");
        if(nameSplit[1]) {
            let mainProperty = nameSplit[0];
            let subProperty = nameSplit[1];
            if(!this._needToSave[mainProperty]) {
                this._needToSave[mainProperty] = {};
            }
            this._needToSave[mainProperty][subProperty] = '';
            this._needToSave[mainProperty][subProperty] = this.dynamicForm.value[element.fieldname];
            cnt++;
        } else {
            let mainProperty = nameSplit[0];
            this._needToSave[mainProperty] = this.dynamicForm.value[element.fieldname];
            if(!this._needToSave["property"]) {
              this._needToSave["property"] = {}
            }
            this._needToSave["property"][mainProperty] = "";
            this._needToSave["property"][mainProperty] = this.dynamicForm.value[element.fieldname];
        }
      });


      let url = this.formsModel.addurl['url'].replace(':_id','');
      let method = this.formsModel.addurl['method'];

      


      this._commonService
          .commonServiceByUrlMethodData(url, method, this._needToSave)
          .subscribe((data: any)=>{

            

              this.showNotification('top', 'right', this.jsUcfirst(this._selectedformSchemaFormName) + ' has been added successfully!!!', 'success');

              if(this.paramsValue.length !== 0) {
                  if(this.paramsValue[0]['fieldname']){
                      
                      this.childSubmitData.emit(this.paramsValue[0]['fieldname']);
                  } else {
                      this.childSubmitData.emit(this.dynamicForm.value);
                  }
              } else {
                  let obj = {
                    id: this.id,
                    value: data._id
                  }
                  this.childSubmitData.emit(obj);
              }
              this.closePopup()
          }, data =>{

              if(data.status == 500) {
              this.showNotification('top', 'right', 'Server Error in Application or Record already exist.', 'danger');
          } else if (data.status == 400) {
              this.showNotification('top', 'right', 'Incorrect Data.', 'danger');
          }
      });
  }

  jsUcfirst(string: any) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onItemAdded(itemToBeAdded: any) {
  }

  displayFn(value: any): string {
    // I want to get the full object and display the name
    return value && value.name ? value.name : '';
  }

  closePopup() {
    $('.close').click();
  }

}
