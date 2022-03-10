import { Component, OnInit, ElementRef, ViewEncapsulation, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component'

import { CommonService } from '../../../../../../core/services/common/common.service';

declare var $: any;

@Component({
  selector: 'app-document-moveto',
  templateUrl: './document-moveto.component.html',
  styles: [
  ]
})
export class DocumentMovetoComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  folderLists: any[] = [];
  
  folderListsDDTreeList: any[] = [];
  folderDDList: any[] = [];
  selectedParent: any = '';

  @Input() selectedAttachment: any;

  @Output() movetoSubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
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
    return;
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

  onSubmitFolder() {
    
    let postData = {};
    postData['parent'] = this.selectedParent._id ? this.selectedParent._id : this.selectedParent;
    
    var url = (this.selectedAttachment.type == "folder" ? "folders/" : "documents/") + this.selectedAttachment.id ;
    var method = "PATCH";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          let postData = {}
          setTimeout(() => {
            this.movetoSubmitData.emit(postData);  
          }, 1000);
          
          return;
        }
    }, (error) =>{
      console.error(error);
    });
    
  }
}
