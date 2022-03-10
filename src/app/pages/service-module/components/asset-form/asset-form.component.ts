import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import swal from 'sweetalert2';
import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { AssetModel } from '../../../../core/models/service/asset';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { AssetService } from '../../../../core/services/service/asset.service';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { WfPermissionComponent } from '../../../../shared/wf-permission/wf-permission.component';
import { OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

declare var $: any;
import * as moment from 'moment';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styles: [
    `.example-chip-list {
      width: 100%;
    }`],
})

export class AssetComponent extends BaseComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  displayedColumns2: string[] = ['title', 'days', 'starttime', 'endtime', 'action'];
  daysList: any[] = [{ code: "Monday", checked: false, disabled: true }, { code: "Tuesday", checked: false, disabled: true }, { code: "Wednesday", checked: false, disabled: true }, { code: "Thursday", checked: false, disabled: true }, { code: "Friday", checked: false, disabled: true }, { code: "Saturday", checked: false, disabled: true }, { code: "Sunday", checked: false, disabled: true }];
  days: any[] = [];

  assetModel = new AssetModel();
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('wfpermission') wfpermission: WfPermissionComponent;

  form: FormGroup;
  brform: FormGroup;

  disableButton: boolean;
  submitted: boolean;

  isLoadingData: boolean = true;
  isBookingHourly: boolean = true;
  isAdvanceCost: boolean = false;

  taxesList: any[] = [];
  breakList: any[] = [];
  unitdetailList: any[] = [];

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  workingHours : any;

  category_fields = {
    "fieldname": "category",
    "fieldtype": "formdata",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "formid", "searchvalue": "5e70cb9dd466f11d24a7c361", "criteria": "eq" , "datatype" : "ObjectId" }
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
    "formname": "facilitytype",
    "value": "",
    "dbvalue": "",
    "autocomplete" : true,
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: any[] = [];
  assettag: FormControl;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private cdr: ChangeDetectorRef,
    private _taxesService: TaxesService,
    private _assetService: AssetService,
  ) {
    super();
    this.form = this.fb.group({
      'title': ['', Validators.required],
      'category': ['', Validators.required],           
      'assettag' : [],
      'quantity': [1, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'description': [],
      'bookingtype': ['HOURLY', Validators.required],
      'charges': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'duration': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'starttime': ['', Validators.required],
      "endtime": ['', Validators.required],
      'taxes': [],
      'gallery': []
    });

    this.brform = this.fb.group({
      'title': ['', Validators.required],
      'days': [''],
      'starttime': ['', Validators.required],
      'endtime': ['', Validators.required]
    });
    this._formName = "asset";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'asset-form';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  async LoadData() {
    this.isLoadingData = true;
    
    this.workingHours = this._authService.currentUser.user.branchid['workinghours'];

    if(this.currentlogin && this.currentlogin.branchid && this.currentlogin.branchid.property && this.currentlogin.branchid.property.advancepricing ) {      
      this.isAdvanceCost = true;
    }
    var workinghours = this._authService.currentUser.user.branchid['workinghours'];
    if (workinghours.days && workinghours.days.length > 0) {
      this.daysList.map(day => {
        if (workinghours.days.includes(day.code)) {
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
    await this._assetService
      .AsyncGetById(id)
      .then((data: any) => {
        // console.log("data==>", data);
        this.assetModel = data;
        this.form.controls['title'].setValue(data.title);

        if(data.category && data.category._id){
          this.form.controls['category'].setValue(data.category);
          this.category_fields.dbvalue = data.category;
        }

        this.form.controls['quantity'].setValue(data.quantity);
        this.form.controls['description'].setValue(data.description);

        this.form.controls['charges'].setValue(data.charges);
        this.form.controls['bookingtype'].setValue(data.bookingtype);
        this.onChangeBooking(data.bookingtype);
        this.isBookingHourly = data.bookingtype == 'HOURLY';
        if (this.isBookingHourly) {
          this.form.controls['duration'].setValue(data.duration);
        }
        if (data.taxes && data.taxes.length > 0) {
          this.form.controls['taxes'].setValue(data.taxes.map(a => a._id));
        }
        this.formImageArray = data.gallery;
        this.unitdetailList = data.unitdetail ? data.unitdetail : [];

        this.form.controls['starttime'].setValue(data.availability.starttime);
        this.form.controls['endtime'].setValue(data.availability.endtime);

        if (data.property && data.property['tags']) {
          this.tags = data.property['tags'];
        }
        //this.tags = data?.property?.tags;
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
            this.breakList.push({ 'title': element.title, 'starttime': element.starttime, 'endtime': element.endtime, 'days': element.days })
          });
          let dataSource = this.breakList;
          let cloned = dataSource.slice();
          this.breakList = cloned; 
        }

        data.advanceavailability.forEach(element => {
          var dys = this.daysList.find(a => a.code == element.days);
          dys['starttime'] = element.starttime;
          dys['endtime'] = element.endtime;
        });

        data.advancecharges.forEach(element => {
          var dys = this.daysList.find(a => a.code == element.days);
          dys['charges'] = element.charges ? element.charges : 0;
        });
        this.cdr.detectChanges();
      });
  }

  avlblOption(type: string) {
    if (type == 'avail') {
      this.daysList.map(a => a.starttime = a.starttime ? a.starttime : '');
      this.daysList.map(a => a.endtime = a.endtime ? a.endtime : '');
    } else if (type == 'avail') {
      this.daysList.map(a => a.charges = a.charges ? a.charges : 0);
    }
  }

  onAdvcd() {
    $("#avilClose").click();
  }

  onAdvcdCost() {
    $("#costClose").click();
  }

  advcQtyOpen() {
    let qty = 0;
    qty = this.form.controls['quantity'].value;
    if (qty != this.unitdetailList.length) {
      this.unitdetailList = [];
      for (let i = 0; i < qty; i++) {
        this.unitdetailList.push({ 'number': i + 1, 'title': i + 1 })
      }
    }
  }

  advcQtyClose() {
    $("#qtyClose").click();
  }

  onChangeBooking(value: string) {
    this.isBookingHourly = true;
    this.form.controls['duration'].setValue(null);
    if (value == 'DAILY') {
      this.form.controls['duration'].setErrors(null);
      this.isBookingHourly = false;
    } else {
      this.form.controls['duration'].setValidators(Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber]));
    }
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

  setAllDays(checked: boolean){
    this.daysList.filter(a=>a.disabled == false).map(a => a.checked = checked);
  }

  get isdisabled(): boolean  {
    return this.daysList.filter(a=>a.disabled == true).length == 7;
  }
  
  onDayChecked() {
    this.days = [];
    this.days = this.daysList.filter(d => d.checked == true);
  }

  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }

  checkWorkinghrs(time : string){
    return { hhmm : `${time.substring(0,2)}:${time.substring(3,5)}` , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
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
    if (cnt != 0 && this.isBookingHourly) {
      super.showNotification("top", "right", "Enter valid availibility times !!", "danger");
      return;
    }

    var durations = moment.duration(moment(endtime.hhmm,'hh:mm').diff(moment(starttime.hhmm,'hh:mm')));
    if(durations.asMinutes() < value.duration && this.isBookingHourly ){
      super.showNotification("top", "right", `Duration should be less or equal to ${durations.asMinutes()} min !! `, "danger");
      return;
    }

    this.assetModel = value;
    if(value.category && value.category.autocomplete_id){
      this.assetModel.category = value.category.autocomplete_id;
    }
    this.assetModel.gallery = this.formImageArray;
    if (value.quantity && value.quantity > 0) {
      this.assetModel.unitdetail = this.unitdetailList;
    }

    this.assetModel.availability = {
      'days': this.days.map(a => a.code),
      'starttime': value.starttime,
      'endtime':  value.endtime,
    };
    this.assetModel.breaktime = this.breakList;
    this.assetModel["property"]={};
    this.assetModel["property"]["tags"] = this.tags;

    var obj;
    this.assetModel.advanceavailability = [];
    this.days.forEach(element => {
      if (element.starttime || element.endtime) {
        obj = {
          'days': element.code,
          'starttime': element.starttime,
          'endtime': element.endtime
        };
        this.assetModel.advanceavailability.push(obj);
      }
    });
    this.assetModel.advancecharges = [];
    this.days.forEach(element => {
      if (element.charges && element.charges > 0) {
        obj = {
          'days': element.code,
          'charges': element.charges,
        };
        this.assetModel.advancecharges.push(obj);
      }
    }); 
    this.disableButton = true;
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.assetModel);
        super.showNotification("top", "right", "Facility added successfully !!", "success");
      } else {
        res = await this.Update(this.bindId, this.assetModel);
        super.showNotification("top", "right", "Facility updated successfully !!", "success");
      }
      if(this.previousUrl){
        this._router.navigate([this.previousUrl]);
      }else{
        this._router.navigate([`/pages/dynamic-list/list/asset`]);
      }
      
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  onOperation(event: any) {
    if (event) {
      if(this.previousUrl){
        this._router.navigate([this.previousUrl]);
      }else{
        this._router.navigate([`/pages/dynamic-list/list/asset`]);
      }
      super.showNotification("top", "right", "Data updated successfully !!", "success");
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
    return await this._assetService.AsyncAdd(model);
  }

  async Update(id?: any, model?: any) {
    return await this._assetService.AsyncUpdate(id, model);
  }

  ActionCall() { }
  Delete() { }

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

