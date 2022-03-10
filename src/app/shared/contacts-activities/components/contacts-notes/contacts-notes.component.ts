import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { MatDialog } from '@angular/material/dialog';

declare var $: any;
@Component({
  selector: 'app-contacts-notes',
  templateUrl: './contacts-notes.component.html',
  
})
export class ContactsNotesComponent extends BaseLiteComponemntComponent  implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  notesList: any [] = [];

  selectedNotes: any = {};

  form: FormGroup;
  submitted: boolean;

  notes: any;

  isdisablesavebutton: boolean = false;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    
  ) {
    super();
    this.pagename="app-contacts-notes";

    this.form = fb.group({
      'notes': [this.notes, Validators.required],
    });
  }

  @Input() dataContent: any;
  @Input() formid: any;
  @Input() onModel: any;
  @Output() onNotesData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    
    await super.ngOnInit()
    try {
      await this.initializeVariables();
    } catch(error){
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
    this.notesList = [];
    this.selectedNotes = {};
    this.notes = "";
    this.isdisablesavebutton = false;
    if(this.dataContent && this.dataContent.notes && this.dataContent.notes.length > 0 ) this.notesList = this.dataContent.notes;
     return;
  }

  notesClick(item: any) {
    this.selectedNotes = item;
  }
  advcQtyClose() {
    this.form.reset();
    $("#closeAddNotes").click();
    setTimeout(() => {
      this.onNotesData.emit();
    }, 500);
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    //this.isdisablesavebutton = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      this.isdisablesavebutton = false;
      return false;
    } else {

      var url = "formdatas"
      var method = "POST";

      let postData = {};
      postData["formid"] = this.formid;
      postData['contextid'] = this.dataContent._id;
      postData['onModel'] = this.onModel;
      postData["property"] = {};
      postData["property"]["notes"] = value.notes;
  
      this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .subscribe( (data: any) => {
          if(data){
            $("#closeAddNotes").click();
            this.showNotification('top', 'right', 'Notes has been added successfully', 'success');
            setTimeout(() => {
              this.onNotesData.emit();
            }, 500);
            
          }
      }, (error) =>{
        console.error(error);
        this.isdisablesavebutton = false;
      });
    }
  }
}
