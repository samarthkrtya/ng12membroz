import { Component,  ElementRef,  OnInit, QueryList, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {  Subject } from 'rxjs';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x'; 

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { OnlyPositiveNumberValidator } from 'src/app/shared/components/basicValidators';
import { MatSelect } from '@angular/material/select';

declare var $: any;

@Component({
  selector: 'app-holiday-package',
  templateUrl: './holiday-package.component.html'
})
export class HolidayPackageComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('title') title : ElementRef;
  
  @ViewChildren('destinationDayRef') destinationDayRef: QueryList<MatSelect>;
  @ViewChildren('transferDayRef') transferDayRef: QueryList<MatSelect>;
  @ViewChildren('flightDayRef') flightDayRef: QueryList<MatSelect>;
  @ViewChildren('activityDayRef') activityDayRef: QueryList<MatSelect>;
  
  form: FormGroup;
  submitted: boolean;
  isLoadingData: boolean;
  disableButton: boolean;
  isLoadingtab: boolean;

  today: Date = new Date();
  
  uploader: FileUploader;
  response: any[] = [];
  formImageArray: any[] = [];
  customeUploader: any[] = [];
  maxFileSize = 5 * 1024 * 1024;

  uploader2: FileUploader;
  customeUploader2: any;
  formImageObj: any = {};

  currentcounter : number = 0;
  ind: number = 0;

  resortlocation_fieldsArray : any[]= [];

  resortlocationTFrm_fieldsArray : any[]= [];
  resortlocationTTo_fieldsArray : any[]= [];

  resortlocationFFrm_fieldsArray : any[]= [];
  resortlocationFTo_fieldsArray : any[]= [];

  resortlocationE_fieldsArray : any[]= [];

  activity_fieldsArray : any[]= [];

  resortlocation_fields = {
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "locationname", "value": 1 },
    ],
    "form": {
      "apiurl": "resortlocations/filter",
      "formfield": "_id",
      "displayvalue": "locationname",
    },
    "method": "POST",
    "dbvalue": {}
  }

  event_fields = {
    "fieldname": "event",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "title", "value": 1 },
    ],
    "form": {
      "apiurl": "events/filter",
      "formfield": "_id",
      "displayvalue": "title",
    },
    "method": "POST",
    "dbvalue": {}
  }

  pacakgetypes_fields = {
    "fieldname": "packagetype",
    "fieldtype": "lookup",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "lookup", "searchvalue": "package type", "criteria": "eq" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ], 
    "dbvalue": {}
  }
 
  durationList : any[] = [
    { id : 0 , name  : '1 Day/0 Nights' , day : 'Day 1' , night : 'Night 0' },
    { id : 1 , name  : '2 Day/1 Nights' , day : 'Day 2' , night : 'Night 1' },
    { id : 2 , name  : '3 Day/2 Nights' , day : 'Day 3' , night : 'Night 2' },
    { id : 3 , name  : '4 Day/3 Nights' , day : 'Day 4' , night : 'Night 3' },
    { id : 4 , name  : '5 Day/4 Nights' , day : 'Day 5' , night : 'Night 4' },
    { id : 5 , name  : '6 Day/5 Nights' , day : 'Day 6' , night : 'Night 5' },
    { id : 6 , name  : '7 Day/6 Nights' , day : 'Day 7' , night : 'Night 6' },
    { id : 7 , name  : '8 Day/7 Nights' , day : 'Day 8' , night : 'Night 7' },
    { id : 8 , name  : '9 Day/8 Nights' , day : 'Day 9' , night : 'Night 8' },
    { id : 9 , name  : '10 Day/9 Nights' , day : 'Day 10'  , night : 'Night 9'  },
    { id : 10 , name  : '11 Day/10 Nights' , day : 'Day 11' , night : 'Night 10' },
    { id : 11 , name  : '12 Day/11 Nights' , day : 'Day 12' , night : 'Night 11' },
    { id : 12 , name  : '13 Day/12 Nights' , day : 'Day 13' , night : 'Night 12' },
    { id : 13 , name  : '14 Day/13 Nights' , day : 'Day 14' , night : 'Night 13' },
    { id : 14 , name  : '15 Day/14 Nights' , day : 'Day 15' , night : 'Night 14' },
  ];

  subdurationList : any[] = [];
  taxesList: any[] = [];

  subdurationArrayList : any[] = [];
  subdurationTrnsArrayList : any[] = [];
  subdurationFltArrayList : any[] = [];
  subdurationActArrayList : any[] = [];

  constructor(
    private _route: ActivatedRoute, 
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
  ) {
    super();

    this.form = fb.group({
      'title' : ['', Validators.required],
      'packagetype' : ['', Validators.required], 
      'duration' : ['', Validators.required],
      'traveldate' : [],
      'taxes' : [[]],
      'image' : [],
      'totaladults' : [ , Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'totalchildrens' : [,OnlyPositiveNumberValidator.insertonlypositivenumber],
      'cost' : [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'destinations' : fb.array([]),
      'transfer' :  fb.array([]),
      'flight' :  fb.array([]),
      'activity' : fb.array([]),
      'status' : ['active'],
      'capacity' : [0],
      'bookedcapacity' : [0],
      'basetourpackage' : [],
      'schedule' : [],
    });
    this.addNewdestination();
    // this.addNewtransfer();
    // this.addNewflight();
    // this.addNewactivity();

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
 
  }

  addNewdestination() {
    const destin = this.form.get('destinations') as FormArray;
    this.resortlocation_fieldsArray[destin.controls.length] = this.resortlocation_fields;
    if(destin.controls.length > 0){
      const prevduration = (destin.controls[destin.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      this.subdurationArrayList[destin.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
    }
    destin.push(this.fb.group({
      'day' : [,Validators.required], 
      'destination' : [, Validators.required],
      'description' : [],
      'attachment' : [[]],
    })); 
    this.fillData();
    this.ind = 0;
    setTimeout(() => {
        if(this.destinationDayRef && this.destinationDayRef.last){
          this.destinationDayRef.last.focus();  
        }
    }, 500);
  }

  addNewtransfer() {
    const transfer = this.form.get('transfer') as FormArray;
    this.resortlocationTFrm_fieldsArray[transfer.controls.length] = this.resortlocation_fields;
    this.resortlocationTTo_fieldsArray[transfer.controls.length] = this.resortlocation_fields;
    if(transfer.controls.length > 0){
      const prevduration = (transfer.controls[transfer.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationTrnsArrayList[transfer.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationTrnsArrayList[transfer.controls.length] = this.subdurationList;
    }
    transfer.push(this.fb.group({
      'day' : [,Validators.required], 
      'from' : [,Validators.required],
      'to' : [,Validators.required],
      'nightscover' : [],
      'facilities' : [],
      'transfertype' : [],
      'duration' : [,Validators.required],
    })); 
    this.ind = 1; 
    setTimeout(() => {
      if(this.transferDayRef){
        this.transferDayRef.last.focus();
      }
    }, 500);
  }

  addNewflight() {
    const flight = this.form.get('flight') as FormArray;
    this.resortlocationFFrm_fieldsArray[flight.controls.length] = this.resortlocation_fields;
    this.resortlocationFTo_fieldsArray[flight.controls.length] = this.resortlocation_fields;
    if(flight.controls.length > 0){
      const prevduration = (flight.controls[flight.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationFltArrayList[flight.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationFltArrayList[flight.controls.length] = this.subdurationList;
    }
    flight.push(this.fb.group({
      'day' : [,Validators.required], 
      'from' : [,Validators.required],
      'to' : [,Validators.required],
      'nightscover' : [],
      'tickettype' : [], 
      'duration' : [,Validators.required],
    }));
    this.ind = 2;
    setTimeout(() => {
      if(this.flightDayRef){
        this.flightDayRef.last.focus();
      }
    }, 500);
  }

  addNewactivity() {
    const activity = this.form.get('activity') as FormArray;
    this.activity_fieldsArray[activity.controls.length]  = this.event_fields;
    this.resortlocationE_fieldsArray[activity.controls.length] = this.resortlocation_fields;
    if(activity.controls.length > 0){
      const prevduration = (activity.controls[activity.controls.length-1] as FormGroup).get('day').value;
      if(!prevduration) {
        super.showNotification("top", "right", "Please select required fields !!", "danger");
        return;
      }
      const predObj = this.durationList.find(a=>a.day == prevduration);
      // this.subdurationActArrayList[activity.controls.length] = this.subdurationList.filter(a=>a.id > predObj.id);
      this.subdurationActArrayList[activity.controls.length] = this.subdurationList;
    }
    activity.push(this.fb.group({
      'day' : [,Validators.required], 
      'event' : [,Validators.required], 
      'location' : [,Validators.required],
      'duration' : [,Validators.required],
      'description' : [],
      'attachment' : [[]],
    }));
    this.fillData();
    this.ind = 3;
    setTimeout(() => {
      if(this.activityDayRef){
        this.activityDayRef.last.focus();
      }
    }, 500);
  }

  removeDestination(ind : number){
    const fnd = this.form.get('destinations') as FormArray;
    fnd.removeAt(ind);
  }

  removeTransfer(ind : number){
    const fnd = this.form.get('transfer') as FormArray;
    fnd.removeAt(ind);
  }

  removeFlight(ind : number){
    const fnd = this.form.get('flight') as FormArray;
    fnd.removeAt(ind);
  }

  removeActivity(ind : number){
    const fnd = this.form.get('activity') as FormArray;
    fnd.removeAt(ind);
  }
  
  async ngOnInit() {
    try {
      this.isLoadingData = true;
      await super.ngOnInit(); 
      await this.LoadData(); 
      if(this.bindId){
        await this.getPackageById(this.bindId);
      }
      this.isLoadingData = false;
    } catch (error) {
      this.isLoadingData = false;
      console.error(error);
    }
  } 

  async LoadData(){
    
    this.subdurationList = this.durationList;
    await this.getTaxes();
    this.imageConfigrations();
    this.form
      .controls['duration']
       .valueChanges
        .subscribe((durn)=>{
          if(durn){
            var day = this.durationList.find(d=>d.name == durn)
            this.subdurationList = this.durationList.filter(a=>a.id <= day.id);
            this.subdurationArrayList = [];
            
            this.subdurationArrayList[0] = [];
            this.subdurationTrnsArrayList[0] = [];
            this.subdurationFltArrayList[0] = [];
            this.subdurationActArrayList[0] = [];

            this.subdurationArrayList[0] = this.subdurationList;
            this.subdurationTrnsArrayList[0] = this.subdurationList;
            this.subdurationFltArrayList[0] = this.subdurationList;
            this.subdurationActArrayList[0] = this.subdurationList;


            const destn = this.form.get('destinations') as FormArray;
            const trnsf = this.form.get('transfer') as FormArray;
            const flt = this.form.get('flight') as FormArray;
            const actv = this.form.get('activity') as FormArray;

            destn.clear();
            trnsf.clear();
            flt.clear();
            actv.clear();

            this.addNewdestination();
          }
       }); 


    return;
  }

  protected imageConfigrations() {

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
    this.customeUploader2 = new FileUploader(uploaderOptions);
    this.customeUploader2.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      form.append('context', `photo=${"attachment"}`);
      form.append('tags', "attachment");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    uploaderOptions.allowedFileType = ['image']
    const upsertResponse = fileItem => {
      $(".loadings").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.formImageObj) {
          this.formImageObj = {};
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
        this.formImageObj = fileInfo;
        $('#' + fieldnameTags).val(fileItem.data.secure_url);
        $(".loadings").hide();
      }
    };
    this.customeUploader2.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );
    this.customeUploader2.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress
        });
    this.customeUploader2.onWhenAddingFileFailed = (item: any, filter: any) => {
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
  

  dayChanges(value : any, i : any , types : string){
    if(types == 'destination'){
      const destin = this.form.get('destinations') as FormArray;
      destin.controls.splice(i+1 , destin.controls.length);
    }else if(types == 'transfer'){
      const transfer = this.form.get('transfer') as FormArray;
      transfer.controls.splice(i+1 , transfer.controls.length);
    }else if(types == 'activity'){
      const activity = this.form.get('activity') as FormArray;
      activity.controls.splice(i+1 , activity.controls.length);
    }else if(types == 'flight'){
      const flight = this.form.get('flight') as FormArray;
      flight.controls.splice(i+1 , flight.controls.length);
    }
  }

  onTabChanged(value : any){
    this.isLoadingtab = true;
      setTimeout(() => {
      this.isLoadingtab = false;
      }, 1000);
  }
  
  async getTaxes() {
    
    var url = "taxes/filter";
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
 
    await this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any) => {
        this.taxesList = data;
      });
  }

  fillData(){
    const destin = this.form.get("destinations") as FormArray;
    const activity = this.form.get("activity") as FormArray;
    destin.controls.forEach((cntrl: FormGroup, ind) => {
      this.imageConfigration('destination',ind);
    });
    activity.controls.forEach((cntrl: FormGroup, ind) => {
      this.imageConfigration('activity',ind);
    });
  }

  imageConfigration(fieldname : string, index  : number) {

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
        url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
        autoUpload: true,
        isHTML5: true,
        removeAfterUpload: true,
        headers: [
          {
            name: "X-Requested-With",
            value: "XMLHttpRequest",
          },
        ],
        additionalParameter: { uploaderparams: index },
        // allowedFileType: element.allowedfiletype ? element.allowedfiletype : this.allowedFileType,
        //maxFileSize: element.maxfilesize ? element.maxfilesize : Number(this.maxFileSize)
      };
      
      uploaderOptions.allowedFileType = ["image"];
      if (!this.customeUploader[fieldname]) {
        this.customeUploader[fieldname] = [];
      }
      if (!this.customeUploader[fieldname][index]) {
        this.customeUploader[fieldname][index] = [];
      }
      
      this.customeUploader[fieldname][index] = new FileUploader(uploaderOptions);
      this.customeUploader[fieldname][index].onBuildItemForm = ( fileItem: any, form: FormData ): any => {
        this.currentcounter =  Number(fileItem.options.additionalParameter.uploaderparams);
        form.append("upload_preset", auth_upload_preset);
        form.append("context",`type=group|index=${this.currentcounter}`);
        // form.append("context",`photo="attachment"|index=${this.currentcounter}`);
        form.append("tags", "attachment");
        form.append("file", fileItem);
        fileItem.withCredentials = false;
        return { fileItem, form };
      };
      const upsertResponse = (fileItem) => {
        $(`.loading_${fieldname}_${this.currentcounter}`).show();
        if (fileItem && fileItem.status == 200) {
          let fieldnameTags = fileItem.data.tags[0];

          if (!this.formImageArray[fieldname]) {
            this.formImageArray[fieldname] = [];
          }
          if (!this.formImageArray[fieldname][this.currentcounter]) {
            this.formImageArray[fieldname][this.currentcounter] = [];
          }
          let extension: any;
          if (fileItem.file) {
            extension = fileItem.file.name.substr(
              fileItem.file.name.lastIndexOf(".") + 1
            );
          }
          let fileInfo = {
            attachment: fileItem.data.secure_url,
            extension: extension,
            originalfilename: fileItem.data.original_filename,
          };
          this.formImageArray[fieldname][this.currentcounter].push(fileInfo);
          $("#" + fieldnameTags).val(fileItem.data.secure_url);
          $(`.loading_${fieldname}_${this.currentcounter}`).hide();
        }
      };
      this.customeUploader[fieldname][index].onCompleteItem = ( item: any, response: string, status: number, headers: ParsedResponseHeaders ) => {  upsertResponse({ file: item.file, status, data: JSON.parse(response)})};
      this.customeUploader[fieldname][index].onProgressItem = ( fileItem: any, progress: any ) =>
        upsertResponse({   file: fileItem.file, progress});
      this.customeUploader[fieldname][index].onWhenAddingFileFailed = ( item: any, filter: any ) => {
        let message = "";
        switch (filter.name) {
          case "fileSize":
            message = 'Warning ! \nThe uploaded file "' + item.name + '" is ' + this.formatBytes(item.size) + ", this exceeds the maximum allowed size of " +
            this.formatBytes(Number(this.maxFileSize) * 1024 * 1024);
            this.showNotification("top", "right", message, "danger");
            break;
          default:
            message = "Error trying to upload file " + item.name;
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

  protected removeImg(fieldname: string , index : number , subindex : number) {
    this.formImageArray[fieldname][index].splice(subindex, 1);
  }

  protected downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  onItemAdded(event : any , ind : number , type : string){
    if(type == 'destination'){
      this.resortlocation_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocation_fieldsArray[ind].dbvalue = event;
    }else if(type == 'transferfrom'){
      this.resortlocationTFrm_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationTFrm_fieldsArray[ind].dbvalue = event;
    }else if(type == 'transferto'){
      this.resortlocationTTo_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationTTo_fieldsArray[ind].dbvalue = event;
    }else if(type == 'flightfrom'){
      this.resortlocationFFrm_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationFFrm_fieldsArray[ind].dbvalue = event;
    }else if(type == 'flightto'){
      this.resortlocationFTo_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationFTo_fieldsArray[ind].dbvalue = event;
    }else if(type == 'evnt'){
      this.activity_fieldsArray[ind] = Object.assign({},this.event_fields);
      this.activity_fieldsArray[ind].dbvalue = event;
    }else if(type == 'evntlcn'){
      this.resortlocationE_fieldsArray[ind] = Object.assign({},this.resortlocation_fields);
      this.resortlocationE_fieldsArray[ind].dbvalue = event;
    }
  }

  async getPackageById(id : any){
    
    var url = "tourpackages/filter";
    var method = "POST";

    let postData = {};
    postData["formname"] = "tourpackage";
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq", "datatype": "objectId" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          var resData = data[0];
          // console.log("resData",resData);

          this.form.controls['title'].setValue(resData.title);
          this.form.controls['packagetype'].setValue(resData.packagetype);
          this.form.controls['cost'].setValue(resData.cost);
          this.form.controls['taxes'].setValue(resData.taxes);
          this.form.controls['totaladults'].setValue(resData.totaladults);
          this.form.controls['totalchildrens'].setValue(resData.totalchildrens);
          this.form.controls['status'].setValue(resData.status);

          if(resData.traveldate){
            this.form.controls['traveldate'].setValue(resData.traveldate);
          }
          if(resData.capacity){
            this.form.controls['capacity'].setValue(resData.capacity);
          }
          if(resData.bookedcapacity){
            this.form.controls['bookedcapacity'].setValue(resData.bookedcapacity);
          }
          if(resData.basetourpackage && resData.basetourpackage._id){
            this.form.controls['basetourpackage'].setValue(resData.basetourpackage._id);
          }
          if(resData.schedule){
            this.form.controls['schedule'].setValue(resData.schedule);
          }
          
          
          this.formImageObj = resData.image ? resData.image : null;
          
          var day = this.durationList.find(d=>d.name == resData.duration);
          this.subdurationList = this.durationList.filter(a=>a.id <= day.id);
          this.form.controls['duration'].setValue(resData.duration);
          this.pacakgetypes_fields.dbvalue = resData.packagetype; 

          this.formImageArray = [];
          if(resData.destinations && resData.destinations.length > 0){
            this.subdurationArrayList = [];
            const destin = this.form.get('destinations') as FormArray;
            destin.clear();
             resData.destinations.forEach((destn, i) => {
                destin.push(
                  this.fb.group({
                    day: [destn.day, Validators.required],
                    destination: [destn.destination, Validators.required],
                    description: [destn.description],
                    attachment: [[]],
                  })
                ); 
                if(!this.formImageArray['destination']){
                    this.formImageArray['destination'] = [];
                }
                if(!this.formImageArray['destination'][i]){
                  this.formImageArray['destination'][i] = [];
                }
                if(destn.attachment){
                  this.formImageArray['destination'][i] = destn.attachment;
                }
              this.resortlocation_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
              this.resortlocation_fieldsArray[i].dbvalue = destn.destination;

              const durationObj = this.durationList[this.durationList.findIndex(a=>a.day == destn.day)];
              this.subdurationArrayList[i] = [];
              this.subdurationArrayList[i] = this.subdurationList.filter(a=>a.id >= durationObj.id);
           });
          }
          

          if(resData.flight && resData.flight.length > 0){
            const flight = this.form.get('flight') as FormArray;
            flight.clear();
            let duration;
             resData.flight.forEach((destn, i) => {
              duration = destn.duration.split(':');
                flight.push(
                  this.fb.group({
                    day: [destn.day],
                    from: [destn.from,Validators.required],
                    to: [destn.to,Validators.required],
                    duration: [`${duration[0]}${duration[1]}`,Validators.required],
                    nightscover: [destn.nightscover],
                    tickettype: [destn.tickettype],
                  })
                );
                this.resortlocationFFrm_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
                this.resortlocationFFrm_fieldsArray[i].dbvalue = destn.from;

                this.resortlocationFTo_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
                this.resortlocationFTo_fieldsArray[i].dbvalue = destn.to;
           });
          }

          if(resData.transfer && resData.transfer.length > 0){
            const transfer = this.form.get('transfer') as FormArray;
            transfer.clear();
            let duration;
             resData.transfer.forEach((destn, i) => {
              duration = destn.duration.split(':');
                transfer.push(
                  this.fb.group({
                    day: [destn.day],
                    from: [destn.from,Validators.required],
                    to: [destn.to,Validators.required],
                    duration: [`${duration[0]}${duration[1]}`,Validators.required],
                    nightscover: [destn.nightscover],
                    facilities: [destn.facilities],
                    transfertype: [destn.transfertype],
                  })

                );

                this.resortlocationTFrm_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
                this.resortlocationTFrm_fieldsArray[i].dbvalue = destn.from;

                this.resortlocationTTo_fieldsArray[i] = Object.assign({},this.resortlocation_fields);
                this.resortlocationTTo_fieldsArray[i].dbvalue = destn.to;
           });
          }

          if(resData.activity && resData.activity.length > 0){
            const activity = this.form.get('activity') as FormArray;
            activity.clear();
            let duration;
            resData.activity.forEach((destn, i) => {
               duration = destn.duration.split(':');
                activity.push(
                  this.fb.group({
                    day: [destn.day,Validators.required],
                    event: [destn.event,Validators.required],
                    description: [destn.description],
                    duration: [`${duration[0]}${duration[1]}`,Validators.required],
                    location: [destn.location],
                    attachment: [],
                    
                  })
                );
                if(!this.formImageArray['activity']){
                  this.formImageArray['activity'] = [];
                }
                if(!this.formImageArray['activity'][i]){
                  this.formImageArray['activity'][i] = [];
                }
                this.formImageArray['activity'][i] = destn.attachment;

                this.activity_fieldsArray[i]  = Object.assign({},this.event_fields);
                this.activity_fieldsArray[i].dbvalue  = destn.event;

                this.resortlocationE_fieldsArray[i]  = Object.assign({},this.resortlocation_fields);
                this.resortlocationE_fieldsArray[i].dbvalue  = destn.location;
           });
          }

          this.fillData();
            setTimeout(() => {
              if(this.title && this.title.nativeElement){
                // this.title.nativeElement.focus()
              }
          });
        }
      });
  }
  
  onSubmit(value: any, valid : boolean){
    this.submitted = true;

    let destinations =  this.form.controls['destinations'] as FormArray;
    let transfer =  this.form.controls['transfer'] as FormArray;
    let flight =  this.form.controls['flight'] as FormArray;
    let activity =  this.form.controls['activity'] as FormArray;

    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      if(destinations.invalid) {
         this.ind = 0;
      }else if(transfer.invalid) {
          this.ind = 1;
      }else if(flight.invalid) {
          this.ind = 2;
      }else if(activity.invalid) {
        this.ind = 3;
      }
      return;
    }else if(destinations.length == 0 &&  transfer.length == 0 && flight.length == 0 && activity.length == 0){
      super.showNotification("top", "right", "Atleast one type !!", "danger");
      return;
    }
    var url = "tourpackages";
    var method = this.bindId ? "PUT" : "POST";
    var model = value;
    model['image'] = this.formImageObj;
    model['packagetype'] = value.packagetype.autocomplete_id; 
    var count = 0;
    let ai = 0, di = 0;
    model['destinations'].forEach((desgn) => {
      desgn.attachment = [];
      desgn.attachment = this.formImageArray['destination'] && this.formImageArray['destination'][di] && this.formImageArray['destination'][di].length > 0 ? this.formImageArray['destination'][di] : [];
      di++
    });
    model['transfer'].forEach((desgn) => {
      desgn.duration = this.subStr(desgn.duration);
      if((desgn.from.autocomplete_id &&  desgn.to.autocomplete_id && desgn.from.autocomplete_id ==  desgn.to.autocomplete_id)){
        count++;
      }else if(desgn.from &&  desgn.to &&  desgn.from ==  desgn.to){
        count++;
      }
    });
    model['flight'].forEach((desgn) => {
      desgn.duration = this.subStr(desgn.duration);
      if((desgn.from.autocomplete_id &&  desgn.to.autocomplete_id && desgn.from.autocomplete_id ==  desgn.to.autocomplete_id)){
        count++;
      }else if(desgn.from &&  desgn.to &&  desgn.from ==  desgn.to){
        count++;
      }
    });
    model['activity'].forEach((actv) => {
      actv.duration = this.subStr(actv.duration);
      actv.attachment = [];
      actv.attachment = this.formImageArray['activity'] && this.formImageArray['activity'][ai] && this.formImageArray['activity'][ai].length > 0 ? this.formImageArray['activity'][ai] : [];
      ai++;
    });
    if(count > 0){
      this.showNotification("top", "right", "Source and destination are not same !!", "danger");
      return;
    }
    console.log("model",model);
    
    this.disableButton = true;
      this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
        .then((data: any) => {
          if (data) {
            this.showNotification("top", "right", "Package added successfully !!", "success");
            this._router.navigate([`/pages/dynamic-list/list/tourpackage`]);
            this.disableButton = false;
          }
        }).catch ((e) =>{
          this.disableButton = false;
          this.showNotification("top", "right", "Something went wrong !!", "danger");
        });
  }
  
  subStr(str : string) {
    let s1=  str.substring(0,2);
    let s2=  str.substring(2,4);
    return  `${this.setdigit(parseInt(s1))}:${this.setdigit(parseInt(s2))}`;
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


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }    
}