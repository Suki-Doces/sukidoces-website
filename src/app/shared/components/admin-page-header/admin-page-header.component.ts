import { Component, Input } from '@angular/core';
import { AdminIconComponent, AdminIconName } from '../admin-icon/admin-icon.component';

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  imports: [AdminIconComponent],
  template: `
    <header class="page-header">
      <span class="page-icon" aria-hidden="true">
        <app-admin-icon [name]="icon" />
      </span>
      <div class="page-heading">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      margin-bottom: 20px;
    }

    .page-header {
      display: flex;
      align-items: center;
      min-height: 66px;
      padding-bottom: 14px;
      border-bottom: 1px solid #e8ebee;
    }

    .page-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin-right: 13px;
      flex: 0 0 auto;
      border: 1px solid #ffe0e8;
      border-radius: 12px;
      background: #fff0f3;
      color: #e85578;
      --admin-icon-size: 19px;
    }

    .page-heading h1 {
      margin: 0 0 3px;
      color: #2c3e50;
      font-size: 29px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }

    .page-heading p {
      margin: 0;
      color: #7f8c8d;
      font-size: 14px;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      :host {
        margin-bottom: 18px;
      }

      .page-icon {
        width: 36px;
        height: 36px;
      }

      .page-heading h1 {
        font-size: 25px;
      }
    }
  `]
})
export class AdminPageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) icon!: AdminIconName;
}
