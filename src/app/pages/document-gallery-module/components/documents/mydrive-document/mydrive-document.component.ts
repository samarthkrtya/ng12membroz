import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'
import { CommonService } from '../../../../../core/services/common/common.service';
import { DynamicSubListComponent } from '../../../../../shared/dynamic-sublist/dynamic-sublist.component';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from '@angular/cdk/collections';

import { DomSanitizer } from '@angular/platform-browser';

import { FormsService } from '../../../../../core/services/forms/forms.service';

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
  selector: 'app-mydrive-document',
  templateUrl: './mydrive-document.component.html',
  styles: [
  ]
})
export class MydriveDocumentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  displayedColumns: string[] = [];

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;
  isButtonEnable: boolean;


  filesAndFolderLists: any[] = [];
  fileAndFolders: any[] = [];

  breadcumLists: any[] = [];

  attachmentLink: any;
  attachmentVisibility: boolean;

  imageLink: any;
  imageVisibility: boolean;

  videoLink: any;
  videoVisibility: boolean;

  folderFormVisibility: boolean;
  shareVisibility: boolean;
  shareWithMemberVisibility: boolean;

  moveVisibility: boolean;
  renameVisibility: boolean;

  contentVisibility: boolean;

  selectedAttachment: any;

  selectedUsers: any[] = [];

  isShareWithUsers: boolean = false;
  isShareWithMembers: boolean = false;


  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;

  @Input() mydriveData: any;
  @Input() folders: any;
  @Input() recent: any;
  @Output() submitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public sanitizer: DomSanitizer,
    private _commonService: CommonService,
    private _formsService: FormsService,
  ) {
    super()
  }

  async ngOnInit() {
    try {
      super.ngOnInit();
      await this.initializeVariables()
      await this.loadData();
      await this.checkShareWith("docshareduser")
      await this.checkShareWith("docsharedmember")
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  async initializeVariables() {
    this.ELEMENT_DATA = []
    this.isButtonEnable = true;
    this.displayedColumns = ['select', 'name', 'size', 'createdAt', 'addedby', 'action'];

    this.filesAndFolderLists = [];
    this.fileAndFolders = [];
    this.contentVisibility = false;

    this.breadcumLists = [];

    this.attachmentLink = "";
    this.attachmentVisibility = false;

    this.imageLink = "";
    this.imageVisibility = false;

    this.videoLink = "";
    this.videoVisibility = false;

    this.folderFormVisibility = false;
    this.shareVisibility = false;
    this.shareWithMemberVisibility = false;

    this.moveVisibility = false
    this.renameVisibility = false;

    this.selectedAttachment = {};

    if (this.recent && this.recent.length > 0) {
      this.recent.forEach(element => {
        element.id = element._id;
        element.type = "";
        if (element.path) {
          element.type = element.path.substr(element.path.lastIndexOf('.') + 1);
        }
      });
    }

    this.selectedUsers = [];

    return;
  }


  async checkShareWith(formname: any) {

    var postData = {};
    postData["search"] = [];
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});
    postData["search"].push({"searchfield": "formname", "searchvalue": formname, "criteria": "eq"});
    
    return this._formsService
        .GetByfilterAsync(postData)
        .then((data: any) => {

        if (data && data[0] && formname == "docshareduser") {
          this.isShareWithUsers = true;
        } else if (data && data[0] && formname == "docsharedmember") {
          this.isShareWithMembers = true;
        }

      }).catch((error) => {
      });

  }

  

  async loadData() {

    this.fileAndFolders = [];
    this.breadcumLists = [];
    this.fileAndFolders = JSON.parse(JSON.stringify(this.mydriveData.concat(this.folders)));

    this.filesAndFolderLists = [];
    this.filesAndFolderLists = JSON.parse(JSON.stringify(this.list_to_tree(this.fileAndFolders)));

    if (this.filesAndFolderLists && this.filesAndFolderLists.length > 0) {
      this.filesAndFolderLists.forEach(element => {
        element.sizeType = "---"
        if (element.type !== 'folder' && element.size) {
          element.sizeType = this.formatBytes(element.size)
        }
        let obj = { "type": element.type, "name": element.name, "createdAt": element.createdAt, "addedby": element.addedby, "action": "", id: element._id, path: element.path, children: element.children, shared: element.shared, sizeType: element.sizeType }
        this.ELEMENT_DATA.push(obj);
      });
    } else {
      this.ELEMENT_DATA = [];
    }

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.selection = new SelectionModel(true, []);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.isButtonEnable = true;

    this.selection.changed.subscribe(item => {
      this.isButtonEnable = this.selection.selected.length == 0;
    })

    this.contentVisibility = true;
  }

  getAttachmentPath(extension: any) {
    switch (extension) {
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

    switch (extension) {
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
    switch (extension) {
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

  checkDocumentDeletePermission(element: any) {
    switch (element.type) {
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
        if (element.children && element.children.length == 0) return true;
        return false;
      default:
        return true;
    }
  }

  onClose() {
    this.shareVisibility = false;
    this.shareWithMemberVisibility = false;
    this.subCompnt.initializeVariable();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  list_to_tree(list: any) {
    var map = {}, roots = [], i;
    var node: any;
    let cnt = 0;
    for (i = 0; i < list.length; i += 1) {
      if (!list[i].parent) {
        map[list[i]._id] = cnt;
        cnt++;
      }
      list[i].children = [];
    }
    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parent) {
        var j, n;
        for (j = 0; j < list.length; j += 1) {
          n = list[j];
          if (n._id == node.parent) {

            let type: any;
            if (node.path) {
              type = node.path.substr(node.path.lastIndexOf('.') + 1);
            }

            node.name = node.title;
            node.parent = node.parent;
            node.type = type ? type : "folder"
            n.children.push(node);
          }
        }
      } else {

        let type: any;
        if (node.path) {
          type = node.path.substr(node.path.lastIndexOf('.') + 1);
        }

        node.name = node.title;
        node.type = type ? type : "folder"
        roots.push(node);
      }
    }
    return roots;
  }

  folderClick(item: any) {

    console.log("ite", item);

    if (item.type == "folder") {

      this.breadcumLists.push(item);

      this.contentVisibility = false;

      this.ELEMENT_DATA = []
      this.isButtonEnable = true;
      this.filesAndFolderLists = [];

      var selectedfolder: any[] = [];

      selectedfolder = JSON.parse(JSON.stringify(this.fileAndFolders.filter(element => element.parent == item.id)));
      selectedfolder.forEach(function (v) { delete v.parent });


      this.filesAndFolderLists = JSON.parse(JSON.stringify(this.list_to_tree(selectedfolder)));

      if (this.filesAndFolderLists && this.filesAndFolderLists.length > 0) {
        this.filesAndFolderLists.forEach(element => {
          element.sizeType = "---"
          if (element.type !== 'folder' && element.size) {
            element.sizeType = this.formatBytes(element.size)
          }
          let obj = { "type": element.type, "name": element.name, "createdAt": element.createdAt, "addedby": element.addedby, "action": "", id: element._id, path: element.path, children: element.children, sizeType: element.sizeType }
          this.ELEMENT_DATA.push(obj);
        });
      } else {
        this.ELEMENT_DATA = [];
      }

      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.selection = new SelectionModel(true, []);
      this.dataSource.sort = this.sort;

      this.isButtonEnable = true;

      this.selection.changed.subscribe(item => {
        this.isButtonEnable = this.selection.selected.length == 0;
      })

      this.contentVisibility = true;

    } else {
      this.attachmentClick(item);
    }
  }

  breadcumClick(item: any) {

    this.breadcumLists = [];

    var value3 = JSON.parse(JSON.stringify(this.getParent(this.fileAndFolders, item.id)));
    if (value3 && value3.parent) {
      var parentdetails = JSON.parse(JSON.stringify(this.fileAndFolders.find(eleF => eleF._id == value3.parent)));
      if (parentdetails)
        this.breadcumLists.push(parentdetails);
    }

    this.folderClick(item);

  }

  getParent(root: any, id: any) {
    var node: any;
    for (var i = 0; i < root.length; i++) {
      node = root[i];
      if (node._id === id || node.children && (node = this.getParent(node.children, id))) {
        return node;
      }
    }
    return null;
  }

  attachmentClick(attachment: any) {

    if (attachment.type && (attachment.type == "xlsx") || (attachment.type == "xls") || (attachment.type == "doc") || (attachment.type == "docx") || (attachment.type == "ppt") || (attachment.type == "pptx") || (attachment.type == "csv") || (attachment.type == "pdf")) {
      this.attachmentLink = "";
      this.attachmentLink = "https://docs.google.com/gview?url=" + attachment.path + "&embedded=true";
      this.attachmentVisibility = true;
      $("#iframBtn").click();
    } else if (attachment.type && (attachment.type == "jpg") || (attachment.type == "jpeg") || (attachment.type == "gif") || (attachment.type == "png") || (attachment.type == "tif") || (attachment.type == "tiff")) {

      this.imageLink = "";
      this.imageLink = attachment.path;
      this.imageVisibility = true;
      $("#imageViwerBtn").click();
    } else if (attachment.type && (attachment.type == "mp4") || (attachment.type == "webm")) {
      this.videoLink = "";
      this.videoLink = attachment.path;
      this.videoVisibility = true;
      $("#videoViwerBtn").click();
    } else if (attachment.type && (attachment.type == "txt") ) {
      this.attachmentLink = "";
      this.attachmentLink = "https://docs.google.com/gview?url=" + attachment.path + "&embedded=true";
      this.attachmentVisibility = true;
      $("#iframBtn").click();
    }
  }

  closeIframe() {
    this.attachmentLink = "";
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
    this.submitData.emit(postData);
  }

  shareDocument(item: any) {
    this.selectedAttachment = {};
    this.selectedAttachment = item;
    this.selectedUsers = [];
    if (this.selectedAttachment && this.selectedAttachment.shared && this.selectedAttachment.shared.length > 0) {
      this.selectedUsers = this.selectedAttachment.shared;
    }
    
    this.shareVisibility = true;
    $("#shareDocumentBtn").click();
  }

  shareDocumentWithMember(item: any) {
    this.selectedAttachment = {};
    this.selectedAttachment = item;
    this.selectedUsers = [];
    if (this.selectedAttachment && this.selectedAttachment.shared && this.selectedAttachment.shared.length > 0) {
      this.selectedUsers = this.selectedAttachment.shared;
    }
    
    this.shareWithMemberVisibility = true;
    $("#shareDocumentWithMemberBtn").click();
  }

 async getSubmittedDataShare(postData: any) {

    let AttachmentpostData = {};
    AttachmentpostData['shared'] = postData;
    
    var url = (this.selectedAttachment.type == "folder" ? "folders/" : "documents/") + this.selectedAttachment.id;
    var method = "PATCH";
    this.subCompnt.isDisable = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, AttachmentpostData)
      .then((data: any) => {
        if (data) {
          this.subCompnt.isDisable = false;
          this.selectedAttachment = {};
          this.shareVisibility = false;
          this.shareWithMemberVisibility = false;
          $("#shareCloseBtn").click();
          $("#shareWithMemberCloseBtn").click();
          let data = {}
          setTimeout(() => {
            this.submitData.emit(data);
          }, 500);
        }
      }).catch((error) => {
        console.error(error);
        this.subCompnt.isDisable = false;
        this.shareVisibility = false;
        this.shareWithMemberVisibility = false;
        $("#shareCloseBtn").click();
        $("#shareWithMemberCloseBtn").click();
      });
  }

  moveDocument(element) {
    this.moveVisibility = true;
    this.selectedAttachment = element;
    $("#moveDocumentBtn").click();
  }

  getSubmittedDataMove(postData: any) {
    this.moveVisibility = false;
    this.selectedAttachment = {};
    $("#moveCloseBtn").click();
    setTimeout(() => {
      this.submitData.emit(postData);  
    });
    
  }

  renameDocument(element) {
    this.renameVisibility = true;
    this.selectedAttachment = element;
    $("#renameDocumentBtn").click();
  }

  getSubmittedDataRename(postData: any) {
    this.renameVisibility = false;
    this.selectedAttachment = {};
    $("#renameCloseBtn").click();
    this.submitData.emit(postData);
  }

  deleteConfirmation(item: any) {

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: '',
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
        varTemp.remove(item)
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Document file is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  remove(item: any) {

    let postData = {};
    postData['status'] = "deleted";

    var url = (item.type == "folder" ? "folders/" : "documents/") + item.id;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          swal.fire({
            title: 'Deleted!',
            text: 'Your imaginary file has been deleted.',
            icon: 'success',
            customClass: {
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
          });

          let postData = {}
          this.submitData.emit(postData);

          return;
        }
      }, (error) => {
        console.error(error);
      });
  }

  back() {
    let postData = {}
    this.submitData.emit(postData);
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

  getImage(attachment: any) {
    if((attachment.type == "jpg") || (attachment.type == "jpeg") || (attachment.type == "gif") || (attachment.type == "png") || (attachment.type == "tif") || (attachment.type == "tiff")) {
      return attachment.path;
    } else if ((attachment.type == "xlsx") || (attachment.type == "xls")) {
      return  "../../../../../assets/img/xlsx.png";
    } else if ((attachment.type == "doc") || (attachment.type == "docx")) {
      return  "../../../../../assets/img/doc.png";
    } else if ((attachment.type == "ppt") || (attachment.type == "pptx")) {
      return  "../../../../../assets/img/ppt.png";
    } else if (attachment.type == "csv") {
      return  "../../../../../assets/img/csv.png";
    } else if (attachment.type == "pdf") {
      return "../../../../../assets/img/image_placeholder.jpg";
      //return  "../../../../../assets/img/pdf.png";
    } else {
      return "../../../../../assets/img/image_placeholder.jpg";
    }
  }


}
