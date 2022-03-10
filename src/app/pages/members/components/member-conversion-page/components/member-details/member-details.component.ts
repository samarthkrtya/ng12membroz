import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BasicValidators} from 'src/app/shared/components/basicValidators';
import { BaseComponemntComponent, BaseComponemntInterface } from 'src/app/shared/base-componemnt/base-componemnt.component';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { MatTab } from '@angular/material/tabs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';
declare var $: any;

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
})
export class MemberDetailsComponent extends BaseLiteComponemntComponent implements BaseComponemntInterface, OnInit {

  @Input() formObj: any;
  @Input() bindId: any;

  isLoadingData: boolean;
  btnDisable: boolean;
  isEditMode: boolean;
  isAvailabilityPermission: boolean;
  dataContent: any;
  schema: string;
  profilepic: string;


  dynamicForm: FormGroup;
  dynamicSubmitted: boolean;

  dynamicData: any[] = [];

  uploader: FileUploader;
  response: any[] = [];

  customeUploader: any[] = [];
  formImageArray: any[] = [];
  formImageArraygrp: any[] = [];
  allowedFileType = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv", "pdf", "jpg", "jpeg", "gif", "png", "tif", "tiff"]
  maxFileSize = 5 * 1024 * 1024;

  filterData: any[] = [];
  gDateFormat: any = "dd/MM/yyyy";

  currentcounter: number = 0;

