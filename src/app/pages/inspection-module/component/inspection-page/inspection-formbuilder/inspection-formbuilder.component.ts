import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, AfterViewChecked, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SafeHtml } from "@angular/platform-browser";

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../../../../../shared/components/basicValidators';

import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { CommonService } from '../../../../../core/services/common/common.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-inspection-formbuilder',
  templateUrl: './inspection-formbuilder.component.html',
  styles: [
    `
      .example-action-buttons {
  padding-bottom: 20px;
}

.example-headers-align .mat-expansion-panel-header-title,
.example-headers-align .mat-expansion-panel-header-description {
  flex-basis: 0;
}

.example-headers-align .mat-expansion-panel-header-description {
  justify-content: space-between;
  align-items: center;
}

.example-headers-align .mat-form-field + .mat-form-field {
  margin-left: 8px;
}

    `
  ]
})
export class InspectionFormbuilderComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();


  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  currentcounter: number = 0;

  isdisablebutton: boolean = false;

  conversion: boolean = false;
  conversionType: any;

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) { 
    super()
  }

  @Input() selectedTemplate: any;
  @Input() bindIdDataValue: any = {};
  @Output() onInspectionFormSubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    
    try {
      //await this.ngOnInit()
      await this.initializeformbuilderVariables()
      await this.fieldsOperation()
      await this.makeForm();
      await this.imageConfigration();
    } catch(error) {
      console.error(error)
    } finally {

    }
  }

  async initializeformbuilderVariables() {
    this.customeUploader = {};
    this.conversion = false;
    this.conversionType = "";
    return;
  }

  async fieldsOperation() {

    this.selectedTemplate.fields.forEach(element => {

      element.accordian = true;

      if(element.fields && element.fields.length > 0) {

        var i = 0;

        element.fields.forEach(eleGroup => {

          if (eleGroup.fieldtype == "image" || eleGroup.fieldtype == "multi_image" || eleGroup.fieldtype == "attachment" || eleGroup.fieldtype == "gallery") {

            if (!this.formImageArray[element.fieldname]) {
              this.formImageArray[element.fieldname] = [];
            }

            if (this.bindIdDataValue &&  this.bindIdDataValue['property'] && this.bindIdDataValue['property'][element.fieldname] && this.bindIdDataValue['property'][element.fieldname][eleGroup.fieldname] && this.bindIdDataValue['property'][element.fieldname][eleGroup.fieldname].length > 0) {
              
              for(var imgcnt = 0; imgcnt < this.bindIdDataValue['property'][element.fieldname][eleGroup.fieldname].length; imgcnt++) {

                if(!this.formImageArray[element.fieldname][i]) {
                  this.formImageArray[element.fieldname][i] = [];
                }

                if(!this.formImageArray[element.fieldname][i][eleGroup.fieldname]) {
                  this.formImageArray[element.fieldname][i][eleGroup.fieldname] = [];
                }

                this.formImageArray[element.fieldname][i][eleGroup.fieldname] = this.bindIdDataValue['property'][element.fieldname][eleGroup.fieldname];
              }
            }
          } else if (eleGroup.fieldtype == "form") {

              let postData = {};
              postData["search"] = [];
              if (eleGroup && eleGroup["form"] && eleGroup["form"]["fieldfilter"]) {
                let res = eleGroup["form"]["fieldfilter"].split(".");
                if (res[0]) {
                  eleGroup["form"]["fieldfilter"] = res[0];
                }
                postData["search"].push({ searchfield: eleGroup["form"]["fieldfilter"], searchvalue: eleGroup["form"]["fieldfiltervalue"], criteria: eleGroup["form"]["criteria"] ? eleGroup["form"]["criteria"] : "eq" });
                postData["select"] = [];
                postData["select"].push({ fieldname: eleGroup["form"]["formfield"], value: 1 });
                postData["select"].push({ fieldname: eleGroup["form"]["displayvalue"], value: 1 });
                postData["sort"] = eleGroup["form"]["displayvalue"];
              }

              eleGroup.formfieldfilterValue = [];
              let url = eleGroup["form"]["apiurl"];
              let method = eleGroup["form"]["method"] ? eleGroup["form"]["method"] : "POST";

              this._commonService
                .commonServiceByUrlMethodData(url, method, postData)
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                  if (data) {
                    if (data.length !== 0) {
                      data.forEach((ele) => {
                        let val: any;
                        let displayvalue: any;
                        if (eleGroup["form"]["displayvalue"].indexOf(".") !== -1) {
                          let stringValue = eleGroup["form"]["displayvalue"].split(".");
                          let str1 = stringValue[0];
                          let str2 = stringValue[1];
                          val = ele[str1][str2];
                        } else {
                          displayvalue = eleGroup["form"]["displayvalue"];
                          val = ele[displayvalue];
                        }

                        let formfield = eleGroup["form"]["formfield"];
                        let key = ele[formfield];
                        let obj = { id: key, itemName: val };
                        eleGroup.formfieldfilterValue.push(obj);

                      });
                    }
                  }
                }, (err) => {
                  console.error("err", err);
                });


          }

          i++;
        });
      }
    });
    return;
  }


  async makeForm() {

    const group: any = {};

    this.selectedTemplate.fields.forEach(element => {
      group[element.fieldname] = this.createItem(element.fields)
      
    });
    this.dynamicForm = this.fb.group(group);

    setTimeout(() => {
      this.selectedTemplate.fields.forEach(element => {
        if (this.bindIdDataValue && this.bindIdDataValue['property'] && (this.bindIdDataValue['property'][element.fieldname] ||  this.bindIdDataValue['property'][element.fieldname] == "0" ) && element.fieldname) {
          
          if(element.fields && element.fields.length > 0) {
            element.fields.forEach(elementField => {
              if(elementField.fieldtype == "form") {
                if(this.bindIdDataValue['property'][element.fieldname][elementField.fieldname] && this.bindIdDataValue['property'][element.fieldname][elementField.fieldname].length > 0) {
                  this.bindIdDataValue['property'][element.fieldname][elementField.fieldname] = this.bindIdDataValue['property'][element.fieldname][elementField.fieldname].map(i=>i._id);
                }
              }
            });
          }
          
          this.dynamicForm.controls[element.fieldname].setValue(this.bindIdDataValue['property'][element.fieldname]);
        }

        if (element.fieldtype == "hidden" || element.fieldtype == "readonly") {
          this.dynamicForm.controls[element.fieldname].setValue(element.defaultvalue);
        }
      });
      return;
    }, 500);
  }

  createItem(fields: any) {
    const group: any = {};
    fields.forEach(element => {

      if(element.checklist == true) {
        group[element.fieldname+'_status_ok'] = new FormControl(null);
        group[element.fieldname+'_status_required'] = new FormControl(null);
        group[element.fieldname+'_status_suggested'] = new FormControl(null);
      }

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

  async imageConfigration() {

    this.selectedTemplate.fields.forEach(element => {

      //console.log("element", element);

      //var controlLength = this.dynamicForm.get([element.fieldname])['controls'].length > 0 ? this.dynamicForm.get([element.fieldname])['controls'].length : 1;

      var controlLength = element.fields.length;

      // console.log("controls", this.dynamicForm)
      // console.log("controlLength", controlLength);

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

            //console.log("customeUploader", this.customeUploader);


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

                console.log("formImageArray", this.formImageArray);

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
    });
    return;
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

  onItemAdded(itemToBeAdded: any) {
  }


  onDynamicFormSubmit(value: any, isValid: boolean) {
    this.dynamicSubmitted = true;
    this.isdisablebutton = true;
    if (!isValid) {

      this.isdisablebutton = false;
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {
      this.selectedTemplate.fields.forEach(ele2 => {
        ele2.fields.forEach(elementGroup => {
          if (elementGroup.fieldtype == 'lookup' || elementGroup.fieldtype == 'form' || elementGroup.fieldtype == 'formdata') {

            if (this.dynamicForm.value[ele2.fieldname] && this.dynamicForm.value[ele2.fieldname].length > 0) {

              this.dynamicForm.value[ele2.fieldname].forEach(elementGroupValue => {
                if (elementGroupValue && elementGroupValue[elementGroup.fieldname] && elementGroupValue[elementGroup.fieldname]['autocomplete_id']) {
                  elementGroupValue[elementGroup.fieldname] = elementGroupValue[elementGroup.fieldname]['autocomplete_id']
                }
              });

            }

          } else if (elementGroup.fieldtype == 'image' || elementGroup.fieldtype == 'multi_image' || elementGroup.fieldtype == 'attachment' || elementGroup.fieldtype == 'gallery') {

            for (let key in this.formImageArray) {
              if (key == ele2.fieldname) {

                if (this.formImageArray[ele2.fieldname] && this.formImageArray[ele2.fieldname].length > 0) {

                  for(var imgcounter = 0; imgcounter < this.formImageArray[ele2.fieldname].length; imgcounter++) {

                    if(this.dynamicForm.value[ele2.fieldname][elementGroup.fieldname] !== undefined) {

                      if(this.formImageArray && this.formImageArray[ele2.fieldname] && this.formImageArray[ele2.fieldname][imgcounter]) {
                        this.dynamicForm.value[ele2.fieldname][elementGroup.fieldname] = this.formImageArray[ele2.fieldname][imgcounter][elementGroup.fieldname];
                      }
                    }
                  }
                }

              }
            }
          }
        });
      });
      console.log("this.dynamicForm.value", this.dynamicForm.value);
      this.onInspectionFormSubmitData.emit(this.dynamicForm.value);
    }
  }

  checkboxChangeEvent(event: any, fieldname: any, groupname: any, type: any) {
    

    if(event.checked == true) {
      if(type == 'ok') {
        this.dynamicForm.get([fieldname, groupname+'_status_ok']).setValue(true);
        this.dynamicForm.get([fieldname, groupname+'_status_required']).setValue(false);
        this.dynamicForm.get([fieldname, groupname+'_status_suggested']).setValue(false);
      } else if (type == 'required') {

        this.dynamicForm.get([fieldname, groupname+'_status_ok']).setValue(false);
        this.dynamicForm.get([fieldname, groupname+'_status_required']).setValue(true);
        this.dynamicForm.get([fieldname, groupname+'_status_suggested']).setValue(false);

      } else if (type == 'suggested') {

        this.dynamicForm.get([fieldname, groupname+'_status_ok']).setValue(false);
        this.dynamicForm.get([fieldname, groupname+'_status_required']).setValue(false);
        this.dynamicForm.get([fieldname, groupname+'_status_suggested']).setValue(true);
      }
    }
  }

  submitFormDynamically() {
    $("#submitBtn").click();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}
