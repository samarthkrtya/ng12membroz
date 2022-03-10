
import { Component, OnInit, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SchemasService } from '../../core/services/schemas/schemas.service';
import { CommonDataService } from '../../core/services/common/common-data.service';
import { PendingChangesGuard } from '../../core/services/common/pendingchanges-guard.service';

import { FormsService } from '../../core/services/forms/forms.service';
import { FormsModel } from '../../core/models/forms/forms.model';

import { ImportService } from '../../core/services/import/import.service';
import { ImportModel } from '../../core/models/import/import.model';

import { BaseComponemntInterface, BaseComponemntComponent } from '../../shared/base-componemnt/base-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html'
})
export class ImportComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit {

  formsModel = new FormsModel();
  _importModel = new ImportModel();
  isdirty = false;

  _defaultTabName: any;

  currentTab: number;
  total_steps: any;
  tabWidth: any;

  _tabLists: any[] = [];

  param: any;
  queryParams: any;

  schemaname: any;
  formname: any;
  fieldLists: any [] = [];
  importFields: any [] = [];
  mappingFields: any [] = [];
  importdatas: any [] = [];
  isLoading: boolean;
  importUrl: any;

  dispalyformname: any;

  reviwedData: any [] = [];
  postDataForImportCheckAndSubmit: any = {};

  isFilterListing: boolean = false;

