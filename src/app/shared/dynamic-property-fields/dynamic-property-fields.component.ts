import { Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import { FormBuilder, FormControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {
  BasicValidators, ValidUrlValidator, OnlyNumberValidator, ValidMobileNumberValidator, OnlyNumberOrDecimalValidator,
  ValidPercValidator, equalValidator, matchingPasswords
} from '../components/basicValidators';


import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {  BaseComponemntComponent } from '../base-componemnt/base-componemnt.component'

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

declare var $: any;
import swal from 'sweetalert2';
@Component({
  selector: 'app-dynamic-property-fields',
  templateUrl: './dynamic-property-fields.component.html',
  styles: [
  ]
})
export class DynamicPropertyFieldsComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  fieldLists: any [] = [];
  visible: boolean = false;

  uploader: FileUploader;
  response: any[] = [];
  customeUploader: any[] = [];

  formImageArray: any[] = [];
  allowedFileType = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv", "pdf", "jpg", "jpeg", "gif", "png", "tif", "tiff"]
  maxFileSize = 5 * 1024 * 1024;

  arr: FormArray;

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
  ) {
    super()
  }

  @Input('formid') formid: any;
  @Input() myForm: FormGroup; // This component is passed a FormGroup from the base component template
  @Input() mySubmitted: boolean;
  @Input() bindIdData: any;
  
  @Output() propertySubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getFormfieldData()
      await this.formFillValue()
      await this.getFormTypeDropdownValue()
      await this.makeForm()
      await this.imageConfigration();
      await this.formSetValue()
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.fieldLists = [];
    this.visible = false;
    return;
  }

  async getFormfieldData() {

    var url = "formfields/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'formid', "searchvalue": this.formid, "criteria": "eq" , 'datatype': "ObjectId" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        
        if (data) {
          this.fieldLists = [];
          this.fieldLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  async formFillValue() {
    for(var i = 0; i < this.fieldLists.length; i++) {
      var element = this.fieldLists[i];
      if (this.bindIdData) {
        for (let key in this.bindIdData) {
          if (element.fieldname == key.toLowerCase()) {
            if (element.fieldtype == "datepicker") {
              if (this.bindIdData[key] == null || this.bindIdData[key] == "") {
                element.value = null;
              } else {
                element.value = new Date(this.bindIdData[key]);
              }
            } else {
              element.value = this.bindIdData[key];
            }
          }
        }
      }
    }
    return;
  }

  async getFormTypeDropdownValue() {

    if(this.fieldLists && this.fieldLists.length > 0) {
      this.fieldLists.forEach(element => {
        if ((element.fieldtype == "form_multiselect") || (element.fieldtype == "form" && element.multiselect)) {
  
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
        } else if (element.fieldtype == "category_list") {
  
          let url = "formdatas/filter";
          let method = "POST";
  
          let postData = {};
          postData["search"] = [];
          postData["search"].push({ searchfield: "status", searchvalue: "active", criteria: "eq" });
  
          element.formfieldfilterValue = [];
          var test;
          this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              if (data) {
                if (data.length !== 0) {
                  data.forEach((ele) => {
                    let child_val: any;
                    let childvalue: any;
                    if (element["form"]["displayvalue"].indexOf(".") !== -1) {
                      let stringValue = element["form"]["displayvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      child_val = ele[str1][str2];
                    } else {
                      childvalue = element["form"]["displayvalue"];
                      child_val = ele[childvalue];
                    }
  
                    let parent_val: any;
                    let parentvalue: any;
                    if (element["form"]["parentvalue"].indexOf(".") !== -1) {
                      let stringValue = element["form"]["parentvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      parent_val = ele[str1][str2];
                    } else {
                      parentvalue = element["form"]["parentvalue"];
                      parent_val = ele[parentvalue];
                    }
  
                    if(ele && child_val && parent_val) {
  
                      var skillObj = element.formfieldfilterValue.find(p=>p.name == child_val);
                      if(skillObj) {
                        skillObj.pokemon.push({value: ele._id, viewValue: parent_val})
                      } else {
                        let obj = {
                          name: child_val,
                          pokemon: [
                            {value: ele._id, viewValue: parent_val}
                          ]
                        }
                        element.formfieldfilterValue.push(obj);
                      }
                    }
                  });
                }
              }
            }, (err) => {
              console.error("err", err);
            });
  
        }
      });
    }
    return;
  }

  async makeForm() {

    const group: any = {};

    this.fieldLists.forEach(element => {

      if (element.fieldtype == 'group') {

        if (this.bindIdData) {
          if (this.bindIdData && this.bindIdData[element.fieldname] && this.bindIdData[element.fieldname].length > 0) {
            group[element.fieldname] = this.fb.array([])
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
          group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required, ValidMobileNumberValidator.onlyvalidmobilenumber]));
        } else {
          group[element.fieldname] = new FormControl(null, Validators.compose([ValidMobileNumberValidator.onlyvalidmobilenumber]));
        }
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
    this.myForm.addControl('property', this.fb.group(group));
    return

  }

  async formSetValue() {

    setTimeout(() => {

      for(var i = 0; i < this.fieldLists.length; i++) {

        var element = this.fieldLists[i];
  
        if (this.bindIdData && this.bindIdData[element.fieldname] && element.fieldname) {
          if (element.fieldtype !== "group") {
            (<FormGroup>this.myForm.controls['property']).controls[element.fieldname].setValue(this.bindIdData[element.fieldname]);

          } else if (element.fieldtype == "group") {
            let control = <FormArray>(<FormGroup>this.myForm.controls['property']).controls[element.fieldname];
            this.bindIdData[element.fieldname].forEach(x => {
              control.push(this.fb.group(x));
            })
          }
        }

        if (element.fieldtype == "hidden" || element.fieldtype == "readonly") {
          (<FormGroup>this.myForm.controls['property']).controls[element.fieldname].setValue(element.defaultvalue);
        } else if (element.fieldtype == "image" || element.fieldtype == "multi_image" || element.fieldtype == "attachment" || element.fieldtype == "gallery") {
        
          if (!this.formImageArray[element.fieldname]) {
            this.formImageArray[element.fieldname] = [];
          }
  
          if (this.bindIdData && this.bindIdData[element.fieldname] && this.bindIdData[element.fieldname].length > 0) {
            this.formImageArray[element.fieldname] = this.bindIdData[element.fieldname];
          }
  
        } 
  
      }
  
      this.visible = true;
  
      return;  
    }, 1000);
    
  }

  addItem(fields: any) {
    this.arr = this.myForm.controls['property'].get([fields.fieldname]) as FormArray
    this.arr.push(this.createItem(fields.fields));
    this.imageConfigration();
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

        (varTemp.myForm.controls['property'].get(fields.fieldname) as FormArray).removeAt(index);

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

  async imageConfigration() {

    this.fieldLists.forEach(element => {
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

            (<FormGroup>this.myForm.controls['property']).controls[element.fieldname].setValue(this.formImageArray[fieldnameTags]);

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

  removeImg(url: any, filedname: any) {

    for (const key in this.formImageArray) {
      if (key == filedname) {
        this.formImageArray[key].forEach(element => {
          if (element == url) {
            this.formImageArray[key].splice(element, 1);
            (<FormGroup>this.myForm.controls['property']).controls[filedname].setValue(this.formImageArray[key]);
          }
        });
      }
    }

    this.fieldLists.forEach(element => {
      if (element.fieldname == filedname) {
        if (this.formImageArray[filedname].length == 0) {
          element.value = "";
        }
      }
    });
  }
  
}
