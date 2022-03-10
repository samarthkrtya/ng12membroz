import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { DynamicSubListComponent } from 'src/app/shared/dynamic-sublist/dynamic-sublist.component';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-invitees',
  templateUrl: './invitees.component.html'
})

export class InviteesComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;

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

  selectedUsers: any[] = [];
  formname: string = "member";
 
  sharedVisibility: boolean = false;
 
  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-invitees";
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
     if (this.reloadingStr && this.reloadingStr == 'invitees') {
      this.setData();
    }
  }

  async setData() {
    this.displayedColumns = ['fullname', 'membership', 'email', 'mobile', 'action'];
    this.displayedColumns2 = ['fullname', 'email', 'mobile', 'action'];
  
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

    return;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onNewclk(formname: string) {
    this.formname = formname;
    this.sharedVisibility = !this.sharedVisibility;
    this.selectedUsers = [];
    if (formname == 'member') {
      this.selectedUsers = this.dataSource.data.map(a => a['_id']);
    } else {
      this.selectedUsers = this.dataSource2.data.map(a => a['_id']);
    }
  }

  onClose() {
    this.sharedVisibility = false;
    this.subCompnt.initializeVariable();
  }

  async getSubmittedData(item: any, formname: string) {
    console.log("item", item);

    let url = "events";
    let method = "PUT";

    var model = {};
    model = this.dataContent;
    if (!model['invitees']) {
      model['invitees'] = {};
    }
    if (formname == 'member') {
      if (!model['invitees']['members']) {
        model['invitees']['members'] = {};
      }
      model['invitees']['members'] = item;
    } else if (formname == 'prospect') {
      if (!model['invitees']['prospects']) {
        model['invitees']['prospects'] = {};
      }
      model['invitees']['prospects'] = item;
    }
    console.log("model", model);
    this.subCompnt.isDisable = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data: any) => {
        // console.log("data",data);
        super.showNotification("top", "right", "Invitees added successfully !!", "success");
        this.sharedVisibility = !this.sharedVisibility;
        this.subCompnt.isDisable = true;
        $("#closeid").click();
        setTimeout(() => {
          this.onAdded.emit(data);
        }, 500);
      }).catch((e) => {
        console.log("e", e);
        this.sharedVisibility = !this.sharedVisibility;
        this.subCompnt.isDisable = true;
        $("#closeid").click();
        super.showNotification("top", "right", "Something went wrong !!", "danger");
      });
  }

  async onDelete(formname: string, id: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then((result) => {
      if (result.value) { 
    let url = "events";
    let method = "PUT";

    var model = {};
    model = this.dataContent;

    var items = [];
    if (formname == 'member') {
      items = this.dataSource.data.map(a => a['_id']);
      items.splice(items.indexOf(id), 1);
      model['invitees']['members'] = items;
    } else if (formname == 'prospect') {
       items = this.dataSource2.data.map(a => a['_id']);
       items.splice(items.indexOf(id), 1);
      model['invitees']['prospects'] = items;
    }
    console.log("model", model);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data: any) => { 
        super.showNotification("top", "right", "Invitees removed successfully !!", "success");
        setTimeout(() => {
          this.onAdded.emit(data);
        }, 500);
      }).catch((e) => {
        super.showNotification("top", "right", "Something went wrong !!", "danger");
      });
  }
 });
}

}
