import { Component, OnInit, ViewChild, Input, Output, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { DynamicSubListComponent } from '../../../../../shared/dynamic-sublist/dynamic-sublist.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'
import { CommonService } from '../../../../../core/services/common/common.service';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';

import { DomSanitizer } from '@angular/platform-browser';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-form-document',
  templateUrl: './form-document.component.html'
})
export class FormDocumentComponent extends BaseLiteComponemntComponent implements OnInit  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = [];

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;

  @Input() formsData: any;
  @Output() formsubmitData: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  constructor(
    public sanitizer: DomSanitizer,
    private _commonService: CommonService,
    private ref: ChangeDetectorRef
  ) {
    super()
  }

  async ngOnInit() {
    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.loadData()
    } catch (error) {
      console.error(error)
    } finally {

    }
  }

  shareddoc: boolean = true
  selectedUsers: any[] = [];
  selectedFormdata: any = {};
  selectedForm: any = {};
  sharedVisibility: boolean;
  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;

  openModel(value: any) {
    this.sharedVisibility = false;
    this.selectedForm = value;
    this.selectedFormdata = Array.isArray(value.shared) ? value : value.sharedforms[0] && value.sharedforms.length > 0 ? value.sharedforms[0] : undefined;
    this.selectedUsers = Array.isArray(value.shared) ? value.shared : value.sharedforms[0] && value.sharedforms.length > 0 ? value.sharedforms[0].property.shared : [];
    this.sharedVisibility = true;
    this.ref.detectChanges();
  }

  onClose() {
    this.sharedVisibility = false;
    this.subCompnt.initializeVariable();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.ref.detectChanges();
  }

  async initializeVariables() {
    this.ELEMENT_DATA = [];
    this.displayedColumns = ['formname', 'action'];
    return;
  }

  async loadData() {

    // console.log("this.formsData", this.formsData);
    this.formsData.forEach(element => {
      if (element.shared && element.shared.length > 0){
        element.docuserid = "/" + this._loginUserId
      }
      else {
        element.docuserid = ''
      }
      this.ELEMENT_DATA.push(element)
    });
    //console.log("this.ELEMENT_DATA", this.formsData[0])
    if (this.formsData && this.formsData[0].shared){
      this.shareddoc = false;
      //console.log("this.ELEMENT_DATA", this.formsData[0])
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    return;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

 async getSubmittedData(postData: any) {

    var url = "formdatas";
    // console.log("postData", postData);
    // console.log("this.selectedForm", this.selectedForm);
    // console.log("this.selectedFormdata", this.selectedFormdata);

    if (!this.selectedFormdata || this.selectedFormdata == undefined) {
      this.selectedFormdata = {
        formid: this.selectedForm._id,
        property: {
          shared: []
        }
      }
    }

    this.selectedFormdata.property.shared = postData;
    this.subCompnt.isDisable = true;

    if (this.selectedFormdata._id) {

      var method = "PUT";
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, this.selectedFormdata, this.selectedFormdata._id)
        .then((data: any) => {
          if (data) {
            this.subCompnt.isDisable = false;
            this.showNotification("top", "right", "Data updated successfully !!", "success")
            $('#myModal').modal('hide');
             // this.ngOnInit();
             setTimeout(() => {
              this.formsubmitData.emit(data);
            }, 500);
          }
        }).catch((e) => {
          this.subCompnt.isDisable = false;
          this.showNotification("top", "right", "Something went wrong !!", "danger")
          $('#myModal').modal('hide');
        })
    }
    else {

      var method = "POST";
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, this.selectedFormdata)
        .then((data: any) => {
          if (data) {
            this.subCompnt.isDisable = false;
            this.showNotification("top", "right", "Data updated successfully !!", "success")
            $('#myModal').modal('hide');
            // this.ngOnInit();
            setTimeout(() => {
              this.formsubmitData.emit(data);
            }, 500);
          }
        }).catch((e) => {
          this.subCompnt.isDisable = false;
          this.showNotification("top", "right", "Something went wrong !!", "danger")
          $('#myModal').modal('hide');
        })

    }

  }


}
