import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

import { AngularEditorConfig } from '@kolkov/angular-editor';


import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-contacts-communication',
  templateUrl: './contacts-communication.component.html',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // each time the binding value changes
        query(':leave', [
          stagger(300, [
            animate('0.5s', style({ opacity: 0 }))
          ])
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          stagger(300, [
            animate('0.5s', style({ opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
})
export class ContactsCommunicationComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  postData: any = {};

  pageSize = 10;
  currentPage: number = 1;
  historyList: any[] = [];
  isLoading: boolean = false;
  disableBtn: boolean = true;

  myControl = new FormControl();
  options: string[] = ['EMAIL', 'SMS', 'MAILMERGE', 'WHATSAPP'];
  filteredOptions: Observable<string[]>;
  filterSearch = [];

  selectedSection: any;
  resendDisableBtn: boolean = false;
  Object = Object;

  editorConfig: AngularEditorConfig = {
    editable: false,
    toolbarHiddenButtons: [
      [
        'undo',
        'redo',
        'bold',
        'italic',
        'underline',
        'strikeThrough',
        'subscript',
        'superscript',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'indent',
        'outdent',
        'insertUnorderedList',
        'insertOrderedList',
        'heading',
        'fontName'
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ]
  };

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename="app-member-communication";
  }

  @Input() dataContent: any;
  @Input() context: any;
  @Input() schema: any;
  @Output() onResendCommunication: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {

    await super.ngOnInit()
    try {
      await this.initializeVariables();
      await this.getCommunication()
    } catch(error){
      console.error(error)
    } finally {

    }
    this.filteredOptions = this.myControl.valueChanges
      .debounceTime(1000)
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.historyList = [];
    this.isLoading = false;
    this.disableBtn = false;
    this.postData = {};
    this.pageSize = 10;
    this.currentPage = 1;
    this.filterSearch = [];
    this.resendDisableBtn = false;
    return;
  }

  async getCommunication() {

    this.postData = {};
    this.postData["search"] = [];
    this.postData["search"].push({ searchfield: "receiver", searchvalue: this.dataContent._id, datatype: "ObjectId", criteria:"eq"  });
    this.postData["pageNo"] = this.currentPage;
    this.postData["size"] = this.pageSize;

    if(this.filterSearch && this.filterSearch.length > 0) {
      this.filterSearch.forEach(element => {
        this.postData["search"].push(element);
      });
    }

    var method = "POST";
    var url = this.schema + "/filter/communication/view";

    this.isLoading = true;
    this.disableBtn = true;

    console.log("postData", this.postData) ;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.postData)
      .then((data: any) => {
        if (data) {

          console.log("history", data);

          data.forEach(element => {
            this.historyList.push(element);
          });
          this.isLoading = false;
          this.disableBtn = false;
          return;
        }
      }, (error)=>{
        console.error(error);
    });

  }

  changePage(pageNumber: number): void {
    this.currentPage = Math.ceil(pageNumber);
    this.getCommunication();
  }

  onSelectValue(selectPageSize: number) {
    this.pageSize = selectPageSize;
    if (this.historyList.length != 0) {
      this.currentPage = 1;
      this.getCommunication();
    }
  }

  getClass(preclass: any, item: any) {
    var classList = '';
    if (item.messagetype == 'EMAIL') {
      classList = 'warning';
    } else if (item.messagetype == 'SMS') {
      classList = 'info';
    } else if (item.messagetype == 'MAILMERGE') {
      classList = 'danger';
    } else if (item.messagetype == 'WHATSAPP') {
      classList = 'success';
    }
    return preclass + classList;
  }

  clickMore(item: any) {
    this.selectedSection = {};
    this.selectedSection = item.messagetype;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  optionSelected(option) {
    // this.myControl.setValue(option.value);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "messagetype", searchvalue: this.myControl.value, datatype: "text", criteria:"eq" });
      this.getCommunication();
    }
  }

  enter() {
    const controlValue = this.myControl.value;
    this.myControl.setValue(controlValue);
    if(this.myControl.value) {
      this.filterSearch = [];
      this.historyList = [];
      this.filterSearch.push({ searchfield: "messagetype", searchvalue: this.myControl.value, datatype: "text", criteria:"eq" });
      this.getCommunication();
    }
  }

  handleEmptyInput(event: any){
    if(event.target.value === '') {
      this.myControl.setValue("");
      this.filterSearch = [];
      this.historyList = [];
      this.currentPage = 1;
      this.getCommunication();
    }
  }

  resendCommunication() {

    this.isLoading = true;
    
    let method = "POST";
    let url = "communications/send";

    let postData = {};

    postData["receiver"] = [this.dataContent._id];
    postData["messagetype"] = this.selectedSection.messagetype;
    postData["message"] = {};
    postData["message"]["content"] = this.selectedSection.property.message;

    if (this.selectedSection.messagetype == 'EMAIL') {
      postData["message"]["to"] = this.dataContent.property.primaryemail;
      postData["message"]["subject"] = this.selectedSection.property.subject;
    } else if (this.selectedSection.messagetype == 'SMS'){
      postData["message"]["to"] = this.dataContent.property.mobile;
    } else if (this.selectedSection.messagetype == 'WHATSAPP'){
      postData["message"]["to"] = this.dataContent.property.whatsapp;
    }
    else {
      postData["message"]["to"] = this.dataContent.property.primaryemail;
    }

    if (this.selectedSection && this.selectedSection.mailalert) {
      postData["mailalertid"] = this.selectedSection.mailalert._id ? this.selectedSection.mailalert._id : this.selectedSection.mailalert;
    }

    console.log("postData", postData);

    this.disableBtn = true;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.disableBtn = false;
          this.isLoading = false;
          this.close();
          setTimeout(() => {
            this.onResendCommunication.emit({ type: "success" });  
          }, 1000);
          
          this.showNotification('top', 'right', 'Notification has been sent successfully!!!', 'success');
          return;
        }
      }, (error)=>{
        this.disableBtn = false;
        this.isLoading = false;
        console.error(error);
    });

  }

  close() {
    this.resendDisableBtn = false;
    $("#closePopup").click();
  }

}
