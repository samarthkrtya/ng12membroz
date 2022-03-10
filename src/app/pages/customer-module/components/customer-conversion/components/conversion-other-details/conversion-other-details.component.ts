import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../../core/services/common/common.service';
@Component({
  selector: 'app-conversion-other-details',
  templateUrl: './conversion-other-details.component.html',
  styles: [
  ]
})
export class ConversionOtherDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() submitted: Boolean;
  @Input() dataContent: any;

  constructor(
    private _commonService: CommonService
  ) { 
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()

      if(this.dataContent && this.dataContent.handlerid && this.dataContent.handlerid.fullname) {
        this.formGroup.controls['salesperson'].setValue(this.dataContent.handlerid.fullname);
      }

      if(this.dataContent && this.dataContent.campaignid && this.dataContent.campaignid.campaignname) {
        this.formGroup.controls['campaign'].setValue(this.dataContent.campaignid.campaignname);
      }

      if(this.dataContent && this.dataContent.campaignid && this.dataContent.campaignid.saleschannelteams && this.dataContent.campaignid.saleschannelteams.saleschannelid && this.dataContent.campaignid.saleschannelteams.saleschannelid.channelname) {
        this.formGroup.controls['channel'].setValue(this.dataContent.campaignid.saleschannelteams.saleschannelid.channelname);
      }

      if(this.dataContent && this.dataContent.campaignid && this.dataContent.campaignid.saleschannelteams && this.dataContent.campaignid.saleschannelteams.saleschannelid && this.dataContent.campaignid.saleschannelteams.saleschannelid.channelhead && this.dataContent.campaignid.saleschannelteams.saleschannelid.channelhead.title) {
        this.formGroup.controls['salesmanager'].setValue(this.dataContent.campaignid.saleschannelteams.saleschannelid.channelhead.title);
      }

    } catch(error) {

    } finally {

    }

  }

}
