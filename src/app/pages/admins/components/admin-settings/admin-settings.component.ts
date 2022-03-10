import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'; 

import { BranchesService } from '../../../../core/services/branches/branch.service';
import { BranchModel } from '../../../../core/models/branch/branch.model';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BasicValidators, ValidMobileNumberValidator } from '../../../../shared/components/basicValidators';
import { Configuration } from '../../../../../app/app.constants';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  moduleId: module.id,
  selector: 'user-cmp',
  templateUrl: 'admin-settings.component.html',
})

export class AdminSettingsComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  form: FormGroup;
  isSubmitted = false;
  bindId: any = '';
  visible: boolean = false;

  uploader: FileUploader;
  response: any[] = [];

   
  _propertyobjectModel: any;
  _branchModel = new BranchModel();
 
  walletsetting: any;
  qrcode: string;
  webqrcode: string;

  country_fields = {
    fieldname: "country",
    fieldtype: "lookup",
    formfield: "code",
    displayvalue: "name",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "lookup", searchvalue: "country", criteria: "eq" }
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "data", value: 1 },
    ],
    modelValue: {},
    dbvalue: {},
    visibility: true
  };

  currency_fields = {
    fieldname: "currency",
    fieldtype: "lookup",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "lookup", searchvalue: "currency", criteria: "eq" }
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "data", value: 1 },
    ],
    form: {
      formfield: "code",
      displayvalue: "name",
    },
    modelValue: {},
    dbvalue: {},
    visibility: true
  }

  locale_fields = {
    fieldname: "locale",
    fieldtype: "lookup",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "lookup", searchvalue: "locale", criteria: "eq" }
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "data", value: 1 },
    ],
    form: {
      formfield: "code",
      displayvalue: "name",
    },
    modelValue: {},
    dbvalue: {},
    visibility: true
  }

  timezone_fields = {
    fieldname: "timezone",
    fieldtype: "lookup",
    search: [
      { searchfield: "status", searchvalue: "active", criteria: "eq" },
      { searchfield: "lookup", searchvalue: "timezone", criteria: "eq" }
    ],
    select: [
      { fieldname: "_id", value: 1 },
      { fieldname: "data", value: 1 },
    ],
    form: {
      formfield: "code",
      displayvalue: "name",
    },
    modelValue: {},
    dbvalue: {},
    visibility: true
  }

  @ViewChild('targetstarttime', { static: false }) targetstarttime: ElementRef;
  @ViewChild('targetendtime', { static: false }) targetendtime: ElementRef;

  wdoptions = [
    { value: "Monday", checked: false },
    { value: "Tuesday", checked: false },
    { value: "Wednesday", checked: false },
    { value: "Thursday", checked: false },
    { value: "Friday", checked: false },
    { value: "Saturday", checked: false },
    { value: "Sunday", checked: false },
  ];
  
  defaultlogo: string;
  orglogo: string;

  editPermission: boolean = false;
  allowmemberlogin: boolean = false;
  qrVisibility: boolean = false;

  organizationsetting: any;

  isLoading: boolean = false;
  btnDisable: boolean = false;

  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";

  displayedColumns2: string[] = ['title', 'days', 'starttime', 'endtime', 'action'];
  breakList: any[] = [];
  brform : FormGroup;

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _branchesService: BranchesService,
    private _route: ActivatedRoute,
    private _configuration: Configuration,

  ) {
    super();
    this.pagename = 'admin-settings';
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      // this._formName = "client";   // for csa
      this._formName = "branch";      // for others
    });
 
    
    if (this._authService.currentUser) {
      if (this._authService.currentUser && this._authService.currentUser.organizationsetting) {
        this.organizationsetting = this._authService.currentUser.organizationsetting;

        if (this.organizationsetting) {
          if (this.organizationsetting.logo ) {
            this.orglogo = this.organizationsetting.logo;
          }
        }

        this.allowmemberlogin = false;
        if (this.organizationsetting.allowmemberlogin) {
          this.allowmemberlogin = this.organizationsetting.allowmemberlogin;
        }
        // this.qrVisibility = false;
        // if (this.organizationsetting.qrvisibility) {
        //   this.qrVisibility = this.organizationsetting.qrvisibility;
        // }
      }
    }

    this.qrVisibility = true;
    var permsList = this._authService.auth_role['permissions'];
    var brachprms = permsList.find(a=>a.formname == "branch");
    if(brachprms && brachprms.fieldpermission && brachprms.fieldpermission.length > 0){
      var hideFields = brachprms.fieldpermission.find(b=>b.type == 'hide');
      this.qrVisibility = !hideFields.fields.includes('qrcode');
    }
    
    this._branchModel.iswalletenable = false;
    this._branchModel.isqrenable = false;
    this._branchModel.iswebqrenable = false;

    this.walletsetting = {
      "paymentType": ["pin", "card", "mobile"],
      "language": "English",
      //"iswalletenable" : false,
      "iswalletotpenable": false,
      "walletsymbol": "€",
      "walletAuthEmailId": "",
    };

    this.form = fb.group({
      'branchname': ['', Validators.required],
      'vatnumber': [],
      'companyphone': [''],
      'contactperson': [''],
      'address': [''],
      'postcode': [],
      'city': [],
      'country': [''],
      'timezone': ['', Validators.compose([Validators.required])],
      'currency': ['', Validators.compose([Validators.required])],
      'locale': ['', Validators.compose([Validators.required])],
      'startingnumber': [''],
      'supportemail': ['', BasicValidators.email],
      'supportnumber': [, ValidMobileNumberValidator.onlyvalidmobilenumber],
      'starttime': ['', Validators.required],
      'endtime': ['', Validators.required],
      'iswalletenable': [],
      'isqrenable': [],
      'iswebqrenable': [],
      'endday' : ['']
    });

    
    this.brform = this.fb.group({
      'title': ['', Validators.required],
      'days': [''],
      'starttime': ['', Validators.required],
      'endtime': ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      this.initImageUpload();
      await super.ngOnInit();
      if (!this.bindId) {
        this.bindId = this._authService.auth_user.branchid._id;
      }

      if (this._loginUserRole != undefined && this._loginUserRole.permissions != undefined) {
        if (this._loginUserRole.permissions.length > 0) {
          this._loginUserRole.permissions.forEach(element => {
            if (element.formname != undefined && element.formname == 'branch') {
              if (element.recordpermission != undefined) {
                element.recordpermission.forEach(ele => {
                  if (ele.type != undefined && ele.type == 'edit') {
                    if (ele.datapermission == 'My Branch' || ele.datapermission == 'All') {
                      this.editPermission = true;
                    }
                  }
                });
              }
            }
          });
        }
      }
      await this.getBranchDetails();
      this.isLoading = false;
      this.visible = true;
    } catch (e) {
      this.isLoading = false;
    }
  }

  initImageUpload() {

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
      form.append('upload_preset', auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = fileItem => {
      $('#upload_status').show();
      this.response = fileItem;
      if (fileItem) {
        if (fileItem.status == 200) {
          this.defaultlogo = fileItem.data.secure_url;
          setTimeout(() => {
            $('#upload_status').hide();
          }, 1000);
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

  async getBranchDetails() {
 
    this.country_fields.visibility = false;
    this.timezone_fields.visibility = false;
    this.currency_fields.visibility = false;
    this.locale_fields.visibility = false;
    
   
    await this._branchesService
      .GetByIdAsync(this.bindId)
      .then((data: any) => {
        if (data) {
          console.log("data", data)
          this._branchModel = data;
          this._propertyobjectModel = data.property;
          this.form.controls['branchname'].setValue(data.branchname);
          this.form.controls['vatnumber'].setValue(data.vatnumber);
          this.form.controls['companyphone'].setValue(data.companyphone);
          this.form.controls['contactperson'].setValue(data.contactperson);
          this.form.controls['address'].setValue(data.address);
          this.form.controls['postcode'].setValue(data.postcode);
          this.form.controls['city'].setValue(data.city);
          this.form.controls['startingnumber'].setValue(data.startingnumber);
          this.form.controls['supportemail'].setValue(data.supportemail);
          this.form.controls['supportnumber'].setValue(data.supportnumber);
          this.form.controls['iswalletenable'].setValue(data.iswalletenable);
          this.form.controls['isqrenable'].setValue(data.isqrenable);
          this.form.controls['iswebqrenable'].setValue(data.iswebqrenable);
          this.form.controls['endday'].setValue(data.weekenddays)
          this.qrcode = data.qrcode;
          this.webqrcode = data.webqrcode;
          
          this.defaultlogo = data.branchlogo;
          

          if (data.currency) {
            this.currency_fields.dbvalue = data.currency;
          }
          if (data.locale) {
            this.locale_fields.dbvalue = data.locale;
          }
          if (data.country) {
            this.country_fields.dbvalue = data.country;
          }
          if (data.timezone) {
            this.timezone_fields.dbvalue = data.timezone;
          }
          this.country_fields.visibility = true;
          this.timezone_fields.visibility = true;
          this.currency_fields.visibility = true;
          this.locale_fields.visibility = true;

          this.breakList = [];
          if(data.breaktime.length > 0) {
            this.breakList = data.breaktime;
          }

          if (data.workinghours) {
            this.form.controls['starttime'].setValue(data.workinghours.starttime);
            this.form.controls['endtime'].setValue(data.workinghours.endtime);
            if (data.workinghours.days && data.workinghours.days.length !== 0) {
              data.workinghours.days.forEach(day => {
                var fond = this.wdoptions.find(a => a.value === day);
                fond.checked = false;
                if (fond) {
                  fond.checked = true;
                }
              });
            }

            if (data.walletsetting != undefined) {
              let tmpWsetting: any = data.walletsetting;
              if (tmpWsetting.paymentType != undefined) {
                this.walletsetting.paymentType = tmpWsetting.paymentType;
              }
              if (tmpWsetting.language != undefined) {
                this.walletsetting.language = tmpWsetting.language;
              }
              if (tmpWsetting.iswalletotpenable != undefined) {
                this.walletsetting.iswalletotpenable = tmpWsetting.iswalletotpenable;
              }
              if (tmpWsetting.walletsymbol != undefined) {
                this.walletsetting.walletsymbol = tmpWsetting.walletsymbol;
              }
              if (tmpWsetting.walletAuthEmailId != undefined) {
                this.walletsetting.walletAuthEmailId = tmpWsetting.walletAuthEmailId;
              }
            }
          }
        }  

      }).catch((error) => {
        console.error(error);
      });
  }

  printBtn(id : string){
    let printContents, popupWin;
    printContents = document.getElementById(id).innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title></title>
            <style type="text/css">
                @page {`+ this.defaultpagesizesetting + `


                }

           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
              }
              * {
                box-sizing: border-box;
              }
              .print-page {
                  font-family: poppins, arial;
                  font-size: 13px;
                  color: #000000;
                  background: #ffffff;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .text-left {
                text-align: left;
              }

              .align-top {
                vertical-align: top;
              }
             .print-company {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
             }
             .print-text {
                font-family: poppins, arial;
                font-size: 13px;
                color: #000000;
                line-height: 1.24;
             }

             .table-print-head-row {
                  height:34px;
             }

            .printqrcode {
              width: 700px; 
              text-align:center;          
              
            }


              }
            </style>
          </head>
          <body onload="window.print();window.close()">${printContents}</body>
        </html>`
    );
    popupWin.document.close();
  }


  onSubmit(value: any, valid: boolean) {
    
    if (this.bindId && !this.editPermission) {
      super.noeditpermissionMsg("edit");
      return;
    }
    this.isSubmitted = true;
    
    if (!valid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    }
    
    var valproperty = value.property;
    this._branchModel = value;
    this._branchModel.property = this._propertyobjectModel ? this._propertyobjectModel : {};
    for (const key in valproperty) {
      if(!this._branchModel.property[key]){
        this._branchModel.property[key] = '';
      }
      this._branchModel.property[key] = valproperty && valproperty[key] && valproperty[key]["autocomplete_id"] ? valproperty[key]["autocomplete_id"] : valproperty[key];
    }
    this._branchModel.qrcode = "";
    this._branchModel.webqrcode = "";

    if(value.isqrenable){
      this._branchModel.qrcode = this.qrcode;
    }


    if(value.iswebqrenable){
      this._branchModel.webqrcode = this.webqrcode;
    }
    this._branchModel.country = value.country.autocomplete_id;
    this._branchModel.currency = value.currency.autocomplete_id;
    this._branchModel.timezone = value.timezone.autocomplete_id;
    this._branchModel.locale = value.locale.autocomplete_id;
    this._branchModel.branchlogo = this.defaultlogo ? this.defaultlogo : this.orglogo;
    this._branchModel.workinghours = {};
    this._branchModel.workinghours.starttime = value.starttime;
    this._branchModel.workinghours.endtime = value.endtime;
    this._branchModel.workinghours.days = this.wdoptions.filter(d => d.checked == true).map(a => a.value);
    this._branchModel.breaktime = this.breakList;

    // console.log("this._branchModel", this._branchModel);

    if (this.bindId) {
      this._branchModel.walletsetting = this.walletsetting;
      this.btnDisable = true;      
      this._branchesService
        .Update(this.bindId, this._branchModel)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {          
            var localStoragetmp = JSON.parse(localStorage.getItem('currentUser'));
            var loginUser = localStoragetmp['user'];
            loginUser['branchid'] = data;
            localStoragetmp['user'] = loginUser;
            localStorage.removeItem('currentUser');
            localStorage.setItem('currentUser',JSON.stringify(localStoragetmp))

            this.showNotification('top', 'right', 'Setting updated successfully!!!', 'success');
            this.btnDisable = false;
          }
        }, data => {
          if (data.status == 500) {
            this.showNotification('top', 'right', 'Server error, Cannot update details.', 'danger');
            this.btnDisable = false;
          }
      });
    } else {
      this.showNotification('top', 'right', 'No branch for this user. Please assign branch', 'danger');
    }
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

  focusFunction(event: any) {
    if (event == "starttime") {
      this.targetstarttime.nativeElement.click();
    } else {
      this.targetendtime.nativeElement.click();
    }
  }

  setAllDays(checked: boolean){
    this.wdoptions.map(a => a.checked = checked);
  }
  
  isAllSelected(){
    return this.wdoptions.filter(a => a.checked == true).length == 7;
  }

  updatimg() {
    this._authService.updData.emit('img');
  } 

  generateQR(e: any) { // here e is a boolean, true if checked, otherwise false
    if (e) {
      var postData = {
        branch: { branchid: this._branchModel._id, branchname: this._branchModel.branchname }
      }
      this._branchesService
        .qrcode(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.qrcode = null;
          if (data) {
            this.qrcode = data;
          }
        })
    } else {
      this.qrcode = null;
    }
  }

  generateWebQR(e: any) { // here e is a boolean, true if checked, otherwise false
    if (e) {

      var postData = {};
      postData['url'] = this._configuration.Server + `/user-checkin`;
      
      this._branchesService
        .webqrcode(postData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.webqrcode = null;
          if (data) {
            this.webqrcode = data;
          }
        })
    } else {
      this.webqrcode = null;
    }
  }


  onRemoveBreak(i: number) {
    this.breakList.splice(i, 1);
    let dataSource = this.breakList;
    let cloned = dataSource.slice();
    this.breakList = cloned;
  }


  onSubmitBreak(value : any , valid : boolean){
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

  setTimers(time : string){
    return { hhmm : time , hh :parseInt(time.substring(0,2)) , mm : parseInt(time.substring(3,5)) };
  }



  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  LoadData() { }
  Save() { }
  Update() { }
  ActionCall() { }
  Delete() { }




}
