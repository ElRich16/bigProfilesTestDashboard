import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { DataService } from '../../../services/data.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import Chart, { ChartConfiguration, ChartType } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, BaseChartDirective],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [DataService],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  data$: BehaviorSubject<PageModel> = new BehaviorSubject<PageModel>({
    averageResponseTime: 0,
    totalRequests: 0,
    ketyDistribution: {},
    timeDistribution: {},
    logs: [],
    totalErrors: 0,
  });
  logs: Log[] = [];
  formSubmitted: boolean = false;
  totalErrors: number = 0;
  keyDistributionChart: Chart | null = null;
  timeLineChart: Chart | null = null;
  constructor(private service: DataService, private cdr: ChangeDetectorRef) {}
  ngAfterViewInit(): void {
    // this.createKeyDistributionChart();
    // this.createChartPie();
    //() this.createTimeLineChart();
  }

  ngOnInit(): void {}

  changeDateRange(from: HTMLInputElement, to: HTMLInputElement): void {
    console.log(from.value, to.value);
    if (!from.value || !to.value) return;
    this.fetchData(new Date(from.value), new Date(to.value));
  }

  // Method for call API
  fetchData(startDate: Date, endDate: Date): void {
    this.service
      .getDatas(startDate, endDate)
      .pipe(map((r) => this.computePage(r)))
      .subscribe({
        next: (model: PageModel) => {
          this.data$.next(model);
          this.cdr.detectChanges();
          console.log('Dati aggiornati:', model);
        },
        error: (error: any) => {
          console.error('Errore durante la chiamata all’API:', error);
        },
        complete: () => {
          console.log('Chiamata API completata.');
        },
      });
  }

  computePage(resp: ValueResponse): PageModel {
    const totalRequests = resp.values.reduce(
      (acc: number, curr: AggregatedValue) => acc + curr.total_requests,
      0
    );
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

  // chart for key distribution
  keyDistributionChartData(kd: KeyDistribution): ChartConfiguration['data'] {
    return {
      datasets: [
        {
          label: 'Time Distribution',
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
  // chart for time distribution
  timeDistributionChartData(td: TimeDistribution): ChartConfiguration['data'] {
    const formattedLabels = Object.keys(td).map((key) => {
      const date = new Date(key);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', // Mese abbreviato (es. "Jan", "Feb")
        day: '2-digit', // Giorno a due cifre
        year: 'numeric', // Anno completo
        hour: '2-digit', // Ore a due cifre
        minute: '2-digit', // Minuti a due cifre
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
  // chart for pie error
  pieDistributionChartData(
    totErr: number,
    totReq: number
  ): ChartConfiguration['data'] {
    const errorPercentage = (totErr / totReq) * 100;
    const successPercentage = ((totReq - totErr) / totReq) * 100;
    return {
      datasets: [
        {
          label: 'Errori vs Successi',
          data: [errorPercentage, successPercentage],
          backgroundColor: ['rgba(215, 22, 48, 0.6)', 'rgba(25, 79, 166, 0.2)'],
        },
      ],
      labels: [errorPercentage, successPercentage],
    };
  }
  toggleDropdown(menuId: string): void {
    const menu = document.getElementById(menuId);
    console.log('cliccasto', menu);
    if (menu) {
      menu.classList.toggle('active');
    }
  }
}
