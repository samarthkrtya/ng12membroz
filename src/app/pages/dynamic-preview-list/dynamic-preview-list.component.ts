import { ChangeDetectorRef, Component, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

import { BaseComponemntComponent } from '../../shared/base-componemnt/base-componemnt.component';
import { SubjectsService } from '../../core/services/common/subjects.service';

declare var $: any;
@Component({
  selector: 'app-dynamic-preview-list',
  templateUrl: './dynamic-preview-list.component.html',
  styleUrls: ['./dynamic-preview-list.css']
})

export class DynamicPreviewListComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  
  defaultpagesizesetting: string = "size: A4 portrait;margin: 30pt 30pt 30pt 45pt;";

  dataHtml: string;
  dataContent: any;
  postSearch: any;
  roletype: string = '';

  contentVisibility : boolean = false;

  itemVisbility: boolean = false;
  previewform: FormGroup;
  isDisable: boolean = false;
  temptype: any;
  selectedtemplate: any;
  template = [];

  communicationList : any[] = [];

  tableContent : {};
  tableLoading : boolean = false;

  isBranchwise : boolean = false;

  viewmode : boolean = false;
  displayThrml : boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public fb: FormBuilder,
    private _subjectsService: SubjectsService,
  ) {
    super();
    this._route.params.forEach((params) => {
      this._formName = params["formname"];
      this.bindId = params["id"];
      this.pagename = 'dynamic-preview-list';
      this.itemVisbility = false;
      this.contentVisibility = false;
      
    });

    if (this._formName) {
      this.templatedata(this._formName);
    }

    this.previewform = this.fb.group({
      'header': [''],
      'footer': ['']

    })

    if (this._authService.currentUser != undefined && this._authService.currentUser.role != undefined) {
      this.roletype = this._authService.currentUser.roletype;
    }
  }

  async ngOnInit() {

    // console.log("ngOnInit", this.bindId);

    this._route.params.forEach(async (params) => {

      this.formObj = {};

      await super.ngOnInit();
      await this.LoadDatas();

      this.isBranchwise = false;
      if(this._organizationsetting.databasetype && this._organizationsetting.databasetype == "branchwise"){
        this.isBranchwise = true;
      }

      this._subjectsService
        .behavioursubjectsArray
          .subscribe((data)=>{
            this.communicationList = [];
            if(data && data.length > 0){
              this.communicationList = data;
            }
          });
    });
  }

  async LoadDatas(){ 
    this.contentVisibility = false;
    this.viewmode = false;
    await this.getData();
    await this.generateHTMLById(); 
    this.contentVisibility = true;
  }

  async getData() {


    var url = `${this.formObj.schemaname}/filter`;
    var method = "POST";
    let postData = {};
    postData['formname'] = this.formObj.formname;
    postData['search'] = [];
    postData['search'].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        console.log("data",data);
        if(data) {
          this.dataContent = {};
          this.dataContent = data[0];
          this.itemVisbility = true;
        }
      }, (error: any) => {
        console.error("error", error);
      });
  }

  public selectItem(selectedItem: any) {
    this._router.navigate([`/pages/dynamic-preview-list/${this._formName}/${selectedItem._id}`]);
    setTimeout(() => {
      this.generateHTMLById();
    },0);
  }

  
  async generateHTMLById() {
    
    var postData = {
      formname: this.formObj.formname,
      schemaname: this.formObj.schemaname,
      preview: this.viewmode ? 'small' : null ,
    }
    this.tableLoading = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(`common/generatehtml`, "POST", postData,this.bindId)
      .then((data: any) => {
        if(data && data.content) {
          this.tableContent = {};
          this.tableContent = data.content;
          this.displayThrml = data.thermal;
          this.tableLoading = false;
        }
      }).catch((e)=>{
        this.tableLoading = false;
      });
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

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this._subjectsService.behavioursubjectsArray.next(null);
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.LoadDatas();
  }


  templatedata(type: any) {
    
    var url = "templates/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "templatetype", "searchvalue": type, "criteria": "eq", "datatype": "text" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.selectedtemplate = [];
          this.selectedtemplate = data[0];
          this.previewform.get("header").setValue(this.selectedtemplate.template.header);
          this.previewform.get("footer").setValue(this.selectedtemplate.template.footer);
        }
      })
  }
 

 onSendRf(obj : any , modal : string){
    
    let mtype:String =  obj.messagetype
    let postData = {};
    postData['id'] = this.bindId;
    postData['schemaname'] = this.formObj.schemaname;
    postData['action'] = {};
    postData['action'][mtype.toLowerCase()] = [ obj._id ];
     
    var url = "common/kickoffworkflow";
    var method = "POST";
    this.isDisable = true;
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          $(`#${modal}`).click();
          this.isDisable = false;
          this.showNotification('top', 'right', 'Send successfully !!', 'success');
        }
        // $("#myModal").modal('hide');
      }).catch((e)=>{
        console.log("e",e);
        this.isDisable = false;
        this.showNotification('top', 'right', 'Something went wrong !!', 'success');
      });
 }
 


  onSubmit(value: any) {

    this.isDisable = true;
    let postData = {
      template: {
        header: this.previewform.get("header").value,
        footer: this.previewform.get("footer").value
      }
    }

    var url = "templates/" + this.selectedtemplate._id;
    var method = "PATCH";

    this._commonService.commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {
          this.isDisable = false;
          this.showNotification('top', 'right', 'Templates detail updated successfully!!!', 'success');
        }
        this.previewform.reset();
        $("#myModal").modal('hide');
        window.location.reload();
      })
  }

}



@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value: any) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
