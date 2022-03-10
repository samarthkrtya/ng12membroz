import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import swal from 'sweetalert2';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { UsersService } from '../../../../core/services/users/users.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { ServiceService } from '../../../../core/services/service/service.service';
import { ServiceModel } from '../../../../core/models/service/service';
import { WfPermissionComponent } from '../../../../shared/wf-permission/wf-permission.component';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
declare var $: any;
import * as moment from 'moment';

@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styles: [
    `.example-chip-list {
      width: 100%;
    }`],
})
export class ServiceComponent extends BaseComponemntComponent implements OnInit, AfterViewInit, OnDestroy, BaseComponemntInterface {

  displayedColumns2: string[] = ['title', 'starttime', 'endtime', 'action'];
  daysList: any[] = [{ code: "Monday", checked: false, disabled: true }, { code: "Tuesday", checked: false, disabled: true }, { code: "Wednesday", checked: false, disabled: true }, { code: "Thursday", checked: false, disabled: true }, { code: "Friday", checked: false, disabled: true }, { code: "Saturday", checked: false, disabled: true }, { code: "Sunday", checked: false, disabled: true }];
  days : any[]=[];

  serviceModel = new ServiceModel();
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('wfpermission') wfpermission: WfPermissionComponent;

  form: FormGroup;
  brform: FormGroup;

  disableButton: boolean;
  submitted: boolean;
  isLoadingData: boolean = true;

  taxesList: any[] = [];
  staffList: any[] = [];
  breakList: any[] = [];
  availList: any[] = [];
  costList: any[] = [];

  advcavailList: any[] = [];
  costavailList: any[] = [];

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  workingHours : any;

