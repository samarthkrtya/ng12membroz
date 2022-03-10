import { Component, OnInit, ViewChild, ChangeDetectorRef  } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


import { MemberService } from '../../core/services/member/member.service';

import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

import { BaseComponemntComponent } from '../../shared/base-componemnt/base-componemnt.component';

import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import * as Chartist from 'chartist';
import { IPieChartOptions } from "chartist";
import { IResponsiveOptionTuple } from "chartist";

export interface StateGroup {
  letter: string;
  names: string[];
  population: string;
  flag: string;
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().includes(filterValue));
};


declare const $: any;


@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent extends BaseComponemntComponent implements OnInit{

  toppings = new FormControl();
  autocompletemyControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  
  memberLists: any [] = [];
  isLoading: boolean = false;
  contentLoading: boolean = false;
  selecteMember: any = {};
  pageSize = 10;
  currentPage: number = 1;

  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";




  form_fields = {
    "fieldname" : "vendor", 
    "fieldtype" : "form", 
    
    

    "search": [
      {"searchfield": "status", "searchvalue": "active", "criteria": "eq"},
      //{"searchfield": "type", "searchvalue": "product", "criteria": "eq"}
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "itemname", "value": 1 },
      { "fieldname": "sale", "value": 1 },
      { "fieldname": "purchase", "value": 1 },
      { "fieldname": "status", "value": 1 },
      { "fieldname": "stock", "value": 1 },
      { "fieldname": "offertype", "value": 1 },
      { "fieldname": "type", "value": 1 }
    ],

    // "fieldfilter" : "status", 
    // "fieldfiltervalue" : "active", 
    "form": {
      "apiurl" : "vendors/filter", 
      "method" : "POST", 
      "formfield" : "_id", 
      "displayvalue" : "fullname",
    },

    
    "modelValue": "vendor",
    "value": "",
    "template": "<div class='row'><label class='col-sm-2 col-form-label'> Name: </label><div class='col-sm-10'><div class='form-group'><p class='form-control-static'>{{fullname}}</p></div></div></div>",
    "dbvalue": {
      "_id": "5fa6190246a0e17f417dc8c5",
      "status": "active",
      "fullname": "All Parts Service",
      "branchid": "5eb4e4164df5b8f44508cbcc",
      "property": {
        "address": "Surat",
        "contact_number": "9632587410",
        "email": "test@gmal.com",
        "fullname": "All Parts Service"
      },
      "createdAt": "2020-11-07T03:48:18.009Z",
      "updatedAt": "2020-11-07T03:48:18.009Z",
      "updatedby": "5eb4e4164df5b8f44508cbce",
      "addedby": "5eb4e4164df5b8f44508cbce",
      "autocomplete_id": "5fa6190246a0e17f417dc8c5",
      "autocomplete_displayname": "All Parts Service"
    }
  }

  lookup_fields = {
    "fieldname" : "vendor", 
    "fieldtype" : "lookup",
    "search": [
      {"searchfield": "status", "searchvalue": "active", "criteria": "eq"},
      {"searchfield": "_id", "searchvalue": "59e5e35bbd4e4bb2fbc3df75", "criteria": "eq"}
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "data", "value": 1 },
    ],
    //"inbuildlookupField" : "59e5e35bbd4e4bb2fbc3df75",
    "modelValue": "vendor",
    "value": ""
  }

  formdata_fields = {
    "fieldname" : "vendor", 
    "fieldtype" : "formdata",
    
    "form": {
      "formfield" : "_id", 
      "displayvalue" : "property.title",
    },
    "search": [
      {"searchfield": "status", "searchvalue": "active", "criteria": "eq"},
      //{"searchfield": "formid", "searchvalue": "5e43ea81d466f115b0fbf1ce", criteria: "eq"}
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "property.title", "value": 1 },
      { "fieldname": "property.noofflat", "value": 1 },
    ],
    "modelValue": "vendor",
    // "fieldfilter" : "formid", 
    // "fieldfiltervalue" : "5e43ea81d466f115b0fbf1ce", 
    "value": "",
    "template": "<div class='row'><label class='col-sm-2 col-form-label'> Name: </label><div class='col-sm-10'><div class='form-group'><p class='form-control-static'>{{name}}</p></div></div></div>"
  }
    
  profileForm: FormGroup;
  submitted: boolean;
  previewBtn: boolean = true;


  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      { name: "quote", class: "quote" },
      { name: 'redText', class: 'redText'},
      { name: "titleText", class: "titleText", tag: "h1"},
    ]
  };

  uploader: FileUploader;
  response: any[] = [];
  private title: string;
  customeUploader: any[] = [];
  formImageArray: any[] = [];
  selectedFileExtension: any;


  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimeGridDay',
    weekends: false,
    resources: [
      { id: 'a', title: 'Room A' },
      { id: 'b', title: 'Room B'},
      { id: 'c', title: 'Room C' },
      { id: 'd', title: 'Room D' }
    ],
    hiddenDays: [ 1, 3, 5 ], // hide Mondays, Wednesdays, and Fridays
    events: 'https://fullcalendar.io/demo-events.json?with-resources=4&single-day',
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    height: 1000,
  };

  currentRate = 3;




  stateForm: FormGroup = this._formBuilder.group({
    stateGroup: '',
  });

  stateGroups: StateGroup[] = [
    {
      letter: 'A',
      names: ['Alabama', 'Alaska', 'Arizona', 'Arkansas'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      letter: 'C',
      names: ['California', 'Colorado', 'Connecticut'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      letter: 'D',
      names: ['Delaware'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      letter: 'F',
      names: ['Florida'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
    {
      letter: 'G',
      names: ['Georgia'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      letter: 'H',
      names: ['Hawaii'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      letter: 'I',
      names: ['Idaho', 'Illinois', 'Indiana', 'Iowa'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      letter: 'K',
      names: ['Kansas', 'Kentucky'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
    {
      letter: 'L',
      names: ['Louisiana'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      letter: 'M',
      names: [
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
      ],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      letter: 'N',
      names: [
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
      ],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      letter: 'O',
      names: ['Ohio', 'Oklahoma', 'Oregon'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
    {
      letter: 'P',
      names: ['Pennsylvania'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      letter: 'R',
      names: ['Rhode Island'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      letter: 'S',
      names: ['South Carolina', 'South Dakota'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
    {
      letter: 'T',
      names: ['Tennessee', 'Texas'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
    },
    {
      letter: 'U',
      names: ['Utah'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
    },
    {
      letter: 'V',
      names: ['Vermont', 'Virginia'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
    },
    {
      letter: 'W',
      names: ['Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
      population: '2.978M',
      flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
    },
  ];

  stateGroupOptions: Observable<StateGroup[]>

  constructor(
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _memberService: MemberService,
    private cloudinary: Cloudinary,
    private cdRef:ChangeDetectorRef,
    private _formBuilder: FormBuilder
  ) {
      super();
  }

  async ngOnInit(){

    this.filteredOptions = this.autocompletemyControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    
    super.ngOnInit();

    this.memberLists = [];
    this.getMember();
    this.imageConfigration();
    this.loadChart();
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      vendor: ['', Validators.required],
    });


    this.stateGroupOptions = this.stateForm.get('stateGroup')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroup(value)),
    );

  }


  loadChart() {
    // new Chartist.Bar('.ct-chart', {
    //   labels: ['Current week', 'Previous week', '2nd week', '3rd week'],
    //   // labels: [42, 43, 44, 45],
    //   series: [ 10, 60, 30, 55],
    // }, {
    //   distributeSeries: true,
    //     axisX : {  showGrid : false },
    //     // height : '300px'
    // });

    var data = {
      labels:  [
        "Monthly Membership (3578500)",
        "Quarterly Buddy Package (2346000)",
        "Quarterly Pre-Postnatal (108282)",
        "Bi-Annual Pre-Postnatal (0)",
        "BI-Annual Buddy Package (1854000)",
        "BI-Annual  (1244000)",
        "Annual (2951000)",
        "Quarterly Membership (1005000)",
        "Annual buddy membership (1245000)"
    ],
      series: [
        90,
        23,
        2,
        2,
        19,
        11,
        28,
        13,
        13
    ]
    };
    
    var options : IPieChartOptions = {
      height : 500,
      width  : 500,
      labelInterpolationFnc: function(value) {
        return value
      }
      
    };
     
    
    
    new Chartist.Pie('.ct-chart', data, options);
  }

  ngAfterViewChecked(){
    this.cdRef.detectChanges();
  }

  private _filterGroup(value: string): StateGroup[] {
    if (value) {
      return this.stateGroups
        .map(group => ({letter: group.letter, names: _filter(group.names, value), population: group.population, flag: group.flag}))
        .filter(group => group.names.length > 0);
    }

    return this.stateGroups;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  imageConfigration() {
  
    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;
    
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [{ name: 'X-Requested-With', value: 'XMLHttpRequest' }]
    };

    this.uploader = new FileUploader(uploaderOptions);

    this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };

    const upsertResponse = fileItem => {
      $(".loading").show();
      this.response = fileItem;
      if (fileItem) {
        if (fileItem.status == 200) {
          if (!this.formImageArray) {
            this.formImageArray = [];
          }

          let extension: any;
          if (fileItem.file) {
            extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
          }
          let fileInfo = {
            attachment: fileItem.data.secure_url,
            extension: extension
          };
          this.formImageArray.push(fileInfo);
          $(".loading").hide();
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

      // let fieldname = element.fieldname;
      // this.customeUploader[fieldname] = new FileUploader(uploaderOptions);

      // this.customeUploader[fieldname].onBuildItemForm = (fileItem: any, form: FormData): any => {
      //   form.append('upload_preset',  auth_upload_preset);
      //   let tags = element.fieldname;

      //   if (this.title) {
      //     form.append('context', `photo=${element.fieldname}`);
      //     tags = element.fieldname;
      //   }
      //   form.append('tags', tags);
      //   form.append('file', fileItem);

      //   fileItem.withCredentials = false;
      //   return { fileItem, form };
      // };

      // const upsertResponse = fileItem => {

      //   $(".loading").show();

      //   if (fileItem && fileItem.status == 200) {

      //     let fieldnameTags = fileItem.data.tags[0];

      //     if (!this.formImageArray[fieldnameTags]) {
      //       this.formImageArray[fieldnameTags] = [];
      //     }

      //     if (!element.value) {
      //       element.value = "";
      //     }

      //     let extension: any;
      //     if (fileItem.file) {
      //       extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
      //     }

      //     let fileInfo = {
      //       attachment: fileItem.data.secure_url,
      //       extension: extension
      //     };

      //     this.formImageArray[fieldnameTags].push(fileInfo);
      //     element.value = fileItem.data.secure_url;
      //     $(".loading_").hide();

      //   }

      // };

      // this.customeUploader[fieldname].onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => upsertResponse({ file: item.file, status, data: JSON.parse(response) });
      // this.customeUploader[fieldname].onProgressItem = (fileItem: any, progress: any) => upsertResponse({ file: fileItem.file, progress});
  }

  get f() { return this.profileForm.controls; }

  getMember() {
    
    this.contentLoading = true;

    let postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["pageNo"] = this.currentPage;
    postData["size"] = this.pageSize;

    this._memberService
      .getbyfilter(postData)
      .subscribe((data: any)=>{
        if(data) {
          data.forEach(element => {
            this.memberLists.push(element);
          });
          this.contentLoading = false;
        }
    })
  }

  memberClick(item: any) {

    this.selecteMember = {};

    if(item._id) {
      this.isLoading = true;
      let postData = {};
      postData["search"] = [];
      postData["search"].push( { "searchfield": "_id", "searchvalue": item._id, "criteria": "eq", "datatype": "ObjectId" });
      this._memberService
        .getbyfilterview(postData)
        .subscribe((data: any)=>{
          if(data) {
            this.selecteMember = data[0];
            this.isLoading = false;
          }
      })
    } 
  }

  loadMore(pageNumber: number): void {
    this.currentPage = Math.ceil(pageNumber);
    this.getMember();
  }

  onItemAdded(itemToBeAdded: any) {
    
  }

  
  public onClickprint(): void {
    let printContents, popupWin;
    printContents = document.getElementById('printid').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
        <html>
          <head>
            <title></title>
            <style type="text/css">               

                @page {
                  size:auto;
                  margin: 15pt 15pt 15pt;	
               }

           @media print {
              body {
                margin: 0;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
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
             .print-text-sm {
              font-family: poppins, arial;
              font-size: 10px;
              color: #000000;
              line-height: 1.2;
           }
             .print-head-md {
              font-family: poppins, arial;
              font-size: 16px;
              color: #000000;
              font-weight: bold;              
            }

            .print-head-sm {
              font-family: poppins, arial;
              font-size: 14px;
              color: #000000;
              font-weight: bold;
            }
             address {
                font-style: normal;
                line-height: inherit;

            }


             .print-page-item-head {
                font-family: poppins, arial;
                font-size: 31px;
                font-weight: 500;
                color: #000000;
                line-height: 1.24;
             }
             .print-item-number {
                font-family: poppins, arial;
                font-size: 16px;
                color: #000000;
                font-weight: bold;
                text-transform: uppercase;
            }

            .table-print-head-row {
                 height:34px;
            }
            .table-print-head {
              color: #ffffff;
              font-size: 13px;
              background-color: #393837;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;

            }

            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
            }

            @supports (-ms-ime-align:auto) {
              .table-print-head {
                color: #393837;
                font-size: 13px;
                background-color: #ffffff;
                border-top:1px solid #aaaaaa;
                border-bottom:1px solid #aaaaaa;
                font-weight: bold;

              }
          }

          .text-break {
            word-break: break-word !important;
            word-wrap: break-word !important;
         }

         .print-table-td {
          color: #000000;
          font-size: 13px;
         }

         .break-row-after {
          page-break-after: auto;
          }
          .break-row-inside {
              page-break-inside: avoid;
          }

          .align-middle {
            vertical-align: middle;
          }

          .d-none {
            display:none;
          }

          .d-block {
              display: block;
          }


          .row {
              display: flex;
              flex-wrap: wrap;
          }

          .col-7 {
              flex: 0 0 58.3333333333%;
              max-width: 58.3333333333%;
          }
          .col-5 {
              flex: 0 0 41.6666666667%;
              max-width: 41.6666666667%;
          }


          .table-bordered {
              border: 1px solid #dee2e6;
          }


              }
            </style>
          </head>
          <body onload="window.print();window.close()">${printContents}</body>
        </html>`
    );
    popupWin.document.close();
  }


  onSubmit(value: any, isValid: boolean) {

    this.submitted = true;
      
    if (!isValid) {
      return false;
    } else {
      // TODO: Use EventEmitter with form value
      console.warn(this.profileForm.value);
      
    }
  }

  Submit() {
    
  }

  removeImg(url: any) {
    for (const key in this.formImageArray) {
      this.formImageArray[key].forEach(element => {
        if (element == url) {
          this.formImageArray[key].splice(element, 1);
        }
      });
    }
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  // document module
  // all calendar modules 
}