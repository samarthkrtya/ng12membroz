import { Component, Input, EventEmitter, Output } from '@angular/core'; 
import { ISalesDesignation } from '../../sales-channel-hierarchy.component';


@Component({
	selector: 'oc-salesdesignation',
	templateUrl: './salesdesignation.component.html',
	styleUrls: ['./salesdesignation.component.css']
})
export class SalesdesignationComponent {
 
	@Input() salesDesignation: ISalesDesignation;
	@Input() hasManager = false;
	@Output() addSalesChannelNd: EventEmitter<any> = new EventEmitter<any>();

	addSDesignation(tempid: any){ 
		this.addSalesChannelNd.emit(tempid);
	}
}
