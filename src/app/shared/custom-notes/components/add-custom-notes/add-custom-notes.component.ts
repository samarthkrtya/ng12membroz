import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-add-custom-notes',
  templateUrl: './add-custom-notes.component.html',
  styleUrls: ['./add-custom-notes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddCustomNotesComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  notes = [];
  recognition:any;

  @Input() formid: any;
  @Input() contextid: any;
  @Input() onModel: any;
  @Input() id: any;
  @Output() onCustomNotesData: EventEmitter<any> = new EventEmitter<any>();

  formdataDetails: any;
  isEdit: boolean = false;
  isnotesLoading: boolean = true;

  
  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private el:ElementRef
  ) {

    super();

    this.pagename="app-add-custom-notes";

    //this.notes = JSON.parse(localStorage.getItem('notes')) || [{ id: 0,content:'' }];

    const {webkitSpeechRecognition} : IWindow = <IWindow><unknown>window;

    this.recognition = new webkitSpeechRecognition();

    this.recognition.onresult = (event)=> {
      this.el.nativeElement.querySelectorAll(".content-custom-note")[0].innerText = event.results[0][0].transcript
    };
  }

  async ngOnInit() {

    await super.ngOnInit()
    try {
      await this.initializeVariables();
      await this.getFormData();
    } catch(error){
      console.error(error)
    } finally {
      this.isnotesLoading = false;
      if(this.formdataDetails[this.id]['notesCount'] > 0) {
        $("#customNotes"+ this.id).click()
      }
    }
  }

  async initializeVariables() {
    this.formdataDetails = {};
    this.notes = [];
    this.isEdit = false;
    this.isnotesLoading = true;

    this.formdataDetails = {};
    if(!this.formdataDetails[this.id]) {
      this.formdataDetails[this.id] = {};
      this.formdataDetails[this.id]['data'] = [];
      this.formdataDetails[this.id]['notes'] = [];
      this.formdataDetails[this.id]['notesCount'] = 0;
    }
    return;
  }

  async getFormData() {

    var url = "formdatas/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "formid", "searchvalue": this.formid, "criteria": "eq" });
    postData["search"].push({ "searchfield": "onModel", "searchvalue": this.onModel, "criteria": "eq" });
    postData["search"].push({ "searchfield": "contextid", "searchvalue": this.contextid, "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
          
        if (data && data[0]) {
          
          
          this.formdataDetails[this.id]['data'] = data[0];

          if(this.formdataDetails[this.id]['data'] && this.formdataDetails[this.id]['data'].property && this.formdataDetails[this.id]['data'].property.notes && this.formdataDetails[this.id]['data'].property.notes.length > 0) {
            this.notes = [];
            this.formdataDetails[this.id]['notes'] = [];
            this.formdataDetails[this.id]['data'].property.notes.forEach(element => {
              this.notes.push(element);
              this.formdataDetails[this.id]['notes'].push(element);
            });
            this.notes = this.notes.sort((a,b)=>{ return b.id-a.id});
            this.formdataDetails[this.id]['notes'] = this.formdataDetails[this.id]['notes'].sort((a,b)=>{ return b.id-a.id});
            this.formdataDetails[this.id]['notesCount'] = this.formdataDetails[this.id]['notes'].length;
            this.isEdit = true;
            return;
          }
        } 
        return;
      }, (error)=>{
        console.error(error);
      });
  }

  updateAllNotes() {
    
    let notes = document.querySelectorAll('app-lists-notes');

    notes.forEach((note, index)=>{
      this.notes[note.id].content = note.querySelector('.content-custom-note').innerHTML;
    });

  }

  addNote () {
    this.notes.push({ id: this.notes.length + 1, content:'' });
    // sort the array
    this.notes= this.notes.sort((a,b)=>{ return b.id-a.id});
    //localStorage.setItem('notes', JSON.stringify(this.notes));
  };
  
  saveNote(event: any) {
    
    const id = event.srcElement.parentElement.parentElement.getAttribute('id');
    const content = event.target.innerText;
    event.target.innerText = content;
    const json = { 'id': id, 'content':content }
    this.updateNote(json);
    this.updateFormData()
  }
  
  updateNote(newValue){
    this.notes.forEach((note, index)=>{
      if(note.id== newValue.id) {
        this.notes[index].content = newValue.content;
      }
    });

    this.formdataDetails[this.id]['notes'] = [];
    this.formdataDetails[this.id]['notes'] = this.notes
    this.formdataDetails[this.id]['notesCount'] = 0;
    this.formdataDetails[this.id]['notesCount'] = this.formdataDetails[this.id]['notes'].length;
    
  }

  refresh() {
    
    this.notes= this.notes.sort((a,b)=>{ return b.id-a.id});
  }
  
  deleteNote(event){

    const varTemp = this;

      swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
        customClass:{
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        const id = event.srcElement.parentElement.parentElement.parentElement.getAttribute('id');
        varTemp.notes.forEach((note, index)=>{
          if(note.id== id) {
            varTemp.notes.splice(index,1);
            return;
          }
        });

        varTemp.formdataDetails[this.id]['notes'] = [];
        varTemp.formdataDetails[varTemp.id]['notes'] = varTemp.notes
        varTemp.formdataDetails[varTemp.id]['notesCount'] = 0;
        varTemp.formdataDetails[varTemp.id]['notesCount'] = varTemp.formdataDetails[varTemp.id]['notes'].length;
        varTemp.updateFormData()

        swal.fire({
            title: 'Deleted!',
            text: 'Your note has been deleted.',
            icon: 'success',
            customClass:{
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
        });

      } else {
        swal.fire({
            title: 'Cancelled',
            text: 'Your note is safe :)',
            icon: 'error',
            customClass:{
              confirmButton: "btn btn-info",
            },
            buttonsStyling: false
        });
      }
    })

     
  }

  updateFormData() {

    var url = "formdatas"
    var method = "POST";
    let postData = {};

    if(this.isEdit) {

      url = "formdatas/" + this.formdataDetails[this.id]['data']._id;
      method = "PATCH";
      postData = {};
      postData["property"] = {};
      postData["property"]["notes"] = [];
      postData["property"]["notes"] = this.notes;

    } else {

      postData = {};
      postData["formid"] = this.formid;
      postData['contextid'] = this.contextid;
      postData['onModel'] = this.onModel;
      postData["property"] = {};
      postData["property"]["notes"] = [];
      postData["property"]["notes"] = this.notes;
    }

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe( (data: any) => {
        if(data){
          $("#refresh_"+ this.id).click();
          $("#customNotes"+ this.id).click()
        }
    }, (error) =>{
      console.error(error);
    });
    
  }

  record(event) {
    this.recognition.start();
    this.addNote();
  }

  getCount() {
    if(this.formdataDetails && this.formdataDetails[this.id] && this.formdataDetails[this.id]['notesCount']) {
      return this.formdataDetails[this.id]['notesCount'];
    } else {
      return 0;
    }
  }

  addNewNotesButton() {
    $("#"+this.id).click();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  close() {
    if(this.notes.length > 0) {
      $("#customNotes"+ this.id).click()
    }
  }

}

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
