import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
@Component({
  selector: 'app-membershipusage',
  templateUrl: './membershipusage.component.html'
})
export class MembershipUsageComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;

  displayedColumns3: string[];
  dataSource3: any[] = [];

  constructor(
  ) {
    super()
    this.pagename = "app-membershipusage";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.getUsage();
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

  async getUsage() {
    this.displayedColumns3 = [];
    this.displayedColumns3 = ['docnumber', "usage", 'qty', 'cost', 'discount', "createdAt",  'action'];
    this.dataSource3 = [];
    if (this.dataContent.membershipusages && this.dataContent.membershipusages.length !== 0) {
      this.dataSource3 = this.dataContent.membershipusages;
    }
  }

}
