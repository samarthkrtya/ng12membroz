import { Component, OnInit, ElementRef, ViewEncapsulation, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'

import { CommonService } from '../../../../../../core/services/common/common.service';

import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';

declare var $: any;

export interface Keyword {
  name: string;
}

@Component({
  selector: 'app-document-create',
  templateUrl: './document-create.component.html',
  styles: [
  ]
})
export class DocumentCreateComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  formDocument: FormGroup;

  
  folderLists: any[] = [];
  documents: any [] = [];;
  submittedDocument: boolean;

  uploader: FileUploader;
  response: any[] = [];

  
  folderListsDDTreeList: any[] = [];
  folderDDList: any[] = [];
  selectedFolder: any = '';

  attachment: any;

  selectedParent: any = '';

  @Output() documentSubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _commonService: CommonService
  ) {
    super()

    this.formDocument = fb.group({
      'attachment': [this.attachment]
    });
  }

  async ngOnInit() {
    try {
      super.ngOnInit()
      await this.initializeVariables()
      await this.initFileUpload()
      await this.loadData()
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

  async initializeVariables() {
    this.folderLists = [];
    this.folderListsDDTreeList = [];
    this.folderDDList = [];
    this.documents = [];
    return;
  }

  
  async initFileUpload() {

    
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
      $(".loading").show();
      this.response = fileItem;
      if (fileItem) {
        if (fileItem.status === 200) {

          

          let extension: any;
          if (fileItem.file) {
            extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
          }

          let fileInfo = {
            attachment: fileItem.data.secure_url,
            extension: extension,
            original_filename: fileItem.data.original_filename,
            size: fileItem.file.size
          };

          this.documents = [];
          this.documents.push(fileInfo);

          
          
          $('#picture').attr('src', fileItem.data.secure_url);
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
  }

  async loadData() {

    var url = "folders/filter";
    var method = "POST";
        
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          this.folderLists = [];
          this.folderLists = data;

          var array = this.list_to_tree(this.folderLists);
          
          this.folderListsDDTreeList = JSON.parse(JSON.stringify(this.folderLists));

          if (this.folderListsDDTreeList.length > 0) {

            let i = 0;
            this.folderListsDDTreeList.forEach(ele => {
              i = i + 100;
              ele.displayOrder = i;
            });
            this.folderListsDDTreeList.forEach(ele => {
              let stage = 0
              ele.displayName = '';
              ele.displayNameDD = '';
              ele.displayNameSelect = '';

              ele.formdispositionid = '';
              ele.isselected = false;

              ele.displayNameSelect = ele.title;
              ele.displayName = ele.title;
              ele.displayNameDD = ele.title;

              if (ele.parent != undefined) {
                this.attachParentName(ele.parent, ele, stage);
              }

              if ((this.folderListsDDTreeList.indexOf(ele) + 1) == this.folderListsDDTreeList.length) {
                this.folderListsDDTreeList.forEach(ele => {
                  this.fillchildFolder(ele);
                });
                this.folderDDList = this.folderListsDDTreeList.filter(ele => ele.parent == undefined || ele.parent == '');
              }
            });
            this.folderListsDDTreeList = this.folderListsDDTreeList.sort((n1,n2) => {if (n1.displayOrder > n2.displayOrder){return 1;}if (n1.displayOrder < n2.displayOrder){return -1;}return 0;});
            this.selectedParent = 'My Drive';


          }

          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  attachParentName(parentobj: any, currObj: any, stage: number) {
    let tempobj: any;
    stage += 1;
    tempobj = this.folderListsDDTreeList.find(ele1 => ele1._id == parentobj);
    
    if (tempobj != undefined) {
      if (tempobj.title != undefined) {
        currObj.displayName = tempobj.title + ' --> ' + currObj.displayName;
        currObj.displayNameDD = '|---- ' + currObj.displayNameDD;

        currObj.displayOrder = tempobj.displayOrder + stage;
      }
      if (tempobj.parent != undefined) {
        this.attachParentName(tempobj.parent, currObj, stage);
      }

    }
  }

  fillchildFolder( obj: any){
    obj.childdisp = [];
    this.folderListsDDTreeList.forEach( ele2 => {
        if(ele2.parent == obj._id){
            this.fillchildFolder(ele2);
            obj.childdisp.push(ele2);
        }
        if((this.folderListsDDTreeList.indexOf(ele2)+1) == this.folderListsDDTreeList.length){
          if(obj.childdisp.length > 0){
             obj.isparent = true;
          }
        }
    });
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
          if(n._id == node.parent) {
            node.name = node.title;
            node.displayname = '|---- ' + node.title;
            node.parent = node.parent;
            n.children.push(node);
          }
        }
      } else {
        node.name = node.title;
        node.displayname = node.title;
        roots.push(node);
      }
    }
    return roots;
  }

  changeParent(desp: any) {
    this.selectedParent = {}; 
    if(desp != ''){
      this.selectedParent = desp;
    }
  }

  resetDocument() {
    this.folderLists = [];
    this.folderListsDDTreeList = [];
    this.folderDDList = [];
    this.documents = [];
    this.formDocument.reset();
  }

  onSubmitDocument(value: any, isValid: boolean) {
    this.submittedDocument = true;
    if (!isValid) {
      return false;
    } else {

      if(this.documents && this.documents.length == 0) {
        this.showNotification('top', 'right', 'Upload at least one document!!!', 'danger');
        return;
      }

      let postData = { 
        "title" : value.attachment ? value.attachment : this.documents[0]["original_filename"], 
        "path" : this.documents[0]["attachment"], 
        "size": this.documents[0]["size"]
      }

      if(this.selectedParent && this.selectedParent._id) {
        postData["parent"] = this.selectedParent._id
      }

      var url = "documents";
      var method = "POST";
        
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( (data: any) => {
          if(data) {
            this.showNotification('top', 'right', 'Document has been added successfully!!!', 'success');
              this.resetDocument();
              let obj = {
                attachment: "success"
              }
              this.documentSubmitData.emit(obj);

            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  removeImg(item: any) {
    this.documents.forEach(element => {
      if (element.original_filename == item.original_filename) {
        this.documents.splice(element, 1);
      }
    });
  }

}
