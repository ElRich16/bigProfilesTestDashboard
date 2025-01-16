import { ChangeDetectorRef, Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import {
  AggregatedValue,
  KeyDistribution,
  Log,
  PageModel,
  TimeDistribution,
  ValueResponse,
} from '../../../models/models';
import { BehaviorSubject, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [DataService],
})
export class LayoutComponent {
  /**
   * Holds the current state of the page model as a reactive subject.
   */
  data$: BehaviorSubject<PageModel> = new BehaviorSubject<PageModel>({
    averageResponseTime: 0,
    totalRequests: 0,
    ketyDistribution: {},
    timeDistribution: {},
    logs: [],
    totalErrors: 0,
  });
  totale: number = 0;
  /**
   * List of logs fetched from the API.
   */
  logs: Log[] = [];

  /**
   * Tracks whether the form has been submitted.
   */
  formSubmitted: boolean = false;

  /**
   * Total number of errors retrieved from the API.
   */
  totalErrors: number = 0;

  /**
   * Chart instance for key distribution data.
   */
  keyDistributionChart: Chart | null = null;

  /**
   * Chart instance for time distribution data.
   */
  timeLineChart: Chart | null = null;

  /**
   * Constructor to inject the required services.
   * @param service Data service to handle API calls.
   * @param cdr ChangeDetectorRef to manually trigger change detection.
   */
  constructor(private service: DataService, private cdr: ChangeDetectorRef) {}

  /**
   * Updates the date range and fetches data for the specified range.
   * @param from Input element for the start date.
   * @param to Input element for the end date.
   */
  changeDateRange(from: HTMLInputElement, to: HTMLInputElement): void {
    if (!from.value || !to.value) return;
    this.fetchData(new Date(from.value), new Date(to.value));
  }

  /**
   * Fetches data from the API within the specified date range.
   * @param startDate The start date for the data request.
   * @param endDate The end date for the data request.
   */
  fetchData(startDate: Date, endDate: Date): void {
    this.service
      .getDatas(startDate, endDate)
      .pipe(map((r) => this.computePage(r)))
      .subscribe({
        next: (model: PageModel) => {
          this.data$.next(model);
        },
        error: (error: any) => {
          console.error('Errore durante la chiamata all’API:', error);
        },
      });
  }

  /**
   * Computes the page model from the API response.
   * @param resp The response object from the API.
   * @returns The calculated PageModel.
   */
  computePage(resp: ValueResponse): PageModel {
    console.log('resp ', resp);
    const totalRequests = resp.values.reduce(
      (acc: number, curr: AggregatedValue) => acc + curr.total_requests,
      0
    );
    console.log('totale request', totalRequests);
    this.totale = totalRequests;
    console.log('totale', this.totale);
    // this.cdr.detectChanges();
    return {
      logs: resp.logs,
      totalErrors: resp.values.reduce(
        (acc: number, curr: AggregatedValue) => acc + curr.total_errors,
        0
      ),
      totalRequests: totalRequests,
      averageResponseTime:
        resp.values.reduce(
          (acc: number, curr: AggregatedValue) =>
            acc + curr.total_response_time_ms,
          0
        ) / totalRequests,
      timeDistribution: resp.values.reduce(
        (acc: TimeDistribution, curr: AggregatedValue) => {
          const key = curr.creation_datetime;
          acc[key] = (acc[key] || 0) + curr.total_requests;
          return acc;
        },
        {}
      ),
      ketyDistribution: resp.values.reduce(
        (acc: KeyDistribution, curr: AggregatedValue) => {
          acc[curr.key] = (acc[curr.key] || 0) + curr.total_requests;
          return acc;
        },
        {}
      ),
    };
  }

  /**
   * Generates chart data for key distribution.
   * @param kd The key distribution data.
   * @returns The chart configuration data.
   */
  keyDistributionChartData(kd: KeyDistribution): ChartConfiguration['data'] {
    return {
      datasets: [
        {
          label: 'Key Distribution',
          data: Object.values(kd),
          backgroundColor: [
            'rgba(25, 79, 166, 0.2)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 86, 97, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
      labels: Object.keys(kd),
    };
  }

  /**
   * Generates chart data for time distribution.
   * @param td The time distribution data.
   * @returns The chart configuration data.
   */
  timeDistributionChartData(td: TimeDistribution): ChartConfiguration['data'] {
    const formattedLabels = Object.keys(td).map((key) => {
      const date = new Date(key);
      return new Intl.DateTimeFormat('it-IT', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    });

    return {
      datasets: [
        {
          label: 'Time Distribution',
          data: Object.values(td),
          fill: false,
          tension: 0,
          backgroundColor: ['rgba(215, 22, 48, 0.6)'],
        },
      ],
      labels: formattedLabels,
    };
  }

  /**
   * Generates chart data for error and success distribution.
   * @param totErr The total number of errors.
   * @param totReq The total number of requests.
   * @returns The chart configuration data.
   */
  pieDistributionChartData(
    totErr: number,
    totReq: number
  ): ChartConfiguration['data'] {
    const errorPercentage = Math.round((totErr / totReq) * 10000) / 100;
    const successPercentage = 100 - errorPercentage;
    return {
      datasets: [
        {
          label: 'Errori vs Successi',
          data: [errorPercentage, successPercentage],
          backgroundColor: ['rgba(215, 22, 48, 0.6)', 'rgba(25, 79, 166, 0.2)'],
        },
      ],
      labels: ['Errori', 'Successi'],
    };
  }

  /**
   * Toggles the visibility of a dropdown menu.
   * @param menuId The ID of the dropdown menu element.
   */
  toggleDropdown(menuId: string): void {
    const menu = document.getElementById(menuId);
    if (menu) {
      menu.classList.toggle('active');
    }
  }
}
