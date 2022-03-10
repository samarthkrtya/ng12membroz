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
  selector: 'app-class-members',
  templateUrl: './class-members.component.html'
})

export class ClassMembersComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('sharedusers', { static: false }) subCompnt: DynamicSubListComponent;

  @Input() dataContent: any;
  @Input() bindId: any;
  @Input() reloadingStr: string;

  @Output() onAdded = new EventEmitter();

  displayedColumns: any[];

  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Element>();
 
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
    if (this.reloadingStr && this.reloadingStr == 'classmember') {
      this.setData();
    }
  }

  async setData() {
    this.displayedColumns = ['fullname', 'email', 'mobile', 'action'];

    this.dataSource.data = [];
    if (this.dataContent.members && this.dataContent.members.length > 0) {
      this.dataSource.data = this.dataContent.members;
    }
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
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
      this.selectedUsers = this.dataSource.data.filter(a => a['onModel'] == "Member").map(a => a['memberid']['_id']);
    } else {
      this.selectedUsers = this.dataSource.data.filter(a => a['onModel'] == "Prospect").map(a => a['memberid']['_id']);
    }
    console.log("this.selectedUsers", this.selectedUsers);
  }

  onClose() {
    this.sharedVisibility = false;
    this.subCompnt.initializeVariable();
  }

  async getSubmittedData(item: any, formname: string) {
    let url = "groupclasses";
    let method = "PUT";
    let bookingperson = this.dataContent?.property['bookingperson']

    var model = {};
    model = this.dataContent;

    let obj, members: any[] = [], oldmembers: any[] = [];
    if (formname == 'member') {
      oldmembers = this.dataContent.members.filter(a => a.onModel == 'Prospect');
    } else {
      oldmembers = this.dataContent.members.filter(a => a.onModel == 'Member');
    }
    item.forEach(selectedids => {
      obj = {};
      obj['memberid'] = selectedids
      obj['onModel'] = formname == 'member' ? "Member" : "Prospect";
      members.push(obj);
    });
    if (oldmembers.length > 0) {
      oldmembers.forEach(mmbr => {
        obj = {};
        obj['memberid'] = mmbr.memberid._id;
        obj['onModel'] = mmbr.onModel;
        members.push(obj);
      });
    }
    if (!model['members']) {
      model['members'] = [];
    }  
    if (bookingperson && bookingperson < members.length){
      super.showNotification("top", "right", "You can not add more than allow capacity", "danger");
      model['members'] = members.splice(0, bookingperson);
    }else{
      model['members'] = members;
    }

    this.subCompnt.isDisable = true;
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
      .then((data: any) => {
        super.showNotification("top", "right", "Assigned successfully !!", "success");
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

  async onDelete(id: any) {
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
        let url = "groupclasses";
        let method = "PUT";

        this.dataContent.members.splice(this.dataContent.members.findIndex(a => a._id == id), 1)
        var model = {};
        model = this.dataContent;


        return this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
          .then((data: any) => {
            super.showNotification("top", "right", "Member removed successfully !!", "success");
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