  category_fields = {
    "fieldname": "category",
    "fieldtype": "formdata",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "formid", "searchvalue": "5e426741d466f1115c2e7d50", "criteria": "eq" , "datatype" : "ObjectId" }
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
    "formname": "treatment",
    "value": "",
    "dbvalue": "",
    "autocomplete" : true,
  }

  starttime: any;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: any[] = [];
  servicetag: FormControl;
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
      'servicetag' : [],
      'description': [],
      'charges': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'commission': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'assistantcommission': [, OnlyPositiveNumberValidator.insertonlypositivenumber],      
      'duration': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'starttime': ['', Validators.required],
      "endtime": ['', Validators.required],
      'taxes': [],
      'gallery': [],
      'onlineavailibility': [false],
    });

    this.brform = this.fb.group({
      'title': ['', Validators.required],
      'days': [''],
      'starttime': ['', Validators.required],
      'endtime': ['', Validators.required]
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
    if (this.workingHours.days && this.workingHours.days.length > 0) {
      this.daysList.map(day => {
        if (this.workingHours.days.includes(day.code)) {
          day.disabled = false;
          day.checked = true;
        }
      });
    }
    this.form.controls['starttime'].setValue(this.workingHours?.starttime);
    this.form.controls['endtime'].setValue(this.workingHours?.endtime);
    this.breakList = [];
    if(this._loginUserBranch.breaktime.length > 0) {
      this.breakList = this._loginUserBranch.breaktime;
    }

    this.imageConfigration();
    this.getTaxes();
    await this.getStaff();
    if (this.bindId) {
      await this.getServiceById(this.bindId);
    }
    this.isLoadingData = false;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(value);
    }
    if (event.input) {
      event.input.value = '';
    }
    // event.chipInput!.clear();
  }

  remove(tag: any): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
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
      form.append('upload_preset',  auth_upload_preset);
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
        // this.form.controls['servicetag'].setValue(data.property.tags);
        this.tags = data?.property?.tags

        if(data.category && data.category._id){
          this.form.controls['category'].setValue(data.category);
          this.category_fields.dbvalue = data.category;
        }

        this.form.controls['description'].setValue(data.description);

        this.form.controls['charges'].setValue(data.charges);
        this.form.controls['commission'].setValue(data.commission);
        this.form.controls['assistantcommission'].setValue(data.assistantcommission);
        this.form.controls['duration'].setValue(data.duration);
        this.form.controls['onlineavailibility'].setValue(data?.property?.onlineavailibility);

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

        this.form.controls['starttime'].setValue(data.availability.starttime);
        this.form.controls['endtime'].setValue(data.availability.endtime);

        if (data.availability.days && data.availability.days.length > 0) {
          this.daysList.forEach(day => {
            day.checked = data.availability.days.includes(day.code);
          });
          this.days = [];
          this.days = this.daysList.filter(d => d.checked == true);
        }

        this.breakList = [];
        if (data.breaktime && data.breaktime.length > 0) {
          data.breaktime.forEach(element => {
            this.breakList.push({ 'title': element.title, 'starttime': element.starttime , 'endtime':  element.endtime , 'days': element.days })
          });
          let dataSource = this.breakList;
          let cloned = dataSource.slice();
          this.breakList = cloned;
        }

        data.staffavailability.forEach(element => {
          var stf = this.staffList.find(a => a._id == element.userid._id);
          if(stf){
            stf['selecteddays'] = element.days;
            stf['starttime'] = element.starttime;
            stf['endtime'] = element.endtime;
          } 
        });

        data.staffcommission.forEach(element => {
          var stf = this.staffList.find(a => a._id == element.userid._id);
          if(stf){
            stf['charges'] = element.charges ? element.charges : 0;
            stf['commission'] = element.commission ? element.commission : 0;
          }
        });
        this.cdr.detectChanges();
      });
  }

  setAll(checked: boolean) {
    this.staffList.map(a => a.checked = checked);
  }

  setAllDays(checked: boolean){
    this.daysList.filter(a=>a.disabled == false).map(a => a.checked = checked);
  }

  avlblOption(type: string) {
    var availList = this.staffList.filter(a => a.checked == true);
    if (type == 'avail' && (this.availList.length == 0 || this.availList.length != availList.length)) { // 1=0(false) ||  1!=2 (true)
      availList.map(a => a.daysList = this.daysList);
      availList.map(a => a.starttime = a.starttime ? a.starttime : '');
      availList.map(a => a.endtime = a.endtime ? a.endtime : '');
      this.availList = availList;
      this.advcavailList = [];
    } else if (type == 'charges' && (this.costList.length == 0 || this.costList.length != availList.length)) {
      availList.map(a => a.charges = a.charges ? a.charges : 0);
      availList.map(a => a.commission = a.commission ? a.commission : 0);

      this.costList = availList;
      this.costavailList = [];
    }
  }

  onAdvcd() {
    this.advcavailList = this.availList.filter(a => a.starttime != '' && a.endtime != '');
    $("#avilClose").click();
  }

  onAdvcdCost() {
    this.costavailList = this.costList.filter(a => a.charges != 0);
    $("#costClose").click();
  }

  onSubmitBreak(value: any, valid: boolean) {
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    var start =  this.form.get('starttime').value;
    var end =  this.form.get('endtime').value;
   
    if(!start || !end) {
      super.showNotification("top", "right", "Please enter availibily hours !!", "danger");
      return;
    }

    var avastarttime = this.setTimers(start);
    var avaendtime = this.setTimers(end);
    var starttime = this.setTimers(value.starttime);
    var endtime = this.setTimers(value.endtime);
    
    if(this.breakList.length > 0){
     var last =  this.breakList[this.breakList.length-1];
     avastarttime = this.setTimers(last.endtime);
    }
    let cnt =0;
    if (starttime.hh > endtime.hh) cnt =4;
    else if (starttime.hh == endtime.hh && starttime.mm >= endtime.mm) cnt =5;
    else if (starttime.hh < avastarttime.hh) cnt =6;
    else if (starttime.hh == avastarttime.hh && starttime.mm < avastarttime.mm) cnt =7;
    else if (endtime.hh > avaendtime.hh) cnt =8;
    else if (endtime.hh == avaendtime.hh && endtime.mm > avaendtime.mm) cnt = 9;
    if(cnt > 0){
      super.showNotification("top", "right", "Enter valid break time !!", "danger");
      return;
    }

    let obj = { title: value.title, starttime: value.starttime, endtime: value.endtime, days: value.days, action: '' };
    let dataSource = this.breakList;
    dataSource.push(obj);
    let cloned = dataSource.slice();
    this.breakList = cloned;
    $("#closebrk").click();
    this.brform.reset();
  }

  onRemoveBreak(i: number) {
    this.breakList.splice(i, 1);
    let dataSource = this.breakList;
    let cloned = dataSource.slice();
    this.breakList = cloned;
  }

  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

  onDayChecked(){
    this.days = [];
    this.days = this.daysList.filter(d => d.checked == true);
  }
  
  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  checkWorkinghrs(time : string){
    return { hhmm : `${time.substring(0,2)}:${time.substring(3,5)}` , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }
  
  get isdisabled(): boolean  {
    return this.daysList.filter(a=>a.disabled == true).length == 7;
  }

  
  async onSubmit(value: any, valid: boolean) {
    if (this.bindId && !this.editPermission) {
      super.noeditpermissionMsg("edit");
      return;
    } else if (!this.bindId && !this.addPermission) {
      super.noeditpermissionMsg("add");
      return;
    }

    this.submitted = true;
    this.days = [];
    this.days = this.daysList.filter(d => d.checked == true);
    if (!valid || this.days.length == 0) {
      super.showNotification("top", "right", "Fill required fields !!", "danger");
      return;
    }
    if (value.duration <= 0) {
      super.showNotification("top", "right", `Enter valid duration !!`, "danger");
      return;
    }
    if (value.commission && value.commission != 0 && value.commission > value.charges) {
      super.showNotification("top", "right", `Commission should be less than charges !!`, "danger");
      return;
    }
 
    var workingstart = this.checkWorkinghrs(this.workingHours.starttime);
    var workingend = this.checkWorkinghrs(this.workingHours.endtime);
    
    var starttime = this.setTimers(value.starttime);
    var endtime = this.setTimers(value.endtime);
    var cnt = 0;
    if (workingstart.hh > workingend.hh) { // 11:00-08:00
      if ((starttime.hh < workingstart.hh) || (starttime.hh > workingend.hh)) cnt =1;
      else if (starttime.hh == workingstart.hh && starttime.mm >= workingstart.mm) cnt =2;
      else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt =3;
    } else {                              // 08:00-16:00
      if (starttime.hh > endtime.hh) cnt =4;
      else if (starttime.hh == endtime.hh && starttime.mm >= endtime.mm) cnt =5;
      else if (starttime.hh < workingstart.hh) cnt =6;
      else if (starttime.hh == workingstart.hh && starttime.mm < workingstart.mm) cnt =7;
      else if (endtime.hh > workingend.hh) cnt =8;
      else if (endtime.hh == workingend.hh && endtime.mm > workingend.mm) cnt = 9;
    }
    if (cnt != 0) {
      super.showNotification("top", "right", "Enter valid availibility times !!", "danger");
      return;
    }

    var durations = moment.duration(moment(endtime.hhmm,'hh:mm').diff(moment(starttime.hhmm,'hh:mm')));
    if(durations.asMinutes() < value.duration){
      super.showNotification("top", "right", `Duration should be less or equal to ${durations.asMinutes()} min !! `, "danger");
      return;
    }
   
    var staff = this.staffList.filter(a => a.checked == true);
    
    this.serviceModel = value;
    if(value.category && value.category.autocomplete_id){
      this.serviceModel.category = value.category.autocomplete_id;
    }
    this.serviceModel.staff = staff.map(a => a._id);
    this.serviceModel.gallery = this.formImageArray;
    this.serviceModel.type = "appointmentservice";

    this.serviceModel.availability = {
      'days': this.days.map(a => a.code),
      'starttime': this.setTimers(value.starttime).hhmm,
      'endtime':  this.setTimers(value.endtime).hhmm,
    };
    this.serviceModel.breaktime = this.breakList;

    var obj;
    this.serviceModel.staffavailability = [];
    this.advcavailList.forEach(element => {
      obj = {
        'userid': element._id,
        'days': element.selecteddays,
        'starttime': this.setTimers(element.starttime).hhmm,
        'endtime': this.setTimers(element.endtime).hhmm
      };
      this.serviceModel.staffavailability.push(obj);
    });

    this.serviceModel.staffcommission = [];
    this.costavailList.forEach(element => {
      obj = {
        'userid': element._id,
        'charges': element.charges,
        'commission': element.commission
      };
      this.serviceModel.staffcommission.push(obj);
    });
    this.serviceModel["property"] = {}
    this.serviceModel["property"]["tags"] = this.tags;
    this.serviceModel["property"]["onlineavailibility"] = value.onlineavailibility;

    this.disableButton = true;
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.serviceModel);
      } else {
        res = await this.Update(this.bindId, this.serviceModel);
      }

      this._router.navigate([`/pages/dynamic-list/list/service`]);
      super.showNotification("top", "right", "Service made successfully !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  ActionCall() {

  }

  Delete() { }
  onOperation(event: any) {

    if (event) {
      this._router.navigate([`/pages/dynamic-list/list/service`]);
      super.showNotification("top", "right", "Service updated successfully !!", "success");
    }
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

  async Save(model?: any) {
    return await this._serviceService.AsyncAdd(model);
  }
  async Update(id?: any, model?: any) {
    return await this._serviceService.AsyncUpdate(id, model);
  }

  getSubmittedData(submit_data: any) {
    this.category_fields.autocomplete = false;
    this.category_fields.dbvalue = submit_data.value;
    setTimeout(() => {
      this.category_fields.autocomplete = true;
    });
      
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

