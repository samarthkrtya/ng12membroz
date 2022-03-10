import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-member-conversion-page',
  templateUrl: './member-conversion-page.component.html',
  styles: [
  ]
})
export class MemberConversionPageComponent extends BaseComponemntComponent implements OnInit {

  visible: boolean = false;

  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this._formName = params["formname"] ? params["formname"] : 'member';
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.initializeVariable()
    return;
    
  }

  async initializeVariable() {

    this.visible = true;
  }

  async getUpdated(event: any) {
    this.visible = false;
    
    setTimeout(async () => {
      this.visible = true;
    }, 1000);
  }

}
