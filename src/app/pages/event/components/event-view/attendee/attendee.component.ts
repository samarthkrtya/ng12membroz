import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table'; 
import { SelectionModel } from '@angular/cdk/collections';

import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
 

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.component.html'
})

export class AttendeeComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>(); 

  @Input() dataContent: any;
  @Input() bindId: any;
  @Input() reloadingStr: string;

  @Output() onAdded = new EventEmitter();

  displayedColumns: any[];
  displayedColumns2: any[];

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  @ViewChild('paginator2', { read: MatPaginator }) paginator2: MatPaginator;

  dataSource = new MatTableDataSource<Element>();
  dataSource2 = new MatTableDataSource<Element>();

  selection = new SelectionModel;
  selection2 = new SelectionModel;
 
  formname: string = "member";

  isLoading: boolean = false;
  disableBtn: boolean = false;
   
  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-attendee";
  }

  async ngOnInit() { 
    try {
      await super.ngOnInit(); 
      await this.setData(); 
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  async ngOnChanges() { 
    if (this.reloadingStr && (this.reloadingStr == 'attendee' ||  this.reloadingStr == 'invitees')) {
      this.setData();
    }
  }

  async setData() {

    this.displayedColumns = ['select','fullname', 'membership', 'email', 'mobile'];
    this.displayedColumns2 = ['select','fullname', 'email', 'mobile'];

    this.dataSource.data = [];
    this.dataSource2.data = [];
    if (this.dataContent.invitees && this.dataContent.invitees.members && this.dataContent.invitees.members.length > 0) {
      this.dataSource.data = this.dataContent.invitees.members;
    }
    if (this.dataContent.invitees && this.dataContent.invitees.prospects && this.dataContent.invitees.prospects.length > 0) {
      this.dataSource2.data = this.dataContent.invitees.prospects;
    }
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource2.paginator = this.paginator2;
    });
    this.selection = new SelectionModel(true, []);
    this.selection2 = new SelectionModel(true, []);
    if (this.dataContent.attendees && this.dataContent.attendees.members && this.dataContent.attendees.members.length > 0 && this.dataSource.data.length > 0) {
      let ind;
      this.dataContent.attendees.members.forEach(invtn => {
        ind = this.dataSource.data.findIndex(a=>a['_id'] == invtn._id);
        this.selection.toggle(this.dataSource.data[ind]);
      });
    }
    if (this.dataContent.attendees && this.dataContent.attendees.prospects && this.dataContent.attendees.prospects.length > 0 && this.dataSource2.data.length > 0) {
      let ind;
      this.dataContent.attendees.prospects.forEach(invtn => {
        ind = this.dataSource2.data.findIndex(a=>a['_id'] == invtn._id);
        this.selection2.toggle(this.dataSource2.data[ind]);
      });
    } 
    return;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onTabChanged(event: any) {
    if(event.index == 1){
      this.formname = "prospect"; 
    }else{
      this.formname = "member"; 
    }
  } 

  async onSave(formname: string) {
    
    let url = "events";
    let method = "PUT";
     
    var model = {};
    model = this.dataContent;
    if (!model['attendees']) {
      model['attendees'] = {};
    }
    if (formname == 'member') {
      if (!model['attendees']['members']) {
        model['attendees']['members'] = {};
      }
      model['attendees']['members'] = this.selection.selected.map(a=>a['_id']);
    } else if (formname == 'prospect') {
      if (!model['attendees']['prospects']) {
        model['attendees']['prospects'] = {};
      }
      model['attendees']['prospects'] = this.selection2.selected.map(a=>a['_id']);
    }
    console.log("model", model); 
    this.disableBtn = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data: any) => {
        super.showNotification("top", "right", "Attendee added successfully !!", "success");
        this.disableBtn = false;
        this.onAdded.emit(data);
      }).catch((e) => {
        console.log("e", e); 
        super.showNotification("top", "right", "Something went wrong !!", "danger");
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isAllSelected2() {
    const numSelected = this.selection2.selected.length;
    const numRows = this.dataSource2.data.length;
    return numSelected === numRows;
  }

  masterToggle2() {
    this.isAllSelected2() ?
      this.selection2.clear() :
      this.dataSource2.data.forEach(row => this.selection2.select(row));
  }

 

}
