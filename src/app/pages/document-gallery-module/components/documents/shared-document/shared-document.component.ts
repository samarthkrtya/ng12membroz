import { Component, OnInit, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'

import {MatTableDataSource} from '@angular/material/table';

import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

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
  selector: 'app-shared-document',
  templateUrl: './shared-document.component.html',
  styles: [
  ]
})
export class SharedDocumentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = [];

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;

  attachmentLink: any;
  attachmentVisibility: boolean;

  imageLink: any;
  imageVisibility: boolean;

  videoLink: any;
  videoVisibility: boolean;

  folderFormVisibility: boolean;
  shareVisibility: boolean;

  @Input() sharedData: any;
  @Output() sharesubmitData: EventEmitter<any> = new EventEmitter<any>();


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor() {
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
    this.displayedColumns = ['name', 'size', 'createdAt', 'addedby', 'action'];

    this.attachmentLink = "";
    this.attachmentVisibility = false;

    this.imageLink = "";
    this.imageVisibility = false;

    this.videoLink = "";
    this.videoVisibility = false;

    this.folderFormVisibility = false;
    this.shareVisibility = false;

    return;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  async loadData() {
    
    if(this.sharedData && this.sharedData.length > 0 ) {
      this.sharedData.forEach(element => {
        element.type = "folder"
        if (element.path) element.type = element.path.substr(element.path.lastIndexOf('.') + 1);

        element.sizeType = "---"
        if(element.type !== 'folder' && element.size) {
          element.sizeType = this.formatBytes(element.size)
        }

        let obj = {"type": element.type, "name": element.title, "createdAt": element.createdAt, "addedby": element.addedby, "action": "", "path": element.path, sizeType: element.sizeType } 
        this.ELEMENT_DATA.push(obj);
      });
      
      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }


    return;
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

  checkImageViewPermission(extension: any) {
    
    switch(extension) {
      case "ppt":
        return false;
      case "xls":
        return false;
      case "doc":
        return false;
      case "docx":
        return false;
      case "pdf":
        return false;
      case "txt":
        return false;
      case "folder":
        return false;
      default:
        return true;
    }
  }

  checkDocumentViewPermission(extension: any) {
    
    switch(extension) {
      case "ppt":
        return true;
      case "xls":
        return true;
      case "doc":
        return true;
      case "docx":
        return true;
      case "pdf":
        return true;
      case "txt":
        return false;
      case "folder":
        return false;
      default:
        return false;
    }
  }

  attachmentClick(attachment: any) {

    if(attachment.type && (attachment.type == "xlsx") || (attachment.type == "xls") || (attachment.type == "doc") || (attachment.type == "docx") || (attachment.type == "ppt") || (attachment.type == "pptx") || (attachment.type == "csv") || (attachment.type == "pdf")) {
      this.attachmentLink ="";
      this.attachmentLink = "https://docs.google.com/gview?url="+attachment.path+"&embedded=true" ;
      this.attachmentVisibility = true;
      $("#iframBtn").click();
    } else if (attachment.type && (attachment.type == "jpg") || (attachment.type == "jpeg") || (attachment.type == "gif") || (attachment.type == "png") || (attachment.type == "tif") || (attachment.type == "tiff")) {
      
      this.imageLink = "";
      this.imageLink = attachment.path;
      this.imageVisibility = true;
      $("#imageViwerBtn").click();
    } else if (attachment.type && (attachment.type == "mp4")) {
      this.videoLink = "";
      this.videoLink = attachment.path;
      this.videoVisibility = true;
      $("#videoViwerBtn").click();
    }
  }

  closeIframe() {
    this.attachmentLink ="";
    this.attachmentVisibility = false;
  }

  closeImageViwer() {
    this.imageLink = "";
    this.imageVisibility = false;
  }

  closeVideoViwer() {
    this.videoLink = "";
    this.videoVisibility = false;
  }

  createFolder() {
    this.folderFormVisibility = true;
    $("#createFolderBtn").click();
  }

  getSubmittedDataFolder(postData: any) {
    this.folderFormVisibility = false;
    $("#FolderCloseBtn").click();
    this.sharesubmitData.emit(postData);
  }

  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  copied() {
    super.showNotification("top", "right", "Link copied to clipboard", "success");
  }

}
