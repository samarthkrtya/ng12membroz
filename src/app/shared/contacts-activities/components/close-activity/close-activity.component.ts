import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-close-activity',
  templateUrl: './close-activity.component.html',
  styles: [
    `
      .cursor-pointer{
        cursor: pointer;
      }
    `
  ]
})
export class CloseActivityComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  closeActivitieLists: any [] = [];
  selectedActvity: any = {}

  constructor(
    private _commonService: CommonService
  ) {
    super()
    this.pagename="app-close-activity";
  }

  @Input() dataContent: any;
  @Output() onCloseActivityData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getCloseActivities()
    } catch(error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.closeActivitieLists = [];
    return;
  }

  async getCloseActivities() {
    this.closeActivitieLists = this.dataContent.closeactivity;
    return;
  }

  activityClick(item: any) {
    this.selectedActvity = {};
    this.selectedActvity = item;

    this.selectedActvity.actvityName = this.selectedActvity && this.selectedActvity._id && this.selectedActvity._id.dispositionid && this.selectedActvity._id.dispositionid.disposition ? this.selectedActvity._id.dispositionid.disposition : this.selectedActvity && this.selectedActvity.dispositionid && this.selectedActvity.dispositionid.disposition ? this.selectedActvity.dispositionid.disposition : '---';
    this.selectedActvity.fullname = this.selectedActvity && this.selectedActvity._id && this.selectedActvity._id.assingeeuser && this.selectedActvity._id.assingeeuser && this.selectedActvity._id.assingeeuser.fullname ? this.selectedActvity._id.assingeeuser.fullname : this.selectedActvity && this.selectedActvity.assingeeuser && this.selectedActvity.assingeeuser && this.selectedActvity.assingeeuser.fullname ? this.selectedActvity.assingeeuser.fullname : '----'


  }

  viewmore() {
    let postData = {
      panelOpenState: true
    }
    this.onCloseActivityData.emit(postData);
  }

}
