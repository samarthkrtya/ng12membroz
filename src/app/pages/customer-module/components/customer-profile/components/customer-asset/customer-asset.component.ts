import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-customer-asset',
  templateUrl: './customer-asset.component.html',
  styles: [
  ]
})
export class CustomerAssetComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
    public _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-customer-asset";
  }

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()

      if (this.dataContent.billpayments) {
        await this.getPayment()
      }

    } catch (error) {
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
    this.displayedColumns3 = [];
    this.displayedColumns3 = ['vehicle', 'model','licenseplate','fueltype','action'];
    this.dataSource3 = [];
  }

  async getPayment() {

    if (this.dataContent.assets && this.dataContent.assets.length !== 0) {

      console.log("this.dataContent.assets",this.dataContent.assets)
      this.dataContent.assets.forEach(element => {

        this.dataSource3.push({
          vehicle: element.title,
          //customername: element.customername,
          model: element.property.model,
          licenseplate: element.property.license_plate,
          fueltype: element.property.fuel_type,
          _id: element._id,
        });
      });
    }
    return;
  }
}
