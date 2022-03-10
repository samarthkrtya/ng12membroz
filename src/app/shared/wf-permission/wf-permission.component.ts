import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import swal from 'sweetalert2';

import { AuthService } from '../../core/services/common/auth.service';
import { CommonService } from '../../core/services/common/common.service';

@Component({
   selector: 'app-wf-permission',
   templateUrl: './wf-permission.component.html'
})

export class WfPermissionComponent implements OnInit {

   loginid: any;
   roleid: any;
   displayText: any;

   btnDisable: Boolean = false;
   isApproveBtn: Boolean = false;
   isReviewBtn: Boolean = false;

   wfAlterPerms: Boolean = false;

   @Input('bindId') bindidValue: any;
   @Input('bindObj') bindObjValue: any;
   @Input('formObj') formObjValue: any;
   @Input('schemaname') schemanameValue: string;
   @Input('isOnlyBtn') isOnlyBtn: boolean;

   @Output() onOperation: EventEmitter<any> = new EventEmitter<any>();

   constructor(
      private commonService: CommonService,
      private authService: AuthService,
   ) {
   }

   ngOnInit() {
      this.loginid = this.authService.currentUser._id;
      this.roleid = this.authService.currentUser.role['_id'];
      this.setPermissions(this.bindObjValue);
   }

   protected setPermissions(datas: any) {
      this.isApproveBtn = false;
      this.isReviewBtn = false;
      this.wfAlterPerms = false;

      if (datas.wfstatus || datas.wfreviewers || datas.wfapprovers) {
         if (datas.wfstatus == 'reviewer' && datas.wfreviewers) {   // reviewer with wfreviewers (only review it)     review->approver
            if ((datas.wfreviewers.userid && datas.wfreviewers.userid.length > 0 && datas.wfreviewers.userid.includes(this.loginid))
               || (datas.wfreviewers.roleid && datas.wfreviewers.roleid.length > 0 && datas.wfreviewers.roleid.includes(this.roleid))
            ) {
               this.isReviewBtn = true;
               this.displayText = `${this.formObjValue?.dispalyformname} is created, You can reviewed it !`;
               this.wfAlterPerms = false;   // can't update if you are reviewer
            } else if (this.loginid == datas.addedby) {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for reviewer to reviewed it !`;
               this.wfAlterPerms = true;   // can update if you are created one
            } else {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for reviewed it !`;
               this.wfAlterPerms = false;   // can't update if you are reviewer
            }
         } else if (datas.wfstatus == 'Pending' && datas.wfapprovers) { // approver with wfapprovers (after review stage only approve it) approver->approve
            if (
               (datas.wfapprovers.userid && datas.wfapprovers.userid.length > 0 && datas.wfapprovers.userid.includes(this.loginid))
               || (datas.wfapprovers.roleid && datas.wfapprovers.roleid.length > 0 && datas.wfapprovers.roleid.includes(this.roleid))
            ) {
               this.isApproveBtn = true;
               this.displayText = `${this.formObjValue?.dispalyformname} is created, You can approve it !`;
            } else if (this.loginid == datas.addedby) {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for approver to approve it !`;
            } else {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for approve it !`;
            }
            this.wfAlterPerms = false;   // can't update in 'approver
         } else if (datas.wfstatus == 'reviewer' && datas.wfapprovers) { // reviewer with wfapprovers (approve review stage only approve it)   review->approve
            if (
               (datas.wfapprovers.userid && datas.wfapprovers.userid.length > 0 && datas.wfapprovers.userid.includes(this.loginid))
               || (datas.wfapprovers.roleid && datas.wfapprovers.roleid.length > 0 && datas.wfapprovers.roleid.includes(this.roleid))
            ) {
               this.isApproveBtn = true;
               this.displayText = `${this.formObjValue?.dispalyformname} is created, You can approve it by reviewed it !`;
               this.wfAlterPerms = false;   // can't update if you are reviewer and directly approve
            } else if (this.loginid == datas.addedby) {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for approver to directly approve it !`;
               this.wfAlterPerms = true;   // can update if you are created
            } else {
               this.displayText = `${this.formObjValue?.dispalyformname} is created, waiting for directly approve it !`;
               this.wfAlterPerms = false;   // can't update if you are other user
            }
          }
        //  } else if (datas.wfstatus == 'approve') {                                                                                    // approve
        //     this.displayText = `${this.formObjValue?.dispalyformname} is approve You can proceed further !`;
        //     this.wfAlterPerms = false;   // can't update after approve
        //  } else if (datas.wfstatus == 'decline') {                                                                                    // approve
        //     this.displayText = `${this.formObjValue?.dispalyformname} is decline You can't proceed further !`;
        //     this.wfAlterPerms = false;   // can't update after approve
        //  }
      } else {
         this.wfAlterPerms = true;
      }
   }

   protected onClickbutton(status: any) {
      let obj = {
         'schemaname': this.schemanameValue,
         'objectId': this.bindidValue,
         'wfstatus': status,
      };
      const varTemp = this;
      swal.fire({
         title: 'Are you sure?',
         //text: 'You will not be able to revert this document !!',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'Yes, Confirm it!',
         cancelButtonText: 'No',
         customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger",
         },
         buttonsStyling: false
      }).then((result) => {
         if (result.value) {
            varTemp.btnDisable = true;
            varTemp.commonService
               .updatewfstatus(obj)
               .then(data => {
                  if (data) {
                     varTemp.btnDisable = false;

                     varTemp.onOperation.emit({ data });
                  }
               });
         }
      })
   }



}
