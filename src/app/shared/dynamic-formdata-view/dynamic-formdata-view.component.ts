import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../core/services/common/common.service';
import { CommonDataService } from '../../core/services/common/common-data.service';
import { BaseLiteComponemntComponent } from '../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-dynamic-formdata-view',
  templateUrl: './dynamic-formdata-view.component.html',
})

export class DynamicFormdataViewComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() tabPermission: any;
  @Output() deleteRecord = new EventEmitter();
  @Output() redirectUrl = new EventEmitter();
  
  dynamicData: any[] = [];

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-member-dynamic-data";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.initializeVariables()
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.dynamicData = [];
    if (this.dataContent.dynamicforms && this.dataContent.dynamicforms.length > 0) {
      this.dynamicData = this.dataContent.dynamicforms;
      this.dynamicData.map(function (a) {
        if (Array.isArray(a.data)) {
          a.datatype = 'array';
        } else if (typeof (a.data) == 'object' && a.data != null) {
          a.datatype = 'object';
        }
        else {
          a.datatype = undefined;
          // a.datatype = 'object';
          // a.data = { 'Licence': 5 };
        }
      });
    }
  }

  confirmationRecord(data: any, item: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this Record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        varTemp.removeRecord(data, item);
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Record is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  async removeRecord(data: any, item: any) {



    let method = "DELETE";
    let url = "formdatas/";



    return this._commonService
      .commonServiceByUrlMethodIdOrData(url, method, item._id)
      .subscribe((data: any) => {
        if (data) {

          const varTemp = this;
          swal.fire({
            title: 'Deleted!',
            text: 'Your Record has been deleted.',
            icon: 'success',
            customClass: {
              confirmButton: "btn btn-success",
            },
            buttonsStyling: false
          });
          varTemp.deleteRecord.emit("success")
        }
      });
  }
 
  dynamicURl(item: any) {
    this.redirectUrl.emit(item);
  }

}
