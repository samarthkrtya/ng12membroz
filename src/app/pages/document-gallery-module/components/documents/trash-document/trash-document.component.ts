import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'
import { CommonService } from '../../../../../core/services/common/common.service';
import {MatTableDataSource} from '@angular/material/table';

export interface PeriodicElement {
  type: string;
  name: string;
  createdAt: string;
  addedby: string;
  action: any
}

import swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-trash-document',
  templateUrl: './trash-document.component.html',
  styles: [
  ]
})


export class TrashDocumentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = [];

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;
  
  @Input() trashData: any;
  @Output() trashsubmitData: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    private _commonService: CommonService
  ) {
    super()
  }

  async ngOnInit() {
    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.loadData()
    } catch (error) {

    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.ELEMENT_DATA = [];
    this.displayedColumns = ['name', 'createdAt', 'addedby', 'action'];
    return;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  async loadData() {

    if(this.trashData && this.trashData.length > 0 ) {
      this.trashData.forEach(element => {
        element.type = "folder"
        if (element.path) element.type = element.path.substr(element.path.lastIndexOf('.') + 1);

        element.sizeType = "---"
        if(element.type !== 'folder' && element.size) {
          element.sizeType = this.formatBytes(element.size)
        }

        let obj = {"type": element.type, "name": element.title, "createdAt": element.createdAt, "addedby": element.addedby, "action": "", "id": element._id, sizeType: element.sizeType}
        this.ELEMENT_DATA.push(obj);
      });
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAttachmentPath(extension: any) {
    switch(extension) {
      case "ppt":
        return "../../../../../assets/img/dg-ppt-icon.svg";
      case "xls":
        return "../../../../../assets/img/dg-excel-icon.svg";
      case "doc":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "docx":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "pdf":
        return "../../../../../assets/img/dg-pdf-icon.svg";
      case "txt":
        return "../../../../../assets/img/dg-text-icon.svg";
      case "folder":
        return "../../../../../assets/img/dg-folder-icon.svg";
      default:
        return "../../../../../assets/img/image_placeholder.jpg";
    }
  }

  recover(element: any) {

    let postData = {};
    postData['status'] = "active";
    var url = "documents/" + element.id ;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          let postData = {}
          this.trashsubmitData.emit(postData);
          return;
        }
    }, (error) =>{
      console.error(error);
    });

  }

  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}
