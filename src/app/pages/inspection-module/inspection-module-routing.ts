import { Routes } from '@angular/router';

import { InspectionModuleComponent } from './inspection-module.component';

export const InspectionModuleRoutes: Routes = [
  {
    path: '', component: InspectionModuleComponent,
    children: [
      {
        path: 'checklist',
        loadChildren: () => import('./component/checklist-designer/checklist-designer.module').then(m => m.ChecklistDesignerModule),
      },
      {
        path: 'inspection',
        loadChildren: () => import('./component/inspection-page/inspection-page.module').then(m => m.InspectionPageModule),
      },
      {
        path: 'assignment',
        loadChildren: () => import('./component/job-assignment/job-assignment.module').then(m => m.JobAssignmentModule),
      },
      {
        path: 'frontdesk',
        loadChildren: () => import('./component/job-frontdesk/job-frontdesk.module').then(m => m.JobFrontdeskModule),
      },
      {
        path: 'estimation',
        loadChildren: () => import('./component/inspetion-estimation/inspetion-estimation.module').then(m => m.InspetionEstimationModule),
      },
      {
        path: 'inspection-view',
        loadChildren: () => import('./component/inspection-view/inspection-view.module').then(m => m.InspectionViewModule),
      },
      {
        path: 'job-order',
        loadChildren: () => import('./component/job-order/job-order.module').then(m => m.JobOrderModule),
      },
      {
        path: 'booking-calendar',
        loadChildren: () => import('./component/inspection-booking-calendar/inspection-booking-calendar.module').then(m => m.InspectionBookingCalendarModule),
      },
      {
        path: 'job-activity',
        loadChildren: () => import('./component/job-activity-view/job-activity-view.module').then(m => m.JobActivityViewModule),
      },
      {
        path: 'inspection-estimation-info',
        loadChildren: () => import('./component/inspection-estimation-info-render/inspection-estimation-info-render.module').then(m => m.InspectionEstimationInfoRenderModule),
      },
      {
        path: 'inspection-template-lists',
        loadChildren: () => import('./component/inspection-template-lists/inspection-template-lists.module').then(m => m.InspectionTemplateListsModule),
      },
      {
        path: 'usage-view',
        loadChildren: () => import('./component/job-usage-view/job-usage-view.module').then(m => m.JobUsageViewModule),
      },
      
    ],
  },
];
