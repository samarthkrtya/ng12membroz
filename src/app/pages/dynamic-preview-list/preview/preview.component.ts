
import { Component, Input } from "@angular/core";
import { Subject } from 'rxjs';


@Component({
  moduleId: module.id,
  selector: 'app-preview',
  templateUrl: './preview.component.html',
})
export class PreviewComponent  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input('tableContent') tableContent: any;
  
  constructor( ) { }
}
