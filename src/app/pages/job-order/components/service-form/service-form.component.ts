import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import swal from 'sweetalert2';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { UsersService } from '../../../../core/services/users/users.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { ServiceModel } from '../../../../core/models/service/service';
import { WfPermissionComponent } from '../../../../shared/wf-permission/wf-permission.component';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';


declare var $: any;

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html'
})
export class ServiceComponent extends BaseComponemntComponent implements OnInit, AfterViewInit, OnDestroy, BaseComponemntInterface {

  displayedColumns2: string[] = ['title', 'days', 'starttime', 'endtime', 'action'];
  daysList: any[] = [{ code: "Monday", checked: false, disabled: true }, { code: "Tuesday", checked: false, disabled: true }, { code: "Wednesday", checked: false, disabled: true }, { code: "Thursday", checked: false, disabled: true }, { code: "Friday", checked: false, disabled: true }, { code: "Saturday", checked: false, disabled: true }, { code: "Sunday", checked: false, disabled: true }];

  serviceModel = new ServiceModel();
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('wfpermission') wfpermission: WfPermissionComponent;

  form: FormGroup;

  disableButton: boolean;
  submitted: boolean;
  isLoadingData: boolean = true;

  taxesList: any[] = [];
  staffList: any[] = [];
  
  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  workingHours : any;

  category_fields = {
    "fieldname": "category",
    "fieldtype": "formdata",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "formid", "searchvalue": "604af7df2a3fec0b08db72f9", "criteria": "eq" , "datatype" : "ObjectId" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "property", "value": 1 },
    ],
    "form": {
      "apiurl": "formdatas/filter",
      "formfield": "_id",
      "displayvalue": "property.name",
    },
    "formname": "jobservicetype",
    "value": "",
    "dbvalue": "",
    "autocomplete" : true,
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private cdr: ChangeDetectorRef,

    private _usersService: UsersService,
    private _taxesService: TaxesService,
    private _serviceService: ServiceService,
  ) {
    super();
    this.form = this.fb.group({
      'title': ['', Validators.required],
      'category': ['', Validators.required],
      'description': [],
      'charges': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'commission': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'taxes': [],
      'gallery': []
    }); 

    this._formName = "service";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'service-form';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  async LoadData() {
    this.isLoadingData = true;

    this.workingHours = this._authService.currentUser.user.branchid['workinghours'];
    var workinghours = this._authService.currentUser.user.branchid['workinghours'];
    if (workinghours.days && workinghours.days.length > 0) {
      this.daysList.map(day => {
        if (workinghours.days.includes(day.code)) {
          day.disabled = false;
          day.checked = true;
        }
      });
    }
    
    this.imageConfigration();
    this.getTaxes();
    await this.getStaff();
    if (this.bindId) {
      await this.getServiceById(this.bindId);
    }
    this.isLoadingData = false;
 
  }

  protected imageConfigration() {

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
    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset', auth_upload_preset);
      form.append('context', `photo=${"attachment"}`);
      form.append('tags', "attachment");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = fileItem => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.formImageArray) {
          this.formImageArray = [];
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
        this.formImageArray.push(fileInfo);
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
    this.customeUploader.onWhenAddingFileFailed = (item: any, filter: any) => {
      let message = '';
      switch (filter.name) {
        case 'fileSize':
          message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(Number(this.maxFileSize) * 1024 * 1024);
          this.showNotification("top", "right", message, "danger");
          break;
        default:
          message = 'Error trying to upload file ' + item.name;
          this.showNotification("top", "right", message, "danger");
          break;
      }
    };
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
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this image file!',
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
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
      }
    })
  }

  protected downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  protected async getStaff() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    await this._usersService
      .AsyncGetByfilter(postData)
      .then((data: any[]) => {
        this.staffList = data;
        this.staffList.map(a => a.checked = false);
      });
  }

  protected getTaxes() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this._taxesService
      .getbyfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.taxesList = data;
      });
  }

  protected async getServiceById(id: any) {
    await this._serviceService
      .AsyncGetById(id)
      .then((data: any) => {
        
        this.serviceModel = data;
        this.form.controls['title'].setValue(data.title);
        // this.form.controls['category'].setValue(data.category._id);
        if(data.category && data.category._id){
          this.form.controls['category'].setValue(data.category);
          this.category_fields.dbvalue = data.category;
        }
        this.form.controls['description'].setValue(data.description);
        this.form.controls['charges'].setValue(data.charges);
        this.form.controls['commission'].setValue(data.commission);
        
        if (data.taxes && data.taxes.length > 0) {
          this.form.controls['taxes'].setValue(data.taxes.map(a => a._id));
        }
        this.formImageArray = data.gallery;

        data.staff.forEach(staff => {
          var fond = this.staffList.find(a => a._id == staff._id);
          if (fond) {
            fond.checked = true;
          }
        });

        if (data.availability.days && data.availability.days.length > 0) {
          this.daysList.forEach(day => {
            day.checked = data.availability.days.includes(day.code);
          });
        }

        this.cdr.detectChanges();
      });
  }

  setAll(checked: boolean) {
    this.staffList.map(a => a.checked = checked);
  }
 
  async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    var staff = this.staffList.filter(a => a.checked == true);
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    if (value.commission && value.commission != 0 && value.commission > value.charges) {
      super.showNotification("top", "right", `Commission should be less than charges !!`, "danger");
      return;
    }
    if(staff.length == 0){
      super.showNotification("top", "right", `Please select staffs !!`, "danger");
      return;
    }

    var days = this.daysList.filter(d => d.checked == true);
    this.serviceModel = value;
    if(value.category && value.category.autocomplete_id){
      this.serviceModel.category = value.category.autocomplete_id;
    }
    this.serviceModel.staff = staff.map(a => a._id);
    this.serviceModel.gallery = this.formImageArray;
    this.serviceModel.type = "jobservice";

    this.serviceModel.availability = {
      'days': days.map(a => a.code),
    };

    this.disableButton = true;
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.serviceModel);
      } else {
        res = await this.Update(this.bindId, this.serviceModel);
      }
      this._router.navigate([`/pages/dynamic-list/list/jobservice`]);
      super.showNotification("top", "right", "Job service made successfully !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  setAllDays(checked: boolean){
    this.daysList.filter(a=>a.disabled == false).map(a => a.checked = checked);
  }
  get isdisabled(): boolean  {
    return this.daysList.filter(a=>a.disabled == true).length == 7;
  }

  workinghoursupdated(localStorage : any){
    this.workingHours = localStorage.user.branchid['workinghours'];
    if (this.workingHours.days && this.workingHours.days.length > 0) {
      this.daysList.map(day => {
        if (this.workingHours.days.includes(day.code)) {
          day.disabled = false;
        }else{
          day.disabled = true;
          day.checked = false;
        }
      });
    } 
  }



  getSubmittedData(submit_data: any) {
    this.category_fields.autocomplete = false;
    this.category_fields.dbvalue = submit_data.value;
    setTimeout(() => {
      this.category_fields.autocomplete = true;
    });
  }

  ActionCall() {

  }

  Delete() { }
  onOperation(event: any) {
    
    if (event) {
      this._router.navigate([`/pages/dynamic-list/list/jobservice`]);
      super.showNotification("top", "right", "Service updated successfully !!", "success");
    }
  }

  async Save(model?: any) {
    return await this._serviceService.AsyncAdd(model);
  }
  async Update(id?: any, model?: any) {
    return await this._serviceService.AsyncUpdate(id, model);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

