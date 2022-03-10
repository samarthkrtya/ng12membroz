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
  selector: 'app-document-rename',
  templateUrl: './document-rename.component.html',
  styles: [
  ]
})
export class DocumentRenameComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  formFolder: FormGroup;
  submittedFolder: boolean;

  oldname: any;
  newname: any;
  
  @Input() selectedAttachment: any;

  @Output() renameSubmitData: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonService: CommonService
  ) {

    super()

    this.formFolder = fb.group({
      'oldname': [this.oldname],
      'newname': [this.newname, Validators.required],
    });
  }

  async ngOnInit() {
    
    try {
      super.ngOnInit()
      await this.initializeVariables()
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
    this.oldname = this.selectedAttachment.name;
    this.formFolder.get("oldname").setValue(this.oldname);
    return;
  }

  onSubmitFolder(value: any, isValid: boolean) {
    this.submittedFolder = true;
    if (!isValid) {
      return false;
    } else {
      
      let postData = {};
      postData['title'] = value.newname;
      
      var url = (this.selectedAttachment.type == "folder" ? "folders/" : "documents/") + this.selectedAttachment.id ;
      var method = "PATCH";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then( (data: any) => {
          if(data) {
            let postData = {}
            this.renameSubmitData.emit(postData);
            return;
          }
      }, (error) =>{
        console.error(error);
      });
    }
  }

  resetFolder(action: any) {
    this.formFolder.reset();

      let postData = {}
      if(action == "add") {
        postData["folder"] = "success";
      }
    this.renameSubmitData.emit(postData);
  }

}
