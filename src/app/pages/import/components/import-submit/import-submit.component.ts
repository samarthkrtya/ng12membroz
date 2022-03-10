import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-import-submit',
  templateUrl: './import-submit.component.html',
})
export class ImportSubmitComponent implements OnInit {

  constructor() { }

  @Input('returnUrl') returnUrlValue: any;
  @Input('importDataCount') importDataCount: number;
  @Input('formname') formname: string;

  ngOnInit() {
  }

}
