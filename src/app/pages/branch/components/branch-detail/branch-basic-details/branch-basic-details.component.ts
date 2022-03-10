import { Component, OnInit, Input } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';


@Component({
  selector: 'app-branch-basic-details',
  templateUrl: './branch-basic-details.component.html',
})
export class BranchBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Input() license: any;
  

  constructor(
  ) {
    super();
    this.pagename = "app-branch-basic-details";
  }

  async ngOnInit() {
    super.ngOnInit();
  }
}