  returnUrl: any;
  original_filename: any;
  selectedFileExtension: any
  sampleCsvPath: any;
  finalImportedDataLists: any [] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _route: ActivatedRoute,
    private _schemasService: SchemasService,
    private _importService: ImportService,
    private _commonDataService: CommonDataService,
  ) {  
     
    super();

    
    this.pagename = "import";

    this._route.params.forEach((params) => {
      this.param = params['param'];
      this._formId = params["id"];
    })

    this._route.queryParams.subscribe(qryparams => {

      this.queryParams = qryparams;
      console.log("qryparams", qryparams);

    })

    if(this._commonDataService.isfilterDataForDynamicPages) {
      if(this._commonDataService.filterDataForDynamicPagesparams) {
        this.isFilterListing = true;
        this._commonDataService.isfilterDataForDynamicPages = false;
      }
    }
  }

  async ngOnInit() {

    
    
    await super.ngOnInit();
    try {
      await this.LoadData();
    } catch(error) {
      console.error(error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async LoadData() {
    try {
      await this.initializeVariables();
      await this.getFormDetailsById(this._formId);
      await this.initTab();
    } catch(error) {
      console.error(error)
    } finally {
      
    }
  }

  Save() {}
  Update() {}
  Delete() {}
  ActionCall() {}

  async initializeVariables() {
    
    this._tabLists = [];
    this._defaultTabName = "";
    this.sampleCsvPath = "";
    this.formname = "";
    this.schemaname = "";
    this.dispalyformname = "";
    this.returnUrl = "";
    this.total_steps = 0;
    this.tabWidth = 0;
    this.importUrl = "";
    this.importFields = [];
    this.original_filename = "";
    this.selectedFileExtension = "";
    this.fieldLists = [];
    this.importdatas = [];
    this.mappingFields = [];
    this.postDataForImportCheckAndSubmit = {};
    this.reviwedData = [];
    this.finalImportedDataLists = [];

    return;
  }

  async getFormDetailsById(id: any) {

    return this._formsService
      .GetByIdAsync(id)
      .then((data: any)=>{
        if(data){
          
          this.formsModel = data;

          this.sampleCsvPath = this.formsModel.sampleCsvPath;
          this.formname = this.formsModel.formname;
          this.schemaname = this.formsModel.schemaname;
          this.dispalyformname = this.formsModel.dispalyformname;

          if(this.isFilterListing) {
            this.returnUrl = this._commonDataService.filterDataForDynamicPagesparams['returnURl']; 
          } else {
            this.returnUrl = '/pages/dynamic-list/list/' + this.formname;
          }
          
          return;
        }
    });
  }

  async initTab() {

    this._tabLists.push({tabname: "Upload Files", class: "disable"});
    this._tabLists.push({tabname: "Preview", class: "disable"});
    this._tabLists.push({tabname: "Mapping", class: "disable"});
    this._tabLists.push({tabname: "Confirm Import", class: "disable"});
    this._tabLists.push({tabname: "Submit Data", class: "disable"});

    this._defaultTabName = this._tabLists[0]['tabname'];

    this.total_steps = this._tabLists.length;
    this.tabWidth = 100 / this.total_steps;

    setTimeout(() => {
      this.onTabClick(1, this._defaultTabName);
    }, 500);
    return;
  }

  @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
      return !this.isdirty;
  }

  async onTabClick(current: any, button_text: any) {

    $('#tab_'+current).removeClass( "disabled-cls" );

    this._defaultTabName = button_text;
    this.currentTab = current;

    $('.wizard-card').find('li').css('width', this.tabWidth + '%');

      let move_distance;
      let wizard = $('.wizard-card').width();
      let step_width;

      setTimeout(function(){
          $('.moving-tab').text(button_text);
      }, 150);


      move_distance = wizard / this.total_steps;
      step_width = move_distance;
      move_distance *= current- 1;

      if(current == 1){
        move_distance = -8;
      } else if(current == this.total_steps){
        move_distance += 8;
      }

      $('.moving-tab').css('width', step_width);
      $('.moving-tab').css({
        'transform':'translate3d(' + move_distance + 'px, 0, 0)',
        'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
      });
      let cnt=1;
      this._tabLists.forEach(element => {
        if (cnt != current) {
          $('#'+cnt).hide();
        } else {
          $('#'+cnt).show();
        }
          cnt++;
      });
      document.querySelector('.main-panel').scrollTop = 0;
      return;
  }

  getSubmittedData(submit_data: any) {
    this.importUrl = submit_data.url;
    this.importFields = submit_data.data.heading;
    this.getFormFields(submit_data.data.fields)
    this.original_filename = submit_data.original_filename;
    this.selectedFileExtension = submit_data.selectedFileExtension;
    this.onTabClick(2, "Preview");
  }

  getFormFields(fields: any) {

    this.fieldLists = [];
    if(fields && fields.length !== 0) {
      fields.forEach(element => {
        let obj = { fieldname: "", datafield: element.fieldname, datatype: element.fieldtype, mandatory: element.isMandatory, displaytext: element.displaytext }
        this.fieldLists.push(obj);
      });
    }
  }

  getImportSubmittedData(submit_data: any) {
    this.importdatas = submit_data;
    this.onTabClick(3, "Mapping");
  }

  removeSubmittedData(submit_data: any) {
    this.LoadData();
  }

  getmappingSubmittedData(submit_data: any) {

    this.mappingFields = [];
    this.mappingFields = submit_data;

    this.postDataForImportCheckAndSubmit = {};
    this.postDataForImportCheckAndSubmit['filename'] = this.importUrl;
    this.postDataForImportCheckAndSubmit['schemaname'] = this.schemaname;
    this.postDataForImportCheckAndSubmit['mapping'] = this.mappingFields;

    this._importService
      .checkExcel(this.postDataForImportCheckAndSubmit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any)=>{
        if(data) {
          this.reviwedData = [];
          this.reviwedData = data;
          this.onTabClick(4, "Review Fields");
        }
    },(err) =>{
      console.error("err", err);
    });

  }

  getReviewSubmittedData(submit_data: any) {

    if(!(Object.keys(this.queryParams).length === 0 && this.queryParams.constructor === Object)) {
      this.postDataForImportCheckAndSubmit["rootfield"] = this.queryParams;
    } 
    
    this._importService
      .importExcel(this.postDataForImportCheckAndSubmit)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any)=>{
        if(data) {
          this.finalImportedDataLists = [];
          this.finalImportedDataLists = data;

          if(this.isFilterListing) {
            this.showNotification('top', 'right', ' Import has been successfully done!!', 'success');
            this._commonDataService.isfilterDataForDynamicPages = true;
            this._router.navigate([ this._commonDataService.filterDataForDynamicPagesparams['returnURl']]); 
          } else {
            this.showNotification('top', 'right', ' Import has been successfully done!!', 'success');
            this.onTabClick(5, "Submit Data");
          }
        }
    }, (err) =>{
      console.error("err", err);
    });
  }

}
