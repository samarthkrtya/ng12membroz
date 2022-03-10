import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ISalesTeam } from '../../sales-channel-team-hierarchy.component';

@Component({
	selector: 'ng-saleschannelteam-chart',
	templateUrl: './saleschannelteam-chart.component.html',
	styleUrls: ['./saleschannelteam-chart.component.css']
})
export class SaleschannelteamChartComponent {
	@Input() salesDesignation: ISalesTeam;
	@Input() hasManager = false;
}
