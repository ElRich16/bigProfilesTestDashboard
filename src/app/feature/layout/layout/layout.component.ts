import {
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
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Color } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers: [DataService],
})
export class LayoutComponent implements OnInit {
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
  constructor(private service: DataService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  changeDateRange(from: HTMLInputElement, to: HTMLInputElement): void {
    console.log(from.value, to.value);
    if (!from.value || !to.value) return;
    // TODO validators and control for from and to not null not string empty
    // after transform in date weith new see cosnole.log  console.log(new Date(from.value), to.value);
    this.fetchData(new Date(from.value), new Date(to.value));
    // const startDate = new Date(this.dateRangeForm.value.startDate);
    // const endDate = new Date(this.dateRangeForm.value.endDate);
    // if (startDate && endDate && startDate <= endDate) {
    //   this.fetchData(startDate, endDate);
    //   this.formSubmitted = true;
    // } else {
    //   console.error('Le date selezionate non sono valide.');
    // }
  }

  // Metodo per fare la chiamata all'API tramite il servizio
  fetchData(startDate: Date, endDate: Date): void {
    this.service
      .getDatas(startDate, endDate)
      .pipe(map((r) => this.computePage(r)))
      .subscribe(
        (model: PageModel) => {
          this.data$.next(model);
          this.cdr.detectChanges();
          console.log('Dati aggiornati:', model);
        },
        (error: any) => {
          console.error('Errore durante la chiamata all’API:', error);
        }
      );
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

  // Opzioni del grafico
  view: [number, number] = [700, 400]; // Dimensioni del grafico

  // Opzioni di stile
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Chiavi';
  showYAxisLabel = true;
  yAxisLabel = 'Numero di chiamate';
  colorScheme: Color = {
    domain: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    name: '',
    selectable: false,
    group: ScaleType.Time,
  };

  barChartLabels: string[] = ['1', '2', '3', '4', '5', '6'];

  barChartData = [
    {
      data: [132679, 126740, 145390, 136477, 144294, 116563],
      label: 'Numero di chiamate',
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ];

  // Opzioni del grafico
  barChartOptions = {
    responsive: true,
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  // Tipo di grafico
  barChartType: any = 'bar';
}