  action: any;

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _commonService: CommonService,
  ) {
    
    super();
  }

  async ngOnInit() {
    try {
      super.ngOnInit();
      this.isLoadingData = true;
      await this.initializeVariables();
      await this.LoadData();
      await this.makeForm();
      this.profileimageConfigration();
      this.imageConfigration();
      this.isLoadingData = false;
    } catch (error) {
      console.error(error);
      this.isLoadingData = false;
    } finally {
    }
  }


  protected profileimageConfigration() {

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
      // console.log("this.response",this.response);
      if (fileItem) {
        if (fileItem.status == 200) {
          //console.log("file item", fileItem.data.secure_url);
          this.profilepic = fileItem.data.secure_url;
          //console.log("this.profilepic", this.profilepic);
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

  imageConfigration() {
    this.formImageArraygrp = [];
    this.filterData.forEach(filele => {
      if (filele.fieldtype == "group") {
        
        if(!this.formImageArraygrp[filele.fieldname]){
          this.formImageArraygrp[filele.fieldname] = [];
        }
        filele.data.forEach((ele , i) => {
          if(!this.formImageArraygrp[filele.fieldname][i]){
            this.formImageArraygrp[filele.fieldname][i] = [];
          };
         ele.forEach((elementGroup ) => {
         if (elementGroup.fieldtype == 'image' || elementGroup.fieldtype == 'multi_image' || elementGroup.fieldtype == "attachment" || elementGroup.fieldtype == "gallery"){
          if(!this.formImageArraygrp[filele.fieldname][i][elementGroup.fieldname]){
            this.formImageArraygrp[filele.fieldname][i][elementGroup.fieldname] = [];
          };
          this.formImageArraygrp[filele.fieldname][i][elementGroup.fieldname] = elementGroup.value;
         }
      });
      });
     } else {
      filele.data.forEach(element => {
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

        if (element.value && element.value.length > 0) {
          if (!this.formImageArray[fieldname]) {
            this.formImageArray[fieldname] = [];
          }
          this.formImageArray[fieldname] = element.value;
        }


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
              super.showNotification("top", "right", message, "danger");
              break;
            default:
              //message = 'Error trying to upload file '+item.name;
              message = 'Please upload image file only.';
              super.showNotification("top", "right", message, "danger");
              break;
          }
        };
      }
      });
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

  async initializeVariables() {
    this.dataContent = {};
    this.isEditMode = false;
    this.schema = this.formObj.schemaname;
    this.dataContent = this._loginUser.property;
    this.profilepic = "";
    this.response = [];
    this.action = "profile";
    this.isAvailabilityPermission = false;


    if(this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0) {
      var permission =  this._loginUserRole.permissions.find(p=>p.formname == "user");
      if(permission && permission.functionpermission && permission.functionpermission.length > 0) {
        var functionPermission = permission.functionpermission.find(per=>per == "Availability")
        if(functionPermission) {
          this.isAvailabilityPermission = true;
        }
      }
    }
    return;
  }

  async LoadData() {

    let url = `${this.schema}/viewprofile/${this.formObj.formname}/`;
    let method = "GET";
    let id = this.bindId ? this.bindId : this._loginUserId;

    await this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
      .then((data: any) => {
        
        if (data) {
          this.isLoadingData = true;
          if (data.main && data.main.profilepic && data.main.profilepic.value) {
            this.profilepic = data.main.profilepic.value;
          }
          this.filterData = [];
          for (var key in data) {
            if (key != '_id') {
              if (data[key] && data[key]["order"] && typeof data[key]["order"] == 'object') {
                let obj = data[key]["order"];
                obj["name"] = key;
                obj["value"] = Number(obj["value"])
                obj["data"] = [];
                for (var k in data[key]) {
                  if (k !== "order") {
                    obj["data"].push(data[key][k]);
                  }
                }
                this.filterData.push(obj);
              } else {
                let obj = {
                  "name": key,
                  "value": Number(data[key]["order"]),
                  "fieldtype": "group",
                  "fieldname": data[key]["fieldname"],
                  "editable": data[key]["editable"],
                }
                obj["data"] = [];
                var subdata = [];
                if (data[key]['data'])
                  data[key]['data'].forEach(ele => {
                    subdata = [];
                    for (var k in ele) {
                      subdata.push(ele[k]);
                    }
                    obj["data"].push(subdata);
                  });

                this.filterData.push(obj);
              }
            }
          }
          this.filterData.sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0))
          this.isLoadingData = false;
        }
      });
  }

  removeImg(url: any, filedname: any, i: number) {
    for (const key in this.formImageArray) {
      if (key == filedname) {
        this.formImageArray[key].splice(i, 1);
      }
    }
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  async makeForm() {
    const group: any = {};
    this.filterData.forEach(ele => {
      var array = [];
      ele.data.forEach(element => {
        if (ele.fieldtype == 'group') {
          array.push(this.createItem(element));
          group[ele.fieldname] = this.fb.array(array);
        } else if (element.fieldtype == 'checkbox') {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true })
        } else if (element.fieldtype == 'readonly') {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
        } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
          if (element.required) {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required, BasicValidators.email]));
          } else {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([BasicValidators.email]));
          }
        } else if (element.fieldtype == 'mobile') {
          if (element.required) {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
          } else {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
          }
        } else if (element.fieldtype == 'lookup' || element.fieldtype == 'form' || element.fieldtype == 'formdata') {
          element.visible = true;
          if (element.required) {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
          } else {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
          }
        }  else if (element.fieldtype == 'datepicker' || element.fieldtype == 'date' ) {
          if (element.required) {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
          } else {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
          }

        }  else {
          if (element.required && element.fieldtype == "slide_toggle") {
            group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
          } else if (element.required) {
            group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
          } else {

            group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
          }
        }
      });
    });
    this.dynamicForm = this.fb.group(group);
    // console.log("this.dynamicForm",this.dynamicForm);
    return;
  }

  createItem(fields: any[]) {
    const group: any = {};
    fields.forEach(element => {
      if (element.fieldtype == 'checkbox') {
        group[element.fieldname] = new FormControl({ value: element.value, disabled: true })
      } else if (element.fieldtype == 'readonly') {
        group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
      } else if (element.fieldtype == 'primaryemail' || element.fieldtype == 'secondaryemail') {
        if (element.required) {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required, BasicValidators.email]));
        } else {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([BasicValidators.email]));
        }
      } else if (element.fieldtype == 'lookup' || element.fieldtype == 'form' || element.fieldtype == 'formdata') {
        element.visible = true;
        if (element.required) {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
        } else {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
        }
      } else {
        if (element.required && element.fieldtype == "slide_toggle") {
          group[element.fieldname] = new FormControl(false, Validators.compose([Validators.requiredTrue]));
        } else if (element.required) {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true }, Validators.compose([Validators.required]));
        } else {
          group[element.fieldname] = new FormControl({ value: element.value, disabled: true });
        }
      }
    });
    return this.fb.group(group);
  }

  async onDynamicFormSubmit(value: any, valid: boolean) {
    // console.log(valid, value);
    // console.log("this.dynamicForm", this.dynamicForm);
    // console.log("this.dataContent", this.dataContent);
    this.dynamicSubmitted = true;
    // if (!valid) {
    //   super.showNotification("top", "right", "Validation Failed !!", "danger");
    //   return;
    // }

    let url = `${this.schema}`;
    let method = "PATCH";
    let id = this.bindId ? this.bindId : this._loginUserId;
    
    
    var property = {}, model = {};
    for (const key in this.dataContent) {
      const element = this.dataContent[key];
      if (value[key]) {
        property[key] = value[key];
      } else {
        property[key] = element;
      }
    }

    for (const key in this.formImageArray) {
      property[key] = this.formImageArray[key]
    }

    model = {
      profilepic: this.profilepic,
      property: property
    }

    // console.log("model", model);
    this.btnDisable = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then((data) => {
        //console.log("data", data);
        this.btnDisable = false;
        this.ngOnInit();
        super.showNotification("top", "right", "Profile Updated !!", "success");

      }).catch((e) => {
        //console.log("e", e);
        this.btnDisable = false;
        return;
      });
  }

  async onTabChanged(mattab : MatTab){
    this.action = mattab.textLabel.toLowerCase();
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  onEdit() {
    this.isLoadingData = true;

    this.filterData.forEach(element => {
      if (element.fieldtype == 'group' && element.editable == true) {
        var fg = this.dynamicForm.controls[element.fieldname] as FormGroup;
        element.data.forEach((subele, i) => {
          subele.forEach((ele) => {
            ele.visible = false;
            fg.controls[i]['controls'][ele.fieldname].enable();
            setTimeout(() => {
              ele.visible = true;
            });
          });
        });
      } else {
        element.data.forEach(ele => {
          if (ele.editable) {
            ele.visible = false;
            this.dynamicForm.controls[ele.fieldname].enable();
            setTimeout(() => {
              ele.visible = true;
            });
          }
        });
      }
    });
    this.isLoadingData = false;
    this.isEditMode = true;
  }

  addItem(fields: any) {
    const group: any = {};
    this.filterData.forEach(ele => {
      if (ele.fieldtype == 'group' && ele.fieldname == fields.fieldname) {
        ele.data[0].forEach((element) => {
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
          } else if (element.fieldtype == 'lookup' || element.fieldtype == 'form' || element.fieldtype == 'formdata') {
            element.visible = true;
            if (element.required) {
              group[element.fieldname] = new FormControl(null, Validators.compose([Validators.required]));
            } else {
              group[element.fieldname] = new FormControl(null);
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
      }
    });

    var formarray = this.dynamicForm.get([fields.fieldname]) as FormArray;
    formarray.push(this.fb.group(group));
    this.filterData.forEach(ele => {
      if (ele.fieldtype == 'group' && ele.fieldname == fields.fieldname) {
        // console.log("ele.data[0]",ele.data[0]);
        var val = ele.data[0].map(a => a.value = null);
        ele.data.push(ele.data[0]);
      }
    });

  }

  deleteGroupItem(fields: any, index: any) {
    (this.dynamicForm.get([fields.parent]) as FormArray).removeAt(index);
  }

}
