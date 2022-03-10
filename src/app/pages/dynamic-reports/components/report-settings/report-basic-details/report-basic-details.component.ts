import { Component, OnInit, Input } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { Cloudinary } from '@cloudinary/angular-5.x';



import swal from 'sweetalert2';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
declare var $: any;
@Component({
  selector: 'app-report-basic-details',
  templateUrl: './report-basic-details.component.html'
})
export class ReportBasicDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;

  uploader: FileUploader;
  response: any[] = [];
  pagename: string;

  constructor(
  ) {
    super();
    this.pagename = "app-report-basic-details";
  }

  async ngOnInit() {

    super.ngOnInit();

  }


}
